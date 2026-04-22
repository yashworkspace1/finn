import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

// Map categories into Needs / Wants / Savings buckets
const NEEDS_CATEGORIES = [
  'Groceries', 'Rent', 'Utilities', 'Healthcare', 'Transport',
  'Insurance', 'Education', 'EMI', 'Fuel', 'Mobile', 'Internet'
]
const SAVINGS_CATEGORIES = [
  'Investment', 'Savings', 'Mutual Fund', 'PPF', 'NPS',
  'Fixed Deposit', 'Stocks', 'SIP', 'LIC'
]

function classifyCategory(category: string): 'needs' | 'wants' | 'savings' {
  const cat = category?.toLowerCase() || ''
  if (SAVINGS_CATEGORIES.some(s => cat.includes(s.toLowerCase()))) return 'savings'
  if (NEEDS_CATEGORIES.some(n => cat.includes(n.toLowerCase()))) return 'needs'
  return 'wants'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    let query = supabase
      .from('transactions')
      .select('amount, type, category')
      .eq('user_id', user.id)
      .eq('type', 'debit')

    if (month) query = query.eq('month', month)

    const { data: transactions, error } = await query
    if (error) throw error

    const txs = transactions || []

    const buckets = { needs: 0, wants: 0, savings: 0 }
    const categoryBreakdown: Record<string, { bucket: string; amount: number }> = {}

    txs.forEach(t => {
      const bucket = classifyCategory(t.category || 'Others')
      buckets[bucket] += Number(t.amount)
      const cat = t.category || 'Others'
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { bucket, amount: 0 }
      }
      categoryBreakdown[cat].amount += Number(t.amount)
    })

    const total = buckets.needs + buckets.wants + buckets.savings || 1

    const actual = {
      needs: (buckets.needs / total) * 100,
      wants: (buckets.wants / total) * 100,
      savings: (buckets.savings / total) * 100,
    }

    const ideal = { needs: 50, wants: 30, savings: 20 }

    // What needs to change to hit 20% savings
    const currentSavingsRate = actual.savings
    const targetSavingsAmt = total * 0.2
    const currentSavingsAmt = buckets.savings
    const savingsGap = targetSavingsAmt - currentSavingsAmt

    // Find top want category to cut
    const topWant = Object.entries(categoryBreakdown)
      .filter(([_, v]) => v.bucket === 'wants')
      .sort((a, b) => b[1].amount - a[1].amount)[0]

    let suggestion = ''
    if (savingsGap > 0 && topWant) {
      const cutPct = Math.min((savingsGap / topWant[1].amount) * 100, 80)
      suggestion = `Cut ${topWant[0]} by ${cutPct.toFixed(0)}% to close the ₹${savingsGap.toLocaleString('en-IN', { maximumFractionDigits: 0 })} savings gap`
    } else if (savingsGap <= 0) {
      suggestion = `You're already exceeding the 20% savings target. 🎉`
    }

    return NextResponse.json({
      buckets,
      actual,
      ideal,
      total,
      savingsGap,
      suggestion,
      categoryBreakdown,
    })

  } catch (error) {
    console.error('[BudgetSplit] Error:', error)
    return NextResponse.json({ error: 'Failed to calculate budget split' }, { status: 500 })
  }
}
