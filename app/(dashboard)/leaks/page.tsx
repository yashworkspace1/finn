'use client'

import { useEffect, useState } from 'react'
import { 
  AlertTriangle, TrendingDown, DollarSign, Shield, 
  Droplets, Zap, ArrowUpRight, Search, ChevronDown, ChevronUp
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import { formatINR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const formatINRShort = (n: number) => {
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return `₹${n}`
}

export default function LeaksPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/leaks')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LeaksSkeleton />

  const totalLeaked = data?.totalLeaked || 0

  return (
    <div className="flex flex-col gap-[20px]">
      
      {/* ── TOPBAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--expense-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
          }}>
            <Droplets size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Money Leaks
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Identification of silent drains and avoidable charges
            </p>
          </div>
        </div>
      </div>

      {/* ── HERO LEAK CARD ── */}
      <div className="finn-card" style={{ 
        padding: '30px', 
        background: 'linear-gradient(135deg, var(--expense-bg), var(--bg-surface))',
        border: '1px solid var(--expense-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '20px',
            background: 'var(--expense-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
          }}>
            <AlertTriangle size={32} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Total Quantified Leakage
            </div>
            <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--expense-color)', lineHeight: 1 }}>
              {formatINR(totalLeaked)}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
              Across <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{data?.leakCount || 0} transactions</span> — typically avoidable fees or penalties.
            </p>
          </div>
        </div>
      </div>

      {totalLeaked === 0 ? (
        <div className="finn-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Shield size={64} style={{ color: 'var(--income-color)', opacity: 0.4, marginBottom: '20px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Your account is watertight!</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
            No hidden fees, penalties, or unusual drain patterns detected in your statements.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.grouped?.map((group: any, i: number) => (
              <div key={group.type} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setExpanded(expanded === group.type ? null : group.type)}
                  className="finn-card"
                  style={{
                    padding: '20px', textAlign: 'left', cursor: 'pointer',
                    borderLeft: `4px solid ${group.color}`, display: 'flex', alignItems: 'center', gap: '16px'
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: `${group.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <TrendingDown size={20} style={{ color: group.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{group.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatINR(group.total)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{group.count} Txns</div>
                    {expanded === group.type ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {expanded === group.type && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="finn-card" style={{ padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        {group.transactions.map((t: any, idx: number) => (
                          <div key={idx} style={{ 
                            padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: idx === group.transactions.length - 1 ? 'none' : '1px solid var(--border-subtle)'
                          }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.description}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.date}</div>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--expense-color)' }}>-{formatINRShort(t.amount)}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="finn-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>Leak Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-elevated)', opacity: 0.4 }}
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 12, boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
                    formatter={(v: any) => formatINR(v)}
                  />
                  <Bar dataKey="amount" fill="var(--expense-color)" radius={[4, 4, 0, 0]} barSize={30}>
                    {data.monthlyTrend.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.amount > (totalLeaked / data.monthlyTrend.length) ? 'var(--expense-color)' : 'var(--expense-color)80'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="finn-card" style={{ padding: '24px', background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>AI Suggestion</h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Most of your leaks are from <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{data?.grouped?.[0]?.label || 'unnecessary charges'}</span>. 
                Setting up balance alerts in your banking app can help you avoid at least {formatINR(totalLeaked * 0.4)} of these annually.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

function LeaksSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="h-40 bg-muted rounded-2xl"/>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl"/>)}
        </div>
        <div className="h-64 bg-muted rounded-2xl"/>
      </div>
    </div>
  )
}
