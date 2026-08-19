import { generateText } from '@/lib/shared/llm-client'
import { assemblePrompt } from '@/lib/shared/prompt-assembly'
import {
  NEWSLETTER_MASTER_PROMPT,
  buildThemeGenerationPrompt,
  buildValidationPrompt,
  buildNewsletterContentPrompt,
} from './newsletter.prompts'
import type { ThemeRecord } from '@/lib/shared/types'
import type { ValidationResult } from './newsletter.types'

export async function generateThemes(
  themeHistory: ThemeRecord[],
  modelId: string,
  userId: string
): Promise<string[]> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'newsletter',
    userRequest: '',
  })

  const response = await generateText({
    modelId,
    prompt: buildThemeGenerationPrompt(themeHistory),
    globalBrandVoice: '',
    masterWorkflowPrompt: systemPrompt + '\n\n' + NEWSLETTER_MASTER_PROMPT,
  })

  return response
    .split('\n')
    .filter((line) => line.trim().match(/^\d+[\.\)]\s/))
    .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .slice(0, 5)
}

export async function validatePosts(
  theme: string,
  postContents: string[],
  modelId: string,
  userId: string
): Promise<ValidationResult> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'newsletter',
    userRequest: '',
  })

  const response = await generateText({
    modelId,
    prompt: buildValidationPrompt(theme, postContents),
    globalBrandVoice: '',
    masterWorkflowPrompt: systemPrompt + '\n\n' + NEWSLETTER_MASTER_PROMPT,
  })

  return parseValidationResponse(response, postContents.length)
}

export async function generateContent(
  theme: string,
  postContents: string[],
  modelId: string,
  userId: string
): Promise<string> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'newsletter',
    userRequest: '',
  })

  return generateText({
    modelId,
    prompt: buildNewsletterContentPrompt(theme, postContents),
    globalBrandVoice: '',
    masterWorkflowPrompt: systemPrompt + '\n\n' + NEWSLETTER_MASTER_PROMPT,
  })
}

function parseValidationResponse(response: string, postCount: number): ValidationResult {
  const posts = []
  let overallScore = 0
  let cohesionRationale = ''
  let passed = false

  for (let i = 1; i <= postCount; i++) {
    const postRegex = new RegExp(`POST\\s*${i}:[\\s\\S]*?Score:\\s*(\\d+)[\\s\\S]*?Rationale:\\s*([\\s\\S]*?)(?=Warnings:|POST\\s*\\d|$)`, 'i')
    const match = response.match(postRegex)
    posts.push({
      postLink: `Post ${i}`,
      fitScore: match ? parseInt(match[1]) : 5,
      rationale: match ? match[2].trim() : 'No analysis available',
      warnings: [],
    })
  }

  const overallMatch = response.match(/OVERALL:[\s\S]*?Score:\s*(\d+)[\s\S]*?Rationale:\s*([\s\S]*?)(?=Passed:|$)/i)
  if (overallMatch) {
    overallScore = parseInt(overallMatch[1])
    cohesionRationale = overallMatch[2].trim()
  }

  passed = response.toLowerCase().includes('passed: true') || overallScore >= 6

  return { overallScore, cohesionRationale, posts, passed }
}
