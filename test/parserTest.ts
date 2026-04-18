/**
 * Parser integration test — run with:
 *   node --experimental-vm-modules test/parserTest.mjs
 *
 * Or simpler — we use tsx:
 *   npx tsx test/parserTest.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { normalizeDate, normalizeAmount, normalizeType } from '../lib/parser/normalizer'

// ─── Test normalizeDate ───────────────────────────────────────────────────────
function testNormalizeDate() {
  const cases: [string, string][] = [
    ['01/04/2024', '2024-04-01'],
    ['2024-04-01', '2024-04-01'],
    ['01-04-2024', '2024-04-01'],
    ['01 Apr 2024', '2024-04-01'],
    ['15 Jan 2024', '2024-01-15'],
  ]

  console.log('\n─── normalizeDate ────────────────────')
  let passed = 0
  for (const [input, expected] of cases) {
    const result = normalizeDate(input)
    const ok = result === expected
    console.log(`  ${ok ? '✅' : '❌'} "${input}" → "${result}" ${ok ? '' : `(expected "${expected}")`}`)
    if (ok) passed++
  }
  console.log(`  ${passed}/${cases.length} passed`)
}

// ─── Test normalizeAmount ─────────────────────────────────────────────────────
function testNormalizeAmount() {
  const cases: [string | number, number][] = [
    ['1,500.00', 1500],
    ['₹2,499.50', 2499.50],
    ['Rs.10000', 10000],
    ['-450.00', 450],
    [3499, 3499],
    ['(1200.00)', 1200],
  ]

  console.log('\n─── normalizeAmount ──────────────────')
  let passed = 0
  for (const [input, expected] of cases) {
    const result = normalizeAmount(input)
    const ok = result === expected
    console.log(`  ${ok ? '✅' : '❌'} "${input}" → ${result} ${ok ? '' : `(expected ${expected})`}`)
    if (ok) passed++
  }
  console.log(`  ${passed}/${cases.length} passed`)
}

// ─── Test normalizeType ───────────────────────────────────────────────────────
function testNormalizeType() {
  const cases: [string, 'credit' | 'debit'][] = [
    ['CR', 'credit'],
    ['DR', 'debit'],
    ['Credit', 'credit'],
    ['Debit', 'debit'],
    ['Deposit', 'credit'],
    ['Withdrawal', 'debit'],
    ['+', 'credit'],
    ['-', 'debit'],
  ]

  console.log('\n─── normalizeType ────────────────────')
  let passed = 0
  for (const [input, expected] of cases) {
    const result = normalizeType(input)
    const ok = result === expected
    console.log(`  ${ok ? '✅' : '❌'} "${input}" → "${result}" ${ok ? '' : `(expected "${expected}")`}`)
    if (ok) passed++
  }
  console.log(`  ${passed}/${cases.length} passed`)
}

// ─── Test CSV parsing (simulated — papaparse works in Node) ───────────────────
async function testCSVParsing() {
  console.log('\n─── CSV Parser (SBI format) ──────────')
  
  const csvPath = join(process.cwd(), 'test', 'sample_sbi.csv')
  const csvContent = readFileSync(csvPath, 'utf-8')

  // Inline the parse logic (avoids Next.js module resolution in node)
  const Papa = (await import('papaparse')).default
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  console.log(`  Parsed ${result.data.length} raw rows`)
  console.log(`  Headers: ${result.meta.fields?.join(', ')}`)

  // Simulate normalization
  const { normalizeDate, normalizeAmount } = await import('../lib/parser/normalizer.js' as string)
  
  const transactions = result.data
    .filter((row: any) => row['Date'] && (row['Debit'] || row['Credit']))
    .map((row: any) => {
      const debit = normalizeAmount(row['Debit'] || '0')
      const credit = normalizeAmount(row['Credit'] || '0')
      return {
        date: normalizeDate(row['Date']),
        description: row['Description'],
        amount: credit > 0 ? credit : debit,
        type: credit > 0 ? 'credit' : 'debit',
      }
    })
    .filter((t: any) => t.amount > 0)

  console.log(`  Valid transactions: ${transactions.length}`)
  console.log('\n  First 5 transactions:')
  transactions.slice(0, 5).forEach((t: any, i: number) => {
    console.log(`  ${i + 1}. [${t.type.toUpperCase()}] ${t.date} | ${t.description.substring(0, 35)} | ₹${t.amount.toLocaleString('en-IN')}`)
  })
}

// ─── Run all tests ────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════╗')
  console.log('║    FINN Parser Test Suite            ║')
  console.log('╚══════════════════════════════════════╝')

  testNormalizeDate()
  testNormalizeAmount()
  testNormalizeType()
  await testCSVParsing()

  console.log('\n✅ All tests completed!\n')
}

main().catch(console.error)
