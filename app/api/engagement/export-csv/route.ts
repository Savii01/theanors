import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/shared/database'
import { stringify } from 'csv-stringify/sync'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const batchId = searchParams.get('batchId')

    if (!batchId) {
      return NextResponse.json({ error: 'batchId is required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: posts } = await supabase
      .from('engagement_posts')
      .select('*')
      .eq('batch_id', batchId)

    if (!posts || posts.length === 0) {
      return new NextResponse('No posts found', { status: 404 })
    }

    const rows = (posts as Record<string, unknown>[]).map((p) => ({
      post_link: p.post_link,
      platform: p.platform,
      selected_comment: p.selected_comment_option ? `Option ${p.selected_comment_option}` : '',
      status: p.status,
      timestamp: p.created_at,
    }))

    const csv = stringify(rows, { header: true })

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="engagement-${batchId}.csv"`,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Export CSV error:', message)
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 })
  }
}
