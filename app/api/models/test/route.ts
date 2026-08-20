import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

interface TestResult {
  ok: boolean
  latencyMs: number
  error?: string
}

async function testGemini(): Promise<TestResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { ok: false, latencyMs: 0, error: 'Missing GEMINI_API_KEY' }

  const start = Date.now()
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
    const result = await model.generateContent('Say "pong" in one word.')
    const latencyMs = Date.now() - start
    const text = result.response.text()
    if (text) return { ok: true, latencyMs }
    return { ok: false, latencyMs, error: 'Empty response from Gemini' }
  } catch (err) {
    const latencyMs = Date.now() - start
    const msg = (err as Error).message || 'Unknown error'
    if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
      return { ok: false, latencyMs, error: '403 Access Denied' }
    }
    return { ok: false, latencyMs, error: `Network Error: ${msg}` }
  }
}

async function testGroq(modelId: string): Promise<TestResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return { ok: false, latencyMs: 0, error: 'Missing GROQ_API_KEY' }

  const start = Date.now()
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: modelId,
        messages: [{ role: 'user', content: 'Say "pong" in one word.' }],
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    const latencyMs = Date.now() - start
    const content = response.data.choices?.[0]?.message?.content
    if (content) return { ok: true, latencyMs }
    return { ok: false, latencyMs, error: 'Empty response from model' }
  } catch (err) {
    const latencyMs = Date.now() - start
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const detail = err.response?.data?.error?.message || err.message
      if (status === 403) return { ok: false, latencyMs, error: `403 Access Denied: ${detail}` }
      if (status === 429) return { ok: false, latencyMs, error: '429 Rate Limited' }
      if (status === 404) return { ok: false, latencyMs, error: `404 Model Not Found: ${detail}` }
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return { ok: false, latencyMs, error: 'Network Error: Timeout (10s)' }
      }
      return { ok: false, latencyMs, error: `Network Error: ${detail}` }
    }
    return { ok: false, latencyMs, error: `Network Error: ${(err as Error).message}` }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { modelId } = await req.json()

    if (typeof modelId !== 'string' || !modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 })
    }

    // Safety timeout wrapper
    const timeoutPromise = new Promise<TestResult>((_, reject) => {
      setTimeout(() => reject(new Error('Test timed out after 10s')), 10000)
    })

    let result: TestResult
    if (modelId === 'gemini') {
      result = await Promise.race([testGemini(), timeoutPromise])
    } else {
      result = await Promise.race([testGroq(modelId), timeoutPromise])
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, latencyMs: 0, error: message })
  }
}
