import { NextResponse } from 'next/server'
import { getNeon, getSupabaseAdmin } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

export interface RecentChatEntry {
  id: string
  workflow: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function GET() {
  try {
    const neon = getNeon()

    // Ensure table exists
    await neon`
      CREATE TABLE IF NOT EXISTS workflow_chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(100) NOT NULL,
        workflow VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `

    const rows = (await neon`
      SELECT id, workflow, role, content, created_at
      FROM workflow_chat_history
      WHERE user_id = ${DEFAULT_USER_ID}
      ORDER BY created_at DESC
      LIMIT 20;
    `) as RecentChatEntry[]

    // Get total count for stats
    const countResult = (await neon`
      SELECT COUNT(*)::int AS total
      FROM workflow_chat_history
      WHERE user_id = ${DEFAULT_USER_ID};
    `) as { total: number }[]

    const totalCount = countResult.length > 0 ? countResult[0].total : 0

    return NextResponse.json({ entries: rows || [], totalCount })
  } catch (neonErr) {
    console.warn('Neon GET /api/chat/recent warning:', neonErr)

    // Supabase fallback
    try {
      const supabase = getSupabaseAdmin()
      const { data } = await supabase
        .from('workflow_chat_history')
        .select('id, workflow, role, content, created_at')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false })
        .limit(20)

      const { count } = await supabase
        .from('workflow_chat_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', DEFAULT_USER_ID)

      return NextResponse.json({ entries: data || [], totalCount: count || 0 })
    } catch (supabaseErr) {
      console.warn('Supabase GET /api/chat/recent fallback warning:', supabaseErr)
      return NextResponse.json({ entries: [], totalCount: 0 })
    }
  }
}
