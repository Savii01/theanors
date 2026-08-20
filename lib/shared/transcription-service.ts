import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabase } from './database'

const GROQ_MAX_SECONDS = 28800
const DEEPGRAM_MAX_SECONDS = 1800
const ASSEMBLY_MAX_SECONDS = 1200

export async function transcribe(
  audioBuffer: Buffer,
  mimeType: string,
  userId: string
): Promise<{ transcript: string; provider: string; remainingSeconds: number }> {
  const usage = await getTranscriptionUsage(userId)

  if (usage.groqUsedSeconds < GROQ_MAX_SECONDS) {
    try {
      const transcript = await transcribeWithGroq(audioBuffer, mimeType)
      const estimatedSeconds = Math.ceil(audioBuffer.length / 16000)
      await updateUsage(userId, 'groq', estimatedSeconds)
      return {
        transcript,
        provider: 'groq-whisper',
        remainingSeconds: GROQ_MAX_SECONDS - usage.groqUsedSeconds - estimatedSeconds,
      }
    } catch (error) {
      console.warn('Groq Whisper failed, trying Deepgram...', error)
    }
  }

  if (usage.deepgramUsedSeconds < DEEPGRAM_MAX_SECONDS) {
    try {
      const transcript = await transcribeWithDeepgram(audioBuffer)
      const estimatedSeconds = Math.ceil(audioBuffer.length / 16000)
      await updateUsage(userId, 'deepgram', estimatedSeconds)
      return {
        transcript,
        provider: 'deepgram',
        remainingSeconds: DEEPGRAM_MAX_SECONDS - usage.deepgramUsedSeconds - estimatedSeconds,
      }
    } catch (error) {
      console.warn('Deepgram failed, trying AssemblyAI...', error)
    }
  }

  if (usage.assemblyUsedSeconds < ASSEMBLY_MAX_SECONDS) {
    try {
      const transcript = await transcribeWithAssemblyAI(audioBuffer)
      const estimatedSeconds = Math.ceil(audioBuffer.length / 16000)
      await updateUsage(userId, 'assembly', estimatedSeconds)
      return {
        transcript,
        provider: 'assemblyai',
        remainingSeconds: ASSEMBLY_MAX_SECONDS - usage.assemblyUsedSeconds - estimatedSeconds,
      }
    } catch (error) {
      console.warn('AssemblyAI failed, falling back to Gemini...', error)
    }
  }

  const transcript = await transcribeWithGemini(audioBuffer, mimeType)
  return { transcript, provider: 'gemini', remainingSeconds: 0 }
}

async function transcribeWithGroq(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Missing GROQ_API_KEY')

  const formData = new FormData()
  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('webm') ? 'webm' : 'wav'
  formData.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }), `audio.${ext}`)
  formData.append('model', 'whisper-large-v3')
  formData.append('response_format', 'text')

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) throw new Error(`Groq transcription failed: ${response.statusText}`)
  return response.text()
}

async function transcribeWithDeepgram(buffer: Buffer): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) throw new Error('Missing DEEPGRAM_API_KEY')

  const response = await fetch(
    'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(buffer),
    }
  )

  if (!response.ok) throw new Error(`Deepgram transcription failed: ${response.statusText}`)
  const data = await response.json()
  return data.results.channels[0].alternatives[0].transcript
}

async function transcribeWithAssemblyAI(buffer: Buffer): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY
  if (!apiKey) throw new Error('Missing ASSEMBLYAI_API_KEY')

  const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/octet-stream' },
    body: new Uint8Array(buffer),
  })

  if (!uploadRes.ok) throw new Error('AssemblyAI upload failed')
  const { upload_url } = await uploadRes.json()

  const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_url: upload_url }),
  })

  if (!transcriptRes.ok) throw new Error('AssemblyAI transcript creation failed')
  const { id } = await transcriptRes.json()

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { Authorization: apiKey },
    })
    const statusData = await statusRes.json()
    if (statusData.status === 'completed') return statusData.text
    if (statusData.status === 'failed') throw new Error('AssemblyAI transcription failed')
  }

  throw new Error('AssemblyAI transcription timeout')
}

async function transcribeWithGemini(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

  const result = await model.generateContent([
    {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    },
    'Transcribe this audio exactly. Output only the transcript text.',
  ])

  return result.response.text()
}

interface TranscriptionUsageRow {
  groq_used_seconds: number
  deepgram_used_seconds: number
  assembly_used_seconds: number
}

async function getTranscriptionUsage(userId: string) {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('transcription_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const row = data as TranscriptionUsageRow | null
  return {
    groqUsedSeconds: row?.groq_used_seconds ?? 0,
    deepgramUsedSeconds: row?.deepgram_used_seconds ?? 0,
    assemblyUsedSeconds: row?.assembly_used_seconds ?? 0,
  }
}

async function updateUsage(
  userId: string,
  provider: 'groq' | 'deepgram' | 'assembly',
  seconds: number
) {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  const column = `${provider}_used_seconds`

  const { data: existing } = await supabase
    .from('transcription_usage')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existing) {
    await supabase
      .from('transcription_usage')
      .update({ [column]: (existing as Record<string, unknown>)[column as keyof typeof existing] as number + seconds })
      .eq('id', existing.id)
  } else {
    await supabase.from('transcription_usage').insert({
      user_id: userId,
      date: today,
      [column]: seconds,
    })
  }
}

export async function getTranscriptionQuota(userId: string) {
  const usage = await getTranscriptionUsage(userId)
  return {
    groq: { used: usage.groqUsedSeconds, total: GROQ_MAX_SECONDS, remaining: GROQ_MAX_SECONDS - usage.groqUsedSeconds },
    deepgram: { used: usage.deepgramUsedSeconds, total: DEEPGRAM_MAX_SECONDS, remaining: DEEPGRAM_MAX_SECONDS - usage.deepgramUsedSeconds },
    assembly: { used: usage.assemblyUsedSeconds, total: ASSEMBLY_MAX_SECONDS, remaining: ASSEMBLY_MAX_SECONDS - usage.assemblyUsedSeconds },
  }
}
