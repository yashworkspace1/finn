import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { parseStatement } from '@/lib/parser'
import { mergeTransactions, filterByDateRange, filterByCustomRange } from '@/lib/engine/merger'
import { categorizeTransactions } from '@/lib/engine/categorizer'
import { detectAnomalies } from '@/lib/engine/anomaly'
import { detectSubscriptions } from '@/lib/engine/subscriptions'
import { validateFile } from '@/lib/security/fileValidator'
import { uploadRateLimit } from '@/lib/security/rateLimit'

export async function POST(request: NextRequest) {
  const t0 = Date.now()
  try {
    // 1. Verify JWT
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Rate limit: 10 requests/minute
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

    console.log('[Upload] Files received:', files.map(f => `${f.name} (${f.size} bytes)`))

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // 4. Validate all files
    for (const file of files) {
      const validation = validateFile(file)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    // 5. Parse all files
    console.log('[Upload] Parsing files...')
    let detectedFormat = 'Unknown'
    const allParsed: any[] = []

    for (const file of files) {
      console.log(`[Upload] Parsing: ${file.name}`)
      const result = await parseStatement(file, file.name)
      detectedFormat = result.detectedFormat
      allParsed.push(result.transactions)
      console.log(`[Upload] Parsed ${result.transactions.length} transactions from ${file.name} [Format: ${result.detectedFormat}]`)
      if (result.transactions.length > 0) {
        console.log('[Upload] Sample transaction:', result.transactions[0])
      }
    }

    // 6. Merge + deduplicate
    let transactions = mergeTransactions(allParsed)
    console.log('[Upload] After merge:', transactions.length, 'transactions')

    // 7. Filter by date range
    if (rangeType === 'custom' && dateFrom && dateTo) {
      transactions = filterByCustomRange(transactions, dateFrom, dateTo)
    } else {
      transactions = filterByDateRange(transactions, days)
    }
    console.log('[Upload] After date filter:', transactions.length, 'transactions')

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in the selected date range. Try a wider range.' },
        { status: 400 }
      )
    }

    // 8. Run engines in parallel (FAST)
    const categorized = categorizeTransactions(transactions)
    const [withAnomalies, withSubscriptions] = await Promise.all([
      Promise.resolve(detectAnomalies(categorized)),
      Promise.resolve(detectSubscriptions(categorized))
    ])

    const processed = categorized.map((t, i) => ({
      ...t,
      is_anomaly: (withAnomalies[i] as { is_anomaly?: boolean })?.is_anomaly || false,
      is_subscription: (withSubscriptions[i] as { is_subscription?: boolean })?.is_subscription || false
    }))

    console.log(`[Upload] Engines done: ${processed.filter(t => (t as any).is_anomaly).length} anomalies, ${processed.filter(t => (t as any).is_subscription).length} subscriptions`)

    // 9. Delete existing transactions for this user
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id)

    // 10. Bulk insert in batches of 100
    const batches = []
    for (let i = 0; i < processed.length; i += 100) {
      batches.push(processed.slice(i, i + 100))
    }

    for (const batch of batches) {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(
          batch.map((t) => ({
            user_id: user.id,
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
            is_anomaly: (t as { is_anomaly?: boolean }).is_anomaly ?? false,
            is_subscription: (t as { is_subscription?: boolean }).is_subscription ?? false,
            raw_text: t.raw_text,
          }))
        )

      if (insertError) throw insertError
    }

    console.log(`[Upload] Inserted ${processed.length} rows to Supabase`)

    // 11. Invalidate insights cache
    await supabase
      .from('insights')
      .delete()
      .eq('user_id', user.id)

    // 12. Return summary
    const dateRange = {
      from: processed[0]?.date,
      to: processed[processed.length - 1]?.date,
    }

    const totalMs = Date.now() - t0
    console.log(`[Upload] ✅ Done in ${totalMs}ms`)

    return NextResponse.json({
      success: true,
      count: processed.length,
      dateRange,
      detectedFormat,
      anomalies: processed.filter((t) => (t as { is_anomaly?: boolean }).is_anomaly).length,
      subscriptions: processed.filter((t) => (t as { is_subscription?: boolean }).is_subscription).length,
      categories: [...new Set(processed.map((t) => t.category))].length,
      preview: processed.slice(0, 5),
      processingMs: totalMs,
    })
  } catch (error) {
    console.error('[Upload] ❌ Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file. Please try again.' },
      { status: 500 }
    )
  }
}
