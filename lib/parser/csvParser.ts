import Papa from 'papaparse'
import {
  Transaction,
  normalizeDate,
  normalizeAmount,
  normalizeType,
  isValidTransaction,
} from '@/lib/parser/normalizer'

// ─── Bank format column mappings ──────────────────────────────────────────────
interface ColumnMap {
  date: string[]
  description: string[]
  debit: string[]
  credit: string[]
  amount: string[]
  type: string[]
}

const COLUMN_MAP: ColumnMap = {
  date: ['date', 'tran date', 'transaction date', 'value date', 'txn date', 'posting date', 'trans date'],
  description: ['description', 'narration', 'particulars', 'transaction remarks', 'remarks', 'details', 'trans particulars', 'transaction details'],
  debit: ['debit', 'dr', 'debit amount', 'withdrawal', 'withdrawal amt', 'debit amt', 'amount(dr)'],
  credit: ['credit', 'cr', 'credit amount', 'deposit', 'deposit amt', 'credit amt', 'amount(cr)'],
  amount: ['amount', 'amount(inr)', 'txn amount', 'transaction amount', 'amt'],
  type: ['type', 'cr/dr', 'dr/cr', 'transaction type', 'txn type'],
}

function findColumn(headers: string[], keys: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase().trim())
  for (const key of keys) {
    const idx = lower.findIndex((h) => h.includes(key))
    if (idx !== -1) return headers[idx]
  }
  return null
}

export async function parseCSV(
  input: File | Buffer | string
): Promise<Transaction[]> {
  let csvText: string

  if (typeof input === 'string') {
    csvText = input
  } else if (input instanceof File) {
    csvText = await input.text()
  } else {
    csvText = input.toString('utf-8')
  }

  // Remove BOM if present
  csvText = csvText.replace(/^\uFEFF/, '')

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`)
  }

  const headers = result.meta.fields ?? []

  const dateCol = findColumn(headers, COLUMN_MAP.date)
  const descCol = findColumn(headers, COLUMN_MAP.description)
  const debitCol = findColumn(headers, COLUMN_MAP.debit)
  const creditCol = findColumn(headers, COLUMN_MAP.credit)
  const amountCol = findColumn(headers, COLUMN_MAP.amount)
  const typeCol = findColumn(headers, COLUMN_MAP.type)

  if (!dateCol || !descCol) {
    throw new Error('Could not detect date or description columns. Please check your CSV format.')
  }

  const transactions: Transaction[] = []

  for (const row of result.data) {
    const rawDate = row[dateCol] ?? ''
    const rawDesc = row[descCol] ?? ''
    const date = normalizeDate(rawDate)
    const description = rawDesc.trim()

    if (!date || !description) continue

    let amount = 0
    let type: 'credit' | 'debit' = 'debit'

    if (debitCol && creditCol) {
      // Separate debit/credit columns (SBI, HDFC format)
      const debitVal = normalizeAmount(row[debitCol] ?? '0')
      const creditVal = normalizeAmount(row[creditCol] ?? '0')
      if (creditVal > 0) {
        amount = creditVal
        type = 'credit'
      } else if (debitVal > 0) {
        amount = debitVal
        type = 'debit'
      } else {
        continue
      }
    } else if (amountCol && typeCol) {
      // Amount + type columns (ICICI format)
      amount = normalizeAmount(row[amountCol] ?? '0')
      type = normalizeType(row[typeCol] ?? '')
    } else if (amountCol) {
      // Single amount column (generic)
      const raw = row[amountCol] ?? '0'
      amount = normalizeAmount(raw)
      type = raw.startsWith('-') || raw.includes('(') ? 'debit' : 'credit'
    }

    if (amount <= 0) continue

    const t: Transaction = {
      date,
      description,
      amount,
      type,
      raw_text: Object.values(row).join(' | '),
    }

    if (isValidTransaction(t)) transactions.push(t)
  }

  return transactions
}
