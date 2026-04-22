import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Auto-detect recurring bills from transaction history
    const { data: transactions } = await supabase
      .from('transactions')
      .select('merchant, description, amount, date, category, type')
      .eq('user_id', user.id)
      .eq('type', 'debit')
      .order('date', { ascending: true })

    const txs = transactions || []

    // Group by merchant and find recurring ones
    const merchantMap: Record<string, any[]> = {}
    txs.forEach(t => {
      const key = t.merchant || t.description?.slice(0, 30) || 'Unknown'
      if (!merchantMap[key]) merchantMap[key] = []
      merchantMap[key].push(t)
    })

    // A bill is recurring if same merchant appears in 2+ different months
    const detectedBills: any[] = []
    Object.entries(merchantMap).forEach(([merchant, txList]) => {
      const months = [...new Set(txList.map(t => t.date?.slice(0, 7)))]
      if (months.length >= 2) {
        const amounts = txList.map(t => Number(t.amount))
        const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length
        const maxAmount = Math.max(...amounts)
        const minAmount = Math.min(...amounts)
        const variance = maxAmount - minAmount
        const lastTx = txList[txList.length - 1]
        const firstTx = txList[0]
        const isIncreasing = amounts[amounts.length - 1] > amounts[0]

        detectedBills.push({
          merchant,
          category: lastTx.category,
          avgAmount,
          lastAmount: Number(lastTx.amount),
          variance,
          monthCount: months.length,
          firstSeen: firstTx.date,
          lastSeen: lastTx.date,
          isIncreasing,
          isEMI: lastTx.category?.toLowerCase().includes('emi') ||
                 merchant.toLowerCase().includes('emi') ||
                 merchant.toLowerCase().includes('loan'),
          months: months.sort(),
        })
      }
    })

    // Sort by amount desc
    detectedBills.sort((a, b) => b.avgAmount - a.avgAmount)

    // Get confirmed bills from DB
    const { data: confirmedBills } = await supabase
      .from('recurring_bills')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('amount', { ascending: false })

    // Total monthly commitment from confirmed bills
    const monthlyCommitment = (confirmedBills || [])
      .reduce((s, b) => s + Number(b.amount || 0), 0)

    // Bills increasing month over month
    const increasingBills = detectedBills.filter(b => b.isIncreasing && b.variance > 50)

    // EMIs close to ending (within 3 months)
    const emisNearEnd = (confirmedBills || [])
      .filter(b => b.is_emi && b.emi_months_remaining && b.emi_months_remaining <= 3)

    return NextResponse.json({
      detected: detectedBills.slice(0, 20),
      confirmed: confirmedBills || [],
      monthlyCommitment,
      increasingBills: increasingBills.slice(0, 5),
      emisNearEnd,
    })

  } catch (error) {
    console.error('[Bills] Error:', error)
    return NextResponse.json({ error: 'Failed to load bills' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { merchant, label, amount, category, is_emi, emi_months_remaining } = body

    const { data, error } = await supabase
      .from('recurring_bills')
      .upsert({
        user_id: user.id,
        merchant,
        label: label || merchant,
        amount,
        category,
        is_emi: is_emi || false,
        emi_months_remaining: emi_months_remaining || null,
        is_confirmed: true,
        is_active: true,
      }, { onConflict: 'user_id,merchant' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ bill: data })

  } catch (error) {
    console.error('[Bills POST] Error:', error)
    return NextResponse.json({ error: 'Failed to save bill' }, { status: 500 })
  }
}
