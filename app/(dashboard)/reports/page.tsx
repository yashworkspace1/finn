'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { RefreshCw, Download } from 'lucide-react'

const formatINR = (n: number) => {
  if (!n && n !== 0) return '₹0'
  const rounded = Math.round(n)
  if (Math.abs(rounded) >= 100000) return `₹${(rounded / 100000).toFixed(1)}L`
  if (Math.abs(rounded) >= 1000) return `₹${(rounded / 1000).toFixed(0)}k`
  return `₹${rounded.toLocaleString('en-IN')}`
}

const CHART_COLORS = [
  '#a855f7', '#34d399', '#f87171', '#60a5fa',
  '#fbbf24', '#f472b6', '#a78bfa', '#fb923c',
  '#38bdf8', '#4ade80'
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-surface, #fff)',
      border: '1px solid var(--border-subtle, rgba(139,92,246,0.15))',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      fontSize: '11px'
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary, #0f0d1a)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary, #5b5675)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReport = () => {
    setLoading(true)
    fetch('/api/reports')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load report')
        setLoading(false)
      })
  }

  useEffect(() => { fetchReport() }, [])

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: '12px'
    }}>
      <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--accent-primary, #7c3aed)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Generating your financial report...</p>
    </div>
  )

  if (!data?.report) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ fontSize: '40px' }}>📊</div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No data yet</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Upload a bank statement to generate your report</p>
    </div>
  )

  const { report, monthlyTrend, topCategories, highlights } = data

  return (
    <div style={{
      padding: '24px',
      background: 'var(--bg-base, #f8f7ff)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px' }}>📋</span>
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Financial Report
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {report.period_start} — {report.period_end}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchReport}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '10px',
            background: 'var(--accent-primary, #7c3aed)', border: 'none',
            color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
          }}>
            <Download size={13} /> Export PDF
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          {
            label: 'Total Income', icon: '📈',
            value: formatINR(report.total_income),
            sub: `${((report.total_income / (report.total_income + report.total_expenses)) * 100).toFixed(0)}% of total flow`,
            color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)'
          },
          {
            label: 'Total Expenses', icon: '📉',
            value: formatINR(report.total_expenses),
            sub: `${((report.total_expenses / (report.total_income + report.total_expenses)) * 100).toFixed(0)}% of total flow`,
            color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)'
          },
          {
            label: 'Net Savings', icon: '🏆',
            value: formatINR(report.net_savings),
            sub: `${report.savings_rate.toFixed(1)}% savings rate`,
            color: report.net_savings >= 0 ? '#a855f7' : '#f87171',
            bg: report.net_savings >= 0 ? 'rgba(168,85,247,0.08)' : 'rgba(248,113,113,0.08)',
            border: report.net_savings >= 0 ? 'rgba(168,85,247,0.2)' : 'rgba(248,113,113,0.2)'
          },
          {
            label: 'Savings Rate', icon: '💹',
            value: `${report.savings_rate.toFixed(1)}%`,
            sub: report.savings_rate >= 20 ? '✅ Above 20% target' : `⚠️ ${(20 - report.savings_rate).toFixed(1)}% below target`,
            color: report.savings_rate >= 20 ? '#34d399' : '#f87171',
            bg: report.savings_rate >= 20 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
            border: report.savings_rate >= 20 ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'
          },
          {
            label: 'Anomalies', icon: '⚠️',
            value: `${report.anomaly_count}`,
            sub: 'Unusual transactions detected',
            color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)'
          },
          {
            label: 'Subscriptions', icon: '💳',
            value: `${report.subscription_count}`,
            sub: 'Recurring charges found',
            color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)'
          },
        ].map((card, i) => (
          <div key={i} className="finn-card" style={{
            padding: '20px',
            background: card.bg,
            border: `1px solid ${card.border}`,
            borderRadius: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
              <span style={{
                fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '1px', textTransform: 'uppercase'
              }}>{card.label}</span>
            </div>
            <div style={{
              fontSize: '28px', fontWeight: 900, color: card.color,
              letterSpacing: '-1px', lineHeight: 1, marginBottom: '6px'
            }}>{card.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>

        {/* Monthly Trend Bar Chart */}
        <div className="finn-card" style={{ padding: '22px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Monthly Trend
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Income vs Expenses over time
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#34d399' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Income</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f87171' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Expenses</span>
              </div>
            </div>
          </div>
          {monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyTrend} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v)} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Upload multiple months to see trend
            </div>
          )}
        </div>

        {/* Top Categories Pie Chart */}
        <div className="finn-card" style={{ padding: '22px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Spending by Category
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Where your money went
          </div>
          {topCategories?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={topCategories.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {topCategories.slice(0, 6).map((_: any, index: number) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => formatINR(v)}
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '10px', fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Category legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topCategories.slice(0, 4).map((cat: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CHART_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.category}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No category data
            </div>
          )}
        </div>
      </div>

      {/* Savings Line Chart */}
      {monthlyTrend?.length > 1 && (
        <div className="finn-card" style={{ padding: '22px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Net Savings Trend
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Month-by-month savings performance
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v)} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="savings"
                name="Net Savings"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ fill: '#a855f7', r: 4 }}
                activeDot={{ r: 6, fill: '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Highlights */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          📌 Key Highlights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            {
              icon: '🏆', label: 'Best Savings Month',
              value: highlights?.bestSavingsMonth
                ? `${highlights.bestSavingsMonth.month} · ${formatINR(highlights.bestSavingsMonth.amount)}`
                : 'N/A',
              color: '#34d399'
            },
            {
              icon: '📛', label: 'Highest Spending',
              value: highlights?.highestSpendMonth
                ? `${highlights.highestSpendMonth.month} · ${formatINR(highlights.highestSpendMonth.amount)}`
                : 'N/A',
              color: '#f87171'
            },
            {
              icon: '💎', label: 'Biggest Transaction',
              value: highlights?.biggestTransaction
                ? `${formatINR(highlights.biggestTransaction.amount)} · ${highlights.biggestTransaction.description?.slice(0, 20)}`
                : 'N/A',
              color: '#60a5fa'
            },
            {
              icon: '🔄', label: 'Most Consistent',
              value: highlights?.mostConsistentCategory || 'N/A',
              color: '#a855f7'
            },
          ].map((h, i) => (
            <div key={i} className="finn-card" style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px'
            }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{h.icon}</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                {h.label}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: h.value !== 'N/A' ? h.color : 'var(--text-muted)', lineHeight: 1.3 }}>
                {h.value}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
