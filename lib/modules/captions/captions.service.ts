import { generateText } from '@/lib/shared/llm-client'
import { assemblePrompt } from '@/lib/shared/prompt-assembly'
import { CAPTION_MASTER_PROMPT, buildCaptionPrompt } from './captions.prompts'
import type { CaptionPlatform } from '@/lib/shared/types'

export async function generateCaptions(
  transcript: string,
  modelId: string,
  userId: string
): Promise<Record<CaptionPlatform, string>> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'captions',
    userRequest: '',
  })

  const effectiveSystemPrompt = systemPrompt + '\n\n' + CAPTION_MASTER_PROMPT
  const userPrompt = buildCaptionPrompt(transcript)

  const response = await generateText({
    modelId,
    prompt: userPrompt,
    globalBrandVoice: '',
    masterWorkflowPrompt: effectiveSystemPrompt,
  })

  return parseCaptions(response)
}

function parseCaptions(response: string): Record<CaptionPlatform, string> {
  const captions: Record<CaptionPlatform, string> = {
    linkedin: '',
    tiktok: '',
    instagram: '',
    youtube_title: '',
    youtube_desc: '',
  }

  const platformMap: Record<string, CaptionPlatform> = {
    LINKEDIN: 'linkedin',
    TIKTOK: 'tiktok',
    INSTAGRAM: 'instagram',
    YOUTUBE_TITLE: 'youtube_title',
    YOUTUBE_DESC: 'youtube_desc',
  }

  let currentPlatform: CaptionPlatform | null = null
  const lines = response.split('\n')

  for (const line of lines) {
    const match = line.match(/^(LINKEDIN|TIKTOK|INSTAGRAM|YOUTUBE_TITLE|YOUTUBE_DESC):\s*(.*)/i)
    if (match) {
      currentPlatform = platformMap[match[1].toUpperCase()]
      if (currentPlatform) {
        captions[currentPlatform] = match[2].trim()
      }
    } else if (currentPlatform && line.trim()) {
      captions[currentPlatform] += (captions[currentPlatform] ? '\n' : '') + line.trim()
    }
  }

  return captions
}
