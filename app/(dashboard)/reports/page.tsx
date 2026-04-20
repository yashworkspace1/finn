'use client'

import { useState } from 'react'
import { formatINR } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { FileText, Download, Share2, Trophy, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react'
import { useReports } from '@/hooks/useData'
import { SkeletonCard, SkeletonChart } from '@/components/common/Loader'
import { CATEGORY_COLORS, CHART_COLORS, HEALTH_SCORE_COLOR } from '@/utils/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { BackButton } from '@/components/common/BackButton'

export default function ReportsPage() {
  const { data, loading } = useReports()
  const [showAllCategories, setShowAllCategories] = useState(false)

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
        <SkeletonChart />
        <SkeletonChart />
      </div>
    )
  }

  const report = data?.report
  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No report data available. Upload a statement first.</p>
      </div>
    )
  }

  const netSavings = report.income.total - report.expenses.total
  const visibleCategories = showAllCategories ? report.topCategories : report.topCategories?.slice(0, 8)

  const scoreCards = [
    { label: 'Total Income', value: formatINR(report.income.total), color: 'text-emerald-500', icon: '💰' },
    { label: 'Total Expenses', value: formatINR(report.expenses.total), color: 'text-rose-500', icon: '💸' },
    { label: 'Net Savings', value: formatINR(Math.abs(netSavings)), color: netSavings >= 0 ? 'text-violet-500' : 'text-red-500', icon: netSavings >= 0 ? '🏆' : '⚠️' },
    { label: 'Savings Rate', value: `${report.savings.rate.toFixed(1)}%`, color: report.savings.rate >= 20 ? 'text-emerald-500' : report.savings.rate >= 10 ? 'text-amber-500' : 'text-rose-500', icon: '📊' },
    { label: 'Anomalies', value: `${report.anomalies.count} found`, color: report.anomalies.count > 0 ? 'text-red-500' : 'text-emerald-500', icon: '🔍' },
    { label: 'Subscriptions', value: `${report.subscriptions.count} active`, color: 'text-amber-500', icon: '🔄' },
  ]

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
            <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Financial Report</h1>
            <p className="text-sm text-muted-foreground">{report.period.from} → {report.period.to}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => toast('PDF export coming soon! 🚀')}>
            <Download className="h-4 w-4" />PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}>
            <Share2 className="h-4 w-4" />Share
          </Button>
        </div>
      </div>

      {/* Scorecard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {scoreCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{card.icon}</span>
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
            </div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Income vs Expenses Chart */}
      {report.monthlyTrend?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Income vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={report.monthlyTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: any) => formatINR(Number(val))} />
                <Legend />
                <Bar dataKey="income" fill={CHART_COLORS.secondary} name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill={CHART_COLORS.danger} name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-base">Category Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {visibleCategories?.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{cat.category}</span>
                <span className="text-muted-foreground">{formatINR(cat.amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || 'hsl(var(--chart-1))' }}
                    initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{cat.percentage}%</span>
              </div>
            </div>
          ))}
          {report.topCategories?.length > 8 && (
            <button onClick={() => setShowAllCategories(v => !v)} className="text-xs text-violet-500 hover:text-violet-400 font-medium">
              {showAllCategories ? 'Show less ↑' : `Show ${report.topCategories.length - 8} more ↓`}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: '🏆', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Best Savings Month', value: report.highlights?.best?.label || 'N/A' },
          { icon: '⚠️', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', label: 'Highest Spend Month', value: report.highlights?.worst?.label || 'N/A' },
          { icon: '💳', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', label: 'Biggest Transaction', value: report.highlights?.biggest?.label || 'N/A' },
          { icon: '🔄', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20', label: 'Most Consistent', value: report.highlights?.consistent?.label || 'N/A' },
        ].map((h) => (
          <div key={h.label} className={`rounded-xl p-4 ${h.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{h.icon}</span>
              <span className={`text-xs font-medium ${h.color}`}>{h.label}</span>
            </div>
            <p className="text-sm font-semibold">{h.value}</p>
          </div>
        ))}
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader><CardTitle className="text-base">Financial Health Score</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold" style={{ color: HEALTH_SCORE_COLOR(report.healthScore.score) }}>
              {report.healthScore.score}
            </div>
            <div>
              <p className="font-semibold">Grade {report.healthScore.grade}</p>
              <p className="text-sm text-muted-foreground">out of 100</p>
            </div>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-muted/30 overflow-hidden relative">
                <motion.div 
                  className="h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]" 
                  initial={{ width: 0, backgroundColor: '#374151' }} 
                  animate={{ 
                    width: `${report.healthScore.score}%`,
                    backgroundColor: HEALTH_SCORE_COLOR(report.healthScore.score),
                    boxShadow: `0 0 15px ${HEALTH_SCORE_COLOR(report.healthScore.score)}44`
                  }} 
                  transition={{ duration: 1.2, ease: 'easeOut' }} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
