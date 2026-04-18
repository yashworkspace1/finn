import { Transaction } from '@/lib/parser/normalizer'
import { groupByCategory } from '@/lib/engine/stats'

export interface AnomalyResult {
  transaction: Transaction & { is_anomaly: boolean }
  zScore: number
  category: string
  message: string
}

// ─── Z-score anomaly detection ────────────────────────────────────────────────
export function detectAnomalies(transactions: Transaction[]): (Transaction & { is_anomaly: boolean })[] {
  const byCategory = groupByCategory(transactions)
  const result: (Transaction & { is_anomaly: boolean })[] = []

  for (const [, txns] of Object.entries(byCategory)) {
    if (txns.length < 3) {
      result.push(...txns.map((t) => ({ ...t, is_anomaly: false })))
      continue
    }

    const amounts = txns.map((t) => t.amount)
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const variance =
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
    const stdDev = Math.sqrt(variance)

    const flagged = txns.map((t) => ({
      ...t,
      is_anomaly: stdDev > 0 ? Math.abs((t.amount - mean) / stdDev) > 2.5 : false,
    }))

    result.push(...flagged)
  }

  return result
}

// ─── Summary of anomalies ─────────────────────────────────────────────────────
export function getAnomalySummary(transactions: (Transaction & { is_anomaly?: boolean })[]): {
  count: number
  totalAmount: number
  byCategory: Record<string, number>
} {
  const anomalies = transactions.filter((t) => t.is_anomaly)
  return {
    count: anomalies.length,
    totalAmount: anomalies.reduce((sum, t) => sum + t.amount, 0),
    byCategory: anomalies.reduce(
      (acc, t) => ({
        ...acc,
        [t.category ?? 'Others']: (acc[t.category ?? 'Others'] ?? 0) + 1,
      }),
      {} as Record<string, number>
    ),
  }
}
