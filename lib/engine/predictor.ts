import { Transaction } from '@/lib/parser/normalizer'
import { getMonthlyIncome, getMonthlySpend } from '@/lib/engine/stats'

export interface Alert {
  type: 'warning' | 'danger' | 'info'
  message: string
  amount?: number
  daysUntil?: number
}

export interface CashFlowPrediction {
  predictedIncome: number
  predictedExpenses: number
  predictedBalance: number
  isCrunchLikely: boolean
  crunchAmount?: number
  trend: 'improving' | 'stable' | 'declining'
  nextAlerts: Alert[]
  monthlyData: { month: string; income: number; expenses: number; balance: number }[]
}

// ─── Simple linear regression ─────────────────────────────────────────────────
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 }
  const xs = values.map((_, i) => i)
  const sumX  = xs.reduce((a, b) => a + b, 0)
  const sumY  = values.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((acc, x, i) => acc + x * values[i], 0)
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

// ─── Predict next 30 days ─────────────────────────────────────────────────────
export function predictCashFlow(transactions: Transaction[]): CashFlowPrediction {
  const monthlyIncome  = getMonthlyIncome(transactions)
  const monthlySpend   = getMonthlySpend(transactions)

  const months = Array.from(
    new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlySpend)])
  ).sort()

  const incomeValues  = months.map((m) => monthlyIncome[m]  ?? 0)
  const expenseValues = months.map((m) => monthlySpend[m]   ?? 0)

  const avgIncome   = incomeValues.length  ? incomeValues.reduce((a, b) => a + b, 0)  / incomeValues.length  : 0
  const avgExpenses = expenseValues.length ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length : 0

  // Linear regression for trend
  const incomeReg  = linearRegression(incomeValues)
  const expenseReg = linearRegression(expenseValues)

  const nextIdx = months.length
  const predictedIncome   = Math.max(0, incomeReg.intercept  + incomeReg.slope  * nextIdx)
  const predictedExpenses = Math.max(0, expenseReg.intercept + expenseReg.slope * nextIdx)
  const predictedBalance  = predictedIncome - predictedExpenses

  // Trend detection
  const trend: CashFlowPrediction['trend'] =
    incomeReg.slope > expenseReg.slope + 500  ? 'improving' :
    expenseReg.slope > incomeReg.slope + 500  ? 'declining' : 'stable'

  // Cash crunch: predicted balance < 20% of avg monthly income
  const crunchThreshold = avgIncome * 0.2
  const isCrunchLikely  = predictedBalance < crunchThreshold

  // Build alerts
  const alerts: Alert[] = []

  if (isCrunchLikely) {
    alerts.push({
      type: 'danger',
      message: `Cash crunch likely next month. Predicted shortfall of ₹${Math.abs(predictedBalance).toLocaleString('en-IN')}`,
      amount: Math.abs(predictedBalance),
    })
  }

  if (trend === 'declining') {
    alerts.push({
      type: 'warning',
      message: 'Your expenses are growing faster than income. Review discretionary spending.',
    })
  }

  if (avgExpenses > avgIncome * 0.9) {
    alerts.push({
      type: 'warning',
      message: 'You are spending over 90% of your income. Consider cutting non-essentials.',
      amount: avgExpenses - avgIncome * 0.7,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      message: 'Cash flow looks healthy for the next 30 days. Keep it up!',
    })
  }

  // Monthly chart data
  const monthlyData = months.map((m, i) => ({
    month: m,
    income:   incomeValues[i],
    expenses: expenseValues[i],
    balance:  (incomeValues[i] ?? 0) - (expenseValues[i] ?? 0),
  }))

  return {
    predictedIncome:   Math.round(predictedIncome),
    predictedExpenses: Math.round(predictedExpenses),
    predictedBalance:  Math.round(predictedBalance),
    isCrunchLikely,
    crunchAmount: isCrunchLikely ? Math.round(Math.abs(predictedBalance)) : undefined,
    trend,
    nextAlerts: alerts,
    monthlyData,
  }
}

// ─── Detect recurring fixed expenses ─────────────────────────────────────────
export function detectRecurringExpenses(
  transactions: Transaction[]
): (Transaction & { is_subscription?: boolean })[] {
  const debits = transactions.filter((t) => t.type === 'debit')
  const groups: Record<string, (Transaction & { is_subscription?: boolean })[]> = {}

  debits.forEach((t) => {
    const key = t.description.toLowerCase().slice(0, 15).trim()
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  const recurringKeys = new Set<string>()

  for (const group of Object.values(groups)) {
    if (group.length < 2) continue

    const amounts = group.map((t) => t.amount)
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const allSimilar = amounts.every((a) => Math.abs(a - avg) / avg < 0.1)
    if (!allSimilar) continue

    const sorted = [...group].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let isRecurring = true
    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24)
      if (diff < 25 || diff > 37) { isRecurring = false; break }
    }

    if (isRecurring) sorted.forEach((t) => recurringKeys.add(`${t.date}|${t.amount}|${t.description}`))
  }

  return transactions.map((t) => ({
    ...t,
    is_subscription: recurringKeys.has(`${t.date}|${t.amount}|${t.description}`),
  }))
}
