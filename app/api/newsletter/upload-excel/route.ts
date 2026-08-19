import { NextRequest, NextResponse } from 'next/server'
import { parseThemeHistory } from '@/lib/modules/newsletter/excel-parser'
import { getNeon } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const themes = parseThemeHistory(buffer)

    if (themes.length === 0) {
      return NextResponse.json({ error: 'No theme records found in spreadsheet. Make sure a column is named "Theme" or "Topic".' }, { status: 400 })
    }

    // Persist to Neon theme_history_archive (upsert by theme text)
    try {
      const neon = getNeon()

      // Ensure table exists
      await neon`
        CREATE TABLE IF NOT EXISTS theme_history_archive (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(100) NOT NULL,
          theme TEXT NOT NULL,
          used_date DATE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `

      // Insert new themes (skip duplicates for this user)
      for (const t of themes) {
        await neon`
          INSERT INTO theme_history_archive (user_id, theme, used_date, notes)
          SELECT ${DEFAULT_USER_ID}, ${t.theme}, ${t.date || null}::DATE, ${t.notes || null}
          WHERE NOT EXISTS (
            SELECT 1 FROM theme_history_archive
            WHERE user_id = ${DEFAULT_USER_ID} AND theme = ${t.theme}
          );
        `
      }
    } catch (dbErr) {
      // Log DB error but still return success with parsed themes
      console.warn('Failed to persist themes to Neon, falling back to in-memory only:', dbErr)
    }

    return NextResponse.json({ themes, saved: themes.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload Excel error:', message)
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 })
  }
}
