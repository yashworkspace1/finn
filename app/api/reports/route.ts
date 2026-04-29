import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) throw error
    const txs = transactions || []

    if (txs.length === 0) {
      return NextResponse.json({
        report: null,
        monthlyTrend: [],
        topCategories: [],
        highlights: null,
        message: 'No transactions found'
      })
    }

    // Core totals — amounts always positive, use type for direction
    const totalIncome = txs
      .filter(t => t.type === 'credit')
      .reduce((s, t) => s + Number(t.amount), 0)

    const totalExpenses = txs
      .filter(t => t.type === 'debit')
      .reduce((s, t) => s + Number(t.amount), 0)

    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    // Monthly trend — group by YYYY-MM
    const monthMap: Record<string, { month: string; income: number; expenses: number; savings: number }> = {}

    txs.forEach(t => {
      const month = t.month || t.date?.slice(0, 7)
      if (!month) return
      if (!monthMap[month]) {
        monthMap[month] = { month, income: 0, expenses: 0, savings: 0 }
      }
      if (t.type === 'credit') monthMap[month].income += Number(t.amount)
      if (t.type === 'debit') monthMap[month].expenses += Number(t.amount)
    })

    const monthlyTrend = Object.values(monthMap)
      .map(m => ({
        ...m,
        savings: m.income - m.expenses,
        // Short label for chart
        label: new Date(m.month + '-01').toLocaleString('en-IN', { month: 'short', year: '2-digit' })
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Top categories
    const catMap: Record<string, number> = {}
    txs.filter(t => t.type === 'debit').forEach(t => {
      const cat = t.category || 'Others'
      catMap[cat] = (catMap[cat] || 0) + Number(t.amount)
    })

    const topCategories = Object.entries(catMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    // Highlights — computed from monthlyTrend
    const bestSavingsMonth = monthlyTrend.length > 0
      ? [...monthlyTrend].sort((a, b) => b.savings - a.savings)[0]
      : null

    const highestSpendMonth = monthlyTrend.length > 0
      ? [...monthlyTrend].sort((a, b) => b.expenses - a.expenses)[0]
      : null

    const biggestTransaction = txs.length > 0
      ? [...txs].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
      : null

    // Most consistent category — appears in most months
    const catMonthCount: Record<string, Set<string>> = {}
    txs.filter(t => t.type === 'debit').forEach(t => {
      const cat = t.category || 'Others'
      const month = t.month || t.date?.slice(0, 7)
      if (!catMonthCount[cat]) catMonthCount[cat] = new Set()
      if (month) catMonthCount[cat].add(month)
    })

    const mostConsistentCategory = Object.entries(catMonthCount)
      .sort((a, b) => b[1].size - a[1].size)[0]?.[0] || null

    const highlights = {
      bestSavingsMonth: bestSavingsMonth
        ? { month: bestSavingsMonth.label, amount: bestSavingsMonth.savings }
        : null,
      highestSpendMonth: highestSpendMonth
        ? { month: highestSpendMonth.label, amount: highestSpendMonth.expenses }
        : null,
      biggestTransaction: biggestTransaction
        ? {
            description: biggestTransaction.description || biggestTransaction.merchant || 'Unknown',
            amount: Number(biggestTransaction.amount),
            date: biggestTransaction.date,
            type: biggestTransaction.type
          }
        : null,
      mostConsistentCategory
    }

    // Anomaly and subscription counts
    const anomalyCount = txs.filter(t => t.is_anomaly).length
    const subscriptionCount = txs.filter(t => t.is_subscription).length

    const dateFrom = txs[0]?.date
    const dateTo = txs[txs.length - 1]?.date

    return NextResponse.json({
      report: {
        period_start: dateFrom,
        period_end: dateTo,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_savings: netSavings,
        savings_rate: savingsRate,
        anomaly_count: anomalyCount,
        subscription_count: subscriptionCount,
      },
      monthlyTrend,
      topCategories,
      highlights,
    })

  } catch (error) {
    console.error('[Reports] Error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
