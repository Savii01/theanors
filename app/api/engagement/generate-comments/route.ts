import { NextRequest, NextResponse } from 'next/server'
import { generateComments } from '@/lib/modules/engagement/engagement.service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { postLinks, postContents, platforms, modelId, userId } = body

    if (!postLinks || !Array.isArray(postLinks) || postLinks.length === 0) {
      return NextResponse.json({ error: 'postLinks is required and must be a non-empty array' }, { status: 400 })
    }
    if (!modelId || !userId) {
      return NextResponse.json({ error: 'modelId and userId are required' }, { status: 400 })
    }

    const result = await generateComments({
      postLinks,
      postContents: postContents || postLinks.map(() => ''),
      platforms: platforms || postLinks.map(() => 'linkedin_personal'),
      modelId,
      userId,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generate comments error:', message)
    return NextResponse.json({ error: 'Failed to generate comments' }, { status: 500 })
  }
}
