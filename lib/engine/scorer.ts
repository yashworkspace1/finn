import { Transaction } from '@/lib/parser/normalizer'
import { getMonthlySpend, calculateConsistency } from '@/lib/engine/stats'

export interface HealthScore {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  breakdown: {
    savingsRate: number        // 0-40 points
    consistency: number        // 0-20 points
    anomalyPenalty: number     // 0-20 points
    subscriptionRatio: number  // 0-20 points
  }
  savingsRatePct: number
  message: string
}

export function calculateHealthScore(
  transactions: (Transaction & { is_anomaly?: boolean; is_subscription?: boolean; category?: string })[]
): HealthScore {
  const credits = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const debits  = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  // ── Savings rate (40 pts) ────────────────────────────────────────────────
  const savingsRatePct = credits > 0 ? ((credits - debits) / credits) * 100 : 0
  const savingsScore =
    savingsRatePct >= 30 ? 40 :
    savingsRatePct >= 20 ? 30 :
    savingsRatePct >= 10 ? 20 :
    savingsRatePct >= 0  ? 10 : 0

  // ── Consistency (20 pts) ─────────────────────────────────────────────────
  const monthlySpend = getMonthlySpend(transactions)
  const spendValues  = Object.values(monthlySpend)
  const consistencyScore = Math.min(20, spendValues.length > 1 ? calculateConsistency(spendValues) : 15)

  // ── Anomaly penalty (20 pts) ─────────────────────────────────────────────
  const anomalyCount = transactions.filter((t) => t.is_anomaly).length
  const anomalyScore = Math.max(0, 20 - anomalyCount * 4)

  // ── Subscription ratio (20 pts) ──────────────────────────────────────────
  const subTotal = transactions
    .filter((t) => t.is_subscription || t.category === 'Subscriptions')
    .reduce((s, t) => s + t.amount, 0)
  const subRatio = credits > 0 ? (subTotal / credits) * 100 : 0
  const subScore = subRatio < 5 ? 20 : subRatio < 10 ? 15 : subRatio < 15 ? 10 : 5

  const total = Math.min(100, Math.max(0, Math.round(savingsScore + consistencyScore + anomalyScore + subScore)))

  return {
    score: total,
    grade: total >= 80 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : total >= 20 ? 'D' : 'F',
    breakdown: {
      savingsRate: savingsScore,
      consistency: consistencyScore,
      anomalyPenalty: anomalyScore,
      subscriptionRatio: subScore,
    },
    savingsRatePct: Math.round(savingsRatePct * 10) / 10,
    message:
      total >= 80 ? 'Excellent financial health! Keep it up.' :
      total >= 60 ? 'Good financial health with room to improve.' :
      total >= 40 ? 'Average. Focus on saving more consistently.' :
      'Needs attention. Review your spending habits.',
  }
}
