import { NextRequest, NextResponse } from 'next/server'
import { brainstorm } from '@/lib/modules/scripting/scripting.service'

export async function POST(req: NextRequest) {
  try {
    const { topic, modelId, userId } = await req.json()

    if (!topic || !modelId || !userId) {
      return NextResponse.json({ error: 'topic, modelId, and userId are required' }, { status: 400 })
    }

    const angles = await brainstorm(topic, modelId, userId)
    return NextResponse.json({ angles })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Brainstorm error:', message)
    return NextResponse.json({ error: 'Failed to brainstorm' }, { status: 500 })
  }
}
