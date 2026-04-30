import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all statements for monthly averages
    const { data: statements } = await supabase
      .from('statements')
      .select('month, total_income, total_expenses')
      .eq('user_id', user.id)
      .order('month', { ascending: false })
      .limit(6)

    const stmts = statements || []

    if (stmts.length === 0) {
      return NextResponse.json({
        avgIncome: 0,
        avgExpenses: 0,
        avgMonthlySavings: 0,
        detectableSavings: 0,
        runwayMonths: 0,
        status: 'critical',
        statusMessage: 'No data — upload a bank statement to calculate your runway',
        statusColor: '#6b7280',
        targetRunwayMonths: 6,
        savingsGap: 0,
        monthlyTopUp: 0,
        monthlyData: [],
        statementCount: 0,
        empty: true,
      })
    }

    // Average monthly income and expenses over last 6 months
    const avgIncome = stmts.reduce((s, m) => s + Number(m.total_income), 0) / stmts.length
    const avgExpenses = stmts.reduce((s, m) => s + Number(m.total_expenses), 0) / stmts.length
    const avgMonthlySavings = avgIncome - avgExpenses

    // Get profile for savings goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('monthly_income, savings_goal')
      .eq('id', user.id)
      .single()

    // Estimate detectable savings from credit transactions
    // that look like transfers to savings/investment accounts
    const { data: savingsTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'debit')
      .in('category', ['Investment', 'Savings', 'Mutual Fund', 'PPF', 'NPS', 'Fixed Deposit', 'SIP'])

    const detectableSavings = (savingsTx || [])
      .reduce((s, t) => s + Number(t.amount), 0)

    // Runway calculation
    const runwayMonths = avgExpenses > 0
      ? detectableSavings / avgExpenses
      : 0

    // Monthly surplus trend
    const monthlyData = stmts
      .reverse()
      .map(s => ({
        month: s.month,
        income: Number(s.total_income),
        expenses: Number(s.total_expenses),
        surplus: Number(s.total_income) - Number(s.total_expenses),
      }))

    // Runway status
    let status: 'critical' | 'warning' | 'good' | 'excellent'
    let statusMessage: string
    let statusColor: string

    if (runwayMonths < 1) {
      status = 'critical'
      statusMessage = 'Critical — Less than 1 month of runway detected'
      statusColor = '#f87171'
    } else if (runwayMonths < 3) {
      status = 'warning'
      statusMessage = `Warning — Only ${runwayMonths.toFixed(1)} months of runway`
      statusColor = '#fb923c'
    } else if (runwayMonths < 6) {
      status = 'good'
      statusMessage = `Getting there — ${runwayMonths.toFixed(1)} months of runway`
      statusColor = '#f9c440'
    } else {
      status = 'excellent'
      statusMessage = `Strong — ${runwayMonths.toFixed(1)} months of runway`
      statusColor = '#4ecca3'
    }

    // How much extra to save monthly to hit 6-month runway in 12 months
    const targetSavings = avgExpenses * 6
    const savingsGap = Math.max(targetSavings - detectableSavings, 0)
    const monthlyTopUp = savingsGap / 12

    return NextResponse.json({
      avgIncome,
      avgExpenses,
      avgMonthlySavings,
      detectableSavings,
      runwayMonths,
      status,
      statusMessage,
      statusColor,
      targetRunwayMonths: 6,
      savingsGap,
      monthlyTopUp,
      monthlyData,
      statementCount: stmts.length,
    })

  } catch (error) {
    console.error('[Runway] Error:', error)
    return NextResponse.json({ error: 'Failed to calculate runway' }, { status: 500 })
  }
}
