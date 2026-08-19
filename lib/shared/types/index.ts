export type WorkflowType = 'engagement' | 'captions' | 'scripting' | 'newsletter' | 'comments'

export type FeedbackAction = 'accept' | 'edit' | 'keep_in_memory' | 'forget'

export type CaptionPlatform = 'linkedin' | 'tiktok' | 'instagram' | 'youtube_title' | 'youtube_desc'

export type ScriptType = 'talking_head' | 'carousel' | 'flyer' | 'trend_acting'

export interface LLMModel {
  id: string
  name: string
  provider: 'groq' | 'gemini'
  dailyLimit: number
  tokenLimit?: number
}

export const LLM_MODELS: LLMModel[] = [
  { id: 'allam-2-7b', name: 'Allam 2 7B', provider: 'groq', dailyLimit: 7000, tokenLimit: 500000 },
  { id: 'groq/compound', name: 'Groq Compound', provider: 'groq', dailyLimit: 250 },
  { id: 'groq/compound-mini', name: 'Groq Compound Mini', provider: 'groq', dailyLimit: 250 },
  { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', provider: 'groq', dailyLimit: 1000, tokenLimit: 200000 },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', provider: 'groq', dailyLimit: 1000, tokenLimit: 200000 },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', provider: 'groq', dailyLimit: 1000, tokenLimit: 200000 },
  { id: 'gemini', name: 'Gemini Flash', provider: 'gemini', dailyLimit: 1000 },
]

export interface TranscriptionUsage {
  groqUsedSeconds: number
  deepgramUsedSeconds: number
  assemblyUsedSeconds: number
}

export interface CommentOption {
  option: 1 | 2 | 3
  text: string
  style: string
}

export interface EngagementPost {
  id: string
  link: string
  platform: string
  content?: string
  selectedOption?: number
  status: 'pending' | 'posted' | 'skipped'
}

export interface EngagementBatch {
  id: string
  posts: EngagementPost[]
  progress: number
}

export interface ThemeRecord {
  theme: string
  date?: string
  notes?: string
}

export interface CaptionJob {
  id: string
  transcript: string
  platform: string
  status: string
  captions?: Record<CaptionPlatform, string>
}

export interface ScriptJob {
  id: string
  topic: string
  scriptType: ScriptType
  content?: string
  status: string
}

export interface InitialComment {
  id: string
  postLink: string
  platform: string
  option1: string
  option2: string
  option3: string
  selectedOption?: number
  status: 'pending' | 'posted'
}

export interface UserPreferences {
  id: string
  userId: string
  workflow: WorkflowType
  preferenceType: string
  preferenceValue: string
  frequencySelected: number
}

export interface ModelLimits {
  [modelId: string]: {
    used: number
    total: number
  }
}
