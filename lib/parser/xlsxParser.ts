import * as XLSX from 'xlsx'
import {
  Transaction,
  normalizeDate,
  normalizeAmount,
  normalizeType,
  isValidTransaction,
} from '@/lib/parser/normalizer'

interface ColumnMap {
  date: number
  description: number
  debit: number
  credit: number
  amount: number
  type: number
}

const DATE_KEYS = ['date', 'tran date', 'transaction date', 'value date', 'txn date']
const DESC_KEYS = ['description', 'narration', 'particulars', 'transaction remarks', 'remarks', 'details']
const DEBIT_KEYS = ['debit', 'dr', 'debit amount', 'withdrawal', 'withdrawal amt']
const CREDIT_KEYS = ['credit', 'cr', 'credit amount', 'deposit', 'deposit amt']
const AMOUNT_KEYS = ['amount', 'amount(inr)', 'txn amount', 'transaction amount', 'amt']
const TYPE_KEYS = ['type', 'cr/dr', 'dr/cr', 'transaction type']

function findColIndex(header: string[], keys: string[]): number {
  const lower = header.map((h) => String(h).toLowerCase().trim())
  for (const key of keys) {
    const idx = lower.findIndex((h) => h.includes(key))
    if (idx !== -1) return idx
  }
  return -1
}

function findHeaderRow(sheet: XLSX.WorkSheet): { rowIndex: number; headers: string[] } | null {
  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:Z1')
  for (let r = range.s.r; r <= Math.min(range.e.r, 10); r++) {
    const row: string[] = []
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })]
      row.push(cell ? String(cell.v) : '')
    }
    // Check if this row looks like a header
    const rowLower = row.map((h) => h.toLowerCase())
    if (
      rowLower.some((h) => DATE_KEYS.some((k) => h.includes(k))) &&
      rowLower.some((h) => DESC_KEYS.some((k) => h.includes(k)))
    ) {
      return { rowIndex: r, headers: row }
    }
  }
  return null
}

export async function parseXLSX(input: File | Buffer): Promise<Transaction[]> {
  let buffer: Buffer

  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } else {
    buffer = input
  }

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const headerInfo = findHeaderRow(sheet)
  if (!headerInfo) {
    throw new Error('Could not detect header row in XLSX. Please check the file format.')
  }

  const { rowIndex, headers } = headerInfo

  const dateCol = findColIndex(headers, DATE_KEYS)
  const descCol = findColIndex(headers, DESC_KEYS)
  const debitCol = findColIndex(headers, DEBIT_KEYS)
  const creditCol = findColIndex(headers, CREDIT_KEYS)
  const amountCol = findColIndex(headers, AMOUNT_KEYS)
  const typeCol = findColIndex(headers, TYPE_KEYS)

  if (dateCol === -1 || descCol === -1) {
    throw new Error('Could not detect date or description columns in XLSX.')
  }

  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:Z1')
  const transactions: Transaction[] = []

  for (let r = rowIndex + 1; r <= range.e.r; r++) {
    const getCell = (colIdx: number): string => {
      if (colIdx === -1) return ''
      const cell = sheet[XLSX.utils.encode_cell({ r, c: colIdx + range.s.c })]
      if (!cell) return ''
      if (cell.t === 'd' && cell.v instanceof Date) {
        return cell.v.toISOString().split('T')[0]
      }
      return String(cell.v ?? '').trim()
    }

    const rawDate = getCell(dateCol)
    const rawDesc = getCell(descCol)
    const date = normalizeDate(rawDate)
    const description = rawDesc.trim()

    if (!date || !description) continue

    let amount = 0
    let type: 'credit' | 'debit' = 'debit'

    if (debitCol !== -1 && creditCol !== -1) {
      const debitVal = normalizeAmount(getCell(debitCol))
      const creditVal = normalizeAmount(getCell(creditCol))
      if (creditVal > 0) { amount = creditVal; type = 'credit' }
      else if (debitVal > 0) { amount = debitVal; type = 'debit' }
      else continue
    } else if (amountCol !== -1 && typeCol !== -1) {
      amount = normalizeAmount(getCell(amountCol))
      type = normalizeType(getCell(typeCol))
    } else if (amountCol !== -1) {
      const raw = getCell(amountCol)
      amount = normalizeAmount(raw)
      type = raw.startsWith('-') ? 'debit' : 'credit'
    }

    if (amount <= 0) continue

    const t: Transaction = { date, description, amount, type }
    if (isValidTransaction(t)) transactions.push(t)
  }

  return transactions
}
