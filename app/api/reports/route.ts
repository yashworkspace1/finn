import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { categorizeTransactions } from '@/lib/engine/categorizer'
import { detectAnomalies } from '@/lib/engine/anomaly'
import { detectSubscriptions } from '@/lib/engine/subscriptions'
import { calculateHealthScore } from '@/lib/engine/scorer'
import { detectPersonality } from '@/lib/engine/personality'
import { predictCashFlow } from '@/lib/engine/predictor'
import { getMonthlySpend, getMonthlyIncome, getTopCategories, getTotalIncome, getTotalExpenses, getSavingsRate } from '@/lib/engine/stats'
import { Transaction } from '@/lib/parser/normalizer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rawTxns, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (fetchErr) throw fetchErr

    if (!rawTxns || rawTxns.length === 0) {
      return NextResponse.json({ error: 'No transactions found.' }, { status: 404 })
    }

    let transactions = categorizeTransactions(rawTxns)
    transactions = detectAnomalies(transactions) as typeof transactions
    transactions = detectSubscriptions(transactions) as typeof transactions

    const healthScore = calculateHealthScore(transactions)
    const personality = detectPersonality(transactions)
    const cashFlow = predictCashFlow(transactions)
    const topCategories = getTopCategories(transactions)
    
    const totalIncome = getTotalIncome(transactions)
    const totalExpenses = getTotalExpenses(transactions)
    const savingsRate = getSavingsRate(transactions)

    // Calculate trends (basic comparison of last 30 days vs previous 30 days)
    const msInDay = 24 * 60 * 60 * 1000
    const now = Date.now()
    
    const currentPeriodTxns = transactions.filter(t => (now - new Date(t.date).getTime()) <= 30 * msInDay)
    const prevPeriodTxns = transactions.filter(t => {
      const diff = now - new Date(t.date).getTime()
      return diff > 30 * msInDay && diff <= 60 * msInDay
    })

    const currIncome = getTotalIncome(currentPeriodTxns)
    const currExpenses = getTotalExpenses(currentPeriodTxns)
    const prevIncome = getTotalIncome(prevPeriodTxns)
    const prevExpenses = getTotalExpenses(prevPeriodTxns)

    const incomeChange = prevIncome > 0 ? ((currIncome - prevIncome) / prevIncome) * 100 : 0
    const expenseChange = prevExpenses > 0 ? ((currExpenses - prevExpenses) / prevExpenses) * 100 : 0
    
    const currSavingsRate = getSavingsRate(currentPeriodTxns)
    const prevSavingsRate = getSavingsRate(prevPeriodTxns)
    const savingsChange = currSavingsRate - prevSavingsRate

    const anomalies = transactions.filter(t => (t as { is_anomaly?: boolean }).is_anomaly)
    const subscriptions = transactions.filter(t => (t as { is_subscription?: boolean }).is_subscription)
    
    // Calculate category spending
    const byCategory = transactions.reduce((acc, t) => {
      if (t.type === 'debit') {
        const cat = t.category || 'Others'
        acc[cat] = (acc[cat] || 0) + t.amount
      }
      return acc
    }, {} as Record<string, number>)

    // Monthly trend — group transactions by month
    const monthlyTrend = transactions.reduce((acc: any[], tx: any) => {
      const month = tx.date?.slice(0, 7); // "YYYY-MM"
      if (!month) return acc;
      let entry = acc.find(e => e.month === month);
      if (!entry) { entry = { month, income: 0, expenses: 0 }; acc.push(entry); }
      if (tx.amount > 0) entry.income += tx.amount;
      else entry.expenses += Math.abs(tx.amount);
      return acc;
    }, []).sort((a, b) => a.month.localeCompare(b.month));

    // Highlights
    const savingsMonths = monthlyTrend.map(m => ({ month: m.month, savings: m.income - m.expenses }));
    const bestSavings = savingsMonths.sort((a, b) => b.savings - a.savings)[0] || null;
    const worstSpend = [...monthlyTrend].sort((a, b) => b.expenses - a.expenses)[0] || null;
    const biggestTx = [...transactions].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0] || null;
    const highlights = { bestSavingsMonth: bestSavings, worstSpendMonth: worstSpend, biggestTransaction: biggestTx };

    return NextResponse.json({
      success: true,
      report: {
        period: {
          from: transactions[0].date,
          to: transactions[transactions.length - 1].date,
          days: Math.round((new Date(transactions[transactions.length - 1].date).getTime() - new Date(transactions[0].date).getTime()) / msInDay) || 1
        },
        income: {
          total: totalIncome,
          average: Object.values(getMonthlyIncome(transactions)).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(getMonthlyIncome(transactions)).length),
          trend: incomeChange > 0 ? 'up' : incomeChange < 0 ? 'down' : 'stable'
        },
        expenses: {
          total: totalExpenses,
          average: Object.values(getMonthlySpend(transactions)).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(getMonthlySpend(transactions)).length),
          trend: expenseChange > 0 ? 'up' : expenseChange < 0 ? 'down' : 'stable',
          byCategory
        },
        savings: {
          amount: totalIncome - totalExpenses,
          rate: savingsRate,
          trend: savingsChange > 0 ? 'up' : savingsChange < 0 ? 'down' : 'stable'
        },
        topTransactions: transactions.sort((a, b) => b.amount - a.amount).slice(0, 10),
        anomalies: { count: anomalies.length, transactions: anomalies },
        subscriptions: { count: subscriptions.length, monthlyTotal: subscriptions.reduce((s,t) => s + (t as any).amount, 0) },
        healthScore: { score: healthScore.score, grade: healthScore.grade },
        personality,
        cashFlow,
        comparisonToPrevious: {
          incomeChange,
          expenseChange,
          savingsChange
        }
      },
      topCategories,
      monthlyTrend,
      highlights
    })

  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
