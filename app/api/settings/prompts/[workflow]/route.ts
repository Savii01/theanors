import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getNeon } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

import { ENGAGEMENT_MASTER_PROMPT } from '@/lib/modules/engagement/engagement.prompts'
import { CAPTION_MASTER_PROMPT } from '@/lib/modules/captions/captions.prompts'
import { SCRIPTING_MASTER_PROMPT } from '@/lib/modules/scripting/scripting.prompts'
import { NEWSLETTER_MASTER_PROMPT } from '@/lib/modules/newsletter/newsletter.prompts'
import { INITIAL_COMMENTS_MASTER_PROMPT } from '@/lib/modules/comments/comments.prompts'

const WORKFLOW_PROMPTS: Record<string, string> = {
  engagement: ENGAGEMENT_MASTER_PROMPT,
  captions: CAPTION_MASTER_PROMPT,
  scripting: SCRIPTING_MASTER_PROMPT,
  newsletter: NEWSLETTER_MASTER_PROMPT,
  comments: INITIAL_COMMENTS_MASTER_PROMPT,
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ workflow: string }> }
) {
  try {
    const { workflow } = await params
    let prompt = WORKFLOW_PROMPTS[workflow] ?? ''

    // 1. Try Neon DB
    try {
      const sql = getNeon()
      const rows = (await sql`
        SELECT prompt_text FROM prompts WHERE user_id = ${DEFAULT_USER_ID} AND workflow = ${workflow} LIMIT 1;
      `) as { prompt_text?: string }[]

      if (rows.length > 0 && rows[0].prompt_text) {
        return NextResponse.json({ prompt: rows[0].prompt_text })
      }
    } catch (neonErr) {
      console.warn('Neon GET [workflow] prompt fallback warning:', neonErr)
    }

    // 2. Try Supabase
    try {
      const supabase = getSupabaseAdmin()
      const { data } = await supabase
        .from('prompts')
        .select('prompt_text')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('workflow', workflow)
        .single()

      if (data && (data as { prompt_text?: string }).prompt_text) {
        prompt = (data as { prompt_text?: string }).prompt_text || prompt
      }
    } catch (supabaseErr) {
      console.warn('Supabase GET [workflow] prompt fallback warning:', supabaseErr)
    }

    return NextResponse.json({ prompt })
  } catch {
    return NextResponse.json({ prompt: '' })
  }
}
