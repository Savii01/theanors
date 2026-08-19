import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

export class LimitExceededError extends Error {
  constructor(modelId: string) {
    super(`Daily limit exceeded for model: ${modelId}`)
    this.name = 'LimitExceededError'
  }
}

interface GenerateTextParams {
  modelId: string
  prompt: string
  globalBrandVoice: string
  masterWorkflowPrompt: string
  contextHistory?: string
}

export async function generateText({
  modelId,
  prompt,
  globalBrandVoice,
  masterWorkflowPrompt,
  contextHistory = '',
}: GenerateTextParams): Promise<string> {
  const systemPrompt = [
    globalBrandVoice && `Global Brand Voice guidelines:\n${globalBrandVoice}`,
    masterWorkflowPrompt && `Workflow instructions:\n${masterWorkflowPrompt}`,
    contextHistory && `Self-Training Context:\n${contextHistory}`,
    'Follow the instructions carefully. Output only the requested content.',
  ]
    .filter(Boolean)
    .join('\n\n')

  if (modelId === 'gemini') {
    return generateWithGemini(systemPrompt, prompt)
  }

  try {
    return await generateWithGroq(modelId, systemPrompt, prompt)
  } catch (groqError: unknown) {
    if (groqError instanceof LimitExceededError) {
      throw groqError
    }

    console.warn(`Primary model ${modelId} failed, falling back to Gemini Flash:`, (groqError as Error)?.message)

    // Automatic Failover to Gemini Flash
    if (process.env.GEMINI_API_KEY) {
      try {
        return await generateWithGemini(systemPrompt, prompt)
      } catch (geminiError) {
        console.error('Gemini fallback failed:', geminiError)
      }
    }

    throw groqError
  }
}

async function generateWithGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt },
  ])

  return result.response.text()
}

async function generateWithGroq(
  modelId: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Missing GROQ_API_KEY')

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.choices[0]?.message?.content ?? ''
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Groq API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        model: modelId,
      })

      if (error.response?.status === 429) {
        throw new LimitExceededError(modelId)
      }
    }
    throw error
  }
}
