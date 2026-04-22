'use client'

import { useEffect, useState } from 'react'
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { 
  Target, TrendingUp, ShoppingBag, Home, PiggyBank,
  PieChart as PieIcon, Activity, ArrowUpRight, Zap
} from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

const BUCKET_CONFIG = {
  needs: { label: 'Needs', color: 'var(--accent-primary)', icon: Home, ideal: 50, desc: 'Rent, groceries, utilities, transport' },
  wants: { label: 'Wants', color: 'var(--savings-color)', icon: ShoppingBag, ideal: 30, desc: 'Dining, entertainment, shopping' },
  savings: { label: 'Savings', color: 'var(--income-color)', icon: PiggyBank, ideal: 20, desc: 'Investments, savings, SIPs' },
}

export default function BudgetPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/budget-split')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <BudgetSkeleton />

  const pieData = data ? [
    { name: 'Needs', value: Math.round(data.buckets.needs), color: 'var(--accent-primary)' },
    { name: 'Wants', value: Math.round(data.buckets.wants), color: 'var(--savings-color)' },
    { name: 'Savings', value: Math.round(data.buckets.savings), color: 'var(--income-color)' },
  ] : []

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
            <PieIcon size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              50/30/20 Budget Check
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Benchmarking your spending against the golden ratio
            </p>
          </div>
        </div>
      </div>

      {/* ── SUGGESTION BANNER ── */}
      {data?.suggestion && (
        <div className="finn-card" style={{ 
          padding: '16px 20px', 
          background: data.savingsGap <= 0 ? 'var(--income-bg)' : 'var(--savings-bg)', 
          border: `1px solid ${data.savingsGap <= 0 ? 'var(--income-color)' : 'var(--savings-color)'}`,
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <Target size={18} style={{ color: data.savingsGap <= 0 ? 'var(--income-color)' : 'var(--savings-color)' }} />
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{data.suggestion}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        
        {/* Actual Split Pie */}
        <div className="finn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', width: '100%' }}>Your Actual Split</h3>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 12, boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
                  formatter={(v: any) => formatINR(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            {pieData.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bucket Progress Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(Object.entries(BUCKET_CONFIG) as any[]).map(([key, cfg]) => {
            const actual = data?.actual?.[key] || 0
            const amount = data?.buckets?.[key] || 0
            const diff = actual - cfg.ideal
            const statusColor = key === 'savings'
              ? (diff >= 0 ? 'var(--income-color)' : 'var(--expense-color)')
              : (diff <= 0 ? 'var(--income-color)' : 'var(--expense-color)')
            
            return (
              <div key={key} className="finn-card" style={{ 
                padding: '16px', 
                borderLeft: `4px solid ${cfg.color}`,
                display: 'flex', flexDirection: 'column', gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <cfg.icon size={16} style={{ color: cfg.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{cfg.label}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>IDEAL: {cfg.ideal}%</span>
                </div>

                <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: `${cfg.ideal}%`, height: '100%', width: '2px', background: 'var(--text-muted)', opacity: 0.3, zIndex: 1 }} />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(actual, 100)}%` }}
                    transition={{ duration: 1 }}
                    style={{ height: '100%', background: cfg.color, borderRadius: '999px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{actual.toFixed(1)}%</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>({formatINR(amount)})</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: statusColor }}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% variance
                  </div>
                </div>
              </div>
            )
          })}
          
          <div className="finn-card" style={{ padding: '16px', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              The 50/30/20 rule is a guide. If you're a high-earner, your <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Savings</span> should ideally be much higher than 20%.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

function BudgetSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="h-16 bg-muted rounded-xl"/>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-muted rounded-2xl"/>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl"/>)}
        </div>
      </div>
    </div>
  )
}
