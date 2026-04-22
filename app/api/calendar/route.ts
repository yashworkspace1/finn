import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM

    if (!month) {
      return NextResponse.json({ error: 'Month required' }, { status: 400 })
    }

    const [year, mon] = month.split('-')
    const dateFrom = `${year}-${mon}-01`
    const dateTo = new Date(Number(year), Number(mon), 0)
      .toISOString().slice(0, 10)

    // Fetch all transactions for this month
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('id, date, description, merchant, amount, type, category, is_anomaly, is_subscription')
      .eq('user_id', user.id)
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true })

    if (error) throw error

    const txs = transactions || []

    // Group by date
    const byDate: Record<string, {
      date: string
      totalSpend: number
      totalIncome: number
      txCount: number
      transactions: any[]
    }> = {}

    txs.forEach(t => {
      if (!byDate[t.date]) {
        byDate[t.date] = {
          date: t.date,
          totalSpend: 0,
          totalIncome: 0,
          txCount: 0,
          transactions: []
        }
      }
      if (t.type === 'debit') byDate[t.date].totalSpend += Number(t.amount)
      if (t.type === 'credit') byDate[t.date].totalIncome += Number(t.amount)
      byDate[t.date].txCount++
      byDate[t.date].transactions.push(t)
    })

    // Day of week spend pattern
    const dayOfWeekSpend: Record<string, number> = {
      Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    txs.filter(t => t.type === 'debit').forEach(t => {
      const day = dayNames[new Date(t.date).getDay()]
      dayOfWeekSpend[day] += Number(t.amount)
    })

    const topSpendDay = Object.entries(dayOfWeekSpend)
      .sort((a, b) => b[1] - a[1])[0]

    // Detect salary credit day
    const salaryTx = txs
      .filter(t => t.type === 'credit')
      .sort((a, b) => Number(b.amount) - Number(a.amount))[0]
    const salaryDay = salaryTx ? new Date(salaryTx.date).getDate() : null

    // Post-salary spike (3 days after salary)
    let postSalarySpend = 0
    if (salaryDay) {
      txs.filter(t => {
        const d = new Date(t.date).getDate()
        return t.type === 'debit' && d >= salaryDay && d <= salaryDay + 3
      }).forEach(t => { postSalarySpend += Number(t.amount) })
    }

    // Zero spend days
    const daysInMonth = new Date(Number(year), Number(mon), 0).getDate()
    let zeroSpendDays = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${mon}-${String(d).padStart(2, '0')}`
      if (!byDate[dateStr] || byDate[dateStr].totalSpend === 0) {
        zeroSpendDays++
      }
    }

    const totalSpend = txs
      .filter(t => t.type === 'debit')
      .reduce((s, t) => s + Number(t.amount), 0)

    const avgDailySpend = totalSpend / daysInMonth

    const patterns = []
    if (topSpendDay && topSpendDay[1] > 0) {
      patterns.push(`You spend most on ${topSpendDay[0]}s`)
    }
    if (salaryDay && postSalarySpend > avgDailySpend * 4) {
      patterns.push(`Post-salary spike detected around the ${salaryDay}th`)
    }
    if (zeroSpendDays >= 5) {
      patterns.push(`${zeroSpendDays} zero-spend days this month 🎉`)
    }

    return NextResponse.json({
      byDate,
      dayOfWeekSpend,
      patterns,
      totalSpend,
      avgDailySpend,
      zeroSpendDays,
      salaryDay,
    })

  } catch (error) {
    console.error('[Calendar] Error:', error)
    return NextResponse.json({ error: 'Failed to load calendar data' }, { status: 500 })
  }
}
