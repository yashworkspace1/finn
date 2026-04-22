'use client'

import { useEffect, useState } from 'react'
import { 
  Store, TrendingUp, TrendingDown, Minus, Search, 
  ArrowUpRight, Filter, Target, Zap, Activity,
  ChevronRight, X
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts'
import { formatINR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const formatINRShort = (n: number) => {
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

const formatMonth = (m: string) => {
  if (!m) return ''
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1)
    .toLocaleString('en-IN', { month: 'short' })
}

export default function MerchantsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'totalSpent' | 'txCount' | 'avgPerVisit'>('totalSpent')

  useEffect(() => {
    fetch('/api/merchants')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <MerchantSkeleton />

  const filtered = (data?.profiles || [])
    .filter((p: any) =>
      p.merchant.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => b[sortBy] - a[sortBy])

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
            <Store size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Merchant Intel
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Analysis of every place you&apos;ve spent money
            </p>
          </div>
        </div>
      </div>

      {/* ── SUMMARY GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Merchants', value: data?.totalMerchants || 0, icon: Store, bg: 'var(--health-bg)', color: 'var(--health-color)' },
          { label: 'Top Destination', value: data?.topByFrequency?.[0]?.merchant || '—', icon: Target, bg: 'var(--savings-bg)', color: 'var(--savings-color)' },
          { label: 'Biggest Expense', value: data?.topByTotal?.[0]?.merchant || '—', icon: TrendingUp, bg: 'var(--expense-bg)', color: 'var(--expense-color)' },
          { label: 'Highest Outflow', value: formatINRShort(data?.topByTotal?.[0]?.totalSpent || 0), icon: Activity, bg: 'var(--accent-soft)', color: 'var(--accent-text)' },
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
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── SELECTED MERCHANT DETAIL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="finn-card" 
            style={{ 
              padding: '30px', 
              background: 'linear-gradient(135deg, var(--bg-overlay), var(--bg-surface))',
              border: '1px solid var(--accent-primary)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>{selected.merchant}</h3>
                <span style={{ fontSize: '12px', fontWeight: 700, background: 'var(--accent-soft)', color: 'var(--accent-text)', padding: '2px 8px', borderRadius: '6px' }}>{selected.category}</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '30px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Spent</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatINR(selected.totalSpent)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Visits</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{selected.txCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Avg / Visit</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatINR(selected.avgPerVisit)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Frequency</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{selected.avgDaysBetween ? `${selected.avgDaysBetween.toFixed(0)}d` : 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>Spending Velocity</h4>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(selected.monthlySpend)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([month, amount]) => ({ month: formatMonth(month), amount }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 12, fontSize: '12px' }}
                        formatter={(v: any) => formatINR(v)}
                      />
                      <Bar dataKey="amount" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH & FILTER ── */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by merchant name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px 12px 48px', borderRadius: '14px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'totalSpent', label: 'Total' },
            { id: 'txCount', label: 'Visits' },
            { id: 'avgPerVisit', label: 'Avg' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id as any)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: sortBy === s.id ? 'var(--bg-surface)' : 'transparent',
                color: sortBy === s.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MERCHANT LIST ── */}
      <div className="finn-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.slice(0, 50).map((p: any, i: number) => (
            <motion.button
              key={p.merchant}
              whileHover={{ background: 'var(--bg-elevated)' }}
              onClick={() => setSelected(selected?.merchant === p.merchant ? null : p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px',
                borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                background: selected?.merchant === p.merchant ? 'var(--bg-elevated)' : 'transparent',
                cursor: 'pointer', transition: 'background 0.2s', borderLeft: 'none', borderRight: 'none', borderTop: 'none',
                textAlign: 'left', width: '100%'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', width: '24px' }}>{i + 1}</span>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Store size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.merchant}
                  {p.trend === 'increasing' ? <TrendingUp size={14} style={{ color: 'var(--expense-color)' }} /> : p.trend === 'decreasing' ? <TrendingDown size={14} style={{ color: 'var(--income-color)' }} /> : null}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.category} · {p.txCount} visits</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatINRShort(p.totalSpent)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg {formatINRShort(p.avgPerVisit)}</div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  )
}

function MerchantSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-xl"/>)}
      </div>
      <div className="h-12 bg-muted rounded-xl"/>
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded-xl"/>)}
      </div>
    </div>
  )
}
