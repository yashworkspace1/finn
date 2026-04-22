import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('merchant, description, amount, type, date, category, month')
      .eq('user_id', user.id)
      .eq('type', 'debit')
      .not('merchant', 'is', null)
      .order('date', { ascending: true })

    const txs = transactions || []

    // Build merchant profiles
    const merchantMap: Record<string, {
      merchant: string
      category: string
      totalSpent: number
      txCount: number
      dates: string[]
      monthlySpend: Record<string, number>
      amounts: number[]
    }> = {}

    txs.forEach(t => {
      const key = t.merchant || 'Unknown'
      if (key === 'Unknown' || key === 'Empty' || key.length < 2) return

      if (!merchantMap[key]) {
        merchantMap[key] = {
          merchant: key,
          category: t.category || 'Others',
          totalSpent: 0,
          txCount: 0,
          dates: [],
          monthlySpend: {},
          amounts: [],
        }
      }

      merchantMap[key].totalSpent += Number(t.amount)
      merchantMap[key].txCount++
      merchantMap[key].dates.push(t.date)
      merchantMap[key].amounts.push(Number(t.amount))

      const month = t.month || t.date?.slice(0, 7)
      if (month) {
        merchantMap[key].monthlySpend[month] =
          (merchantMap[key].monthlySpend[month] || 0) + Number(t.amount)
      }
    })

    const profiles = Object.values(merchantMap)
      .map(m => ({
        merchant: m.merchant,
        category: m.category,
        totalSpent: m.totalSpent,
        txCount: m.txCount,
        avgPerVisit: m.totalSpent / m.txCount,
        firstSeen: m.dates[0],
        lastSeen: m.dates[m.dates.length - 1],
        monthlySpend: m.monthlySpend,
        // Frequency: avg days between visits
        avgDaysBetween: m.dates.length > 1
          ? (new Date(m.dates[m.dates.length - 1]).getTime() -
             new Date(m.dates[0]).getTime()) /
            (1000 * 60 * 60 * 24) / (m.dates.length - 1)
          : null,
        // Trend: is spending increasing?
        trend: (() => {
          const months = Object.entries(m.monthlySpend).sort((a, b) => a[0].localeCompare(b[0]))
          if (months.length < 2) return 'stable'
          const last = months[months.length - 1][1]
          const prev = months[months.length - 2][1]
          if (last > prev * 1.2) return 'increasing'
          if (last < prev * 0.8) return 'decreasing'
          return 'stable'
        })(),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)

    // Top 5 by total spent
    const topByTotal = profiles.slice(0, 5)

    // Top 5 by frequency
    const topByFrequency = [...profiles]
      .sort((a, b) => b.txCount - a.txCount)
      .slice(0, 5)

    // Category totals
    const categoryTotals: Record<string, number> = {}
    profiles.forEach(p => {
      categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.totalSpent
    })

    return NextResponse.json({
      profiles: profiles.slice(0, 50),
      topByTotal,
      topByFrequency,
      totalMerchants: profiles.length,
      categoryTotals,
    })

  } catch (error) {
    console.error('[Merchants] Error:', error)
    return NextResponse.json({ error: 'Failed to load merchant data' }, { status: 500 })
  }
}
