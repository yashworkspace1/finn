import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { categorizeTransactions } from '@/lib/engine/categorizer'
import { detectAnomalies } from '@/lib/engine/anomaly'
import { detectSubscriptions } from '@/lib/engine/subscriptions'
import { calculateHealthScore } from '@/lib/engine/scorer'
import { detectPersonality } from '@/lib/engine/personality'
import { predictCashFlow } from '@/lib/engine/predictor'
import { getTopCategories, getTotalIncome, getTotalExpenses, getSavingsRate } from '@/lib/engine/stats'

// ─── Simple in-memory rate limit ──────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>()
function checkRate(userId: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const e = rateMap.get(userId)
  if (!e || now > e.resetAt) { rateMap.set(userId, { count: 1, resetAt: now + windowMs }); return true }
  if (e.count >= limit) return false
  e.count++; return true
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!checkRate(user.id, 30, 60_000))
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 })

    // ── Fetch transactions from Supabase ────────────────────────────────────
    const { data: rawTxns, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (fetchErr) return NextResponse.json({ error: 'Failed to fetch transactions.' }, { status: 500 })
    if (!rawTxns || rawTxns.length === 0)
      return NextResponse.json({ error: 'No transactions found. Please upload a statement first.' }, { status: 404 })

    // ── Run all engines ─────────────────────────────────────────────────────
    let transactions = categorizeTransactions(rawTxns)
    transactions = detectAnomalies(transactions) as typeof transactions
    transactions = detectSubscriptions(transactions) as typeof transactions

    const healthScore   = calculateHealthScore(transactions)
    const personality   = detectPersonality(transactions)
    const cashflow      = predictCashFlow(transactions)
    const topCategories = getTopCategories(transactions, 6)
    const totalIncome   = getTotalIncome(transactions)
    const totalExpenses = getTotalExpenses(transactions)
    const savingsRate   = getSavingsRate(transactions)
    const anomalyCount  = transactions.filter((t) => (t as { is_anomaly?: boolean }).is_anomaly).length

    // ── Try Gemini for AI summary (fallback to rule-based) ──────────────────
    let aiSummary = ''
    let weeklyNudge = ''
    try {
      const { generateInsights, generateNudge } = await import('@/lib/ai/gemini')
      const stats = { totalIncome, totalExpenses, savingsRate, anomalyCount, topCategories }
      aiSummary  = await generateInsights(transactions, stats)
      weeklyNudge = await generateNudge({ healthScore, personality, topCategories })
    } catch {
      // Fallback: rule-based summary
      aiSummary = `You spent ₹${totalExpenses.toLocaleString('en-IN')} this period with a savings rate of ${savingsRate}%. Your top spending category is ${topCategories[0]?.category ?? 'Others'}. ${healthScore.message}`
      weeklyNudge = personality.tip
    }

    // ── Save insights to Supabase ───────────────────────────────────────────
    await supabase.from('insights').upsert({
      user_id: user.id,
      health_score: healthScore.score,
      personality: personality.type,
      personality_desc: personality.description,
      summary: aiSummary,
      top_categories: topCategories,
      anomalies: { count: anomalyCount },
      generated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({
      success: true,
      healthScore,
      personality,
      cashflow,
      topCategories,
      summary: aiSummary,
      weeklyNudge,
      stats: { totalIncome, totalExpenses, savingsRate, anomalyCount, transactionCount: transactions.length },
    })
  } catch (err) {
    console.error('Insights route error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
