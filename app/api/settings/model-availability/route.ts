import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getNeon } from '@/lib/shared/database'
import { LLM_MODELS } from '@/lib/shared/types'

const DEFAULT_USER_ID = 'default'

export async function GET() {
  const overrides: Record<string, boolean> = {}

  // 1. Try Neon DB first
  try {
    const sql = getNeon()
    await sql`
      CREATE TABLE IF NOT EXISTS model_availability (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(100) NOT NULL,
        model_id VARCHAR(100) NOT NULL,
        available BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, model_id)
      );
    `
    const rows = (await sql`
      SELECT model_id, available FROM model_availability WHERE user_id = ${DEFAULT_USER_ID};
    `) as { model_id: string; available: boolean }[]

    for (const row of rows) {
      overrides[row.model_id] = row.available
    }
  } catch (neonErr) {
    console.warn('Neon GET model-availability warning:', neonErr)
  }

  // 2. Fallback to Supabase if Neon returned nothing
  if (Object.keys(overrides).length === 0) {
    try {
      const supabase = getSupabaseAdmin()
      const { data } = await supabase
        .from('model_availability')
        .select('model_id, available')
        .eq('user_id', DEFAULT_USER_ID)

      if (data) {
        for (const row of data as { model_id: string; available: boolean }[]) {
          overrides[row.model_id] = row.available
        }
      }
    } catch (supabaseErr) {
      console.warn('Supabase GET model-availability warning:', supabaseErr)
    }
  }

  // Merge static definitions with user overrides
  const models = LLM_MODELS.map((m) => ({
    ...m,
    available: m.id in overrides ? overrides[m.id] : (m.available !== false),
  }))

  return NextResponse.json({ models })
}

export async function POST(req: NextRequest) {
  try {
    const { modelId, available } = await req.json()

    if (typeof modelId !== 'string' || typeof available !== 'boolean') {
      return NextResponse.json({ error: 'modelId (string) and available (boolean) are required' }, { status: 400 })
    }

    // 1. Persist to Neon
    try {
      const sql = getNeon()
      await sql`
        INSERT INTO model_availability (user_id, model_id, available, updated_at)
        VALUES (${DEFAULT_USER_ID}, ${modelId}, ${available}, now())
        ON CONFLICT (user_id, model_id)
        DO UPDATE SET available = ${available}, updated_at = now();
      `
    } catch (neonErr) {
      console.warn('Neon POST model-availability error:', neonErr)
    }

    // 2. Sync to Supabase
    try {
      const supabase = getSupabaseAdmin()
      const { data: existing } = await supabase
        .from('model_availability')
        .select('id')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('model_id', modelId)
        .single()

      if (existing) {
        await supabase
          .from('model_availability')
          .update({ available, updated_at: new Date().toISOString() })
          .eq('id', (existing as { id: string }).id)
      } else {
        await supabase.from('model_availability').insert({
          user_id: DEFAULT_USER_ID,
          model_id: modelId,
          available,
        })
      }
    } catch (supabaseErr) {
      console.warn('Supabase POST model-availability sync warning:', supabaseErr)
    }

    return NextResponse.json({ success: true, modelId, available })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Save model availability error:', message)
    return NextResponse.json({ error: 'Failed to save model availability' }, { status: 500 })
  }
}
