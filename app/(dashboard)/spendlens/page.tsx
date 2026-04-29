'use client'

import { useState, useEffect } from 'react'
import { 
  Eye, CheckCircle, AlertTriangle, CreditCard, 
  TrendingDown, List, Calendar, ArrowUpRight,
  RefreshCw, Search, Filter
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import { formatINR } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const formatINRShort = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

const CHART_COLORS = [
  '#a855f7', '#34d399', '#f87171', '#60a5fa',
  '#fbbf24', '#f472b6', '#a78bfa', '#fb923c',
  '#38bdf8', '#4ade80'
]

export default function SpendLensPage() {
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [timeFilter, setTimeFilter] = useState('all')
  const [showAllAnomalies, setShowAllAnomalies] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const txRes = await fetch('/api/transactions?limit=10000')
        if (!txRes.ok) throw new Error('Failed to fetch transactions')
        const txData = await txRes.json()
        setAllTransactions(txData.transactions || [])
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
  }

  const categoryData = getCategoryBreakdown(filteredTransactions)
  const dailyData = getDailySpend(filteredTransactions)
  const anomalies = filteredTransactions.filter(t => t.is_anomaly)
  const subscriptions = filteredTransactions.filter(t => t.is_subscription)
  const totalSpent = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex flex-col gap-[20px]">
      
      {/* ── TOPBAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
          }}>
            <Eye size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              SpendLens
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Deep-dive analysis of your spending habits
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: '8px 16px', borderRadius: '10px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, outline: 'none'
            }}
          >
            <option value="all">All Time</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Outflow', value: totalSpent, icon: TrendingDown, color: 'var(--expense-color)', bg: 'var(--expense-bg)' },
          { label: 'Unique Categories', value: categoryData.length, icon: List, color: 'var(--accent-primary)', bg: 'var(--health-bg)' },
          { label: 'Unusual Spends', value: anomalies.length, icon: AlertTriangle, color: 'var(--expense-color)', bg: 'var(--expense-bg)' },
          { label: 'Avg Daily Spend', value: totalSpent / (dailyData.length || 1), icon: Calendar, color: 'var(--savings-color)', bg: 'var(--savings-bg)' },
        ].map((s, i) => (
          <div key={i} className="finn-card" style={{ padding: '20px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: s.bg, border: `1px solid ${s.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
            }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
              {typeof s.value === 'number' && s.value > 100 ? formatINRShort(s.value) : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' }}>
        
        {/* Category Distribution */}
        {(() => {
          const topCategories = categoryData
          const othersItem = topCategories.find((c: any) =>
            c.category === 'Others' || c.category === 'Uncategorized'
          )
          const totalAmt = topCategories.reduce((s: number, c: any) => s + c.amount, 0)
          const othersPercentage = othersItem ? (othersItem.amount / totalAmt) * 100 : 0

          let pieData: any[]
          if (othersPercentage > 60) {
            const withoutOthers = topCategories
              .filter((c: any) => c.category !== 'Others' && c.category !== 'Uncategorized')
              .sort((a: any, b: any) => b.amount - a.amount)
            if (withoutOthers.length === 0) {
              pieData = topCategories.slice(0, 8)
            } else {
              const top7 = withoutOthers.slice(0, 7)
              const miscAmount = withoutOthers.slice(7).reduce((s: number, c: any) => s + c.amount, 0)
              pieData = [
                ...top7.map((c: any) => ({ ...c, percentage: (c.amount / totalAmt) * 100 })),
                ...(miscAmount > 0 ? [{ category: 'Others', amount: miscAmount + (othersItem?.amount || 0), percentage: ((miscAmount + (othersItem?.amount || 0)) / totalAmt) * 100 }] : [])
              ]
            }
          } else {
            pieData = topCategories.slice(0, 8)
          }

          return (
            <div className="finn-card" style={{ padding: '22px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Category Distribution</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>Where your money went</div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="amount" nameKey="category">
                      {pieData.map((_: any, index: number) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1a1530', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', color: '#f5f3ff', fontSize: '11px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                      formatter={(value: any, name: any) => [formatINR(value), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pieData.map((cat: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0, boxShadow: `0 0 6px ${CHART_COLORS[i % CHART_COLORS.length]}60` }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.category}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatINR(cat.amount)}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>{cat.percentage?.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Daily Activity */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
            Daily Spending Activity
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor((dailyData?.length || 30) / 8)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`}
                width={42}
              />
              <Tooltip
                cursor={{ fill: 'rgba(168,85,247,0.08)' }}
                contentStyle={{ background: '#1a1530', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '10px', color: '#f5f3ff', fontSize: '11px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                labelStyle={{ color: '#f5f3ff', fontWeight: 700, marginBottom: '4px' }}
                itemStyle={{ color: '#a09abf' }}
                formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Spent']}
              />
              <Bar dataKey="amount" fill="#a855f7" radius={[3, 3, 0, 0]} maxBarSize={12}>
                {dailyData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hasAnomaly ? 'var(--expense-color)' : '#a855f7'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── ALERTS & SUBSCRIPTIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Alerts */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Unusual Activity</h3>
            <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--expense-bg)', color: 'var(--expense-color)', padding: '2px 8px', borderRadius: '6px' }}>
              {anomalies.length} Alerts
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {anomalies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} style={{ color: 'var(--income-color)', opacity: 0.5, marginBottom: '12px' }} />
                <p style={{ fontSize: '13px' }}>No unusual activity detected.</p>
              </div>
            ) : (
              anomalies.slice(0, 4).map((t: any, i: number) => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px', background: 'var(--bg-elevated)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{t.description}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.date} · {t.category}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--expense-color)' }}>{formatINRShort(t.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subscriptions */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Recurring Payments</h3>
            <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--health-bg)', color: 'var(--health-color)', padding: '2px 8px', borderRadius: '6px' }}>
              {subscriptions.length} Found
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {subscriptions.slice(0, 6).map((t: any, i: number) => (
              <div key={i} style={{ 
                padding: '12px', background: 'var(--bg-elevated)', borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.description}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-primary)' }}>{formatINRShort(t.amount)}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.date}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

function SpendLensSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-xl"/>)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-2xl"/>
        <div className="h-80 bg-muted rounded-2xl"/>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertTriangle size={48} color="var(--expense-color)" style={{ marginBottom: '16px' }} />
      <p style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Analysis Failed</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{error}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Eye size={64} className="text-muted/20 mb-4" />
      <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>No Activity Seen</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '24px' }}>
        Upload your bank statement to see your spending analytics through the SpendLens.
      </p>
      <Link href="/onboarding">
        <button style={{
          padding: '12px 24px', borderRadius: '12px',
          background: 'var(--accent-primary)', color: '#ffffff',
          fontWeight: 700, border: 'none', cursor: 'pointer'
        }}>
          Upload Statement
        </button>
      </Link>
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
  
  const colors = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6']
  
  return Object.entries(grouped)
    .map(([category, amount], index) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: colors[index % colors.length]
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
