'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseDataOptions {
  url: string
}

interface UseDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useData<T>({ url }: UseDataOptions): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
      const res = await fetch(fetchUrl)
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || `Error ${res.status}`)
        return
      }
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }, [url, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ─── Typed hooks ──────────────────────────────────────────────────────────────

export interface InsightItem {
  title: string
  description: string
  type: 'positive' | 'warning' | 'danger' | 'info'
  amount?: number
}

export interface InsightsData {
  success: boolean
  insights: {
    summary: string
    insights: InsightItem[]
    weeklyNudge: string
    savingOpportunity: string
    fromCache: boolean
  }
  stats: {
    totalIncome: number
    totalExpenses: number
    savingsRate: number
    topCategories: { category: string; amount: number; percentage: number }[]
    anomalyCount: number
    subscriptionCount: number
    healthScore: number
    personality: string
    transactionCount: number
  }
  personality: {
    type: string
    emoji: string
    description: string
    strengths: string[]
    weaknesses: string[]
    tip: string
  }
  healthGrade: string
}

export function useInsights() {
  return useData<InsightsData>({ url: '/api/insights' })
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  category: string
  is_anomaly: boolean
  is_subscription: boolean
}

export interface TransactionsData {
  transactions: Transaction[]
  total: number
  page: number
  limit: number
}

export function useTransactions(limit = 50, page = 1) {
  return useData<TransactionsData>({
    url: `/api/transactions?limit=${limit}&page=${page}`,
  })
}

export interface CashFlowData {
  success: boolean
  cashFlow: {
    predictedIncome: number
    predictedExpenses: number
    predictedBalance: number
    trend: 'improving' | 'stable' | 'declining'
    alerts: { type: string; message: string; amount?: number; daysFromNow?: number }[]
    fixedExpenses: { description: string; amount: number; frequency: string }[]
    chartData: { date: string; balance?: number; predicted?: number }[]
    savingsForecast: { monthly: number; yearly: number; onTrack: boolean }
  }
}

export function useCashFlow() {
  return useData<CashFlowData>({ url: '/api/cashflow' })
}

export interface ReportsData {
  success: boolean
  report: {
    period: { from: string; to: string }
    income: { total: number; transactions: number }
    expenses: { total: number; transactions: number }
    savings: { amount: number; rate: number }
    anomalies: { count: number; transactions: any[] }
    subscriptions: { count: number; monthlyTotal: number }
    topCategories: { category: string; amount: number; percentage: number }[]
    healthScore: { score: number; grade: string }
    personality: any
    cashFlow: any
    monthlyTrend: { month: string; income: number; expenses: number }[]
    highlights: { best: any; worst: any; biggest: any; consistent: any }
  }
}

export function useReports() {
  return useData<ReportsData>({ url: '/api/reports' })
}
