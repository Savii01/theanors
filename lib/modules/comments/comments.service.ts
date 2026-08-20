import { generateText } from '@/lib/shared/llm-client'
import { assemblePrompt } from '@/lib/shared/prompt-assembly'
import { INITIAL_COMMENTS_MASTER_PROMPT, buildInitialCommentPrompt } from './comments.prompts'
import type { CommentOption } from './comments.types'

export async function generateInitialComments(
  postLink: string,
  platform: string,
  modelId: string,
  userId: string
): Promise<CommentOption[]> {
  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'comments',
    userRequest: '',
  })

  const response = await generateText({
    modelId,
    prompt: buildInitialCommentPrompt(postLink, platform),
    globalBrandVoice: '',
    masterWorkflowPrompt: systemPrompt + '\n\n' + INITIAL_COMMENTS_MASTER_PROMPT,
  })

  return parseCommentOptions(response)
}

function parseCommentOptions(response: string): CommentOption[] {
  const options: CommentOption[] = []
  const lines = response.split('\n')
  let currentOption: Partial<CommentOption> | null = null

  for (const line of lines) {
    const optionMatch = line.match(/Option\s*(\d):\s*["']?(.*?)["']?\s*$/i)
    if (optionMatch) {
      if (currentOption?.option && currentOption.text) {
        options.push(currentOption as CommentOption)
      }
      currentOption = {
        option: parseInt(optionMatch[1]) as 1 | 2 | 3,
        text: optionMatch[2].replace(/^["']|["']$/g, '').trim(),
        style: '',
      }
    }
    const styleMatch = line.match(/Style:\s*(.*)/i)
    if (styleMatch && currentOption) {
      currentOption.style = styleMatch[1].trim()
    }
  }

  if (currentOption?.option && currentOption.text) {
    options.push(currentOption as CommentOption)
  }

  while (options.length < 3) {
    options.push({
      option: (options.length + 1) as 1 | 2 | 3,
      text: 'Could not parse option',
      style: 'fallback',
    })
  }

  return options.slice(0, 3)
}
