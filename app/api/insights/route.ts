import { createClient } from '@/lib/database/supabaseServer'
import { createAdminClient } from '@/lib/database/supabaseAdmin'
import { categorizeTransactions } from '@/lib/engine/categorizer'
import { detectAnomalies } from '@/lib/engine/anomaly'
import { detectSubscriptions } from '@/lib/engine/subscriptions'
import { calculateHealthScore } from '@/lib/engine/scorer'
import { detectPersonality } from '@/lib/engine/personality'
import { predictCashFlow } from '@/lib/engine/predictor'
import { getTopCategories, getTotalIncome, getTotalExpenses, getSavingsRate } from '@/lib/engine/stats'
import { generateInsights } from '@/lib/ai/gemini'
import { generateFallbackInsights } from '@/lib/ai/fallback'
import { hashTransactions, getCachedInsights, saveInsightsCache } from '@/lib/ai/cache'

async function handler(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    const { data: transactions, error: txError } = await adminSupabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
    
    if (txError || !transactions?.length) {
      return Response.json({ empty: true, message: 'No transactions found' })
    }

    const body = request.method === 'POST' ? await request.clone().json().catch(() => ({})) : {}
    const forceRefresh = body.forceRefresh === true

    const dataHash = hashTransactions(transactions)
    const cached = !forceRefresh ? await getCachedInsights(user.id, dataHash) : null

    const processed = detectSubscriptions(detectAnomalies(categorizeTransactions(transactions)))
    const healthScore = calculateHealthScore(processed)
    const personality = detectPersonality(processed)
    const anomalies = processed.filter(t => t.is_anomaly)
    const totalIncome = getTotalIncome(processed)
    const totalExpenses = getTotalExpenses(processed)
    const savingsRate = getSavingsRate(processed)

    const fromDate = new Date(processed[processed.length - 1]?.date)
    const toDate = new Date(processed[0]?.date)
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const monthsCount = Math.max(1, Math.ceil(diffDays / 30.44))

    const stats = {
      totalIncome, totalExpenses, savingsRate,
      monthlyIncome: totalIncome / monthsCount,
      monthlyExpenses: totalExpenses / monthsCount,
      monthsCount,
      healthScore: healthScore.score,
      personality: personality.type,
      topCategories: getTopCategories(processed, 6),
      anomalyCount: anomalies.length,
      subscriptionCount: processed.filter(t => t.is_subscription).length,
      transactionCount: processed.length,
      dateRange: {
        from: processed[processed.length - 1]?.date,
        to: processed[0]?.date
      }
    }

    if (cached) {
      return Response.json({
        fromCache: true,
        healthScore: { score: cached.health_score, grade: cached.grade },
        healthGrade: cached.grade,
        personality: { type: cached.personality, description: cached.personality_desc, emoji: cached.personality_emoji },
        insights: { summary: cached.summary, insights: cached.insights_data, weeklyNudge: cached.weekly_nudge, savingOpportunity: cached.saving_opportunity },
        topCategories: cached.top_categories,
        anomalies: cached.anomalies,
        stats
      })
    }

    const rawTopCategories = stats.topCategories
    const normalizedTopCategories = rawTopCategories.map(cat => ({
      ...cat,
      amount: cat.amount / monthsCount
    }))

    const aiStats = {
      ...stats,
      topCategories: normalizedTopCategories
    }

    let aiInsights
    try {
      aiInsights = await generateInsights(aiStats)
      console.log('Gemini insights generated ✅')
    } catch (err) {
      console.log('Gemini failed, using fallback ✅')
      aiInsights = generateFallbackInsights(aiStats)
    }

    await saveInsightsCache(user.id, dataHash, aiInsights, { 
      healthScore, 
      personality, 
      topCategories: normalizedTopCategories, 
      anomalies 
    })

    return Response.json({
      fromCache: false,
      healthScore, 
      healthGrade: healthScore.grade,
      personality,
      insights: aiInsights,
      topCategories: normalizedTopCategories, 
      anomalies,
      cashFlow: predictCashFlow(processed),
      stats
    })

  } catch (error: any) {
    console.error('Insights error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
