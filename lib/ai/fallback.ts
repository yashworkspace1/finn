export interface InsightItem {
  title: string
  description: string
  type: 'positive' | 'warning' | 'danger' | 'info'
  amount?: number
}

export interface GeminiInsights {
  summary: string
  insights: InsightItem[]
  weeklyNudge: string
  savingOpportunity: string
}

interface FallbackStats {
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

// ─── Rule-based fallback — output identical to Gemini ────────────────────────
export function generateFallbackInsights(stats: FallbackStats): GeminiInsights {
  const insights: InsightItem[] = []

  // Savings insight
  if (stats.savingsRate < 10) {
    insights.push({
      title: 'Low savings rate detected',
      description: `You saved only ${stats.savingsRate.toFixed(1)}% of your income. Experts recommend at least 20%. Try reducing ${stats.topCategories[0]?.category ?? 'top'} expenses first.`,
      type: 'danger',
      amount: Math.round(stats.totalIncome * 0.2),
    })
  } else if (stats.savingsRate >= 20) {
    insights.push({
      title: 'Great savings rate!',
      description: `You saved ${stats.savingsRate.toFixed(1)}% of your income — well above the 20% benchmark. Consider investing your surplus for compounding returns.`,
      type: 'positive',
    })
  } else {
    insights.push({
      title: 'Savings can improve',
      description: `You saved ${stats.savingsRate.toFixed(1)}% this period. A small reduction in ${stats.topCategories[0]?.category ?? 'discretionary'} spending could push you above the 20% mark.`,
      type: 'info',
    })
  }

  // Anomaly insight
  if (stats.anomalyCount > 0) {
    insights.push({
      title: `${stats.anomalyCount} unusual transaction${stats.anomalyCount > 1 ? 's' : ''} flagged`,
      description: `We detected ${stats.anomalyCount} transaction${stats.anomalyCount > 1 ? 's' : ''} significantly above your normal spending pattern. Review them in SpendLens to confirm they're legitimate.`,
      type: 'warning',
    })
  }

  // Subscription insight
  if ((stats.subscriptionCount ?? 0) > 5) {
    insights.push({
      title: 'Subscription overload',
      description: `You have ${stats.subscriptionCount ?? 0} recurring subscriptions. Even cancelling 2-3 unused ones could save ₹${((stats.subscriptionCount ?? 0) * 300).toLocaleString('en-IN')}+ per month.`,
      type: 'warning',
    })
  }

  // Top category insight
  const top = stats.topCategories[0]
  if (top && insights.length < 3) {
    insights.push({
      title: `${top.category} is your biggest expense`,
      description: `You spent ${top.percentage.toFixed(1)}% of your total expenses on ${top.category} (₹${top.amount.toLocaleString('en-IN')}). ${top.percentage > 30 ? 'This is above average — consider setting a monthly cap.' : 'This looks reasonable for your income level.'}`,
      type: top.percentage > 30 ? 'warning' : 'info',
      amount: top.amount,
    })
  }

  const saved = Math.round(stats.totalIncome * stats.savingsRate / 100)
  const summary = `Your financial health score is ${stats.healthScore}/100 (${stats.healthScore >= 70 ? 'good' : stats.healthScore >= 40 ? 'average' : 'needs improvement'}). You saved ₹${saved.toLocaleString('en-IN')} (${stats.savingsRate.toFixed(1)}%) across ${stats.transactionCount ?? 0} transactions. ${stats.healthScore >= 70 ? 'Keep building on this momentum.' : 'Focus on reducing your top expense categories to improve your score.'}`

  const weeklyNudge =
    stats.savingsRate < 20
      ? `This week, cut ${top?.category ?? 'dining'} by 20% — that alone could save ₹${Math.round((top?.amount ?? 0) * 0.2).toLocaleString('en-IN')} this month.`
      : `You're saving well! This week, explore a SIP or index fund to put your ₹${saved.toLocaleString('en-IN')} savings to work.`

  const savingOpportunity = `Trimming ${top?.category ?? 'top'} expenses by 15% would free up ₹${Math.round((top?.amount ?? 0) * 0.15).toLocaleString('en-IN')} per month — enough to boost your health score by 5-10 points.`

  return {
    summary,
    insights: insights.slice(0, 3),
    weeklyNudge,
    savingOpportunity,
  }
}
