import { NextRequest, NextResponse } from 'next/server'
import { getNeon } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

export async function GET() {
  try {
    const neon = getNeon()
    const memories = await neon`
      SELECT id, preference_type, preference_value, frequency_selected
      FROM user_preferences
      WHERE user_id = ${DEFAULT_USER_ID}
      ORDER BY frequency_selected DESC
    `
    return NextResponse.json({ memories })
  } catch {
    return NextResponse.json({ memories: [] })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const neon = getNeon()
    await neon`DELETE FROM user_preferences WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Delete memory error:', message)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
