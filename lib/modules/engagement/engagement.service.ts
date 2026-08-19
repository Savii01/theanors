import { generateText } from '@/lib/shared/llm-client'
import { assemblePrompt } from '@/lib/shared/prompt-assembly'
import { getSupabase } from '@/lib/shared/database'
import { ENGAGEMENT_MASTER_PROMPT, buildEngagementPrompt } from './engagement.prompts'
import type { CommentOption } from './engagement.types'

export async function generateComments(params: {
  postLinks: string[]
  postContents: string[]
  platforms: string[]
  modelId: string
  userId: string
}): Promise<{ batchId: string; results: { postLink: string; options: CommentOption[] }[] }> {
  const { postLinks, postContents, platforms, modelId, userId } = params

  const { systemPrompt } = await assemblePrompt({
    userId,
    workflowType: 'engagement',
    userRequest: '',
  })

  const effectiveSystemPrompt = systemPrompt + '\n\n' + ENGAGEMENT_MASTER_PROMPT
  const supabase = getSupabase()

  const { data: batchData } = await supabase
    .from('engagement_batches')
    .insert({
      user_id: userId,
      total_posts: postLinks.length,
      status: 'in_progress',
    })
    .select('id')
    .single()

  const batchId = (batchData as { id: string })?.id ?? ''
  const results: { postLink: string; options: CommentOption[] }[] = []

  for (let i = 0; i < postLinks.length; i++) {
    const link = postLinks[i]
    const content = postContents[i] || ''
    const platform = platforms[i] || 'linkedin_personal'

    try {
      const userPrompt = buildEngagementPrompt(content, platform)
      const response = await generateText({
        modelId,
        prompt: userPrompt,
        globalBrandVoice: '',
        masterWorkflowPrompt: effectiveSystemPrompt,
      })

      const options = parseCommentOptions(response)

      const { data: postData } = await supabase
        .from('engagement_posts')
        .insert({
          batch_id: batchId,
          post_link: link,
          platform,
          post_content: content,
          status: 'pending',
        })
        .select('id')
        .single()

      const postId = (postData as { id: string })?.id ?? ''

      for (const opt of options) {
        await supabase.from('engagement_comments').insert({
          post_id: postId,
          option_number: opt.option,
          comment_text: opt.text,
        })
      }

      results.push({ postLink: link, options })
    } catch (error) {
      console.error(`Failed to generate comments for ${link}:`, error)
      results.push({
        postLink: link,
        options: [
          { option: 1, text: 'Error generating comment', style: 'error' },
          { option: 2, text: 'Error generating comment', style: 'error' },
          { option: 3, text: 'Error generating comment', style: 'error' },
        ],
      })
    }
  }

  return { batchId, results }
}

function parseCommentOptions(response: string): CommentOption[] {
  const options: CommentOption[] = []
  const lines = response.split('\n')
  let currentOption: Partial<CommentOption> | null = null

  for (const line of lines) {
    const optionMatch = line.match(/\[?Option\s*(\d)\]?:?\s*["']?(.*?)["']?\s*$/i)
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
