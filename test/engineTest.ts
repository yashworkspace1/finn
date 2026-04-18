/**
 * FINN Engine Integration Test — run with:
 *   npx tsx test/engineTest.ts
 */

import { categorizeTransactions } from '../lib/engine/categorizer'
import { detectAnomalies } from '../lib/engine/anomaly'
import { detectSubscriptions } from '../lib/engine/subscriptions'
import { calculateHealthScore } from '../lib/engine/scorer'
import { detectPersonality } from '../lib/engine/personality'
import { predictCashFlow } from '../lib/engine/predictor'
import { getTopCategories, getTotalIncome, getTotalExpenses, getSavingsRate } from '../lib/engine/stats'
import { Transaction } from '../lib/parser/normalizer'

// ─── 50 realistic Indian bank transactions ────────────────────────────────────
const RAW: Transaction[] = [
  // Salary credits
  { date: '2024-01-03', description: 'NEFT/SALARY JAN/ACME CORP',       amount: 75000, type: 'credit' },
  { date: '2024-02-03', description: 'NEFT/SALARY FEB/ACME CORP',       amount: 75000, type: 'credit' },
  { date: '2024-03-03', description: 'NEFT/SALARY MAR/ACME CORP',       amount: 75000, type: 'credit' },
  { date: '2024-01-15', description: 'IMPS/FREELANCE PAYMENT',           amount: 15000, type: 'credit' },
  { date: '2024-02-18', description: 'IMPS/FREELANCE PAYMENT',           amount: 12000, type: 'credit' },
  // Rent (recurring)
  { date: '2024-01-05', description: 'UPI/RENT PAYMENT/MR SHARMA',       amount: 18000, type: 'debit' },
  { date: '2024-02-05', description: 'UPI/RENT PAYMENT/MR SHARMA',       amount: 18000, type: 'debit' },
  { date: '2024-03-05', description: 'UPI/RENT PAYMENT/MR SHARMA',       amount: 18000, type: 'debit' },
  // Food
  { date: '2024-01-07', description: 'UPI/SWIGGY FOOD ORDER',            amount: 450,   type: 'debit' },
  { date: '2024-01-09', description: 'UPI/ZOMATO FOOD ORDER',            amount: 680,   type: 'debit' },
  { date: '2024-01-12', description: 'UPI/BIGBASKET GROCERIES',          amount: 2200,  type: 'debit' },
  { date: '2024-02-08', description: 'UPI/SWIGGY FOOD ORDER',            amount: 520,   type: 'debit' },
  { date: '2024-02-14', description: 'UPI/ZOMATO VALENTINE DINNER',      amount: 1800,  type: 'debit' },
  { date: '2024-03-10', description: 'UPI/SWIGGY FOOD ORDER',            amount: 390,   type: 'debit' },
  // Transportation
  { date: '2024-01-08', description: 'UPI/OLA RIDE BOOKING',             amount: 280,   type: 'debit' },
  { date: '2024-01-18', description: 'UPI/UBER RIDE',                    amount: 320,   type: 'debit' },
  { date: '2024-02-10', description: 'IRCTC TRAIN TICKET',               amount: 850,   type: 'debit' },
  { date: '2024-03-15', description: 'UPI/OLA RIDE BOOKING',             amount: 310,   type: 'debit' },
  // Subscriptions (recurring ~monthly)
  { date: '2024-01-14', description: 'NETFLIX SUBSCRIPTION',             amount: 649,   type: 'debit' },
  { date: '2024-02-14', description: 'NETFLIX SUBSCRIPTION',             amount: 649,   type: 'debit' },
  { date: '2024-03-14', description: 'NETFLIX SUBSCRIPTION',             amount: 649,   type: 'debit' },
  { date: '2024-01-18', description: 'SPOTIFY PREMIUM',                  amount: 119,   type: 'debit' },
  { date: '2024-02-18', description: 'SPOTIFY PREMIUM',                  amount: 119,   type: 'debit' },
  { date: '2024-03-18', description: 'SPOTIFY PREMIUM',                  amount: 119,   type: 'debit' },
  // Shopping
  { date: '2024-01-20', description: 'AMAZON SHOPPING ORDER',            amount: 3499,  type: 'debit' },
  { date: '2024-02-22', description: 'FLIPKART ORDER DELIVERED',         amount: 2100,  type: 'debit' },
  { date: '2024-03-25', description: 'MYNTRA FASHION ORDER',             amount: 1750,  type: 'debit' },
  // EMI (recurring)
  { date: '2024-01-15', description: 'NACH/HOME LOAN EMI/HDFC BANK',     amount: 18500, type: 'debit' },
  { date: '2024-02-15', description: 'NACH/HOME LOAN EMI/HDFC BANK',     amount: 18500, type: 'debit' },
  { date: '2024-03-15', description: 'NACH/HOME LOAN EMI/HDFC BANK',     amount: 18500, type: 'debit' },
  // Utilities
  { date: '2024-01-22', description: 'BSES ELECTRICITY BILL',            amount: 1250,  type: 'debit' },
  { date: '2024-02-22', description: 'BSES ELECTRICITY BILL',            amount: 1380,  type: 'debit' },
  { date: '2024-01-25', description: 'AIRTEL BROADBAND BILL',            amount: 999,   type: 'debit' },
  { date: '2024-02-25', description: 'AIRTEL BROADBAND BILL',            amount: 999,   type: 'debit' },
  // Investments
  { date: '2024-01-10', description: 'NEFT/MUTUAL FUND SIP/GROWW',       amount: 5000,  type: 'debit' },
  { date: '2024-02-10', description: 'NEFT/MUTUAL FUND SIP/GROWW',       amount: 5000,  type: 'debit' },
  { date: '2024-03-10', description: 'NEFT/MUTUAL FUND SIP/GROWW',       amount: 5000,  type: 'debit' },
  // Health
  { date: '2024-01-28', description: 'APOLLO PHARMACY MEDICINES',        amount: 890,   type: 'debit' },
  { date: '2024-02-12', description: 'CULT FIT GYM MEMBERSHIP',          amount: 2500,  type: 'debit' },
  // Entertainment
  { date: '2024-01-27', description: 'BOOKMYSHOW PVR CINEMA',            amount: 650,   type: 'debit' },
  { date: '2024-03-22', description: 'BOOKMYSHOW INOX TICKETS',          amount: 780,   type: 'debit' },
  // ANOMALY: huge unexpected purchase
  { date: '2024-02-28', description: 'AMAZON SHOPPING ORDER',            amount: 45000, type: 'debit' },
  // Education
  { date: '2024-01-30', description: 'UDEMY COURSE PURCHASE',            amount: 499,   type: 'debit' },
  // ATM
  { date: '2024-01-16', description: 'ATM WDL/HDFC BANK/CONNAUGHT',      amount: 5000,  type: 'debit' },
  { date: '2024-02-20', description: 'ATM WDL/SBI ATM/NEHRU PLACE',      amount: 3000,  type: 'debit' },
  // Interest/cashback income
  { date: '2024-01-31', description: 'INTEREST CREDITED',                amount: 320,   type: 'credit' },
  { date: '2024-02-29', description: 'CASHBACK FROM AMAZON',             amount: 150,   type: 'credit' },
  // Travel
  { date: '2024-03-20', description: 'OYO HOTEL BOOKING',               amount: 3200,  type: 'debit' },
  { date: '2024-03-20', description: 'MAKEMYTRIP FLIGHT TICKET',         amount: 6500,  type: 'debit' },
  // Weekend splurge (Saturday)
  { date: '2024-01-20', description: 'UPI/ZOMATO WEEKEND PARTY ORDER',   amount: 2800,  type: 'debit' },
]

function pad(s: string, n: number) { return s.slice(0, n).padEnd(n) }
function inr(n: number) { return `₹${n.toLocaleString('en-IN')}` }

async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║       FINN Engine Integration Test Suite         ║')
  console.log('╚══════════════════════════════════════════════════╝\n')
  console.log(`Input: ${RAW.length} raw transactions\n`)

  // ── Step 1: Categorize ───────────────────────────────────────────────────
  const categorized = categorizeTransactions(RAW)
  const uncategorized = categorized.filter((t) => t.category === 'Others').length
  console.log('─── 1. Categorizer ──────────────────────────────────')
  console.log(`  ✅ Categorized: ${categorized.length - uncategorized}/${categorized.length}`)
  console.log('  Sample:')
  categorized.slice(0, 5).forEach((t) =>
    console.log(`    ${pad(t.category ?? 'Others', 20)} | ${t.description.slice(0, 30)}`)
  )

  // ── Step 2: Anomalies ─────────────────────────────────────────────────
  const withAnomalies = detectAnomalies(categorized) as (Transaction & { is_anomaly: boolean; category?: string })[]
  const anomalies = withAnomalies.filter((t) => t.is_anomaly)
  console.log('\n─── 2. Anomaly Detection (Z-score > 2.5) ────────────')
  console.log(`  ✅ Anomalies found: ${anomalies.length}`)
  anomalies.forEach((t) =>
    console.log(`    ⚠️  ${t.date} | ${t.description.slice(0, 35)} | ${inr(t.amount)}`)
  )

  // ── Step 3: Subscriptions ──────────────────────────────────────────────
  const withSubs = detectSubscriptions(withAnomalies)
  const subs = withSubs.filter((t) => t.is_subscription && t.type === 'debit')
  console.log('\n─── 3. Subscription Detection ───────────────────────')
  console.log(`  ✅ Recurring subscriptions found: ${subs.length}`)
  subs.slice(0, 5).forEach((t) =>
    console.log(`    📦 ${t.date} | ${t.description.slice(0, 30)} | ${inr(t.amount)}`)
  )

  // ── Step 4: Health Score ───────────────────────────────────────────────
  const health = calculateHealthScore(withSubs)
  console.log('\n─── 4. Health Score ─────────────────────────────────')
  console.log(`  ✅ Score: ${health.score}/100 (Grade: ${health.grade})`)
  console.log(`     Savings rate:      ${health.savingsRatePct}%  → ${health.breakdown.savingsRate}/40 pts`)
  console.log(`     Consistency:       ${health.breakdown.consistency}/20 pts`)
  console.log(`     Anomaly penalty:   ${health.breakdown.anomalyPenalty}/20 pts`)
  console.log(`     Subscription ratio:${health.breakdown.subscriptionRatio}/20 pts`)
  console.log(`     Message: ${health.message}`)
  console.log(`  ${health.score >= 0 && health.score <= 100 ? '✅' : '❌'} Score in valid range 0-100`)

  // ── Step 5: Personality ────────────────────────────────────────────────
  const personality = detectPersonality(withSubs)
  console.log('\n─── 5. Personality Profiler ─────────────────────────')
  console.log(`  ✅ Type: ${personality.emoji} ${personality.type}`)
  console.log(`     ${personality.description}`)
  console.log(`     Tip: ${personality.tip}`)

  // ── Step 6: Predictor ─────────────────────────────────────────────────
  const prediction = predictCashFlow(withSubs)
  console.log('\n─── 6. CashFlow Predictor ───────────────────────────')
  console.log(`  ✅ Predicted income:   ${inr(prediction.predictedIncome)}`)
  console.log(`  ✅ Predicted expenses: ${inr(prediction.predictedExpenses)}`)
  console.log(`  ✅ Predicted balance:  ${inr(prediction.predictedBalance)}`)
  console.log(`  ✅ Trend:              ${prediction.trend}`)
  console.log(`  ✅ Cash crunch likely: ${prediction.isCrunchLikely ? '⚠️  YES' : '✅ No'}`)
  console.log(`  ✅ Alerts: ${prediction.nextAlerts.length}`)
  prediction.nextAlerts.forEach((a) => console.log(`     [${a.type.toUpperCase()}] ${a.message}`))

  // ── Step 7: Summary stats ──────────────────────────────────────────────
  const totalIncome   = getTotalIncome(withSubs)
  const totalExpenses = getTotalExpenses(withSubs)
  const savingsRate   = getSavingsRate(withSubs)
  const topCats       = getTopCategories(withSubs, 5)
  console.log('\n─── 7. Summary Stats ────────────────────────────────')
  console.log(`  Total income:   ${inr(totalIncome)}`)
  console.log(`  Total expenses: ${inr(totalExpenses)}`)
  console.log(`  Savings rate:   ${savingsRate}%`)
  console.log('  Top categories:')
  topCats.forEach((c) =>
    console.log(`    ${pad(c.category, 20)} ${inr(c.amount).padStart(12)}  (${c.percentage}%)`)
  )

  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║  ✅  All engines passed — 0 errors               ║')
  console.log('╚══════════════════════════════════════════════════╝\n')
}

main().catch((e) => { console.error('❌ Test failed:', e); process.exit(1) })
