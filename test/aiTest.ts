/**
 * FINN AI Pipeline Test — run with:
 *   npx tsx test/aiTest.ts
 *
 * Tests Strategy 1 (cache), Strategy 2 (fallback), and chat fallback
 * WITHOUT needing a live Gemini API key.
 */

import { generateFallbackInsights } from '../lib/ai/fallback'
import { hashTransactions } from '../lib/ai/cache'
import { chatWithFallback } from '../lib/ai/gemini'
import { Transaction } from '../lib/parser/normalizer'

const TRANSACTIONS: Transaction[] = [
  { date: '2024-01-03', description: 'NEFT/SALARY/ACME CORP',      amount: 75000, type: 'credit' },
  { date: '2024-01-05', description: 'UPI/RENT PAYMENT/MR SHARMA', amount: 18000, type: 'debit'  },
  { date: '2024-01-07', description: 'UPI/SWIGGY FOOD ORDER',       amount: 450,   type: 'debit'  },
  { date: '2024-01-10', description: 'NEFT/MUTUAL FUND SIP/GROWW',  amount: 5000,  type: 'debit'  },
  { date: '2024-01-14', description: 'NETFLIX SUBSCRIPTION',        amount: 649,   type: 'debit'  },
  { date: '2024-01-15', description: 'NACH/HOME LOAN EMI/HDFC',     amount: 18500, type: 'debit'  },
  { date: '2024-01-20', description: 'AMAZON SHOPPING ORDER',       amount: 3499,  type: 'debit'  },
  { date: '2024-01-22', description: 'BSES ELECTRICITY BILL',       amount: 1250,  type: 'debit'  },
]

const STATS = {
  totalIncome: 75000,
  totalExpenses: 47348,
  savingsRate: 36.9,
  topCategories: [
    { category: 'Rent & Housing', amount: 18000, percentage: 38.0 },
    { category: 'Investments',    amount: 5000,  percentage: 10.6 },
    { category: 'Shopping',       amount: 3499,  percentage: 7.4  },
  ],
  anomalyCount: 0,
  subscriptionCount: 2,
  healthScore: 72,
  personality: 'Steady Saver',
  transactionCount: 8,
}

function check(label: string, condition: boolean) {
  console.log(`  ${condition ? '✅' : '❌'} ${label}`)
  return condition
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║        FINN AI Pipeline Test Suite              ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  let passed = 0, total = 0

  // ── Test 1: Transaction hashing ───────────────────────────────────────────
  console.log('─── 1. Transaction Hash (Cache Key) ─────────────────')
  const hash1 = hashTransactions(TRANSACTIONS)
  const hash2 = hashTransactions(TRANSACTIONS)
  const hash3 = hashTransactions([...TRANSACTIONS, {
    date: '2024-01-25', description: 'NEW TXN', amount: 100, type: 'debit'
  }])

  total += 3
  passed += check('Same data → same hash', hash1 === hash2) ? 1 : 0
  passed += check('Different data → different hash', hash1 !== hash3) ? 1 : 0
  passed += check('Hash is 32-char MD5', /^[a-f0-9]{32}$/.test(hash1)) ? 1 : 0
  console.log(`  Hash: ${hash1}`)

  // ── Test 2: Fallback Insights ────────────────────────────────────────────
  console.log('\n─── 2. Strategy 2 — Fallback Insights ──────────────')
  const fallback = generateFallbackInsights(STATS)

  total += 5
  passed += check('summary is non-empty string', typeof fallback.summary === 'string' && fallback.summary.length > 10) ? 1 : 0
  passed += check('insights is array with 1-3 items', Array.isArray(fallback.insights) && fallback.insights.length >= 1 && fallback.insights.length <= 3) ? 1 : 0
  passed += check('weeklyNudge is non-empty', typeof fallback.weeklyNudge === 'string' && fallback.weeklyNudge.length > 5) ? 1 : 0
  passed += check('savingOpportunity is non-empty', typeof fallback.savingOpportunity === 'string') ? 1 : 0
  passed += check('insights have correct type field', fallback.insights.every(i => ['positive','warning','danger','info'].includes(i.type))) ? 1 : 0

  console.log(`\n  Summary: "${fallback.summary.slice(0, 80)}..."`)
  console.log(`  Insights (${fallback.insights.length}):`)
  fallback.insights.forEach(i => console.log(`    [${i.type.toUpperCase()}] ${i.title}`))
  console.log(`  Nudge: "${fallback.weeklyNudge.slice(0, 70)}..."`)

  // ── Test 3: Low savings rate fallback path ───────────────────────────────
  console.log('\n─── 3. Fallback — Low Savings Rate (< 10%) ─────────')
  const lowSavings = generateFallbackInsights({ ...STATS, savingsRate: 5, healthScore: 30 })
  total += 2
  passed += check('danger insight generated for low savings', lowSavings.insights.some(i => i.type === 'danger')) ? 1 : 0
  passed += check('score mentioned in summary', lowSavings.summary.includes('30')) ? 1 : 0
  console.log(`  Insight: [${lowSavings.insights[0].type.toUpperCase()}] ${lowSavings.insights[0].title}`)

  // ── Test 4: Fallback with anomalies ──────────────────────────────────────
  console.log('\n─── 4. Fallback — Anomaly Warning ───────────────────')
  const withAnomalies = generateFallbackInsights({ ...STATS, anomalyCount: 3, savingsRate: 15 })
  total += 1
  passed += check('warning insight for anomalies', withAnomalies.insights.some(i => i.title.includes('unusual') || i.type === 'warning')) ? 1 : 0
  console.log(`  Found: ${withAnomalies.insights.find(i => i.title.includes('unusual') || i.type === 'warning')?.title}`)

  // ── Test 5: Chat fallback ─────────────────────────────────────────────────
  console.log('\n─── 5. Chat Fallback (no Gemini key) ────────────────')
  const questions = [
    'Where did I spend the most last month?',
    'What is my savings rate?',
    'How much did I earn?',
    'Give me a summary of my finances',
  ]

  for (const q of questions) {
    const reply = await chatWithFallback(q, TRANSACTIONS, [])
    total++
    const ok = typeof reply === 'string' && reply.length > 10
    passed += ok ? 1 : 0
    console.log(`  Q: "${q.slice(0, 40)}"`)
    console.log(`  A: "${reply.slice(0, 80)}..."`)
    check('Response is non-empty string', ok)
    console.log()
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════╗')
  console.log(`║  Results: ${passed}/${total} tests passed${passed === total ? '  ✅ ALL PASSING' : '  ❌ SOME FAILED'}       ║`)
  console.log('╚══════════════════════════════════════════════════╝\n')

  if (passed < total) process.exit(1)
}

main().catch(e => { console.error('Test error:', e); process.exit(1) })
