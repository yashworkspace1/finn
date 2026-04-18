export interface Transaction {
  date: string         // YYYY-MM-DD
  description: string
  amount: number       // always positive
  type: 'credit' | 'debit'
  category?: string
  raw_text?: string
}

// ─── Date Normalizer ──────────────────────────────────────────────────────────
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return ''
  const s = dateStr.trim()

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // MM/DD/YYYY (US format - only when month > 12 is impossible for DD)
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (mdy) {
    const [, m, d, y] = mdy
    if (parseInt(m) > 12) {
      // must be DD/MM
      return `${y}-${d.padStart(2, '0')}-${m.padStart(2, '0')}`
    }
  }

  // DD MMM YYYY (e.g. 15 Jan 2024 or 15-Jan-2024)
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  }
  const dmy2 = s.match(/^(\d{1,2})[\s\-]([A-Za-z]{3})[\s\-](\d{4})$/)
  if (dmy2) {
    const [, d, mon, y] = dmy2
    const m = months[mon.toLowerCase()]
    if (m) return `${y}-${m}-${d.padStart(2, '0')}`
  }

  // YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/)
  if (ymd) {
    const [, y, m, d] = ymd
    return `${y}-${m}-${d}`
  }

  // Fallback — try JS Date parse
  const parsed = new Date(s)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return s // return as-is if we can't parse
}

// ─── Amount Normalizer ────────────────────────────────────────────────────────
export function normalizeAmount(amount: string | number): number {
  if (typeof amount === 'number') return Math.abs(amount)
  let s = String(amount).trim()
  // Remove currency symbols and whitespace
  s = s.replace(/[₹$£€]/g, '').replace(/\bRs\.?\b/gi, '').trim()
  // Remove parentheses (accounting notation for negatives)
  s = s.replace(/[()]/g, '')
  // Remove thousands-separator commas only (not the decimal point)
  // e.g. "1,500.00" → "1500.00"  but  "1500.00" stays "1500.00"
  s = s.replace(/,(?=\d{3}(?:[.,]|$))/g, '')
  // Fallback: remove any remaining commas (e.g. European "1.500,00" → handle below)
  s = s.replace(/,/g, '')
  const num = parseFloat(s)
  return isNaN(num) ? 0 : Math.abs(num)
}

// ─── Type Normalizer ──────────────────────────────────────────────────────────
export function normalizeType(
  type: string,
  amount?: number
): 'credit' | 'debit' {
  const t = String(type).toLowerCase().trim()

  if (['cr', 'credit', 'c', '+', 'deposit', 'received', 'in', 'inward'].some(k => t.includes(k))) return 'credit'
  if (['dr', 'debit', 'd', '-', 'withdrawal', 'sent', 'out', 'outward', 'payment'].some(k => t.includes(k))) return 'debit'

  // Fallback on amount sign
  if (amount !== undefined) return amount >= 0 ? 'credit' : 'debit'
  return 'debit'
}

// ─── Row Validator ────────────────────────────────────────────────────────────
export function isValidTransaction(t: Partial<Transaction>): boolean {
  return !!(t.date && t.amount && t.amount > 0 && t.description)
}
