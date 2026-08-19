import type { ThemeRecord } from '@/lib/shared/types'
import * as XLSX from 'xlsx'

export function parseThemeHistory(buffer: Buffer): ThemeRecord[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rawData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet)

  return rawData
    .map((row) => ({
      theme: String(row['Theme'] || row['theme'] || row['Topic'] || row['topic'] || Object.values(row)[0] || ''),
      date: String(row['Date'] || row['date'] || ''),
      notes: String(row['Notes'] || row['notes'] || ''),
    }))
    .filter((item) => Boolean(item.theme.trim()))
}
