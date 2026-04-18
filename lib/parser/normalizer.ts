export interface Transaction {
  date: string         // YYYY-MM-DD
  description: string
  amount: number       // always positive
  type: 'credit' | 'debit'
  category?: string
  raw_text?: string
}

// ─── Month Map ────────────────────────────────────────────────────────────────
const MONTHS: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
}

// ─── Date Normalizer ──────────────────────────────────────────────────────────
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr?.trim()) return null

  const str = dateStr.trim()

  // Handle ISO timestamp (2025-04-01T12:34:56)
  if (str.includes('T')) {
    const d = new Date(str)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  }

  // Handle epoch timestamps (10 or 13 digits)
  if (/^\d{10,13}$/.test(str)) {
    const ts = parseInt(str)
    const d = new Date(ts > 9999999999 ? ts : ts * 1000)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  }

  // Ordered format patterns — most specific first
  const formats: Array<{ r: RegExp; f: (m: RegExpMatchArray) => string }> = [
    // YYYY-MM-DD (already ISO)
    {
      r: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      f: (m) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`,
    },
    // YYYY/MM/DD
    {
      r: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
      f: (m) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`,
    },
    // YYYY.MM.DD (Asian)
    {
      r: /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/,
      f: (m) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`,
    },
    // DD/MM/YYYY (India, UK, AU)
    {
      r: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      f: (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`,
    },
    // DD-MM-YYYY
    {
      r: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      f: (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`,
    },
    // DD.MM.YYYY (European)
    {
      r: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
      f: (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`,
    },
    // DD MMM YYYY  (01 Apr 2025)
    {
      r: /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
      f: (m) =>
        `${m[3]}-${MONTHS[m[2].toLowerCase()] || '01'}-${m[1].padStart(2, '0')}`,
    },
    // DD-MMM-YYYY  (01-Apr-2025)
    {
      r: /^(\d{1,2})-([A-Za-z]+)-(\d{4})$/,
      f: (m) =>
        `${m[3]}-${MONTHS[m[2].toLowerCase()] || '01'}-${m[1].padStart(2, '0')}`,
    },
    // MMM DD YYYY  (Apr 01 2025)
    {
      r: /^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/,
      f: (m) =>
        `${m[3]}-${MONTHS[m[1].toLowerCase()] || '01'}-${m[2].padStart(2, '0')}`,
    },
    // DD/MM/YY
    {
      r: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      f: (m) => `20${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`,
    },
    // DD MMM YY  (01 Apr 25)
    {
      r: /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2})$/,
      f: (m) =>
        `20${m[3]}-${MONTHS[m[2].toLowerCase()] || '01'}-${m[1].padStart(2, '0')}`,
    },
  ]

  for (const { r, f } of formats) {
    const match = str.match(r)
    if (match) {
      const result = f(match)
      const d = new Date(result)
      if (!isNaN(d.getTime()) && d.getFullYear() > 2000 && d.getFullYear() < 2100) {
        return result
      }
    }
  }

  // Last resort: native Date
  const fallback = new Date(dateStr)
  if (!isNaN(fallback.getTime())) {
    return fallback.toISOString().split('T')[0]
  }

  return null
}

// ─── Amount Normalizer ────────────────────────────────────────────────────────
export function normalizeAmount(val: string | number): number {
  if (typeof val === 'number') return Math.abs(val)
  if (!val?.trim()) return 0

  let cleaned = val.trim()

  // Remove all known currency symbols / codes
  const symbols = [
    '₹', '$', '€', '£', '¥', '₩', '₪', '₺', '₽',
    'AED', 'SAR', 'SGD', 'MYR', 'AUD', 'CAD', 'CHF',
    'HKD', 'INR', 'USD', 'EUR', 'GBP', 'JPY', 'KRW',
    'CAD$', 'A$', 'NZ$', 'S$', 'HK$', 'RM', 'Rp',
    'Rs.', 'Rs', 'US$',
  ]
  for (const sym of symbols) {
    cleaned = cleaned.replace(
      new RegExp(sym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      ''
    )
  }

  cleaned = cleaned.trim()

  // European format: 1.234,56 → 1234.56
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    // Standard: remove thousands commas
    cleaned = cleaned.replace(/,/g, '')
  }

  // Remove parentheses (accounting negatives)
  cleaned = cleaned.replace(/[()]/g, '').trim()

  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : Math.abs(num)
}

// ─── Type Normalizer ──────────────────────────────────────────────────────────
export function normalizeType(type: string, _amount?: number): 'credit' | 'debit' {
  const t = String(type).toLowerCase().trim()

  const creditWords = ['cr', 'credit', 'deposit', 'received', 'in', 'inward', '+', 'refund', 'cashback', 'receipt', 'haben', 'money in']
  const debitWords = ['dr', 'debit', 'db', 'withdrawal', 'sent', 'out', 'outward', '-', 'paid', 'payment', 'charge', 'soll', 'money out']

  if (creditWords.some((w) => t.includes(w))) return 'credit'
  if (debitWords.some((w) => t.includes(w))) return 'debit'

  return 'debit'
}

// ─── Row Validator ────────────────────────────────────────────────────────────
export function isValidTransaction(t: Partial<Transaction>): boolean {
  return !!(t.date && t.amount && t.amount > 0 && t.description)
}
