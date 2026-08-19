import { NextRequest, NextResponse } from 'next/server'
import { generateInitialComments } from '@/lib/modules/comments/comments.service'

export async function POST(req: NextRequest) {
  try {
    const { postLink, platform, modelId, userId } = await req.json()

    if (!postLink || !platform || !modelId || !userId) {
      return NextResponse.json({ error: 'postLink, platform, modelId, and userId are required' }, { status: 400 })
    }

    const options = await generateInitialComments(postLink, platform, modelId, userId)
    return NextResponse.json({ options })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generate initial comments error:', message)
    return NextResponse.json({ error: 'Failed to generate comments' }, { status: 500 })
  }
}
