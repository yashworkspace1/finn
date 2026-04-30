import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { generateCFOMemo } from '@/lib/ai/gemini'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return list of available months for this user
    const { data: statements, error } = await supabase
      .from('statements')
      .select('id, month, total_income, total_expenses, transaction_count, date_from, date_to')
      .eq('user_id', user.id)
      .order('month', { ascending: false })

    if (error) throw error

    return NextResponse.json({ statements: statements || [] })
  } catch (error) {
    console.error('[Compare GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch statements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { monthA, monthB } = await request.json()

    if (!monthA || !monthB || monthA === monthB) {
      return NextResponse.json({ error: 'Please provide two different months' }, { status: 400 })
    }


    // Fetch transactions for both months
    const [{ data: txA }, { data: txB }] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', monthA),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', monthB),
    ])

    if (!txA?.length || !txB?.length) {
      return NextResponse.json(
        { error: 'Not enough transaction data for one or both months' },
        { status: 400 }
      )
    }

    // Calculate totals — amounts always positive, use type for direction
    const calcTotals = (txs: any[]) => ({
      income: txs.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0),
      expenses: txs.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0),
    })

    const totalsA = calcTotals(txA)
    const totalsB = calcTotals(txB)

    const savingsRateA = totalsA.income > 0
      ? ((totalsA.income - totalsA.expenses) / totalsA.income) * 100
      : 0
    const savingsRateB = totalsB.income > 0
      ? ((totalsB.income - totalsB.expenses) / totalsB.income) * 100
      : 0

    // Category breakdown for both months
    const buildCategoryMap = (txs: any[]) => {
      const map: Record<string, number> = {}
      txs.filter(t => t.type === 'debit').forEach(t => {
        const cat = t.category || 'Others'
        map[cat] = (map[cat] || 0) + Number(t.amount)
      })
      return map
    }

    const catA = buildCategoryMap(txA)
    const catB = buildCategoryMap(txB)

    const allCategories = [...new Set([...Object.keys(catA), ...Object.keys(catB)])]
    const categoryDeltas = allCategories.map(category => {
      const amountA = catA[category] || 0
      const amountB = catB[category] || 0
      const delta = amountB - amountA
      const percentChange = amountA > 0 ? (delta / amountA) * 100 : 100
      return { category, amountA, amountB, delta, percentChange }
    }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

    // Merchant analysis
    const merchantsA = new Set(txA.map(t => t.merchant).filter(Boolean))
    const merchantsB = new Set(txB.map(t => t.merchant).filter(Boolean))

    const newMerchants = [...merchantsB].filter(m => !merchantsA.has(m)).slice(0, 10)
    const droppedMerchants = [...merchantsA].filter(m => !merchantsB.has(m)).slice(0, 10)

    // Biggest spike
    const topSpike = categoryDeltas.find(c => c.delta > 0) || null

    // Day of week breakdown
    const buildDayMap = (txs: any[]) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const map: Record<string, number> = {}
      txs.filter(t => t.type === 'debit').forEach(t => {
        const day = days[new Date(t.date).getDay()]
        map[day] = (map[day] || 0) + Number(t.amount)
      })
      return map
    }

    const daySpendA = buildDayMap(txA)
    const daySpendB = buildDayMap(txB)

    // Generate CFO memo via Gemini
    const { memo, verdict, score } = await generateCFOMemo({
      monthA,
      monthB,
      incomeA: totalsA.income,
      incomeB: totalsB.income,
      expensesA: totalsA.expenses,
      expensesB: totalsB.expenses,
      savingsRateA,
      savingsRateB,
      categoryDeltas,
      newMerchants,
      droppedMerchants,
      topSpike: topSpike ? { category: topSpike.category, delta: topSpike.delta } : null,
    })

    const comparisonData = {
      monthA,
      monthB,
      totalsA: totalsA || { income: 0, expenses: 0 },
      totalsB: totalsB || { income: 0, expenses: 0 },
      savingsRateA: savingsRateA || 0,
      savingsRateB: savingsRateB || 0,
      deltaIncome: (totalsB.income || 0) - (totalsA.income || 0),
      deltaExpenses: (totalsB.expenses || 0) - (totalsA.expenses || 0),
      deltaSavingsRate: (savingsRateB || 0) - (savingsRateA || 0),
      categoryDeltas: categoryDeltas || [],
      newMerchants: newMerchants || [],
      droppedMerchants: droppedMerchants || [],
      daySpendA: daySpendA || {},
      daySpendB: daySpendB || {},
      txCountA: txA?.length || 0,
      txCountB: txB?.length || 0,
      memo: memo || "Unable to generate memo.",
      verdict: verdict || "stable",
      score: score || 50,
    }

    // Cache the result
    await supabase
      .from('comparisons')
      .upsert({
        user_id: user.id,
        month_a: monthA,
        month_b: monthB,
        delta_income: comparisonData.deltaIncome,
        delta_expenses: comparisonData.deltaExpenses,
        delta_savings: comparisonData.deltaSavingsRate,
        category_deltas: categoryDeltas,
        new_merchants: newMerchants,
        dropped_merchants: droppedMerchants,
        cfo_memo: memo,
        verdict,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,month_a,month_b' })

    return NextResponse.json({ comparison: comparisonData, cached: false })

  } catch (error) {
    console.error('[Compare POST] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Comparison failed' },
      { status: 500 }
    )
  }
}
