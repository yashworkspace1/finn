import { createClient } from '@/lib/database/supabaseServer'
import crypto from 'crypto'
import { Transaction } from '@/lib/parser/normalizer'
import { GeminiInsights } from '@/lib/ai/fallback'

// ─── Hash transaction data for cache key ─────────────────────────────────────
export function hashTransactions(transactions: Transaction[]): string {
  const data = transactions
    .map((t) => `${t.date}|${t.amount}|${t.type}`)
    .join('#')
  return crypto.createHash('md5').update(data).digest('hex')
}

// ─── Strategy 1: Read from cache ──────────────────────────────────────────────
export async function getCachedInsights(
  userId: string,
  dataHash: string
): Promise<GeminiInsights | null> {
  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('insights')
      .select('summary, top_categories, generated_at, data_hash')
      .eq('user_id', userId)
      .eq('data_hash', dataHash)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return null

    // Cache valid for 24 hours
    const generatedAt = new Date(data.generated_at)
    const hoursDiff = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60)
    if (hoursDiff > 24) return null

    // Return cached data as GeminiInsights shape
    return {
      summary: data.summary ?? '',
      insights: [],
      weeklyNudge: '',
      savingOpportunity: '',
    }
  } catch {
    return null
  }
}

// ─── Strategy 1: Write to cache ───────────────────────────────────────────────
export async function saveInsightsToCache(
  userId: string,
  dataHash: string,
  insights: GeminiInsights
): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('insights').upsert(
      {
        user_id: userId,
        data_hash: dataHash,
        summary: insights.summary,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  } catch (err) {
    console.error('Cache save error:', err)
  }
}

// ─── Strategy 1 + 2 combined ──────────────────────────────────────────────────
interface InsightStats {
  totalIncome: number
  totalExpenses: number
  savingsRate: number
  topCategories: { category: string; amount: number; percentage: number }[]
  anomalyCount: number
  subscriptionCount?: number
  healthScore: number
  personality: string
  transactionCount?: number
}

export async function generateInsightsWithCache(
  userId: string,
  transactions: Transaction[],
  stats: InsightStats
): Promise<GeminiInsights & { fromCache: boolean }> {
  const hash = hashTransactions(transactions)

  // Check cache first
  const cached = await getCachedInsights(userId, hash)
  if (cached) {
    console.log('[FINN Cache] Hit — returning cached insights')
    return { ...cached, fromCache: true }
  }

  console.log('[FINN Cache] Miss — calling Gemini (or fallback)')
  const { generateInsightsWithFallback } = await import('@/lib/ai/gemini')
  const insights = await generateInsightsWithFallback(transactions, stats)

  // Persist to cache
  await saveInsightsToCache(userId, hash, insights)

  return { ...insights, fromCache: false }
}
