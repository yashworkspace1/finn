'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Minus, ArrowRight, 
  Sparkles, RefreshCw, Activity, Calendar,
  ArrowUpRight, Target, Zap, Filter, ChevronRight, CheckCircle
} from 'lucide-react'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts'
import { formatINR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const formatINRShort = (n: number) => {
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

const formatMonth = (m: string) => {
  if (!m) return ''
  const [year, month] = m.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' })
}

const formatMonthLong = (m: string) => {
  if (!m) return ''
  const [year, month] = m.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

export default function ComparePage() {
  const [statements, setStatements] = useState<any[]>([])
  const [monthA, setMonthA] = useState('')
  const [monthB, setMonthB] = useState('')
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/compare')
      .then(r => r.json())
      .then(data => {
        setStatements(data.statements || [])
        if (data.statements?.length >= 2) {
          setMonthA(data.statements[1].month)
          setMonthB(data.statements[0].month)
        }
      })
      .finally(() => setFetching(false))
  }, [])

  const runComparison = async () => {
    if (!monthA || !monthB) return
    setLoading(true)
    setError('')
    setComparison(null)

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthA, monthB }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setComparison(data.comparison)
    } catch (e: any) {
      setError(e.message || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  const verdictConfig = {
    better: { icon: TrendingUp, color: 'var(--income-color)', label: 'Strong Improvement', bg: 'var(--income-bg)' },
    worse: { icon: TrendingDown, color: 'var(--expense-color)', label: 'Financial Decline', bg: 'var(--expense-bg)' },
    stable: { icon: Minus, color: 'var(--savings-color)', label: 'Stable Performance', bg: 'var(--savings-bg)' },
  }

  if (fetching) return <CompareSkeleton />

  if (statements.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Sparkles size={64} className="text-muted/20 mb-4" />
        <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>Not Enough Data</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '24px' }}>
          Upload at least 2 different months of bank statements to see side-by-side comparisons.
        </p>
        <Link href="/onboarding">
          <button style={{
            padding: '12px 24px', borderRadius: '12px',
            background: 'var(--accent-primary)', color: '#ffffff',
            fontWeight: 700, border: 'none', cursor: 'pointer'
          }}>
            Upload More
          </button>
        </Link>
      </div>
    )
  }

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
            <Activity size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Month vs Month
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Side-by-side performance analysis of your financial periods
            </p>
          </div>
        </div>
      </div>

      {/* ── SELECTORS ── */}
      <div className="finn-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Base Month</label>
          <select 
            value={monthA} 
            onChange={e => setMonthA(e.target.value)}
            style={{ 
              width: '100%', padding: '12px', borderRadius: '10px', 
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, outline: 'none'
            }}
          >
            {statements.map(s => <option key={s.month} value={s.month}>{formatMonthLong(s.month)}</option>)}
          </select>
        </div>
        
        <div style={{ paddingBottom: '12px' }}>
          <ArrowRight size={20} color="var(--text-muted)" />
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Compare Month</label>
          <select 
            value={monthB} 
            onChange={e => setMonthB(e.target.value)}
            style={{ 
              width: '100%', padding: '12px', borderRadius: '10px', 
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, outline: 'none'
            }}
          >
            {statements.map(s => <option key={s.month} value={s.month}>{formatMonthLong(s.month)}</option>)}
          </select>
        </div>

        <button 
          onClick={runComparison}
          disabled={loading || monthA === monthB}
          style={{ 
            padding: '12px 30px', borderRadius: '10px', 
            background: 'var(--accent-primary)', color: '#ffffff',
            fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer',
            opacity: (loading || monthA === monthB) ? 0.5 : 1
          }}
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="animate-spin text-accent-primary mb-4" size={32} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>AI is calculating delta metrics...</p>
        </div>
      )}

      {comparison && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* VERDICT HERO */}
          {(() => {
            const v = verdictConfig[comparison.verdict as keyof typeof verdictConfig] || verdictConfig.stable
            const VIcon = v.icon
            return (
              <div className="finn-card" style={{ padding: '30px', background: `linear-gradient(135deg, ${v.color}15, var(--bg-surface))`, border: `1px solid ${v.color}40` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <VIcon size={24} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FINN Analysis Result</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>{v.label}</h2>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Efficiency Score</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>{comparison.score}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span></div>
                  </div>
                </div>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  {comparison.memo}
                </p>
              </div>
            )
          })()}

          {/* DELTA METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Income', a: comparison.totalsA.income, b: comparison.totalsB.income, delta: comparison.deltaIncome, good: comparison.deltaIncome >= 0 },
              { label: 'Outflow', a: comparison.totalsA.expenses, b: comparison.totalsB.expenses, delta: comparison.deltaExpenses, good: comparison.deltaExpenses <= 0 },
              { label: 'Net Savings', a: (comparison.totalsA.income - comparison.totalsA.expenses), b: (comparison.totalsB.income - comparison.totalsB.expenses), delta: (comparison.totalsB.income - comparison.totalsB.expenses) - (comparison.totalsA.income - comparison.totalsA.expenses), good: (comparison.totalsB.income - comparison.totalsB.expenses) >= (comparison.totalsA.income - comparison.totalsA.expenses) },
              { label: 'Savings Rate', a: comparison.savingsRateA, b: comparison.savingsRateB, delta: comparison.deltaSavingsRate, isPercent: true, good: comparison.deltaSavingsRate >= 0 },
            ].map((m, i) => (
              <div key={i} className="finn-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{m.isPercent ? `${m.a.toFixed(1)}%` : formatINRShort(m.a)}</div>
                  <ArrowRight size={12} color="var(--text-muted)" />
                  <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{m.isPercent ? `${m.b.toFixed(1)}%` : formatINRShort(m.b)}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: m.delta === 0 ? 'var(--text-muted)' : m.good ? 'var(--income-color)' : 'var(--expense-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {m.delta > 0 ? '+' : ''}{m.isPercent ? `${m.delta.toFixed(1)}%` : formatINRShort(m.delta)}
                  {m.delta !== 0 && (m.good ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
            
            <div className="finn-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>Category Drift</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={(comparison.categoryDeltas || []).slice(0, 8).map((c: any) => ({
                    name: c.category.length > 10 ? c.category.slice(0, 10) + '…' : c.category,
                    [formatMonth(comparison.monthA)]: Math.round(c.amountA),
                    [formatMonth(comparison.monthB)]: Math.round(c.amountB),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(168,85,247,0.08)' }}
                    contentStyle={{ background: '#1a1530', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', color: '#f5f3ff', fontSize: '11px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '10px 14px' }}
                    labelStyle={{ color: '#f5f3ff', fontWeight: 700, marginBottom: '6px', fontSize: '11px' }}
                    itemStyle={{ color: '#c4b5fd', fontSize: '11px' }}
                    formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString('en-IN')}`, name]}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey={formatMonth(comparison.monthA)} fill="var(--accent-primary)40" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey={formatMonth(comparison.monthB)} fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="finn-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>Drift Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(comparison.categoryDeltas || []).slice(0, 6).map((c: any, i: number) => {
                  const isSpike = c.delta > 0
                  const color = c.delta === 0 ? 'var(--text-muted)' : isSpike ? 'var(--expense-color)' : 'var(--income-color)'
                  const barWidth = Math.min(Math.abs(c.percentChange), 100)
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-primary)' }}>{c.category}</span>
                        <span style={{ color: color }}>{c.delta >= 0 ? '+' : ''}{formatINRShort(c.delta)}</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${barWidth}%` }} style={{ height: '100%', background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* MERCHANT CHANGES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="finn-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="var(--expense-color)" /> New Outlets ({(comparison.newMerchants || []).length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(comparison.newMerchants || []).slice(0, 10).map((m: string, i: number) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
            <div className="finn-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="var(--income-color)" /> Ceased Spending ({(comparison.droppedMerchants || []).length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(comparison.droppedMerchants || []).slice(0, 10).map((m: string, i: number) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </motion.div>
      )}

    </div>
  )
}

function CompareSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="h-20 bg-muted rounded-2xl"/>
      <div className="h-40 bg-muted rounded-2xl"/>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"/>)}
      </div>
    </div>
  )
}
