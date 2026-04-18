import { Transaction } from '@/lib/parser/normalizer'

type EnrichedTransaction = Transaction & {
  is_anomaly?: boolean
  is_subscription?: boolean
  category?: string
}

// ─── Group by category ────────────────────────────────────────────────────────
export function groupByCategory(
  transactions: EnrichedTransaction[]
): Record<string, EnrichedTransaction[]> {
  return transactions.reduce(
    (acc, t) => {
      const cat = t.category ?? 'Others'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(t)
      return acc
    },
    {} as Record<string, EnrichedTransaction[]>
  )
}

// ─── Monthly spend (debits) ───────────────────────────────────────────────────
export function getMonthlySpend(
  transactions: EnrichedTransaction[]
): Record<string, number> {
  return transactions
    .filter((t) => t.type === 'debit')
    .reduce(
      (acc, t) => {
        const month = t.date.slice(0, 7) // YYYY-MM
        acc[month] = (acc[month] ?? 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )
}

// ─── Monthly income (credits) ─────────────────────────────────────────────────
export function getMonthlyIncome(
  transactions: EnrichedTransaction[]
): Record<string, number> {
  return transactions
    .filter((t) => t.type === 'credit')
    .reduce(
      (acc, t) => {
        const month = t.date.slice(0, 7)
        acc[month] = (acc[month] ?? 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )
}

// ─── Consistency score (0-20) ─────────────────────────────────────────────────
// Uses coefficient of variation — lower CV = more consistent = higher score
export function calculateConsistency(values: number[]): number {
  if (values.length < 2) return 15
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (mean === 0) return 15
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
  const cv = Math.sqrt(variance) / mean // coefficient of variation
  // CV < 0.1 → 20, CV < 0.2 → 17, CV < 0.3 → 14, CV < 0.5 → 10, else → 5
  return cv < 0.1 ? 20 : cv < 0.2 ? 17 : cv < 0.3 ? 14 : cv < 0.5 ? 10 : 5
}

// ─── Totals ───────────────────────────────────────────────────────────────────
export function getTotalIncome(transactions: EnrichedTransaction[]): number {
  return transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
}

export function getTotalExpenses(transactions: EnrichedTransaction[]): number {
  return transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
}

export function getSavingsRate(transactions: EnrichedTransaction[]): number {
  const income   = getTotalIncome(transactions)
  const expenses = getTotalExpenses(transactions)
  return income > 0 ? Math.round(((income - expenses) / income) * 1000) / 10 : 0
}

// ─── Top categories ───────────────────────────────────────────────────────────
export function getTopCategories(
  transactions: EnrichedTransaction[],
  limit = 5
): { category: string; amount: number; percentage: number }[] {
  const debits = transactions.filter((t) => t.type === 'debit')
  const total  = debits.reduce((s, t) => s + t.amount, 0)

  const byCategory = groupByCategory(debits)
  return Object.entries(byCategory)
    .map(([category, txns]) => ({
      category,
      amount: txns.reduce((s, t) => s + t.amount, 0),
      percentage: total > 0 ? Math.round((txns.reduce((s, t) => s + t.amount, 0) / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}
