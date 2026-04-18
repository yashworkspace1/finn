import { createClient } from '@/lib/database/supabaseServer'
import { Transaction } from '@/lib/parser/normalizer'
import { CHART_COLORS } from '@/utils/constants'

// Simple engine to predict cashflow
function predictCashFlow(transactions: Transaction[]) {
  const debits = transactions.filter(t => t.type === 'debit')
  const credits = transactions.filter(t => t.type === 'credit')
  
  const totalDebit = debits.reduce((s, t) => s + t.amount, 0)
  const totalCredit = credits.reduce((s, t) => s + t.amount, 0)
  
  // Calculate average daily spend
  const dates = [...new Set(transactions.map(t => t.date))].sort()
  const days = dates.length > 0 ? 
    (new Date(dates[dates.length-1]).getTime() - new Date(dates[0]).getTime()) / (1000 * 3600 * 24) || 1
    : 1
    
  const dailySpend = totalDebit / days
  const dailyIncome = totalCredit / days
  
  // Predict next 30 days
  const predictedExpenses = dailySpend * 30
  const predictedIncome = dailyIncome * 30
  const predictedBalance = predictedIncome - predictedExpenses
  
  // Determine trend
  let trend = 'stable'
  if (predictedBalance > 10000) trend = 'improving'
  if (predictedBalance < 0) trend = 'declining'

  // Generate chart data (last 30 days actual + 30 days forecast)
  const chartData = []
  let runningBalance = 0
  
  // Backfill actuals
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    
    const dayDebits = debits.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0)
    const dayCredits = credits.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0)
    
    runningBalance += (dayCredits - dayDebits)
    
    chartData.push({
      date: dateStr.slice(5),
      balance: runningBalance,
      predicted: null
    })
  }
  
  // Forecast
  let forecastBalance = runningBalance
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    
    forecastBalance += (dailyIncome - dailySpend)
    
    chartData.push({
      date: dateStr.slice(5),
      balance: null,
      predicted: forecastBalance
    })
  }

  return {
    predictedIncome,
    predictedExpenses,
    predictedBalance,
    trend,
    chartData,
    alerts: predictedBalance < 0 ? [
      { type: 'danger', message: 'Cashflow negative projected for month end', daysFromNow: 30, amount: Math.abs(predictedBalance) }
    ] : [],
    savingsForecast: {
      monthly: predictedBalance,
      yearly: predictedBalance * 12,
      onTrack: predictedBalance > (predictedIncome * 0.2)
    },
    fixedExpenses: []
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (!transactions || transactions.length === 0) {
    return Response.json({ 
      predictedIncome: 0,
      predictedExpenses: 0,
      predictedBalance: 0,
      trend: 'stable',
      alerts: [],
      chartData: []
    })
  }

  // Run prediction engine
  const prediction = predictCashFlow(transactions)
  
  return Response.json(prediction)
}
