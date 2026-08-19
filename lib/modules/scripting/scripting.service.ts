import { generateText } from '@/lib/shared/llm-client'
import { assemblePrompt } from '@/lib/shared/prompt-assembly'
import {
  SCRIPTING_MASTER_PROMPT,
  buildBrainstormPrompt,
  buildRepurposePrompt,
  buildScriptPrompt,
} from './scripting.prompts'
import type { ScriptType } from '@/lib/shared/types'

export async function brainstorm(
  topic: string,
  modelId: string,
  userId: string
): Promise<string[]> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'scripting',
    userRequest: '',
  })

  const response = await generateText({
    modelId,
    prompt: buildBrainstormPrompt(topic),
    globalBrandVoice: '',
    masterWorkflowPrompt: systemPrompt + '\n\n' + SCRIPTING_MASTER_PROMPT,
  })

  return response
    .split('\n')
    .filter((line) => line.trim().match(/^\d+[\.\)]\s/))
    .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .slice(0, 8)
}

export async function repurposeFromVideo(
  transcript: string,
  modelId: string,
  userId: string
): Promise<string[]> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'scripting',
    userRequest: '',
  })

  const response = await generateText({
    modelId,
    prompt: buildRepurposePrompt(transcript),
    globalBrandVoice: '',
    masterWorkflowPrompt: systemPrompt + '\n\n' + SCRIPTING_MASTER_PROMPT,
  })

  return response
    .split('\n')
    .filter((line) => line.trim().match(/^\d+[\.\)]\s/))
    .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .slice(0, 5)
}

export async function generateScript(
  angle: string,
  type: ScriptType,
  modelId: string,
  userId: string
): Promise<string> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'scripting',
    userRequest: '',
  })

  return generateText({
    modelId,
    prompt: buildScriptPrompt(angle, type),
    globalBrandVoice: '',
    masterWorkflowPrompt: systemPrompt + '\n\n' + SCRIPTING_MASTER_PROMPT,
  })
}
