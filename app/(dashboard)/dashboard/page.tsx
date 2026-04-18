'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, Heart, Lightbulb, X,
  CheckCircle, AlertTriangle, XCircle, Info,
  PiggyBank, ArrowRight, Brain, Upload
} from 'lucide-react'
import CountUp from 'react-countup'
import { useInsights } from '@/hooks/useData'
import { HealthScore } from '@/components/dashboard/HealthScore'
import { SkeletonCard, SkeletonChart } from '@/components/common/Loader'
import { CATEGORY_COLORS, HEALTH_SCORE_COLOR } from '@/utils/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  const router = useRouter()
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center gap-6">
      <div className="rounded-full bg-violet-100 dark:bg-violet-900/20 p-8">
        <Brain className="h-16 w-16 text-violet-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">No financial data yet</h2>
        <p className="text-muted-foreground max-w-sm">
          Upload your bank statement to get AI-powered insights about your spending.
        </p>
      </div>
      <Button onClick={() => router.push('/onboarding')} className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8">
        Upload Statement <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

// ─── Dashboard Skeleton ───────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}

// ─── Insight Icon ─────────────────────────────────────────────────────────────
function InsightIcon({ type }: { type: string }) {
  if (type === 'positive') return <CheckCircle className="h-5 w-5 text-emerald-500" />
  if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />
  if (type === 'danger') return <XCircle className="h-5 w-5 text-rose-500" />
  return <Info className="h-5 w-5 text-violet-500" />
}

const INSIGHT_BORDER: Record<string, string> = {
  positive: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  danger: 'border-l-rose-500',
  info: 'border-l-violet-500',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { data, loading, error } = useInsights()
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('finn-nudge-dismissed') === 'true') {
      setNudgeDismissed(true)
    }
  }, [])

  const dismissNudge = () => {
    localStorage.setItem('finn-nudge-dismissed', 'true')
    setNudgeDismissed(true)
  }

  if (loading) return <DashboardSkeleton />
  if (error || !data?.stats) return <EmptyState />

  const { stats, insights, personality, healthGrade } = data
  const savingsColor = stats.savingsRate >= 20 ? 'text-emerald-500' : stats.savingsRate >= 10 ? 'text-amber-500' : 'text-rose-500'

  const statsCards = [
    {
      label: 'Total Income',
      value: stats.totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      prefix: '₹',
    },
    {
      label: 'Total Expenses',
      value: stats.totalExpenses,
      icon: TrendingDown,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      prefix: '₹',
    },
    {
      label: 'Savings Rate',
      value: stats.savingsRate,
      icon: PiggyBank,
      color: savingsColor,
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      suffix: '%',
      decimals: 1,
    },
    {
      label: 'Health Score',
      value: stats.healthScore,
      icon: Heart,
      color: HEALTH_SCORE_COLOR(stats.healthScore),
      bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
      suffix: '/100',
    },
  ]

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Right Action */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/onboarding')}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-violet-500/50 rounded-lg transition-all duration-200"
        >
          <Upload className="w-3 h-3"/>
          Re-upload
        </button>
      </div>

      {/* Weekly Nudge Banner */}
      <AnimatePresence>
        {!nudgeDismissed && insights?.weeklyNudge && (
          <motion.div
            key="nudge"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-white overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,white,transparent)]" />
            <div className="flex items-start gap-3 relative z-10">
              <Lightbulb className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium flex-1">{insights.weeklyNudge}</p>
              <button onClick={dismissNudge} className="text-white/70 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              className="rounded-xl border bg-card p-5 cursor-default transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
                <div className={`rounded-full p-2 ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold tabular-nums ${card.color}`}>
                <CountUp
                  end={card.value}
                  duration={1.2}
                  separator=","
                  prefix={card.prefix}
                  suffix={card.suffix}
                  decimals={card.decimals}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Health Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-center">
              <HealthScore score={stats.healthScore} grade={healthGrade} />
              <div className="flex-1 space-y-3 w-full">
                <div className="space-y-2">
                  {[
                    { label: 'Savings Rate', pct: Math.min(stats.savingsRate, 100), color: 'bg-emerald-500' },
                    { label: 'Spend Control', pct: Math.max(0, 100 - (stats.totalExpenses / (stats.totalIncome || 1)) * 100), color: 'bg-violet-500' },
                    { label: 'Anomaly Free', pct: Math.max(0, 100 - stats.anomalyCount * 10), color: 'bg-blue-500' },
                  ].map(bar => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{bar.label}</span>
                        <span>{Math.round(bar.pct)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${bar.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights?.insights?.length ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                  {insights.insights.map((insight: any, i: number) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className={`border-l-4 rounded-r-xl bg-muted/30 px-4 py-3 ${INSIGHT_BORDER[insight.type]}`}
                    >
                      <div className="flex items-start gap-2">
                        <InsightIcon type={insight.type} />
                        <div>
                          <p className="font-semibold text-sm">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                          {insight.amount && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              ₹{insight.amount.toLocaleString('en-IN')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="text-muted-foreground text-sm">No insights available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personality Card */}
          {personality && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-6 rounded-2xl bg-card border border-transparent before:absolute before:inset-0 before:rounded-2xl before:p-px before:bg-gradient-to-br before:from-violet-500 before:to-indigo-500 before:-z-10"
            >
              <div className="text-4xl mb-3">{personality.emoji}</div>
              <h3 className="text-lg font-bold mb-1">{personality.type}</h3>
              <p className="text-sm text-muted-foreground mb-4">{personality.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-500 mb-2">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {personality.strengths?.map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-500 mb-2">Watch Out</p>
                  <div className="flex flex-wrap gap-1">
                    {personality.weaknesses?.map((w: string) => (
                      <Badge key={w} variant="secondary" className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {personality.tip && (
                <div className="flex gap-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 p-3">
                  <Lightbulb className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{personality.tip}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Top Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Top Categories</CardTitle>
              <Link href="/dashboard/spendlens" className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topCategories?.slice(0, 5).map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-muted-foreground">₹{cat.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] || 'hsl(var(--chart-1))' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
