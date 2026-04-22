import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all leak transactions
    const { data: leaks, error } = await supabase
      .from('transactions')
      .select('id, date, description, merchant, amount, category, leak_type, month')
      .eq('user_id', user.id)
      .eq('is_leak', true)
      .eq('type', 'debit')
      .order('date', { ascending: false })

    if (error) throw error

    const txs = leaks || []

    // Group by leak type
    const grouped: Record<string, {
      type: string
      label: string
      total: number
      count: number
      transactions: any[]
      color: string
    }> = {
      penalty: { type: 'penalty', label: 'Penalties & Fines', total: 0, count: 0, transactions: [], color: '#f87171' },
      bank_fee: { type: 'bank_fee', label: 'Bank Charges', total: 0, count: 0, transactions: [], color: '#fb923c' },
      hidden_charge: { type: 'hidden_charge', label: 'Hidden Charges', total: 0, count: 0, transactions: [], color: '#f9c440' },
      other: { type: 'other', label: 'Other Leaks', total: 0, count: 0, transactions: [], color: '#a78bfa' },
    }

    txs.forEach(t => {
      const key = (t.leak_type as string) || 'other'
      if (grouped[key]) {
        grouped[key].total += Number(t.amount)
        grouped[key].count++
        grouped[key].transactions.push(t)
      }
    })

    const totalLeaked = txs.reduce((s, t) => s + Number(t.amount), 0)

    // Monthly leak trend
    const monthlyLeaks: Record<string, number> = {}
    txs.forEach(t => {
      const m = t.month || t.date?.slice(0, 7)
      if (m) monthlyLeaks[m] = (monthlyLeaks[m] || 0) + Number(t.amount)
    })

    const monthlyTrend = Object.entries(monthlyLeaks)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }))

    return NextResponse.json({
      totalLeaked,
      leakCount: txs.length,
      grouped: Object.values(grouped).filter(g => g.count > 0),
      monthlyTrend,
    })

  } catch (error) {
    console.error('[Leaks] Error:', error)
    return NextResponse.json({ error: 'Failed to load leaks data' }, { status: 500 })
  }
}
