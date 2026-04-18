'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { BackButton } from '@/components/common/BackButton'

const AreaChart = dynamic(
  () => import('recharts').then(m => ({ default: m.AreaChart })), { ssr: false }
)
const Area = dynamic(
  () => import('recharts').then(m => ({ default: m.Area })), { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false }
)

export default function CashFlowPage() {
  const [data, setData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const txRes = await fetch('/api/transactions')
        if (!txRes.ok) throw new Error('Failed to fetch transactions')
        const txData = await txRes.json()
        const txns = txData.transactions || []
        setTransactions(txns)

        const cfRes = await fetch('/api/cashflow')
        if (cfRes.ok) {
          const cfData = await cfRes.json()
          setData(cfData)
        } else {
          setData(generateBasicPrediction(txns))
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <CashFlowSkeleton />
  if (error) return <ErrorState error={error} />
  if (transactions.length === 0) return <EmptyState />

  const chartData = buildChartData(transactions)
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const predictedIncome = data?.predictedIncome || totalIncome
  const predictedExpenses = data?.predictedExpenses || totalExpenses
  const predictedBalance = predictedIncome - predictedExpenses
  const alerts = data?.alerts || []

  return (
    <div className="p-6 space-y-6">
      <BackButton href="/dashboard" />
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-violet-500"/>
        <div>
          <h1 className="text-2xl font-semibold">CashFlow Copilot</h1>
          <p className="text-muted-foreground text-sm">
            {data?.trend === 'improving' ? '↑ Improving' : data?.trend === 'declining' ? '↓ Declining' : '→ Stable'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Predicted Income</p>
          <p className="text-2xl font-bold text-teal-400 mt-1">₹{Math.round(predictedIncome).toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Predicted Expenses</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">₹{Math.round(predictedExpenses).toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Predicted Balance</p>
          <p className={`text-2xl font-bold mt-1 ${predictedBalance >= 0 ? 'text-violet-400' : 'text-red-400'}`}>
            ₹{Math.round(Math.abs(predictedBalance)).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{predictedBalance >= 0 ? 'Surplus' : 'Deficit'}</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Income vs Expenses</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }}/>
              <Tooltip formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name]} />
              <Area type="monotone" dataKey="income" stroke="#2dd4bf" fill="url(#incomeGrad)" name="Income" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#8b5cf6" fill="url(#expenseGrad)" name="Expenses" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Upcoming Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.type === 'danger' ? 'bg-red-500/10 border-red-500/20' : alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-violet-500/10 border-violet-500/20'
                }`}>
                {alert.type === 'danger' ? <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"/> : alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0"/> : <Info className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0"/>}
                <div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  {alert.amount && <p className="text-xs text-muted-foreground mt-0.5">Amount: ₹{alert.amount.toLocaleString('en-IN')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-2">Savings Forecast</h2>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-violet-400">
              ₹{Math.max(0, Math.round(predictedIncome - predictedExpenses)).toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Estimated savings this month</p>
          </div>
          {predictedBalance >= 0 ? <CheckCircle className="w-8 h-8 text-green-500 ml-auto"/> : <AlertTriangle className="w-8 h-8 text-red-500 ml-auto"/>}
        </div>
      </div>
    </div>
  )
}

function buildChartData(transactions: any[]) {
  const byDate: Record<string, { income: number, expenses: number }> = {}
  transactions.forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = { income: 0, expenses: 0 }
    if (t.type === 'credit') byDate[t.date].income += t.amount
    else byDate[t.date].expenses += t.amount
  })
  return Object.entries(byDate).map(([date, vals]) => ({ date, ...vals })).sort((a, b) => a.date.localeCompare(b.date))
}

function generateBasicPrediction(transactions: any[]) {
  const income = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  return {
    predictedIncome: income,
    predictedExpenses: expenses,
    predictedBalance: income - expenses,
    trend: income > expenses ? 'improving' : 'declining',
    alerts: expenses > income ? [{ type: 'danger', message: 'Your expenses exceed your income', amount: expenses - income }] : []
  }
}

function CashFlowSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48"/>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl"/>)}
      </div>
      <div className="h-64 bg-muted rounded-xl"/>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-[60vh] text-center">
      <p className="text-red-500 font-medium">Something went wrong</p>
      <p className="text-muted-foreground text-sm mt-1">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-violet-600 hover:underline">Try again</button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-[60vh] text-center">
      <TrendingUp className="w-12 h-12 text-muted-foreground mb-3"/>
      <p className="font-medium">No data yet</p>
      <p className="text-muted-foreground text-sm mt-1">Upload your bank statement to see predictions</p>
      <a href="/onboarding" className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Upload statement →</a>
    </div>
  )
}
