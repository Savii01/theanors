import { NextResponse } from 'next/server'

function maskKey(key?: string): string {
  if (!key) return ''
  if (key.length <= 8) return '••••••••'
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`
}

export async function GET() {
  const keys = {
    groq: {
      name: 'Groq API Key',
      configured: Boolean(process.env.GROQ_API_KEY),
      masked: maskKey(process.env.GROQ_API_KEY),
      requiredFor: 'Multi-model LLM chat & Whisper transcription',
    },
    gemini: {
      name: 'Gemini API Key',
      configured: Boolean(process.env.GEMINI_API_KEY),
      masked: maskKey(process.env.GEMINI_API_KEY),
      requiredFor: 'Gemini 1.5 Flash LLM & transcription fallback',
    },
    deepgram: {
      name: 'Deepgram API Key',
      configured: Boolean(process.env.DEEPGRAM_API_KEY),
      masked: maskKey(process.env.DEEPGRAM_API_KEY),
      requiredFor: '2nd transcription cascade fallback (30 min cap)',
    },
    assemblyai: {
      name: 'AssemblyAI API Key',
      configured: Boolean(process.env.ASSEMBLYAI_API_KEY),
      masked: maskKey(process.env.ASSEMBLYAI_API_KEY),
      requiredFor: '3rd transcription cascade fallback (20 min cap)',
    },
    supabase: {
      name: 'Supabase URL & Anon Key',
      configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      masked: maskKey(process.env.NEXT_PUBLIC_SUPABASE_URL),
      requiredFor: 'Real-time database, prompt storage & active jobs',
    },
    neon: {
      name: 'Neon PostgreSQL Connection',
      configured: Boolean(process.env.NEON_CONNECTION_STRING || process.env.DATABASE_URL),
      masked: maskKey(process.env.NEON_CONNECTION_STRING || process.env.DATABASE_URL),
      requiredFor: 'Self-training analytics & feedback loop storage',
    },
  }

  return NextResponse.json({ keys })
}
