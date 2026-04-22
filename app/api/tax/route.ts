import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

const TAX_RULES = {
  section80C: {
    label: 'Section 80C',
    limit: 150000,
    keywords: ['LIC', 'PPF', 'ELSS', 'NPS', 'NSC', 'SCHOOL FEES', 'TUITION',
      'PROVIDENT FUND', 'TAX SAVING', 'SIP', 'MUTUAL FUND', 'SUKANYA'],
    description: 'Life insurance, PPF, ELSS, school fees, home loan principal',
  },
  section80D: {
    label: 'Section 80D',
    limit: 25000,
    keywords: ['HEALTH INSURANCE', 'MEDICLAIM', 'STAR HEALTH', 'MAX BUPA',
      'HDFC ERGO HEALTH', 'NIVA BUPA', 'CARE HEALTH'],
    description: 'Health insurance premiums',
  },
  hra: {
    label: 'HRA / Rent',
    limit: null,
    keywords: ['RENT', 'HOUSE RENT', 'RENTAL', 'LANDLORD', 'PAYING GUEST', 'PG RENT'],
    description: 'Rent payments for HRA exemption',
  },
  homeLoan: {
    label: 'Home Loan Interest (Sec 24)',
    limit: 200000,
    keywords: ['HOME LOAN', 'HOUSING LOAN', 'HDFC LOAN', 'SBI LOAN',
      'ICICI LOAN', 'MORTGAGE', 'BAJAJ HOUSING'],
    description: 'Home loan interest deduction',
  },
  nps: {
    label: 'NPS (Sec 80CCD)',
    limit: 50000,
    keywords: ['NPS', 'NATIONAL PENSION', 'PRAN', 'PENSION FUND'],
    description: 'National Pension Scheme contributions',
  },
  education: {
    label: 'Education Loan (Sec 80E)',
    limit: null,
    keywords: ['EDUCATION LOAN', 'STUDENT LOAN', 'VIDYA LAKSHMI'],
    description: 'Education loan interest',
  },
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('description, merchant, amount, type, category, date')
      .eq('user_id', user.id)

    const txs = transactions || []

    // Detect each tax section
    const detected: Record<string, {
      found: boolean
      totalAmount: number
      transactions: any[]
      limit: number | null
      utilized: number | null
    }> = {}

    Object.entries(TAX_RULES).forEach(([key, rule]) => {
      const matchedTxs = txs.filter(t => {
        const text = `${t.description || ''} ${t.merchant || ''} ${t.category || ''}`.toUpperCase()
        return rule.keywords.some(kw => text.includes(kw))
      })

      const total = matchedTxs.reduce((s, t) => s + Number(t.amount), 0)

      detected[key] = {
        found: matchedTxs.length > 0,
        totalAmount: total,
        transactions: matchedTxs.slice(0, 5),
        limit: rule.limit,
        utilized: rule.limit ? Math.min((total / rule.limit) * 100, 100) : null,
      }
    })

    // Detect TDS from salary
    const salaryCredits = txs.filter(t =>
      t.type === 'credit' &&
      ['SALARY', 'STIPEND', 'PAYROLL', 'WAGES', 'REMUNERATION']
        .some(kw => (t.description || '').toUpperCase().includes(kw))
    )
    const tdsDetected = salaryCredits.length > 0

    // Detect professional/business expenses (for freelancers)
    const professionalExpenses = txs.filter(t => {
      const text = `${t.description || ''} ${t.category || ''}`.toUpperCase()
      return ['DOMAIN', 'HOSTING', 'SOFTWARE', 'SUBSCRIPTION', 'CLOUD',
        'AWS', 'GSUITE', 'NOTION', 'FIGMA', 'GITHUB'].some(kw => text.includes(kw))
    })

    // Calculate tax readiness score
    let score = 0
    const maxScore = 100
    const checks = [
      { key: 'section80C', weight: 30, condition: detected.section80C.found },
      { key: 'section80D', weight: 20, condition: detected.section80D.found },
      { key: 'hra', weight: 15, condition: detected.hra.found },
      { key: 'nps', weight: 15, condition: detected.nps.found },
      { key: 'homeLoan', weight: 10, condition: detected.homeLoan.found },
      { key: 'education', weight: 10, condition: detected.education.found },
    ]

    checks.forEach(c => {
      if (c.condition) score += c.weight
    })

    // Bonus for multiple months of data
    const { data: stmtCount } = await supabase
      .from('statements')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)

    if ((stmtCount?.length || 0) >= 6) score = Math.min(score + 10, 100)

    const totalDetectable80C = detected.section80C.totalAmount +
      detected.nps.totalAmount

    const estimatedTaxSaving = Math.min(totalDetectable80C, 150000) * 0.3

    return NextResponse.json({
      score,
      detected,
      tdsDetected,
      professionalExpenses: professionalExpenses.length,
      estimatedTaxSaving,
      checks: checks.map(c => ({
        ...c,
        rule: TAX_RULES[c.key as keyof typeof TAX_RULES],
        data: detected[c.key],
      })),
    })

  } catch (error) {
    console.error('[Tax] Error:', error)
    return NextResponse.json({ error: 'Failed to calculate tax readiness' }, { status: 500 })
  }
}
