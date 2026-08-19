import { NextRequest, NextResponse } from 'next/server'
import { validatePosts } from '@/lib/modules/newsletter/newsletter.service'

export async function POST(req: NextRequest) {
  try {
    const { theme, postLinks, modelId, userId } = await req.json()

    if (!theme || !postLinks || !modelId || !userId) {
      return NextResponse.json({ error: 'theme, postLinks, modelId, and userId are required' }, { status: 400 })
    }

    const result = await validatePosts(theme, postLinks, modelId, userId)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Validate posts error:', message)
    return NextResponse.json({ error: 'Failed to validate posts' }, { status: 500 })
  }
}
