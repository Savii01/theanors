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
    try {
      return await generateWithGemini(systemPrompt, prompt)
    } catch (geminiErr) {
      console.warn('Gemini failed, cascading to GPT OSS 20B on Groq:', (geminiErr as Error)?.message)
      if (process.env.GROQ_API_KEY) {
        try {
          return await generateWithGroq('openai/gpt-oss-20b', systemPrompt, prompt)
        } catch (groqErr) {
          console.error('Groq fallback after Gemini failed:', groqErr)
        }
      }
      throw geminiErr
    }
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
  // Use primary high-quota Gemini 3.6 Flash
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt },
  ])
  return result.response.text()
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWithModelParams {
  modelId: string
  messages: ChatMessage[]
  systemPrompt: string
}

export async function chatWithModel({
  modelId,
  messages,
  systemPrompt,
}: ChatWithModelParams): Promise<string> {
  if (modelId === 'gemini') {
    try {
      return await chatWithGemini(systemPrompt, messages)
    } catch (geminiErr) {
      console.warn('Gemini chat failed, cascading to Groq fallback:', (geminiErr as Error)?.message)
      if (process.env.GROQ_API_KEY) {
        try {
          return await chatWithGroq('openai/gpt-oss-20b', systemPrompt, messages)
        } catch {
          try {
            return await chatWithGroq('allam-2-7b', systemPrompt, messages)
          } catch (groqErr2) {
            console.error('All Groq chat fallbacks failed:', groqErr2)
          }
        }
      }
      throw geminiErr
    }
  }

  try {
    return await chatWithGroq(modelId, systemPrompt, messages)
  } catch (groqError: unknown) {
    if (groqError instanceof LimitExceededError) throw groqError
    console.warn(`Primary chat model ${modelId} failed, falling back to Gemini / Groq backup:`, (groqError as Error)?.message)

    if (process.env.GEMINI_API_KEY) {
      try {
        return await chatWithGemini(systemPrompt, messages)
      } catch {
        try {
          return await chatWithGroq('allam-2-7b', systemPrompt, messages)
        } catch (geminiError) {
          console.error('Gemini chat fallback failed:', geminiError)
        }
      }
    }

    throw groqError
  }
}

async function chatWithGemini(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction: systemPrompt })

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastUserMsg = messages[messages.length - 1]?.content ?? ''

  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastUserMsg)
  return result.response.text()
}

async function chatWithGroq(
  modelId: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Missing GROQ_API_KEY')

  // Keep last 4 messages to stay strictly within TPM limits
  const recentMessages = messages.slice(-4)
  // Compact system prompt to under 2000 chars
  const compactSystemPrompt = systemPrompt.length > 2000 ? systemPrompt.slice(0, 2000) : systemPrompt

  // Chat replies are concise: 500 tokens is plenty
  const maxTokens = 500

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: modelId,
        messages: [
          { role: 'system', content: compactSystemPrompt },
          ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
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
      console.error('Groq Chat API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        model: modelId,
      })
      if (error.response?.status === 429) {
        throw new LimitExceededError(modelId)
      }
      if (error.response?.data?.error?.message) {
        throw new Error(`Groq API (${modelId}): ${error.response.data.error.message}`)
      }
    }
    throw error
  }
}

async function generateWithGroq(
  modelId: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Missing GROQ_API_KEY')

  const compactSystemPrompt = systemPrompt.length > 2000 ? systemPrompt.slice(0, 2000) : systemPrompt

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: modelId,
        messages: [
          { role: 'system', content: compactSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
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
