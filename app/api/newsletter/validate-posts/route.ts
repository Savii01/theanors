import { NextRequest, NextResponse } from 'next/server'
import { validatePosts } from '@/lib/modules/newsletter/newsletter.service'
import axios from 'axios'

export async function POST(req: NextRequest) {
  try {
    const { theme, postLinks, modelId, userId } = await req.json()

    if (!theme || !postLinks || !modelId || !userId) {
      return NextResponse.json({ error: 'theme, postLinks, modelId, and userId are required' }, { status: 400 })
    }

    const result = await validatePosts(theme, postLinks, modelId, userId)
    return NextResponse.json(result)
  } catch (error: unknown) {
    let message = 'Unknown error'
    let detail = ''

    if (axios.isAxiosError(error)) {
      message = `Groq API error ${error.response?.status}: ${JSON.stringify(error.response?.data)}`
      detail = error.message
    } else if (error instanceof Error) {
      message = error.message
      detail = error.stack ?? ''
    }

    console.error('[validate-posts] Error:', message)
    if (detail) console.error('[validate-posts] Detail:', detail)

    return NextResponse.json({ error: 'Failed to validate posts', detail: message }, { status: 500 })
  }
}
