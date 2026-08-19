import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID)
      .single()

    return NextResponse.json({
      settings: data ?? {},
    })
  } catch {
    return NextResponse.json({ settings: {} })
  }
}
