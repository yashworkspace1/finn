import {
  Transaction,
  normalizeDate,
  normalizeAmount,
  normalizeType,
  isValidTransaction,
} from '@/lib/parser/normalizer'

// ─── Regex patterns for transaction rows ──────────────────────────────────────
const TX_PATTERNS = [
  // DD/MM/YYYY ... amount ... CR/DR
  /(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(.+?)\s+([\d,]+\.?\d{0,2})\s*(CR|DR|Cr|Dr)?/g,
  // DD MMM YYYY ... amount
  /(\d{2}\s+[A-Za-z]{3}\s+\d{4})\s+(.+?)\s+([\d,]+\.?\d{0,2})/g,
  // YYYY-MM-DD ... amount
  /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([\d,]+\.?\d{0,2})\s*(CR|DR|Cr|Dr)?/g,
]

function extractTransactionsFromText(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  for (const line of lines) {
    for (const pattern of TX_PATTERNS) {
      pattern.lastIndex = 0
      const match = pattern.exec(line)
      if (match) {
        const [, rawDate, rawDesc, rawAmount, rawType] = match
        const date = normalizeDate(rawDate.trim())
        if (!date) break
        const description = rawDesc.trim()
        const amount = normalizeAmount(rawAmount)
        const type = normalizeType(rawType ?? '')

        const t: Transaction = { date, description, amount, type, raw_text: line }
        if (isValidTransaction(t)) {
          transactions.push(t)
          break
        }
      }
    }
  }

  return transactions
}

export async function parsePDF(input: File | Buffer): Promise<Transaction[]> {
  let buffer: Buffer

  // Server-safe: arrayBuffer() works in Next.js API routes ✅
  if (input instanceof File) {
    const ab = await input.arrayBuffer()
    buffer = Buffer.from(ab)
  } else {
    buffer = input
  }

  let text = ''
  try {
    const { PDFParse } = await import('pdf-parse')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parser = new (PDFParse as any)()
    await parser.load(buffer)
    const numPages: number = parser.numPages ?? 0
    const pages: string[] = []
    for (let i = 1; i <= numPages; i++) {
      try { pages.push((await parser.getText(i)) ?? '') } catch { /* skip */ }
    }
    text = pages.join('\n')
    console.log('[FINN Parser] PDF text extracted, length:', text.length)
  } catch (err: any) {
    throw new Error(`Could not read PDF: ${err.message}. The file may be scanned or password-protected.`)
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Could not extract text from PDF. The file may be scanned or image-based.')
  }

  const transactions = extractTransactionsFromText(text)

  if (transactions.length === 0) {
    throw new Error('No transactions found in PDF. Make sure this is a text-based bank statement PDF.')
  }

  return transactions
}
