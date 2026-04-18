import { Transaction } from '@/lib/parser/normalizer'
import { parseCSV } from '@/lib/parser/csvParser'
import { parsePDF } from '@/lib/parser/pdfParser'
import { parseXLSX } from '@/lib/parser/xlsxParser'

export type { Transaction }

export interface ParseResult {
  transactions: Transaction[]
  detectedFormat: string
}

/**
 * Parse a bank statement file server-side.
 * Uses arrayBuffer() — NO FileReader (browser-only API).
 */
export async function parseStatement(
  file: File | Buffer,
  filename?: string
): Promise<ParseResult> {
  const name = filename || (file instanceof File ? file.name : 'unknown')
  const ext = name.split('.').pop()?.toLowerCase()

  console.log(`[Upload] Parsing: ${name} | ext: ${ext} | size: ${file instanceof File ? file.size : (file as Buffer).length} bytes`)

  switch (ext) {
    case 'csv': {
      // Returns { transactions, detectedFormat }
      const result = await parseCSV(file as File | Buffer)
      return result
    }
    case 'pdf': {
      const transactions = await parsePDF(file as File | Buffer)
      return { transactions, detectedFormat: 'PDF' }
    }
    case 'xlsx':
    case 'xls': {
      const transactions = await parseXLSX(file as File | Buffer)
      return { transactions, detectedFormat: 'Excel' }
    }
    default:
      throw new Error(
        `Unsupported format: .${ext ?? 'unknown'}. Please upload a CSV, PDF, or XLSX file.`
      )
  }
}
