import Papa from 'papaparse'
import { Transaction } from './normalizer'
import { normalizeDate, normalizeAmount, normalizeType } from './normalizer'

// ─── Bank Format Definitions ──────────────────────────────────────────────────

interface BankFormat {
  name: string
  dateCol: string[]
  descCol: string[]
  debitCol: string[]
  creditCol: string[]
  amountCol: string[]
  typeCol: string[]
}

const INDIAN_FORMATS: BankFormat[] = [
  {
    name: 'SBI',
    dateCol: ['date', 'txn date', 'transaction date', 'value date'],
    descCol: ['description', 'particulars', 'narration', 'remarks'],
    debitCol: ['debit', 'withdrawal', 'dr', 'debit amount', 'withdrawal amt'],
    creditCol: ['credit', 'deposit', 'cr', 'credit amount', 'deposit amt'],
    amountCol: ['amount', 'transaction amount'],
    typeCol: ['type', 'dr/cr', 'cr/dr', 'txn type'],
  },
  {
    name: 'HDFC',
    dateCol: ['date', 'value date'],
    descCol: ['narration', 'description', 'particulars'],
    debitCol: ['debit amount', 'withdrawal amt(inr)', 'debit'],
    creditCol: ['credit amount', 'deposit amt(inr)', 'credit'],
    amountCol: ['amount(inr)', 'amount'],
    typeCol: [],
  },
  {
    name: 'ICICI',
    dateCol: ['transaction date', 'value date', 'date'],
    descCol: ['transaction remarks', 'particulars', 'description'],
    debitCol: ['debit', 'withdrawal'],
    creditCol: ['credit', 'deposit'],
    amountCol: ['amount(inr)', 'amount'],
    typeCol: ['cr/dr', 'type'],
  },
  {
    name: 'AXIS',
    dateCol: ['tran date', 'date', 'transaction date'],
    descCol: ['particulars', 'description', 'narration'],
    debitCol: ['dr', 'debit', 'withdrawal'],
    creditCol: ['cr', 'credit', 'deposit'],
    amountCol: ['amount'],
    typeCol: [],
  },
  {
    name: 'KOTAK',
    dateCol: ['date', 'transaction date', 'value date'],
    descCol: ['description', 'narration', 'particulars'],
    debitCol: ['debit', 'dr amount', 'withdrawal'],
    creditCol: ['credit', 'cr amount', 'deposit'],
    amountCol: ['amount'],
    typeCol: ['dr/cr'],
  },
  {
    name: 'Paytm Payments Bank',
    dateCol: ['date', 'transaction date', 'timestamp'],
    descCol: ['description', 'comment', 'remarks', 'merchant'],
    debitCol: ['debit', 'amount paid', 'paid'],
    creditCol: ['credit', 'amount received', 'received'],
    amountCol: ['amount', 'transaction amount'],
    typeCol: ['type', 'transaction type'],
  },
  {
    name: 'Yes Bank',
    dateCol: ['transaction date', 'date', 'value date'],
    descCol: ['description', 'remarks', 'narration'],
    debitCol: ['debit', 'withdrawal amount', 'dr'],
    creditCol: ['credit', 'deposit amount', 'cr'],
    amountCol: ['amount'],
    typeCol: ['type', 'dr/cr'],
  },
  {
    name: 'PNB',
    dateCol: ['date', 'txn date', 'value date'],
    descCol: ['narration', 'particulars', 'description'],
    debitCol: ['debit', 'dr', 'withdrawal'],
    creditCol: ['credit', 'cr', 'deposit'],
    amountCol: ['amount'],
    typeCol: ['type'],
  },
]

const INTERNATIONAL_FORMATS: BankFormat[] = [
  {
    name: 'Chase (US)',
    dateCol: ['transaction date', 'post date', 'date'],
    descCol: ['description', 'merchant'],
    debitCol: ['debit', 'amount'],
    creditCol: ['credit', 'amount'],
    amountCol: ['amount'],
    typeCol: ['type'],
  },
  {
    name: 'Bank of America (US)',
    dateCol: ['date', 'posted date'],
    descCol: ['payee', 'description'],
    debitCol: ['withdrawal', 'debit'],
    creditCol: ['deposit', 'credit'],
    amountCol: ['amount'],
    typeCol: [],
  },
  {
    name: 'HSBC (Global)',
    dateCol: ['date', 'transaction date', 'value date'],
    descCol: ['description', 'payee', 'narrative'],
    debitCol: ['debit', 'money out', 'payment'],
    creditCol: ['credit', 'money in', 'receipt'],
    amountCol: ['amount', 'local amount'],
    typeCol: ['type', 'dr/cr'],
  },
  {
    name: 'Barclays (UK)',
    dateCol: ['date', 'transaction date'],
    descCol: ['memo', 'payee', 'description'],
    debitCol: ['money out', 'debit'],
    creditCol: ['money in', 'credit'],
    amountCol: ['amount'],
    typeCol: ['type'],
  },
  {
    name: 'Revolut (Global)',
    dateCol: ['started date', 'completed date', 'date'],
    descCol: ['description', 'merchant'],
    debitCol: ['amount'],
    creditCol: ['amount'],
    amountCol: ['amount'],
    typeCol: ['type'],
  },
  {
    name: 'DBS (SG)',
    dateCol: ['transaction date', 'date', 'value date'],
    descCol: ['reference', 'description', 'remarks'],
    debitCol: ['debit', 'withdrawal'],
    creditCol: ['credit', 'deposit'],
    amountCol: ['amount'],
    typeCol: ['type', 'dr/cr'],
  },
  {
    name: 'Emirates NBD (UAE)',
    dateCol: ['date', 'transaction date', 'value date'],
    descCol: ['description', 'narration', 'remarks'],
    debitCol: ['debit', 'dr', 'withdrawal'],
    creditCol: ['credit', 'cr', 'deposit'],
    amountCol: ['amount', 'aed'],
    typeCol: ['type', 'dr/cr'],
  },
  {
    name: 'Generic',
    dateCol: ['date', 'transaction date', 'posting date', 'value date', 'booking date', 'created'],
    descCol: ['description', 'memo', 'payee', 'narration', 'particulars', 'remarks', 'merchant', 'name', 'reference', 'narrative'],
    debitCol: ['debit', 'dr', 'withdrawal', 'money out', 'amount out', 'payment', 'charge', 'withdrawals'],
    creditCol: ['credit', 'cr', 'deposit', 'money in', 'amount in', 'receipt', 'deposits'],
    amountCol: ['amount', 'transaction amount', 'sum', 'value', 'local amount'],
    typeCol: ['type', 'dr/cr', 'cr/dr', 'transaction type', 'debit/credit'],
  },
]

const ALL_BANK_FORMATS: BankFormat[] = [...INDIAN_FORMATS, ...INTERNATIONAL_FORMATS]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findColumn(headers: string[], possibleNames: string[]): string | null {
  const normalized = headers.map((h) => h.toLowerCase().trim())
  for (const name of possibleNames) {
    const idx = normalized.findIndex((h) => h.includes(name.toLowerCase()))
    if (idx !== -1) return headers[idx]
  }
  return null
}

export function detectBankFormat(headers: string[]): BankFormat {
  const lower = headers.map((h) => h.toLowerCase().trim())
  for (const format of ALL_BANK_FORMATS) {
    const hasDate = format.dateCol.some((d) => lower.some((h) => h.includes(d)))
    const hasDesc = format.descCol.some((d) => lower.some((h) => h.includes(d)))
    if (hasDate && hasDesc) {
      console.log(`[FINN Parser] Detected bank format: ${format.name}`)
      return format
    }
  }
  console.log('[FINN Parser] No format matched, using Generic')
  return ALL_BANK_FORMATS[ALL_BANK_FORMATS.length - 1]
}

// ─── Row Parser ───────────────────────────────────────────────────────────────

export interface ParseCSVResult {
  transactions: Transaction[]
  detectedFormat: string
}

function parseRows(rows: Record<string, string>[], headers: string[]): ParseCSVResult {
  const format = detectBankFormat(headers)
  const transactions: Transaction[] = []

  for (const row of rows) {
    try {
      if (Object.values(row).every((v) => !v?.trim())) continue

      const dateCol = findColumn(headers, format.dateCol)
      const dateVal = dateCol ? row[dateCol]?.trim() : null
      if (!dateVal) continue
      const normalizedDate = normalizeDate(dateVal)
      if (!normalizedDate) continue

      const descCol = findColumn(headers, format.descCol)
      const description = (descCol ? row[descCol]?.trim() : null)
        || Object.values(row).find((v) => v?.length > 5 && isNaN(Number(v.replace(/[,₹$€£\s]/g, ''))))
        || 'Transaction'

      const debitCol = findColumn(headers, format.debitCol)
      const creditCol = findColumn(headers, format.creditCol)
      const amountCol = findColumn(headers, format.amountCol)
      const typeCol = findColumn(headers, format.typeCol)

      let amount = 0
      let type: 'credit' | 'debit' = 'debit'

      if (debitCol && creditCol && debitCol !== creditCol) {
        const creditVal = normalizeAmount(row[creditCol]?.trim() || '')
        const debitVal = normalizeAmount(row[debitCol]?.trim() || '')
        if (creditVal > 0) { amount = creditVal; type = 'credit' }
        else if (debitVal > 0) { amount = debitVal; type = 'debit' }
        else continue
      } else if (amountCol) {
        const amountVal = row[amountCol]?.trim() || ''
        amount = normalizeAmount(amountVal)
        if (typeCol) {
          type = normalizeType(row[typeCol]?.trim().toLowerCase() || '')
        } else {
          type = amountVal.startsWith('-') ? 'debit' : 'credit'
        }
      } else {
        const numericCol = headers.find((h) => normalizeAmount(row[h]) > 0)
        if (!numericCol) continue
        amount = normalizeAmount(row[numericCol])
        type = 'debit'
      }

      if (amount <= 0 || !description) continue

      transactions.push({
        date: normalizedDate,
        description,
        amount: Math.round(amount * 100) / 100,
        type,
        raw_text: JSON.stringify(row),
      })
    } catch {
      continue
    }
  }

  return { transactions, detectedFormat: format.name }
}

// ─── Public API (server-safe, no FileReader) ─────────────────────────────────

export async function parseCSV(file: File | Buffer): Promise<ParseCSVResult> {
  // Convert to text server-side without FileReader
  let text: string
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer()
    text = Buffer.from(arrayBuffer).toString('utf-8')
  } else {
    text = file.toString('utf-8')
  }

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })

  const headers = result.meta.fields || []
  console.log('[FINN Parser] CSV Headers:', headers)
  console.log('[FINN Parser] First row:', result.data[0])
  console.log('[FINN Parser] Total rows:', result.data.length)

  if (!result.data || result.data.length === 0) {
    throw new Error('No data found in CSV file')
  }

  const parsed = parseRows(result.data, headers)
  console.log(`[FINN Parser] Parsed ${parsed.transactions.length} transactions [Format: ${parsed.detectedFormat}]`)

  if (parsed.transactions.length === 0) {
    throw new Error(
      `Could not parse transactions. Headers found: [${headers.join(', ')}]. First row: ${JSON.stringify(result.data[0])}`
    )
  }

  return parsed
}
