'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Info, Sparkles, Activity, Target, Zap, ArrowUpRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { formatINR } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const formatINRShort = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

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
            <TrendingUp size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              CashFlow Copilot
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {data?.trend === 'improving' ? 'Trend: Improving' : data?.trend === 'declining' ? 'Trend: Declining' : 'Trend: Stable'}
            </p>
          </div>
        </div>
      </div>

      {/* ── PREDICTION STATS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--income-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} style={{ color: 'var(--income-color)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Predicted Income</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--income-color)', letterSpacing: '-1px' }}>{formatINRShort(predictedIncome)}</div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Next 30 days forecast</p>
        </div>

        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--expense-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} style={{ color: 'var(--expense-color)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Predicted Spend</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--expense-color)', letterSpacing: '-1px' }}>{formatINRShort(predictedExpenses)}</div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Next 30 days forecast</p>
        </div>

        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: predictedBalance >= 0 ? 'var(--savings-bg)' : 'var(--expense-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} style={{ color: predictedBalance >= 0 ? 'var(--savings-color)' : 'var(--expense-color)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Predicted Surplus</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: predictedBalance >= 0 ? 'var(--accent-primary)' : 'var(--expense-color)', letterSpacing: '-1px' }}>
            {formatINRShort(Math.abs(predictedBalance))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{predictedBalance >= 0 ? 'Projected Surplus' : 'Projected Deficit'}</p>
        </div>
      </div>

      {/* ── FLOW CHART ── */}
      <div className="finn-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Flow Comparison</h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--income-color)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Income</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--expense-color)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Expenses</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--income-color)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--income-color)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--expense-color)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--expense-color)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => v.slice(5)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 12, boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
              formatter={(v: any) => formatINR(v)}
            />
            <Area type="monotone" dataKey="income" stroke="var(--income-color)" fill="url(#incomeGrad)" name="Income" strokeWidth={3} />
            <Area type="monotone" dataKey="expenses" stroke="var(--expense-color)" fill="url(#expenseGrad)" name="Expenses" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── ALERTS & FORECAST ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Alerts */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>Upcoming Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} style={{ color: 'var(--income-color)', opacity: 0.5, marginBottom: '12px' }} />
                <p style={{ fontSize: '13px' }}>Your cash flow looks stable for the next month.</p>
              </div>
            ) : (
              alerts.map((alert: any, i: number) => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '16px', background: alert.type === 'danger' ? 'var(--expense-bg)' : 'var(--bg-elevated)',
                  borderRadius: '16px', borderLeft: `4px solid ${alert.type === 'danger' ? 'var(--expense-color)' : 'var(--accent-primary)'}`
                }}>
                  {alert.type === 'danger' ? <AlertTriangle size={18} style={{ color: 'var(--expense-color)' }} /> : <Info size={18} style={{ color: 'var(--accent-primary)' }} />}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{alert.message}</p>
                    {alert.amount && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Projected Impact: {formatINR(alert.amount)}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Forecast Card */}
        <div className="finn-card" style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
          border: 'none', color: '#ffffff',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
        }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ marginBottom: '16px' }}>
            <Sparkles size={48} />
          </motion.div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Savings Forecast</h3>
          <div style={{ fontSize: '36px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-1px' }}>
            {formatINR(Math.max(0, predictedIncome - predictedExpenses))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '240px' }}>
            Estimated net savings by the end of the next 30-day cycle.
          </p>
          <button style={{
            marginTop: '20px', padding: '10px 24px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
          }}>
            Optimize Flow
          </button>
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
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl"/>)}
      </div>
      <div className="h-72 bg-muted rounded-2xl"/>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertTriangle size={48} color="var(--expense-color)" style={{ marginBottom: '16px' }} />
      <p style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Prediction Failed</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{error}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <TrendingUp size={64} className="text-muted/20 mb-4" />
      <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>No Cash Flow Data</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '24px' }}>
        Upload your bank statement to start predicting your future cash flow.
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
