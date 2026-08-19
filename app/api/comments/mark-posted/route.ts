import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/shared/database'

export async function PATCH(req: NextRequest) {
  try {
    const { commentId, selectedOption } = await req.json()

    if (!commentId || selectedOption === undefined) {
      return NextResponse.json({ error: 'commentId and selectedOption are required' }, { status: 400 })
    }

    const supabase = getSupabase()
    await supabase
      .from('initial_comments')
      .update({ selected_option: selectedOption, status: 'posted' })
      .eq('id', commentId)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Mark posted error:', message)
    return NextResponse.json({ error: 'Failed to mark as posted' }, { status: 500 })
  }
}
