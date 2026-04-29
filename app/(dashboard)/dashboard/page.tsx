'use client'

import { useInsights, useCashFlow } from '@/hooks/useData'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useState } from 'react'
import {
  TrendingUp, TrendingDown, RefreshCw, Upload,
  Brain, Zap, AlertCircle, CreditCard,
  ArrowUpRight, Shield,
  Activity, Target, Droplets, AlertTriangle, Sparkles
} from 'lucide-react'

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(n)

const formatINRShort = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return `₹${Math.round(n)}`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [cashFlowRange, setCashFlowRange] = useState('1M')
  
  const { data: insightsData, loading: insightsLoading, refetch: refetchInsights } = useInsights()
  const { data: cashFlowData, loading: cashFlowLoading, refetch: refetchCashFlow } = useCashFlow()

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchInsights(), refetchCashFlow()])
    setRefreshing(false)
  }

  const stats = insightsData?.stats
  const insightsList = insightsData?.insights?.insights || []
  const topCategories = insightsData?.stats?.topCategories || []
  const healthScore = stats?.healthScore || 0
  const savingsRate = stats?.savingsRate || 0
  const totalIncome = stats?.totalIncome || 0
  const totalExpenses = stats?.totalExpenses || 0
  const anomalyCount = stats?.anomalyCount || 0
  const scoreColor = healthScore >= 70 ? '#34d399' : healthScore >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div className="flex flex-col gap-[20px]">
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Welcome back, {user?.email?.split('@')[0]} · Updated {refreshing ? 'just now' : 'recently'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: '10px 16px', borderRadius: '12px', background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s', opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link href="/onboarding">
            <button style={{
              padding: '10px 18px', borderRadius: '12px', background: 'var(--accent-primary)',
              border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
            }}>
              <Upload size={14} />
              Upload Statement
            </button>
          </Link>
        </div>
      </div>

      {/* ── TOP STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {insightsLoading ? (
          [1,2,3,4].map(i => <div key={i} className="finn-card animate-pulse" style={{ height: '120px' }} />)
        ) : (
          <>
            {/* Income */}
            <div className="finn-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} style={{ color: 'var(--income-color)' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Income</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                {formatINRShort(stats?.totalIncome || 0)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {formatINR(stats?.totalIncome || 0)}
              </div>
            </div>

            {/* Expenses */}
            <div className="finn-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(248, 113, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={16} style={{ color: 'var(--expense-color)' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Expenses</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                {formatINRShort(stats?.totalExpenses || 0)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {formatINR(stats?.totalExpenses || 0)}
              </div>
            </div>

            {/* Savings Rate */}
            <div className="finn-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} style={{ color: 'var(--savings-color)' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Savings Rate</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                {stats?.savingsRate?.toFixed(1) || 0}%
              </div>
              <div style={{ marginTop: '8px', width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                <div style={{ width: `${Math.min(stats?.savingsRate || 0, 100)}%`, height: '100%', background: 'var(--savings-color)', borderRadius: '2px' }} />
              </div>
            </div>

            {/* Health Score */}
            <div className="finn-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Health Score</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                {stats?.healthScore || 0}<span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
              </div>
              <div style={{ marginTop: '8px', width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                <div style={{ width: `${stats?.healthScore || 0}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '2px' }} />
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {/* AI Personality Card */}
        {insightsLoading ? (
          <div className="finn-card animate-pulse" style={{ background: 'var(--accent-primary)', opacity: 0.2, height: '280px' }} />
        ) : (
          <div className="finn-card" style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
            padding: '24px', color: 'white', position: 'relative', overflow: 'hidden',
            minHeight: '220px', display: 'flex', alignItems: 'center'
          }}>
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={22} fill="white" />
                </div>
                <div style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Financial Personality
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>{insightsData?.personality?.type || 'Impulse Spender'}</h2>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', marginBottom: '0' }}>
                    {insightsData?.insights?.summary || 'Analyzing your financial behavior...'}
                  </p>
                </div>

                <div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.6)' }}><Sparkles size={14} /></div>
                      <p style={{ fontSize: '11px', color: 'white', fontWeight: 500, lineHeight: 1.5 }}>
                        {insightsData?.insights?.weeklyNudge || 'Keep tracking to unlock personalized AI insights.'}
                      </p>
                    </div>
                  </div>

                  <Link href="/brain" style={{ textDecoration: 'none' }}>
                    <button style={{
                      width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '12px', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s'
                    }}>
                      <Brain size={16} />
                      Consult Your AI Brain
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            {/* Background pattern */}
            <div style={{ position: 'absolute', bottom: '-40px', right: '10%', opacity: 0.1 }}>
              <Zap size={200} fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* ── LOWER SECTION ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        
        {/* Top Categories */}
        <div className="finn-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Top Categories</h3>
            <Link href="/spendlens" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'none' }}>View all</Link>
          </div>
          {insightsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-10 w-full bg-muted rounded-lg" />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(topCategories || []).slice(0, 4).map((cat: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      {['🍔', '🚗', '🏠', '🛍️', '💊'][i % 5]}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.category}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{cat.percentage?.toFixed(0)}% of spend</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatINRShort(cat.amount)}</div>
                </div>
              ))}
              {!topCategories.length && <div className="text-center text-xs text-muted-foreground py-10">No data yet</div>}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="finn-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>AI Insights</h3>
            <Link href="/brain" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'none' }}>View all</Link>
          </div>
          {insightsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-12 w-full bg-muted rounded-lg" />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(insightsList || []).slice(0, 3).map((insight: any, i: number) => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', 
                  background: 'var(--bg-elevated)', borderRadius: '12px',
                  borderLeft: `3px solid ${insight.type === 'danger' ? 'var(--expense-color)' : insight.type === 'warning' ? 'var(--savings-color)' : 'var(--accent-primary)'}`
                }}>
                  <div style={{ color: insight.type === 'danger' ? 'var(--expense-color)' : 'var(--accent-primary)' }}>
                    {insight.type === 'danger' ? <AlertTriangle size={16} /> : <Zap size={16} />}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{insight.title}</div>
                </div>
              ))}
              {!insightsList.length && <div className="text-center text-xs text-muted-foreground py-10">No insights yet</div>}
            </div>
          )}
        </div>

        {/* Anomalies & Quick Stats */}
        <div className="finn-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Anomalies</h3>
            <Link href="/brain" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'none' }}>View all</Link>
          </div>
          {insightsLoading ? (
            <div className="flex flex-col items-center justify-center h-40 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-full mb-4" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(248, 113, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Droplets size={24} color="var(--expense-color)" />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{stats?.anomalyCount || 0} detected</div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Unusual transactions found</p>
            </div>
          )}
        </div>

      </div>

      {/* ── CATEGORY BREAKDOWN CHART ── */}
      {topCategories.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          {/* Horizontal bar chart */}
          <div className="finn-card" style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Categories
              </div>
              <Link href="/spendlens" style={{ fontSize: '11px', color: 'var(--accent-text)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                View all <ArrowUpRight size={11} />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topCategories.slice(0, 6)}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => formatINRShort(v)}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '10px',
                    fontSize: '11px'
                  }}
                  formatter={(v: any) => formatINR(v)}
                />
                <Bar dataKey="amount" name="Spent" radius={[0, 6, 6, 0]}>
                  {topCategories.slice(0, 6).map((_: any, index: number) => (
                    <Cell
                      key={index}
                      fill={['#a855f7','#34d399','#f87171','#60a5fa','#fbbf24','#f472b6'][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Health score donut + metrics */}
          <div className="finn-card" style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Financial Health
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Donut */}
              <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie
                      data={[
                        { value: healthScore },
                        { value: 100 - healthScore }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={50}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      paddingAngle={0}
                    >
                      <Cell fill={scoreColor} />
                      <Cell fill="var(--bg-elevated)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{healthScore}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>/ 100</div>
                </div>
              </div>

              {/* Metric rows */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, target: 20, current: Math.min(savingsRate, 20), color: savingsRate >= 20 ? '#34d399' : '#f87171' },
                  { label: 'Spend Control', value: totalExpenses < totalIncome ? 'Good' : 'Poor', target: 100, current: totalExpenses < totalIncome ? 70 : 20, color: totalExpenses < totalIncome ? '#34d399' : '#f87171' },
                  { label: 'Anomaly Free', value: `${Math.max(0, 100 - anomalyCount * 5)}%`, target: 100, current: Math.max(0, 100 - anomalyCount * 5), color: '#a855f7' },
                ].map((m, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.label}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: m.color }}>{m.value}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '999px' }}>
                      <div style={{
                        width: `${(m.current / m.target) * 100}%`,
                        height: '100%', borderRadius: '999px',
                        background: m.color, transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
