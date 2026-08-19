import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/shared/database'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { postId, selectedOption } = body

    if (!postId || selectedOption === undefined) {
      return NextResponse.json({ error: 'postId and selectedOption are required' }, { status: 400 })
    }

    const supabase = getSupabase()
    await supabase
      .from('engagement_posts')
      .update({
        status: 'posted',
        selected_comment_option: selectedOption,
      })
      .eq('id', postId)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Mark posted error:', message)
    return NextResponse.json({ error: 'Failed to mark as posted' }, { status: 500 })
  }
}
