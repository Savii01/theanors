import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/modules/newsletter/newsletter.service'

export async function POST(req: NextRequest) {
  try {
    const { theme, posts, modelId, userId } = await req.json()

    if (!theme || !posts || !modelId || !userId) {
      return NextResponse.json({ error: 'theme, posts, modelId, and userId are required' }, { status: 400 })
    }

    const content = await generateContent(theme, posts, modelId, userId)
    return NextResponse.json({ content })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generate content error:', message)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
