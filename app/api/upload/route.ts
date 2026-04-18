import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { parseStatement } from '@/lib/parser/index'
import { mergeTransactions, getDateRange, filterByDateRange, filterByCustomRange } from '@/lib/engine/merger'
import { validateFile } from '@/lib/security/fileValidator'

// ─── Rate limiting (simple in-memory, swap for Upstash in prod) ───────────────
const uploadRateMap = new Map<string, { count: number; resetAt: number }>()
const UPLOAD_LIMIT = 10
const WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = uploadRateMap.get(userId)
  if (!entry || now > entry.resetAt) {
    uploadRateMap.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= UPLOAD_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Rate limit ──────────────────────────────────────────────────────────
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait a minute.' },
        { status: 429 }
      )
    }

    // ── Parse form data ─────────────────────────────────────────────────────
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const dateRangeParam = formData.get('dateRange') as string | null
    const fromParam = formData.get('from') as string | null
    const toParam = formData.get('to') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 })
    }

    if (files.length > 12) {
      return NextResponse.json(
        { error: 'Maximum 12 files allowed per upload.' },
        { status: 400 }
      )
    }

    // ── Validate all files first ────────────────────────────────────────────
    for (const file of files) {
      const validation = validateFile(file)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    // ── Parse each file ─────────────────────────────────────────────────────
    const allParsed: Awaited<ReturnType<typeof parseStatement>>[] = []
    const parseErrors: string[] = []

    for (const file of files) {
      try {
        const transactions = await parseStatement(file, file.name)
        allParsed.push(transactions)
      } catch (err) {
        parseErrors.push(`${file.name}: ${err instanceof Error ? err.message : 'Parse failed'}`)
      }
    }

    if (allParsed.length === 0) {
      return NextResponse.json(
        { error: `Failed to parse files: ${parseErrors.join('; ')}` },
        { status: 422 }
      )
    }

    // ── Merge + deduplicate ─────────────────────────────────────────────────
    let merged = mergeTransactions(allParsed)

    // ── Apply date filter ───────────────────────────────────────────────────
    if (fromParam && toParam) {
      merged = filterByCustomRange(merged, fromParam, toParam)
    } else if (dateRangeParam && dateRangeParam !== 'all') {
      const days = parseInt(dateRangeParam)
      if (!isNaN(days)) merged = filterByDateRange(merged, days)
    }

    if (merged.length === 0) {
      return NextResponse.json(
        { error: 'No valid transactions found in the selected date range.' },
        { status: 422 }
      )
    }

    // ── Save to Supabase (batches of 100) ───────────────────────────────────
    const rows = merged.map((t) => ({ ...t, user_id: user.id }))
    const BATCH_SIZE = 100

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE)
      const { error: insertError } = await supabase
        .from('transactions')
        .upsert(batch, { onConflict: 'user_id,date,amount,description' })

      if (insertError) {
        console.error('Insert error:', insertError)
        // Continue with remaining batches even on partial failure
      }
    }

    const dateRange = getDateRange(merged)

    return NextResponse.json({
      success: true,
      count: merged.length,
      parseErrors: parseErrors.length > 0 ? parseErrors : undefined,
      dateRange,
      preview: merged.slice(0, 5),
    })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
