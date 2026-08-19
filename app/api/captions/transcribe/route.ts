import { NextRequest, NextResponse } from 'next/server'
import { transcribe } from '@/lib/shared/transcription-service'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = (formData.get('userId') as string) || 'default'

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type || 'audio/wav'

    const result = await transcribe(buffer, mimeType, userId)

    return NextResponse.json({
      transcript: result.transcript,
      provider: result.provider,
      remainingSeconds: result.remainingSeconds,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Transcribe error:', message)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
