import { NextRequest, NextResponse } from 'next/server'
import { generateThemes } from '@/lib/modules/newsletter/newsletter.service'

export async function POST(req: NextRequest) {
  try {
    const { themeHistory, modelId, userId } = await req.json()

    if (!modelId || !userId) {
      return NextResponse.json({ error: 'modelId and userId are required' }, { status: 400 })
    }

    const themes = await generateThemes(themeHistory || [], modelId, userId)
    return NextResponse.json({ themes })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generate themes error:', message)
    return NextResponse.json({ error: 'Failed to generate themes' }, { status: 500 })
  }
}
