import { NextRequest, NextResponse } from 'next/server'
import { generateScript } from '@/lib/modules/scripting/scripting.service'
import type { ScriptType } from '@/lib/shared/types'

export async function POST(req: NextRequest) {
  try {
    const { angle, type, modelId, userId } = await req.json()

    if (!angle || !type || !modelId || !userId) {
      return NextResponse.json({ error: 'angle, type, modelId, and userId are required' }, { status: 400 })
    }

    const script = await generateScript(angle, type as ScriptType, modelId, userId)
    return NextResponse.json({ script })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generate script error:', message)
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 })
  }
}
