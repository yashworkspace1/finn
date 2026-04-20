import {
  Transaction,
  normalizeDate,
  normalizeAmount,
  isValidTransaction,
} from '@/lib/parser/normalizer'

// ─── Smart PDF Parser with 3-Strategy Fallback ───────────────────────────────

export async function parsePDF(input: File | Buffer): Promise<Transaction[]> {
  let buffer: Buffer

  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } else {
    buffer = input
  }

  const { PDFParse } = await import('pdf-parse')
  const parser = new (PDFParse as any)({ data: buffer })
  let rawText = ''
  try {
    const textResult = await parser.getText()
    rawText = textResult.text
  } catch (err: any) {
    throw new Error(
      `Could not read PDF: ${err.message}. The file may be scanned or password-protected.`
    )
  }

  console.log('='.repeat(60))
  console.log('PDF PARSING DEBUG')
  console.log('='.repeat(60))
  console.log('Total text length:', rawText.length)
  console.log('First 1000 chars:')
  console.log(rawText.substring(0, 1000))
  console.log('='.repeat(60))

  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
      'PDF appears empty or is image-based. ' +
        'Please upload a text-based PDF or use CSV/XLSX.'
    )
  }

  // Try multiple extraction strategies
  let transactions = extractUsingLineStrategy(rawText)

  if (transactions.length < 3) {
    console.log(
      'Line strategy found only',
      transactions.length,
      'transactions. Trying block strategy...'
    )
    transactions = extractUsingBlockStrategy(rawText)
  }

  if (transactions.length < 3) {
    console.log('Block strategy failed. Trying table strategy...')
    transactions = extractUsingTableStrategy(rawText)
  }

  console.log('Final PDF parse result:', transactions.length, 'transactions')
  console.log('Sample transactions:', transactions.slice(0, 3))

  if (transactions.length === 0) {
    throw new Error(
      'Could not extract transactions from PDF. ' +
        'Try CSV or XLSX format for best results.'
    )
  }

  return transactions
}

// ─── STRATEGY 1 — Line-by-line extraction ─────────────────────────────────────
function extractUsingLineStrategy(text: string): Transaction[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 10)

  const transactions: Transaction[] = []

  // Patterns for common bank PDF formats
  const patterns: Array<{
    regex: RegExp
    dateIdx: number
    descIdx: number
    amountIdx?: number
    typeIdx?: number
    debitIdx?: number
    creditIdx?: number
  }> = [
    // Pattern 1: DD/MM/YYYY  Description  Amount CR/DR
    {
      regex:
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR|Cr|Dr)?$/i,
      dateIdx: 1,
      descIdx: 2,
      amountIdx: 3,
      typeIdx: 4,
    },
    // Pattern 2: DD-MMM-YYYY  Description  Amount
    {
      regex:
        /(\d{1,2}[\/\-][A-Za-z]{3}[\/\-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})/,
      dateIdx: 1,
      descIdx: 2,
      amountIdx: 3,
    },
    // Pattern 3: Separate debit/credit columns
    {
      regex:
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})?/,
      dateIdx: 1,
      descIdx: 2,
      debitIdx: 3,
      creditIdx: 4,
    },
    // Pattern 4: Amount first format (some SBI/PNB formats)
    {
      regex: /([\d,]+\.\d{2})\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+)/,
      dateIdx: 2,
      descIdx: 3,
      amountIdx: 1,
    },
    // Pattern 5: ISO date format YYYY-MM-DD
    {
      regex:
        /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR|Cr|Dr)?/i,
      dateIdx: 1,
      descIdx: 2,
      amountIdx: 3,
      typeIdx: 4,
    },
  ]

  for (const line of lines) {
    if (isHeaderOrFooter(line)) continue

    for (const p of patterns) {
      const match = line.match(p.regex)
      if (!match) continue

      try {
        const date = normalizeDate(match[p.dateIdx])
        if (!date) continue

        const description = cleanDescription(match[p.descIdx])
        if (!description || description.length < 3) continue

        let amount = 0
        let type: 'credit' | 'debit' = 'debit'

        if (p.debitIdx && p.creditIdx) {
          const debit = normalizeAmount(match[p.debitIdx] || '0')
          const credit = normalizeAmount(match[p.creditIdx] || '0')
          if (credit > 0) {
            amount = credit
            type = 'credit'
          } else if (debit > 0) {
            amount = debit
            type = 'debit'
          }
        } else if (p.amountIdx) {
          amount = normalizeAmount(match[p.amountIdx])
          if (p.typeIdx && match[p.typeIdx]) {
            const t = match[p.typeIdx].toLowerCase()
            type = t.startsWith('c') ? 'credit' : 'debit'
          } else {
            type = inferTypeFromDescription(description)
          }
        }

        if (amount <= 0) continue

        const t: Transaction = {
          date,
          description,
          amount: Math.round(amount * 100) / 100,
          type,
          raw_text: line,
        }
        if (isValidTransaction(t)) {
          transactions.push(t)
          break
        }
      } catch {
        continue
      }
    }
  }

  return transactions
}

// ─── STRATEGY 2 — Block-based extraction ─────────────────────────────────────
// For PDFs where transactions span multiple lines
function extractUsingBlockStrategy(text: string): Transaction[] {
  const transactions: Transaction[] = []

  // Split on date markers
  const datePattern = /(\d{1,2}[\/\-][\d\w]{1,3}[\/\-]\d{2,4})/g
  const blocks = text.split(datePattern)

  for (let i = 1; i < blocks.length; i += 2) {
    const dateStr = blocks[i]
    const content = blocks[i + 1] || ''

    const date = normalizeDate(dateStr)
    if (!date) continue

    // Find amount in content
    const amountMatch = content.match(/([\d,]+\.\d{2})/)
    if (!amountMatch) continue

    const amount = normalizeAmount(amountMatch[1])
    if (amount <= 0) continue

    // Description = text before amount
    const amountPos = content.indexOf(amountMatch[0])
    const description = cleanDescription(content.substring(0, amountPos).trim())
    if (!description || description.length < 3) continue

    const type = inferTypeFromDescription(description)

    const t: Transaction = {
      date,
      description,
      amount: Math.round(amount * 100) / 100,
      type,
    }
    if (isValidTransaction(t)) {
      transactions.push(t)
    }
  }

  return transactions
}

// ─── STRATEGY 3 — Table detection ────────────────────────────────────────────
// For PDFs with clear columnar structure
function extractUsingTableStrategy(text: string): Transaction[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const transactions: Transaction[] = []

  for (const line of lines) {
    const dateMatch = line.match(/(\d{1,2}[\/\-][\d\w]{1,3}[\/\-]\d{2,4})/)
    const amountMatches = line.match(/([\d,]+\.\d{2})/g)

    if (!dateMatch || !amountMatches) continue
    if (amountMatches.length === 0) continue

    const date = normalizeDate(dateMatch[1])
    if (!date) continue

    // Use last amount (usually transaction amount, not running balance)
    // Filter out amounts > 10,000,000 which are likely balances
    const validAmounts = amountMatches
      .map((a) => normalizeAmount(a))
      .filter((a) => a > 0 && a < 10_000_000)

    if (validAmounts.length === 0) continue
    const amount = validAmounts[validAmounts.length - 1]

    // Description = text between date and first amount
    const datePos = line.indexOf(dateMatch[0])
    const firstAmtPos = line.indexOf(amountMatches[0])
    let description = line.substring(datePos + dateMatch[0].length, firstAmtPos).trim()

    description = cleanDescription(description)
    if (!description || description.length < 3) continue

    const type = inferTypeFromDescription(description)

    const t: Transaction = {
      date,
      description,
      amount: Math.round(amount * 100) / 100,
      type,
    }
    if (isValidTransaction(t)) {
      transactions.push(t)
    }
  }

  return transactions
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHeaderOrFooter(line: string): boolean {
  const lower = line.toLowerCase()
  const skipWords = [
    'statement',
    'account no',
    'account number',
    'customer name',
    'branch',
    'ifsc',
    'page',
    'opening balance',
    'closing balance',
    'total',
    'summary',
    'statement period',
    'date description',
    'balance b/f',
    'balance c/f',
    'generated on',
    'transaction date',
    'value date',
    'narration',
    'cheque no',
    'ref no',
    'printed on',
  ]
  return skipWords.some((w) => lower.includes(w))
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-\/@&.,()]/g, '')
    .trim()
    .substring(0, 200)
}

function inferTypeFromDescription(desc: string): 'credit' | 'debit' {
  const lower = desc.toLowerCase()
  const creditKeywords = [
    'salary',
    'credit',
    'deposit',
    'received',
    'refund',
    'cashback',
    'interest',
    'dividend',
    'neft cr',
    'imps cr',
    'upi cr',
    'rtgs cr',
    'reversal',
    'inward',
    'receipts',
  ]
  const debitKeywords = [
    'debit',
    'withdrawal',
    'payment',
    'purchase',
    'atm',
    'pos',
    'bill',
    'emi',
    'transfer to',
    'neft dr',
    'imps dr',
    'upi dr',
    'charge',
    'fee',
    'outward',
  ]

  if (creditKeywords.some((k) => lower.includes(k))) return 'credit'
  if (debitKeywords.some((k) => lower.includes(k))) return 'debit'
  return 'debit' // default
}
