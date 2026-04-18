import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { categorizeTransactions } from '@/lib/engine/categorizer'
import { detectAnomalies } from '@/lib/engine/anomaly'
import { detectSubscriptions } from '@/lib/engine/subscriptions'
import { predictCashFlow } from '@/lib/engine/predictor'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: rawTxns, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (fetchErr) return NextResponse.json({ error: 'Failed to fetch transactions.' }, { status: 500 })
    if (!rawTxns || rawTxns.length === 0)
      return NextResponse.json({ error: 'No transactions found. Please upload a statement first.' }, { status: 404 })

    let transactions = categorizeTransactions(rawTxns)
    transactions = detectAnomalies(transactions) as typeof transactions
    transactions = detectSubscriptions(transactions) as typeof transactions

    const prediction = predictCashFlow(transactions)

    return NextResponse.json({ success: true, prediction })
  } catch (err) {
    console.error('Cashflow route error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
