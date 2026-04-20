'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Sparkles, TrendingUp, 
  TrendingDown, AlertTriangle, CheckCircle,
  Lightbulb, Target, Zap, RefreshCw,
  ChevronRight, Star, Info, Eye, TrendingUp as TrendingUpIcon, MessageCircle, FileText
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { formatCurrency, formatINR } from '@/lib/utils'

// BackButton component since it's used in other pages
function BackButton({ href }: { href: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
      <ChevronRight className="w-4 h-4 rotate-180" />
      Back
    </a>
  )
}

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
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          forceRefresh: refresh 
        })
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

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <BackButton href="/dashboard" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity 
            }}
            className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30"
          >
            <Brain className="w-6 h-6 text-white"/>
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold">AI Brain</h1>
            <p className="text-sm text-muted-foreground">
              Your personal financial intelligence
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm hover:border-violet-500/50 transition-all duration-200 disabled:opacity-50"
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : {}}
            transition={{ 
              duration: 1, 
              repeat: refreshing ? Infinity : 0,
              ease: 'linear'
            }}
          >
            <RefreshCw className="w-4 h-4"/>
          </motion.div>
          {refreshing ? 'Analyzing...' : 'Refresh insights'}
        </motion.button>
      </div>

      {/* Cache indicator */}
      {data.fromCache && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600/10 border border-violet-600/20 rounded-lg text-xs text-violet-400"
        >
          <Zap className="w-3 h-3"/>
          Served from cache — click Refresh for new analysis
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Health Score + Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Health Score Ring */}
                <div className="md:col-span-1 bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center">
                  <HealthScoreRing 
                    score={data.healthScore?.score || 0}
                    grade={data.healthScore?.grade || 'F'}
                  />
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    {data.healthScore?.message}
                  </p>
                </div>

                {/* Stats */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Total Income',
                      value: formatINR(data.stats?.totalIncome || 0),
                      icon: TrendingUp,
                      color: 'emerald'
                    },
                    {
                      label: 'Total Expenses',
                      value: formatINR(data.stats?.totalExpenses || 0),
                      icon: TrendingDown,
                      color: 'rose'
                    },
                    {
                      label: 'Savings Rate',
                      value: `${(data.stats?.savingsRate || 0).toFixed(1)}%`,
                      icon: Target,
                      color: data.stats?.savingsRate >= 20 ? 'emerald' : 'amber'
                    },
                    {
                      label: 'Transactions',
                      value: data.stats?.transactionCount || 0,
                      icon: Zap,
                      color: 'violet'
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card border border-border rounded-xl p-4 hover:border-violet-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <stat.icon className={`w-4 h-4 text-${stat.color}-500`}/>
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                      <p className={`text-xl font-bold ${stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'rose' ? 'text-rose-500' : stat.color === 'amber' ? 'text-amber-500' : 'text-violet-500'}`}>
                        {stat.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-600/10 to-indigo-600/5 border border-violet-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-violet-400"/>
                  <h3 className="font-semibold">AI Summary</h3>
                  <span className="text-xs bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full">
                    {data.fromCache ? 'Cached' : 'Fresh'}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {data.insights?.summary || 'Analysis in progress...'}
                </p>
              </motion.div>

              {/* Top Categories */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Top Spending Categories</h3>
                <div className="space-y-3">
                  {(data.topCategories || []).slice(0, 5).map((cat: any, i: number) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{cat.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{cat.percentage?.toFixed(1)}%</span>
                          <span className="text-sm font-semibold">{formatINR(cat.amount || 0)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PERSONALITY TAB */}
          {activeTab === 'personality' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gradient-to-br from-violet-600/20 via-card to-indigo-600/10 border border-violet-500/30 rounded-2xl p-8 text-center overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl"/>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"/>
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-7xl mb-4"
                  >
                    {data.personality?.emoji || '🧠'}
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">{data.personality?.type || 'Analyzing...'}</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                    {data.personality?.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
                    <div className="text-left">
                      <p className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                      <div className="space-y-1.5">
                        {(data.personality?.strengths || []).map((s: string) => (
                          <div key={s} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0"/>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">Watch out for</p>
                      <div className="space-y-1.5">
                        {(data.personality?.weaknesses || []).map((w: string) => (
                          <div key={w} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0"/>
                            {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-start gap-2 px-4 py-3 bg-violet-600/10 border border-violet-600/20 rounded-xl text-sm text-left max-w-md">
                    <Lightbulb className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5"/>
                    <p className="text-muted-foreground">
                      <span className="text-violet-400 font-medium">Tip: </span>
                      {data.personality?.tip}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">All Financial Personalities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { type: 'Weekend Warrior', emoji: '🎉', desc: 'Spends more on weekends' },
                    { type: 'Subscription Hoarder', emoji: '📦', desc: '5+ recurring charges' },
                    { type: 'Impulse Spender', emoji: '⚡', desc: 'High anomaly count' },
                    { type: 'Steady Saver', emoji: '🏦', desc: 'Consistent + disciplined' },
                    { type: 'Big Ticket Buyer', emoji: '🛍️', desc: 'Few large transactions' },
                    { type: 'Daily Spender', emoji: '☕', desc: 'Many small daily spends' },
                  ].map(p => (
                    <motion.div
                      key={p.type}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-xl border transition-all ${
                        data.personality?.type === p.type
                          ? 'border-violet-500 bg-violet-600/10'
                          : 'border-border bg-background/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{p.emoji}</div>
                      <p className="text-xs font-semibold">
                        {p.type}
                        {data.personality?.type === p.type && <span className="ml-1.5 text-violet-400">← You</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {data.fromCache ? 'AI-generated insights from cache' : 'Fresh AI-generated insights'}
              </p>
              {(data.insights?.insights || []).map((insight: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-5 rounded-2xl border relative overflow-hidden ${
                    insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' :
                    insight.type === 'danger' ? 'bg-rose-500/5 border-rose-500/20' :
                    insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-violet-500/5 border-violet-500/20'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    insight.type === 'positive' ? 'bg-emerald-500' :
                    insight.type === 'danger' ? 'bg-rose-500' :
                    insight.type === 'warning' ? 'bg-amber-500' :
                    'bg-violet-500'
                  }`}/>
                  <div className="flex items-start gap-3 pl-3">
                    {insight.type === 'positive' ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"/> :
                     insight.type === 'danger' ? <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5"/> :
                     insight.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/> :
                     <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5"/>
                    }
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                      {insight.amount && (
                        <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                          insight.type === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {formatINR(insight.amount || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {data.insights?.savingOpportunity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-5 bg-teal-500/5 border border-teal-500/20 rounded-2xl flex items-start gap-3"
                >
                  <Target className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm font-semibold text-teal-400 mb-1">Saving Opportunity</p>
                    <p className="text-sm text-muted-foreground">{data.insights.savingOpportunity}</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* WEEKLY NUDGES TAB */}
          {activeTab === 'nudges' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-6 bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/20 rounded-2xl overflow-hidden"
              >
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-4xl mb-4">💡</motion.div>
                <h3 className="text-lg font-bold mb-2">This Week's Nudge</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {data.insights?.weeklyNudge || 'Keep tracking your spending!'}
                </p>
              </motion.div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Health Score Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Savings Rate', score: data.healthScore?.breakdown?.savingsRate || 0, max: 40, color: '#8b5cf6' },
                    { label: 'Spending Consistency', score: data.healthScore?.breakdown?.consistency || 0, max: 20, color: '#10b981' },
                    { label: 'Anomaly Control', score: data.healthScore?.breakdown?.anomalyPenalty || 0, max: 20, color: '#f59e0b' },
                    { label: 'Subscription Health', score: data.healthScore?.breakdown?.subscriptionRatio || 0, max: 20, color: '#6366f1' },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm">{item.label}</span>
                        <span className="text-sm font-semibold">{item.score}/{item.max}</span>
                      </div>
                      <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0, backgroundColor: '#374151' }}
                          animate={{ 
                            width: `${Math.max((item.score / item.max) * 100, 2)}%`,
                            backgroundColor: item.color
                          }}
                          transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="font-semibold">Total Health Score</span>
                  <span className="text-2xl font-bold text-violet-400">{data.healthScore?.score}/100</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">How to improve your score</h3>
                <div className="space-y-3">
                  {[
                    { tip: 'Save at least 20% of income', impact: '+15 points', done: (data.stats?.savingsRate || 0) >= 20 },
                    { tip: 'Keep spending consistent monthly', impact: '+10 points', done: (data.healthScore?.breakdown?.consistency || 0) >= 15 },
                    { tip: 'Reduce unusual transactions', impact: '+10 points', done: (data.anomalies?.length || 0) === 0 },
                    { tip: 'Keep subscriptions under 5', impact: '+5 points', done: (data.stats?.subscriptionCount || 0) <= 5 },
                  ].map((item, i) => (
                    <motion.div
                      key={item.tip}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {item.done ? <CheckCircle className="w-4 h-4 text-green-400"/> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground"/>}
                        <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.tip}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.done ? 'bg-green-500/10 text-green-400' : 'bg-violet-500/10 text-violet-400'}`}>
                        {item.done ? 'Done ✓' : item.impact}
                      </span>
                    </motion.div>
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

function HealthScoreRing({ score, grade }: { score: number, grade: string }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 71 ? '#10b981' : score >= 41 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
        <motion.circle
          cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-4xl font-bold" style={{ color }}>{score}</motion.span>
        <span className="text-sm font-medium" style={{ color }}>Grade {grade}</span>
        <span className="text-xs text-muted-foreground">Health Score</span>
      </div>
    </div>
  )
}

function BrainSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-muted rounded-2xl"/>
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded"/>
          <div className="h-4 w-48 bg-muted rounded"/>
        </div>
      </div>
      <div className="flex gap-1 w-fit">
        {[1,2,3,4].map(i => <div key={i} className="h-9 w-24 bg-muted rounded-lg"/>)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-48 bg-muted rounded-2xl"/>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-xl"/>)}
        </div>
      </div>
      <div className="h-32 bg-muted rounded-2xl"/>
    </div>
  )
}

function EmptyBrain() {
  return (
    <div className="p-6 flex items-center justify-center min-h-96">
      <div className="text-center">
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-4">🧠</motion.div>
        <h3 className="text-xl font-bold mb-2">AI Brain needs data</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Upload your bank statement to activate your AI Brain and get personalized financial intelligence.</p>
        <a href="/dashboard" className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2">
          Upload Statement
          <ChevronRight className="w-4 h-4"/>
        </a>
      </div>
    </div>
  )
}
