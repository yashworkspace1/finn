'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Eye, CheckCircle } from 'lucide-react'
import { BackButton } from '@/components/common/BackButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Import Recharts with no SSR
const PieChart = dynamic(
  () => import('recharts').then(m => ({ default: m.PieChart })),
  { ssr: false }
)
const Pie = dynamic(
  () => import('recharts').then(m => ({ default: m.Pie })),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then(m => ({ default: m.Cell })),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then(m => ({ default: m.BarChart })),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then(m => ({ default: m.Bar })),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(m => ({ default: m.XAxis })),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(m => ({ default: m.YAxis })),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(m => ({ default: m.Tooltip })),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then(m => ({ default: m.ResponsiveContainer })),
  { ssr: false }
)

import { CATEGORY_COLORS, CHART_COLORS } from '@/utils/constants'

export default function SpendLensPage() {
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [timeFilter, setTimeFilter] = useState('all')
  const [showAllAnomalies, setShowAllAnomalies] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const txRes = await fetch('/api/transactions?limit=10000')
        if (!txRes.ok) throw new Error('Failed to fetch transactions')
        const txData = await txRes.json()
        setAllTransactions(txData.transactions || [])

        const insRes = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        if (insRes.ok) {
          const insData = await insRes.json()
          setInsights(insData)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <SpendLensSkeleton />
  if (error) return <ErrorState error={error} />
  if (allTransactions.length === 0) return <EmptyState />

  const now = new Date()
  let filteredTransactions = allTransactions
  if (timeFilter === 'this_month') {
    filteredTransactions = allTransactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  } else if (timeFilter === 'last_30_days') {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)
    filteredTransactions = allTransactions.filter(t => new Date(t.date) >= thirtyDaysAgo)
  } else if (timeFilter === 'this_year') {
    filteredTransactions = allTransactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear())
  }

  const transactions = filteredTransactions

  const categoryData = getCategoryBreakdown(transactions)
  const dailyData = getDailySpend(transactions)
  const anomalies = transactions.filter(t => t.is_anomaly)
  const visibleAnomalies = showAllAnomalies ? anomalies : anomalies.slice(0, 5)
  const subscriptions = transactions.filter(t => t.is_subscription)

  return (
    <div className="p-6 space-y-6">
      <BackButton href="/dashboard" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-violet-500"/>
          <div>
            <h1 className="text-2xl font-semibold">SpendLens</h1>
            <p className="text-muted-foreground text-sm">
              {transactions.length} transactions analyzed
            </p>
          </div>
        </div>
        
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Spent"
          value={formatCurrency(
            transactions
              .filter(t => t.type === 'debit')
              .reduce((s, t) => s + t.amount, 0)
          )}
          color="rose"
        />
        <StatCard
          label="Categories"
          value={categoryData.length.toString()}
          color="violet"
        />
        <StatCard
          label="Anomalies"
          value={anomalies.length.toString()}
          color={anomalies.length > 0 ? "red" : "green"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Spending by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3}
                  dataKey="amount"
                />
                <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.slice(0, 6).map((cat: any) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[cat.category] || CHART_COLORS.primary }} />
                  <span className="text-sm">{cat.category}</span>
                </div>
                <span className="text-sm font-medium">₹{cat.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Daily Spending</h2>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 10, fill: '#64748b'}} 
                  axisLine={false}
                  tickLine={false}
                  minTickGap={10}
                  tickFormatter={(str) => {
                    const date = new Date(str)
                    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  }}
                />
                <YAxis hide />
                <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" radius={[4,4,0,0]} name="Spent">
                  {dailyData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.hasAnomaly ? CHART_COLORS.danger : CHART_COLORS.primary} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold">Unusual Transactions</h2>
          {anomalies.length > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
              {anomalies.length} found
            </span>
          )}
        </div>
        {anomalies.length === 0 ? (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-4 h-4"/>
            <span className="text-sm">No unusual activity found</span>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAnomalies.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date} · {t.category}</p>
                </div>
                <span className="text-red-400 font-semibold">₹{t.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {anomalies.length > 5 && (
              <button
                onClick={() => setShowAllAnomalies(!showAllAnomalies)}
                className="w-full py-2 text-sm text-red-400 hover:text-red-300 font-medium transition-colors border border-dashed border-red-500/30 rounded-lg"
              >
                {showAllAnomalies ? 'Show less' : `See more (${anomalies.length - 5} more)`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">
          Active Subscriptions
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ₹{subscriptions.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}/mo total
          </span>
        </h2>
        {subscriptions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No subscriptions detected</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subscriptions.map((t: any) => (
              <div key={t.id} className="p-3 bg-background border rounded-lg">
                <p className="font-medium text-sm truncate">{t.description}</p>
                <p className="text-violet-400 font-semibold text-sm mt-1">₹{t.amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  const colorMap: Record<string, string> = {
    rose: 'text-rose-500',
    violet: 'text-violet-500',
    red: 'text-red-500',
    green: 'text-emerald-500'
  }
  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || 'text-foreground'}`}>{value}</p>
    </div>
  )
}

function SpendLensSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48"/>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl"/>)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-xl"/>
        <div className="h-80 bg-muted rounded-xl"/>
      </div>
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
      <div className="p-4 rounded-full bg-muted mb-4"><Eye className="h-10 w-10 text-muted-foreground" /></div>
      <p className="font-medium">No transactions found</p>
      <p className="text-muted-foreground text-sm mt-1">Upload your bank statement to see your spending analytics.</p>
      <a href="/onboarding" className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">Upload Statement</a>
    </div>
  )
}

function getCategoryBreakdown(transactions: any[]) {
  const debits = transactions.filter(t => t.type === 'debit')
  const total = debits.reduce((s, t) => s + t.amount, 0)
  const grouped: Record<string, number> = {}
  
  debits.forEach(t => {
    const cat = t.category || 'Others'
    grouped[cat] = (grouped[cat] || 0) + t.amount
  })
  
  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      fill: CATEGORY_COLORS[category] || CHART_COLORS.primary
    }))
    .sort((a, b) => b.amount - a.amount)
}

function getDailySpend(transactions: any[]) {
  const grouped: Record<string, { amount: number, hasAnomaly: boolean }> = {}
  
  transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      if (!grouped[t.date]) {
        grouped[t.date] = { amount: 0, hasAnomaly: false }
      }
      grouped[t.date].amount += t.amount
      if (t.is_anomaly) grouped[t.date].hasAnomaly = true
    })
  
  return Object.entries(grouped)
    .map(([date, vals]) => ({ date, amount: vals.amount, hasAnomaly: vals.hasAnomaly }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}
