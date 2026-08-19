import { NextResponse } from 'next/server'
import { getNeon } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

export async function GET() {
  try {
    const neon = getNeon()

    const rows = await neon`
      SELECT theme, used_date::TEXT AS date, notes
      FROM theme_history_archive
      WHERE user_id = ${DEFAULT_USER_ID}
      ORDER BY created_at DESC;
    ` as { theme: string; date: string | null; notes: string | null }[]

    const themes = rows.map((r) => ({
      theme: r.theme,
      date: r.date ?? '',
      notes: r.notes ?? '',
    }))

    return NextResponse.json({ themes })
  } catch (err) {
    console.warn('Could not load theme history:', err)
    return NextResponse.json({ themes: [] })
  }
}

export async function DELETE() {
  try {
    const neon = getNeon()
    await neon`
      DELETE FROM theme_history_archive WHERE user_id = ${DEFAULT_USER_ID};
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to delete theme history:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
