import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { parseStatement } from '@/lib/parser'
import { mergeTransactions, filterByDateRange, filterByCustomRange } from '@/lib/engine/merger'
import { categorizeTransactions } from '@/lib/engine/categorizer'
import { detectAnomalies } from '@/lib/engine/anomaly'
import { detectSubscriptions } from '@/lib/engine/subscriptions'
import { validateFile } from '@/lib/security/fileValidator'
import { uploadRateLimit } from '@/lib/security/rateLimit'

// ─── Merchant name normalizer ───────────────────────────────────────────────
function normalizeMerchant(description: string): string {
  let name = description.trim()

  // Strip common Indian bank prefixes
  name = name.replace(/^UPI[\/\-][0-9]+[\/\-]?/i, '')
  name = name.replace(/^NEFT[\/\-][A-Z0-9]+[\/\-]?/i, '')
  name = name.replace(/^IMPS[\/\-][0-9]+[\/\-]?/i, '')
  name = name.replace(/^POS[\/\-]/i, '')
  name = name.replace(/^ACH[\/\-][A-Z0-9]+[\/\-]?/i, '')
  name = name.replace(/^INF[\/\-]/i, '')
  name = name.replace(/^MMT[\/\-]/i, '')
  name = name.replace(/^BIL[\/\-][A-Z0-9]+[\/\-]?/i, '')

  // Split by common delimiters and find first readable part
  const parts = name.split(/[\/\-_|@]/)
  const readable = parts.find(p => {
    const t = p.trim()
    return (
      t.length > 2 &&
      !/^\d+$/.test(t) &&
      !/^[A-Z]{2}\d+$/.test(t) &&
      !/^\d{10,}$/.test(t)
    )
  }) || parts[0]

  // Title case
  return readable
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .slice(0, 60)
}

// ─── Leak detector ───────────────────────────────────────────────────────────
const LEAK_KEYWORDS = [
  'PENALTY', 'LATE FEE', 'OVERDUE', 'FINE', 'BOUNCE',
  'ATM CHARGES', 'SMS CHARGES', 'ANNUAL FEE', 'PROCESSING FEE',
  'FOREX', 'FOREIGN TRANSACTION', 'CONVENIENCE FEE',
  'SURCHARGE', 'GST ON CHARGES', 'BANK CHARGES'
]

function detectLeak(description: string): { is_leak: boolean; leak_type: string | null } {
  const upper = description.toUpperCase()
  for (const keyword of LEAK_KEYWORDS) {
    if (upper.includes(keyword)) {
      if (keyword.includes('PENALTY') || keyword.includes('FINE') ||
        keyword.includes('BOUNCE') || keyword.includes('OVERDUE')) {
        return { is_leak: true, leak_type: 'penalty' }
      }
      if (keyword.includes('ATM') || keyword.includes('SMS') ||
        keyword.includes('ANNUAL') || keyword.includes('BANK CHARGES')) {
        return { is_leak: true, leak_type: 'bank_fee' }
      }
      if (keyword.includes('FOREX') || keyword.includes('FOREIGN') ||
        keyword.includes('SURCHARGE') || keyword.includes('CONVENIENCE')) {
        return { is_leak: true, leak_type: 'hidden_charge' }
      }
      return { is_leak: true, leak_type: 'other' }
    }
  }
  return { is_leak: false, leak_type: null }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const t0 = Date.now()
  try {
    // 1. Verify JWT
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Rate limit
    const rateLimit = uploadRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      )
    }

    // 3. Parse form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const rangeType = formData.get('rangeType') as string
    const days = parseInt(formData.get('days') as string || '30')
    const dateFrom = formData.get('dateFrom') as string
    const dateTo = formData.get('dateTo') as string
    const statementMonth = formData.get('statementMonth') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // 4. Validate files
    for (const file of files) {
      const validation = validateFile(file)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    // 5. Parse all files
    let detectedFormat = 'Unknown'
    const allParsed: any[] = []

    for (const file of files) {
      const result = await parseStatement(file, file.name)
      detectedFormat = result.detectedFormat
      allParsed.push(result.transactions)
    }

    // 6. Merge + deduplicate
    let transactions = mergeTransactions(allParsed)

    // 7. Filter by date range
    if (rangeType === 'custom' && dateFrom && dateTo) {
      transactions = filterByCustomRange(transactions, dateFrom, dateTo)
    } else {
      transactions = filterByDateRange(transactions, days)
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in the selected date range.' },
        { status: 400 }
      )
    }

    // 8. Run engines
    const categorized = categorizeTransactions(transactions)
    const [withAnomalies, withSubscriptions] = await Promise.all([
      Promise.resolve(detectAnomalies(categorized)),
      Promise.resolve(detectSubscriptions(categorized))
    ])

    const processed = categorized.map((t, i) => ({
      ...t,
      is_anomaly: (withAnomalies[i] as any)?.is_anomaly || false,
      is_subscription: (withSubscriptions[i] as any)?.is_subscription || false
    }))

    const txDates = processed.map((t: any) => t.date).filter(Boolean).sort()

    // 10. Calculate totals using type field (not amount sign)
    const totalIncome = processed
      .filter((t: any) => t.type === 'credit')
      .reduce((s: number, t: any) => s + Math.abs(t.amount), 0)

    const totalExpenses = processed
      .filter((t: any) => t.type === 'debit')
      .reduce((s: number, t: any) => s + Math.abs(t.amount), 0)

    // 11. Group transactions by their actual month
    const txsByMonth: Record<string, typeof processed> = {}
    processed.forEach((t: any) => {
      const txMonth = t.date?.slice(0, 7) // 'YYYY-MM' from actual date
      if (!txMonth) return
      if (!txsByMonth[txMonth]) txsByMonth[txMonth] = []
      txsByMonth[txMonth].push(t)
    })

    // 12. For each month — upsert statement + insert transactions
    for (const [txMonth, monthTxs] of Object.entries(txsByMonth)) {
      const monthIncome = monthTxs
        .filter((t: any) => t.type === 'credit')
        .reduce((s: number, t: any) => s + Math.abs(t.amount), 0)

      const monthExpenses = monthTxs
        .filter((t: any) => t.type === 'debit')
        .reduce((s: number, t: any) => s + Math.abs(t.amount), 0)

      const monthDates = monthTxs.map((t: any) => t.date).sort()

      // Upsert one statement record per month
      const { data: stmtRecord, error: stmtErr } = await supabase
        .from('statements')
        .upsert({
          user_id: user.id,
          month: txMonth,
          file_name: files[0]?.name,
          file_type: files[0]?.name?.split('.').pop()?.toLowerCase(),
          detected_format: detectedFormat,
          transaction_count: monthTxs.length,
          total_income: monthIncome,
          total_expenses: monthExpenses,
          date_from: monthDates[0],
          date_to: monthDates[monthDates.length - 1],
          uploaded_at: new Date().toISOString(),
        }, { onConflict: 'user_id,month' })
        .select()
        .single()

      if (stmtErr) throw stmtErr

      // Delete only this month's existing transactions
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .eq('month', txMonth)

      // Insert this month's transactions
      const batches = []
      for (let i = 0; i < monthTxs.length; i += 100) {
        batches.push(monthTxs.slice(i, i + 100))
      }

      for (const batch of batches) {
        const { error: insertError } = await supabase
          .from('transactions')
          .insert(
            batch.map((t: any) => {
              const leak = detectLeak(t.description || '')
              return {
                user_id: user.id,
                statement_id: stmtRecord.id,
                month: txMonth,
                date: t.date,
                description: t.description,
                merchant: normalizeMerchant(t.description || ''),
                amount: Math.abs(t.amount),
                type: t.type,
                category: t.category,
                is_anomaly: t.is_anomaly ?? false,
                is_subscription: t.is_subscription ?? false,
                is_leak: leak.is_leak,
                leak_type: leak.leak_type,
                raw_text: t.raw_text,
              }
            })
          )
        if (insertError) throw insertError
      }
    }

    // 14. Invalidate insights cache for this user
    await supabase
      .from('insights')
      .delete()
      .eq('user_id', user.id)

    // 15. Invalidate comparison cache for any month just re-uploaded
    // so Compare page always re-computes fresh deltas
    const uploadedMonths = Object.keys(txsByMonth)
    if (uploadedMonths.length > 0) {
      await Promise.all([
        supabase
          .from('comparisons')
          .delete()
          .eq('user_id', user.id)
          .in('month_a', uploadedMonths),
        supabase
          .from('comparisons')
          .delete()
          .eq('user_id', user.id)
          .in('month_b', uploadedMonths),
      ])
    }

    const totalMs = Date.now() - t0

    return NextResponse.json({
      success: true,
      count: processed.length,
      monthsCreated: Object.keys(txsByMonth).length,
      months: Object.keys(txsByMonth).sort(),
      dateRange: {
        from: txDates[0],
        to: txDates[txDates.length - 1],
      },
      detectedFormat,
      totalIncome,
      totalExpenses,
      anomalies: processed.filter((t: any) => t.is_anomaly).length,
      subscriptions: processed.filter((t: any) => t.is_subscription).length,
      leaks: processed.filter((t: any) => t.is_leak).length,
      categories: [...new Set(processed.map((t: any) => t.category))].length,
      preview: processed.slice(0, 5),
      processingMs: Date.now() - t0,
    })

  } catch (error) {
    console.error('[Upload] ❌ Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file.' },
      { status: 500 }
    )
  }
}