import { Transaction } from '@/lib/parser/normalizer'
import { parseCSV } from '@/lib/parser/csvParser'
import { parsePDF } from '@/lib/parser/pdfParser'
import { parseXLSX } from '@/lib/parser/xlsxParser'

export type { Transaction }

export async function parseStatement(
  file: File | Buffer,
  filename: string
): Promise<Transaction[]> {
  const ext = filename.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'csv':
      return await parseCSV(file as File | Buffer)
    case 'pdf':
      return await parsePDF(file as File | Buffer)
    case 'xlsx':
    case 'xls':
      return await parseXLSX(file as File | Buffer)
    default:
      throw new Error(
        `Unsupported format: .${ext ?? 'unknown'}. Please upload a CSV, PDF, or XLSX file.`
      )
  }
}
