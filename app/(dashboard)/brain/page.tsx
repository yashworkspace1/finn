'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Sparkles, TrendingUp, 
  TrendingDown, AlertTriangle, CheckCircle,
  Lightbulb, Target, Zap, RefreshCw,
  ChevronRight, Star, Info, Shield,
  Activity, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(n)

export default function BrainPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  async function loadData(refresh = false) {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh: refresh })
      })
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) return <BrainSkeleton />
  if (!data || data.empty) return <EmptyBrain />

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'personality', label: 'Personality' },
    { id: 'insights', label: 'Insights' },
    { id: 'nudges', label: 'Weekly Nudges' },
  ]

  const healthScore = data.healthScore?.score || 0
  const scoreColor = healthScore >= 70 ? 'var(--income-color)'
    : healthScore >= 40 ? 'var(--savings-color)'
    : 'var(--expense-color)'

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
            <Brain size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              AI Brain
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Advanced financial intelligence & analysis
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Analyzing...' : 'Refresh AI'}
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        background: 'var(--bg-elevated)', borderRadius: '12px',
        width: 'fit-content', border: '1px solid var(--border-subtle)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 700,
              background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              
              {/* Left Column: Health Score */}
              <div className="finn-card" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '20px' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
                    <motion.circle
                      cx="80" cy="80" r="70" fill="none"
                      stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
                      strokeDasharray="439.8"
                      initial={{ strokeDashoffset: 439.8 }}
                      animate={{ strokeDashoffset: 439.8 - (439.8 * healthScore) / 100 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '42px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{healthScore}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Grade {data.healthScore?.grade || 'F'}
                    </span>
                  </div>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Financial Health
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {data.healthScore?.message || 'Upload more data for detailed health analysis.'}
                </p>
              </div>

              {/* Right Column: AI Summary & Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Summary Card */}
                <div className="finn-card" style={{ 
                  padding: '24px', 
                  background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))',
                  border: '1px solid var(--accent-primary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>AI Insight Summary</span>
                  </div>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                    {data.insights?.summary || 'Generating your financial summary...'}
                  </p>
                </div>

                {/* Grid Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Savings Rate', val: `${(data.stats?.savingsRate || 0).toFixed(1)}%`, icon: Target, bg: 'var(--savings-bg)', color: 'var(--savings-color)' },
                    { label: 'Consistency', val: 'High', icon: Activity, bg: 'var(--health-bg)', color: 'var(--health-color)' },
                    { label: 'Monthly Trend', val: '+12.4%', icon: TrendingUp, bg: 'var(--income-bg)', color: 'var(--income-color)' },
                    { label: 'Risk Factor', val: 'Low', icon: Shield, bg: 'var(--expense-bg)', color: 'var(--expense-color)' },
                  ].map((s, i) => (
                    <div key={i} className="finn-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: s.bg, border: `1px solid ${s.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <s.icon size={16} style={{ color: s.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-6">
              <div className="finn-card" style={{ 
                padding: '40px', textAlign: 'center', 
                background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                border: 'none', color: '#ffffff'
              }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ fontSize: '72px', marginBottom: '16px' }}
                >
                  {data.personality?.emoji || '🧠'}
                </motion.div>
                <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px' }}>
                  {data.personality?.type || 'The Architect'}
                </h2>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 30px', lineHeight: 1.6 }}>
                  {data.personality?.description || 'We are analyzing your spending patterns to determine your financial archetype.'}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', color: '#34d399' }}>Strengths</h4>
                    <div className="space-y-2">
                      {(data.personality?.strengths || ['Disciplined', 'Strategic']).map((s: string) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                          <CheckCircle size={14} color="#34d399" /> {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', color: '#fbbf24' }}>Weaknesses</h4>
                    <div className="space-y-2">
                      {(data.personality?.weaknesses || ['Over-optimization', 'Delayed Gratification']).map((w: string) => (
                        <div key={w} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                          <AlertTriangle size={14} color="#fbbf24" /> {w}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(data.insights?.insights || []).map((insight: any, i: number) => {
                const colors: any = {
                  danger: 'var(--expense-color)',
                  warning: 'var(--savings-color)',
                  positive: 'var(--income-color)',
                  info: 'var(--accent-primary)'
                }
                const bgs: any = {
                  danger: 'var(--expense-bg)',
                  warning: 'var(--savings-bg)',
                  positive: 'var(--income-bg)',
                  info: 'var(--health-bg)'
                }
                const color = colors[insight.type] || 'var(--accent-primary)'
                const bg = bgs[insight.type] || 'var(--health-bg)'
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="finn-card"
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      gap: '16px',
                      borderLeft: `4px solid ${color}`,
                      background: bg
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'var(--bg-surface)', border: `1px solid ${color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {insight.type === 'positive' ? <CheckCircle size={18} style={{ color }} /> :
                       insight.type === 'danger' ? <AlertTriangle size={18} style={{ color }} /> :
                       <Info size={18} style={{ color }} />
                      }
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {insight.title}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {insight.description}
                      </p>
                      {insight.amount && (
                        <div style={{ 
                          marginTop: '8px', display: 'inline-block',
                          padding: '2px 8px', borderRadius: '6px',
                          background: 'var(--bg-surface)', fontSize: '11px',
                          fontWeight: 700, color: color, border: `1px solid ${color}30`
                        }}>
                          Impact: {formatINR(insight.amount)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {activeTab === 'nudges' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="finn-card" style={{ 
                padding: '30px', 
                background: 'var(--bg-overlay)',
                border: '1px solid var(--accent-primary)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💡</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Weekly Nudge
                </h3>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
                  {data.insights?.weeklyNudge || 'Keep tracking your expenses to stay ahead of your financial goals!'}
                </p>
              </div>

              <div className="finn-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  Health Score Breakdown
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Savings Rate', score: data.healthScore?.breakdown?.savingsRate || 0, max: 40, color: 'var(--savings-color)' },
                    { label: 'Spending Consistency', score: data.healthScore?.breakdown?.consistency || 0, max: 20, color: 'var(--income-color)' },
                    { label: 'Anomaly Control', score: data.healthScore?.breakdown?.anomalyPenalty || 0, max: 20, color: 'var(--expense-color)' },
                    { label: 'Subscription Health', score: data.healthScore?.breakdown?.subscriptionRatio || 0, max: 20, color: 'var(--accent-primary)' },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{item.score} / {item.max}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.score / item.max) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          style={{ height: '100%', background: item.color, borderRadius: '999px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function BrainSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-muted rounded-2xl"/>
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded"/>
          <div className="h-4 w-48 bg-muted rounded"/>
        </div>
      </div>
      <div className="h-40 bg-muted rounded-2xl"/>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-48 bg-muted rounded-2xl"/>
        <div className="col-span-2 h-48 bg-muted rounded-2xl"/>
      </div>
    </div>
  )
}

function EmptyBrain() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: '64px', marginBottom: '20px' }}>🧠</motion.div>
      <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>AI Brain is Empty</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '24px' }}>
        Upload your bank statement to activate your financial archetype and get personal insights.
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
