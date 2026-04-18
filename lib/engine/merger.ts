import { Transaction } from '@/lib/parser/normalizer'

// ─── Merge + Deduplicate ──────────────────────────────────────────────────────
export function mergeTransactions(
  allTransactions: Transaction[][]
): Transaction[] {
  const combined = allTransactions.flat()

  // Deduplicate: same date + amount + description = duplicate
  const seen = new Set<string>()
  const unique = combined.filter((t) => {
    const key = `${t.date}|${t.amount}|${t.description.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort chronologically
  return unique.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

// ─── Filter by rolling N days ─────────────────────────────────────────────────
export function filterByDateRange(
  transactions: Transaction[],
  days: number
): Transaction[] {
  if (transactions.length === 0) return []
  
  // Find the most recent transaction date in the uploaded data
  const latestDateStr = transactions.reduce(
    (max, t) => (t.date > max ? t.date : max),
    transactions[0].date
  )
  const cutoff = new Date(latestDateStr)
  cutoff.setDate(cutoff.getDate() - days)

  return transactions.filter((t) => new Date(t.date) >= cutoff)
}

// ─── Filter by explicit date range ────────────────────────────────────────────
export function filterByCustomRange(
  transactions: Transaction[],
  from: string,
  to: string
): Transaction[] {
  return transactions.filter((t) => t.date >= from && t.date <= to)
}

// ─── Summary helpers ──────────────────────────────────────────────────────────
export function getDateRange(transactions: Transaction[]): {
  from: string
  to: string
} {
  if (transactions.length === 0) return { from: '', to: '' }
  const dates = transactions.map((t) => t.date).sort()
  return { from: dates[0], to: dates[dates.length - 1] }
}
