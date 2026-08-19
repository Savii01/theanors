import { NextResponse } from 'next/server'
import type { ModelLimits } from '@/lib/shared/types'

export async function GET() {
  const limits: ModelLimits = {
    'allam-2-7b': { used: 0, total: 7000 },
    'groq/compound': { used: 0, total: 250 },
    'groq/compound-mini': { used: 0, total: 250 },
    'qwen/qwen3.6-27b': { used: 0, total: 1000 },
    'openai/gpt-oss-120b': { used: 0, total: 1000 },
    'openai/gpt-oss-20b': { used: 0, total: 1000 },
    'gemini': { used: 0, total: 1000 },
  }

  return NextResponse.json({ limits })
}
