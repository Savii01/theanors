import { NextRequest, NextResponse } from 'next/server'
import { repurposeFromVideo } from '@/lib/modules/scripting/scripting.service'

export async function POST(req: NextRequest) {
  try {
    const { transcript, modelId, userId } = await req.json()

    if (!transcript || !modelId || !userId) {
      return NextResponse.json({ error: 'transcript, modelId, and userId are required' }, { status: 400 })
    }

    const angles = await repurposeFromVideo(transcript, modelId, userId)
    return NextResponse.json({ angles })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Repurpose error:', message)
    return NextResponse.json({ error: 'Failed to repurpose' }, { status: 500 })
  }
}
