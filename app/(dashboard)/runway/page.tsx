'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, AlertTriangle, TrendingUp, TrendingDown, Zap, Info, 
  ArrowUpRight, Gauge, Target, Activity, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import Link from 'next/link'

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(n)

const formatINRShort = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

const formatMonth = (m: string) => {
  if (!m) return ''
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1)
    .toLocaleString('en-IN', { month: 'short', year: '2-digit' })
}

export default function RunwayPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/runway')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <RunwaySkeleton />

  if (!data || data.error || data.empty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div style={{
          width: '64px', height: '64px', borderRadius: '20px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
        }}>
          <Gauge size={32} className="text-[var(--text-muted)]" />
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>No Data Available</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '24px' }}>
          Upload your bank statements to calculate how long your money will last.
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

  const runwayPct = Math.min((data.runwayMonths / data.targetRunwayMonths) * 100, 100)
  const StatusIcon = data.status === 'excellent' ? Shield
    : data.status === 'good' ? TrendingUp
    : AlertTriangle

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
            <Gauge size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Runway Analysis
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Sustainability forecast based on spending patterns
            </p>
          </div>
        </div>
      </div>

      {/* ── HERO RUNWAY CARD ── */}
      <div className="finn-card" style={{ 
        padding: '30px', 
        background: `linear-gradient(135deg, ${data.statusColor}10, var(--bg-surface))`,
        border: `1px solid ${data.statusColor}40`
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '30px', alignItems: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: `${data.statusColor}20`, border: `1px solid ${data.statusColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <StatusIcon size={36} style={{ color: data.statusColor }} />
          </div>

          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Estimated Survival Runway
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '56px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {data.runwayMonths.toFixed(1)}
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-muted)' }}>months</span>
            </div>
            <p style={{ fontSize: '14px', color: data.statusColor, fontWeight: 700 }}>
              {data.statusMessage}
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '160px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
              Progress to 6 Month Target
            </div>
            <div style={{ height: '10px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${runwayPct}%` }}
                transition={{ duration: 1 }}
                style={{ height: '100%', background: data.statusColor, borderRadius: '999px' }}
              />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {runwayPct.toFixed(0)}% <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Achieved</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KEY METRICS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Avg Monthly Income', value: data.avgIncome, icon: TrendingUp, color: 'var(--income-color)', bg: 'var(--income-bg)' },
          { label: 'Avg Monthly Spend', value: data.avgExpenses, icon: TrendingDown, color: 'var(--expense-color)', bg: 'var(--expense-bg)' },
          { label: 'Monthly Surplus', value: data.avgMonthlySavings, icon: Activity, color: 'var(--savings-color)', bg: 'var(--savings-bg)' },
          { label: 'Total Savings', value: data.detectableSavings, icon: Target, color: 'var(--health-color)', bg: 'var(--health-bg)' },
        ].map((m, i) => (
          <div key={i} className="finn-card" style={{ padding: '20px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: m.bg, border: `1px solid ${m.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
            }}>
              <m.icon size={16} style={{ color: m.color }} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatINRShort(m.value)}</div>
          </div>
        ))}
      </div>

      {/* ── ACTION BANNER ── */}
      {data.savingsGap > 0 && (
        <div className="finn-card" style={{ 
          padding: '20px', 
          background: 'var(--savings-bg)', 
          border: '1px solid var(--savings-color)',
          display: 'flex', alignItems: 'flex-start', gap: '16px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg-surface)', border: '1px solid var(--savings-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Zap size={20} style={{ color: 'var(--savings-color)' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Action Plan: Bridge the Runway Gap
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              To reach a 6-month runway in the next 12 months, you need to save an extra <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatINR(data.monthlyTopUp)}/month</span>. 
              This is roughly <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatINR(data.monthlyTopUp / 30)}/day</span> in reduced discretionary spending.
            </p>
          </div>
        </div>
      )}

      {/* ── CHART SECTION ── */}
      <div className="finn-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Monthly Cash Flow Trend
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.monthlyData.map((d: any) => ({
            ...d,
            month: formatMonth(d.month)
          }))}>
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
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 12, boxShadow: 'var(--card-shadow)' }}
              formatter={(v: any) => formatINR(v)}
            />
            <ReferenceLine y={0} stroke="var(--border-subtle)" />
            <Area type="monotone" dataKey="income" stroke="var(--income-color)"
              fill="url(#incomeGrad)" strokeWidth={3} name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="var(--expense-color)"
              fill="url(#expenseGrad)" strokeWidth={3} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
        Runway estimates are calculated based on identifiable recurring patterns and detectable savings. 
        Based on your last {data.statementCount} month(s) of activity.
      </p>

    </div>
  )
}

function RunwaySkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="h-40 bg-muted rounded-2xl"/>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"/>)}
      </div>
      <div className="h-64 bg-muted rounded-2xl"/>
    </div>
  )
}
