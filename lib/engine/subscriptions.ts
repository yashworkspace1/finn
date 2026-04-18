import { Transaction } from '@/lib/parser/normalizer'

type EnrichedTransaction = Transaction & {
  is_anomaly?: boolean
  is_subscription?: boolean
  category?: string
}

// ─── Detect recurring subscriptions ──────────────────────────────────────────
export function detectSubscriptions(
  transactions: EnrichedTransaction[]
): EnrichedTransaction[] {
  const debits = transactions.filter((t) => t.type === 'debit')

  // Group by first 15 chars of description (normalised)
  const groups: Record<string, EnrichedTransaction[]> = {}
  debits.forEach((t) => {
    const key = t.description.toLowerCase().replace(/\s+/g, ' ').slice(0, 15).trim()
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  const recurringKeys = new Set<string>()

  for (const group of Object.values(groups)) {
    if (group.length < 2) continue

    // Amounts within ±10% of average
    const amounts = group.map((t) => t.amount)
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const allSimilar = amounts.every((a) => Math.abs(a - avg) / avg < 0.1)
    if (!allSimilar) continue

    // Dates roughly monthly (25–37 days apart) OR weekly (5–9 days apart)
    const sorted = [...group].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let isRecurring = true
    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24)
      const monthly = diff >= 25 && diff <= 37
      const weekly  = diff >= 5  && diff <= 9
      if (!monthly && !weekly) { isRecurring = false; break }
    }

    if (isRecurring) {
      sorted.forEach((t) => recurringKeys.add(`${t.date}|${t.amount}|${t.description}`))
    }
  }

  return transactions.map((t) => ({
    ...t,
    is_subscription:
      recurringKeys.has(`${t.date}|${t.amount}|${t.description}`) ||
      t.category === 'Subscriptions',
  }))
}

// ─── Subscription summary ─────────────────────────────────────────────────────
export function getSubscriptionSummary(
  transactions: EnrichedTransaction[]
): { merchant: string; amount: number; frequency: string }[] {
  const subs = transactions.filter((t) => t.is_subscription && t.type === 'debit')
  const groups: Record<string, EnrichedTransaction[]> = {}

  subs.forEach((t) => {
    const key = t.description.toLowerCase().slice(0, 20).trim()
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  return Object.entries(groups)
    .map(([, txns]) => {
      const sorted = [...txns].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      const avgAmount = txns.reduce((s, t) => s + t.amount, 0) / txns.length
      let frequency = 'Monthly'
      if (sorted.length >= 2) {
        const diff =
          (new Date(sorted[1].date).getTime() - new Date(sorted[0].date).getTime()) /
          (1000 * 60 * 60 * 24)
        frequency = diff <= 9 ? 'Weekly' : 'Monthly'
      }
      return {
        merchant: txns[0].description.slice(0, 30),
        amount: Math.round(avgAmount),
        frequency,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}
