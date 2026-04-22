'use client'

import { useState } from 'react'
import { formatINR } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid
} from 'recharts'
import { 
  FileText, Download, Share2, Trophy, 
  AlertTriangle, CreditCard, RefreshCw,
  TrendingUp, TrendingDown, Target, Zap,
  ArrowUpRight
} from 'lucide-react'
import { useReports } from '@/hooks/useData'
import Link from 'next/link'
import toast from 'react-hot-toast'

const formatINRShort = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

export default function ReportsPage() {
  const { data, loading } = useReports()
  const [showAllCategories, setShowAllCategories] = useState(false)

  if (loading) return <ReportSkeleton />

  const report = data?.report
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText size={64} className="text-muted/20 mb-4" />
        <p className="text-muted-foreground">No report data available. Upload a statement first.</p>
        <Link href="/onboarding" className="mt-4">
          <button style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'var(--accent-primary)', color: '#ffffff',
            fontWeight: 700, border: 'none', cursor: 'pointer'
          }}>
            Upload Statement
          </button>
        </Link>
      </div>
    )
  }

  const netSavings = report.income.total - report.expenses.total
  const visibleCategories = showAllCategories ? report.topCategories : report.topCategories?.slice(0, 6)

  const stats = [
    { label: 'Income', value: report.income.total, icon: TrendingUp, bg: 'var(--income-bg)', color: 'var(--income-color)' },
    { label: 'Expenses', value: report.expenses.total, icon: TrendingDown, bg: 'var(--expense-bg)', color: 'var(--expense-color)' },
    { label: 'Net Savings', value: Math.abs(netSavings), icon: Trophy, bg: 'var(--savings-bg)', color: 'var(--savings-color)' },
    { label: 'Savings Rate', value: `${report.savings.rate.toFixed(1)}%`, icon: Target, bg: 'var(--health-bg)', color: 'var(--health-color)' },
    { label: 'Anomalies', value: report.anomalies.count, icon: AlertTriangle, bg: 'var(--expense-bg)', color: 'var(--expense-color)' },
    { label: 'Subscriptions', value: report.subscriptions.count, icon: CreditCard, bg: 'var(--health-bg)', color: 'var(--health-color)' },
  ]

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
            <FileText size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Financial Report
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {report.period.from} — {report.period.to}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button
            onClick={() => toast.success('Report sharing coming soon!')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            onClick={() => toast.success('PDF download started...')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'var(--accent-primary)',
              border: 'none', color: '#ffffff',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="finn-card"
            style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: s.bg, border: `1px solid ${s.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {typeof s.value === 'number' ? formatINRShort(s.value) : s.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        
        {/* Trend Chart */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Monthly Trend</h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Income</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--expense-color)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Expenses</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={report.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: 'var(--bg-elevated)', opacity: 0.4 }}
                contentStyle={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                  borderRadius: '12px', boxShadow: 'var(--card-shadow)', fontSize: '12px'
                }}
              />
              <Bar dataKey="income" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expenses" fill="var(--expense-color)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '🏆', label: 'Best Savings Month', val: report.highlights?.best?.label || 'N/A', bg: 'var(--income-bg)', color: 'var(--income-color)' },
            { icon: '💸', label: 'Highest Spending', val: report.highlights?.worst?.label || 'N/A', bg: 'var(--expense-bg)', color: 'var(--expense-color)' },
            { icon: '💎', label: 'Biggest Transaction', val: report.highlights?.biggest?.label || 'N/A', bg: 'var(--savings-bg)', color: 'var(--savings-color)' },
            { icon: '🔁', label: 'Most Consistent', val: report.highlights?.consistent?.label || 'N/A', bg: 'var(--health-bg)', color: 'var(--health-color)' },
          ].map((h, i) => (
            <div key={i} className="finn-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '24px' }}>{h.icon}</div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{h.val}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── CATEGORIES ── */}
      <div className="finn-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Category Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {visibleCategories?.slice(0, 5).map((cat: any, i: number) => {
              const colors = ['var(--accent-primary)', 'var(--income-color)', 'var(--savings-color)', 'var(--expense-color)', '#60a5fa']
              const color = colors[i % colors.length]
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatINR(cat.amount)}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ height: '100%', background: color, borderRadius: '999px' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {visibleCategories?.slice(5, 10).map((cat: any, i: number) => {
              const colors = ['#f472b6', '#fb923c', '#4ade80', '#c084fc', '#60a5fa']
              const color = colors[i % colors.length]
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatINR(cat.amount)}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ height: '100%', background: color, borderRadius: '999px' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {report.topCategories?.length > 10 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              style={{
                background: 'none', border: 'none', color: 'var(--accent-text)',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              {showAllCategories ? 'Show Less ↑' : 'Show All Categories ↓'}
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-muted rounded-xl"/>)}
      </div>
      <div className="h-64 bg-muted rounded-2xl"/>
    </div>
  )
}
