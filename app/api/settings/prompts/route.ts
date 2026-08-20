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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workflow = searchParams.get('workflow')
    const prompts: Record<string, string> = { ...WORKFLOW_PROMPTS }

    // 1. Fetch from Neon DB
    try {
      const sql = getNeon()
      if (workflow) {
        const rows = (await sql`
          SELECT prompt_text FROM prompts WHERE user_id = ${DEFAULT_USER_ID} AND workflow = ${workflow} LIMIT 1;
        `) as { prompt_text?: string }[]

        if (rows.length > 0 && rows[0].prompt_text) {
          return NextResponse.json({ prompt: rows[0].prompt_text })
        }
      } else {
        const rows = (await sql`
          SELECT workflow, prompt_text FROM prompts WHERE user_id = ${DEFAULT_USER_ID};
        `) as { workflow: string; prompt_text: string }[]

        for (const row of rows) {
          if (row.workflow && row.prompt_text) {
            prompts[row.workflow] = row.prompt_text
          }
        }
      }
    } catch (neonErr) {
      console.warn('Neon GET prompts fallback warning:', neonErr)
    }

    // 2. Fetch from Supabase
    try {
      const supabase = getSupabaseAdmin()
      if (workflow) {
        const { data } = await supabase
          .from('prompts')
          .select('prompt_text')
          .eq('user_id', DEFAULT_USER_ID)
          .eq('workflow', workflow)
          .single()

        if (data && (data as { prompt_text?: string }).prompt_text) {
          return NextResponse.json({ prompt: (data as { prompt_text?: string }).prompt_text })
        }
      } else {
        const { data } = await supabase
          .from('prompts')
          .select('workflow, prompt_text')
          .eq('user_id', DEFAULT_USER_ID)

        if (data) {
          for (const row of data as { workflow: string; prompt_text: string }[]) {
            prompts[row.workflow] = row.prompt_text
          }
        }
      }
    } catch (supabaseErr) {
      console.warn('Supabase GET prompts fallback warning:', supabaseErr)
    }

    if (workflow) {
      return NextResponse.json({ prompt: prompts[workflow] ?? '' })
    }

    return NextResponse.json({ prompts })
  } catch {
    return NextResponse.json({ prompts: WORKFLOW_PROMPTS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { workflow, prompt } = await req.json()
    const promptText = typeof prompt === 'string' ? prompt : ''

    if (!workflow) {
      return NextResponse.json({ error: 'Missing workflow parameter' }, { status: 400 })
    }

    // 1. Save to Neon DB
    try {
      const sql = getNeon()
      await sql`
        INSERT INTO prompts (user_id, workflow, prompt_text, updated_at)
        VALUES (${DEFAULT_USER_ID}, ${workflow}, ${promptText}, now())
        ON CONFLICT (user_id, workflow)
        DO UPDATE SET prompt_text = ${promptText}, updated_at = now();
      `
    } catch (neonErr) {
      console.warn('Neon POST prompt error:', neonErr)
    }

    // 2. Sync to Supabase
    try {
      const supabase = getSupabaseAdmin()
      const { data: existing } = await supabase
        .from('prompts')
        .select('id')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('workflow', workflow)
        .single()

      if (existing) {
        await supabase
          .from('prompts')
          .update({ prompt_text: promptText, updated_at: new Date().toISOString() })
          .eq('id', (existing as { id: string }).id)
      } else {
        await supabase.from('prompts').insert({
          user_id: DEFAULT_USER_ID,
          workflow,
          prompt_text: promptText,
        })
      }
    } catch (supabaseErr) {
      console.warn('Supabase POST prompt sync warning:', supabaseErr)
    }

    return NextResponse.json({ success: true, workflow, prompt: promptText })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Save prompt error:', message)
    return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 })
  }
}
