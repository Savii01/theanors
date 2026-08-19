import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getNeon } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

export async function GET() {
  let brandVoice = ''

  // 1. Try Neon DB first
  try {
    const sql = getNeon()
    const rows = (await sql`
      SELECT global_brand_voice FROM user_settings WHERE user_id = ${DEFAULT_USER_ID} LIMIT 1;
    `) as { global_brand_voice?: string }[]

    if (rows.length > 0 && rows[0].global_brand_voice) {
      return NextResponse.json({ brandVoice: rows[0].global_brand_voice })
    }
  } catch (neonErr) {
    console.warn('Neon GET brand-voice fallback warning:', neonErr)
  }

  // 2. Try Supabase
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('user_settings')
      .select('global_brand_voice')
      .eq('user_id', DEFAULT_USER_ID)
      .single()

    if (data && (data as { global_brand_voice?: string }).global_brand_voice) {
      brandVoice = (data as { global_brand_voice?: string }).global_brand_voice || ''
    }
  } catch (supabaseErr) {
    console.warn('Supabase GET brand-voice fallback warning:', supabaseErr)
  }

  return NextResponse.json({ brandVoice })
}

export async function POST(req: NextRequest) {
  try {
    const { brandVoice } = await req.json()
    const voiceText = typeof brandVoice === 'string' ? brandVoice : ''

    // 1. Persist to Neon DB (Rock-Solid Primary Persistence)
    try {
      const sql = getNeon()
      await sql`
        INSERT INTO user_settings (user_id, global_brand_voice, updated_at)
        VALUES (${DEFAULT_USER_ID}, ${voiceText}, now())
        ON CONFLICT (user_id)
        DO UPDATE SET global_brand_voice = ${voiceText}, updated_at = now();
      `
    } catch (neonErr) {
      console.warn('Neon POST brand-voice error:', neonErr)
    }

    // 2. Also sync to Supabase
    try {
      const supabase = getSupabaseAdmin()
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', DEFAULT_USER_ID)
        .single()

      if (existing) {
        await supabase
          .from('user_settings')
          .update({ global_brand_voice: voiceText, updated_at: new Date().toISOString() })
          .eq('id', (existing as { id: string }).id)
      } else {
        await supabase.from('user_settings').insert({
          user_id: DEFAULT_USER_ID,
          global_brand_voice: voiceText,
        })
      }
    } catch (supabaseErr) {
      console.warn('Supabase POST brand-voice sync warning:', supabaseErr)
    }

    return NextResponse.json({ success: true, brandVoice: voiceText })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Save brand voice error:', message)
    return NextResponse.json({ error: 'Failed to save brand voice' }, { status: 500 })
  }
}
