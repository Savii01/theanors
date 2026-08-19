import { NextRequest, NextResponse } from 'next/server'
import { generateCaptions } from '@/lib/modules/captions/captions.service'

export async function POST(req: NextRequest) {
  try {
    const { transcript, modelId, userId } = await req.json()

    if (!transcript || !modelId || !userId) {
      return NextResponse.json({ error: 'transcript, modelId, and userId are required' }, { status: 400 })
    }

    const captions = await generateCaptions(transcript, modelId, userId)
    return NextResponse.json({ captions })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generate captions error:', message)
    return NextResponse.json({ error: 'Failed to generate captions' }, { status: 500 })
  }
}
