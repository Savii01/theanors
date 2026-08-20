import { generateText } from '@/lib/shared/llm-client'
import { assemblePrompt } from '@/lib/shared/prompt-assembly'
import { getSupabase } from '@/lib/shared/database'
import { fetchLinkPreview } from '@/lib/shared/link-fetcher'
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

  // Generate comments for all posts with robust execution
  const results: { postLink: string; options: CommentOption[] }[] = []

  for (let i = 0; i < postLinks.length; i++) {
    const link = postLinks[i]
    let content = postContents[i]?.trim() || ''
    const platform = platforms[i] || 'linkedin_personal'

    try {
      // If content is empty, fetch real preview & author metadata from the URL
      if (!content && link) {
        try {
          const previewData = await fetchLinkPreview(link)
          if (previewData.previewText) {
            content = previewData.previewText
          }
        } catch (fetchErr) {
          console.warn(`Could not fetch preview for ${link}:`, fetchErr)
        }
      }

      const userPrompt = buildEngagementPrompt(content, platform, link)
      let response = ''
      
      try {
        response = await generateText({
          modelId,
          prompt: userPrompt,
          globalBrandVoice: '',
          masterWorkflowPrompt: effectiveSystemPrompt,
        })
      } catch (genErr) {
        console.warn(`Primary generation attempt failed for ${link}, retrying with Groq fallback:`, genErr)
        // Instant retry with fast model
        response = await generateText({
          modelId: 'openai/gpt-oss-20b',
          prompt: userPrompt,
          globalBrandVoice: '',
          masterWorkflowPrompt: effectiveSystemPrompt,
        })
      }

      const options = parseCommentOptions(response)

      // Non-blocking database logging
      try {
        if (batchId) {
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

          if (postId) {
            await Promise.all(
              options.map((opt) =>
                supabase.from('engagement_comments').insert({
                  post_id: postId,
                  option_number: opt.option,
                  comment_text: opt.text,
                })
              )
            )
          }
        }
      } catch (dbErr) {
        console.warn(`Database log warning for ${link}:`, dbErr)
      }

      results.push({ postLink: link, options })
    } catch (error) {
      console.error(`Failed to generate comments for ${link}:`, error)
      results.push({
        postLink: link,
        options: getFallbackOptions(),
      })
    }
  }

  return { batchId, results }
}

function parseCommentOptions(response: string): CommentOption[] {
  const options: CommentOption[] = []
  if (!response || typeof response !== 'string') return getFallbackOptions()

  // Clean markdown bold tags on Option markers
  const cleanResponse = response.replace(/\*\*(Option\s*\d(?::)?)\*\*/gi, '$1')

  // Split on Option headers
  const optionBlocks = cleanResponse.split(/(?:\[?Option\s*\d\]?:?|^###\s*Option\s*\d|^\d+\.\s*(?:\*\*)?Option\s*\d)/gim)
  
  if (optionBlocks.length > 1) {
    for (let i = 1; i < optionBlocks.length && options.length < 3; i++) {
      const block = optionBlocks[i].trim()
      const rawLines = block.split('\n').map((l) => l.trim())
      
      let style = i === 1 ? 'Value-Add Warmth' : i === 2 ? 'Grounded Perspective' : 'Relatable Connection'
      const textParagraphs: string[] = []

      for (const line of rawLines) {
        if (!line || line === '***' || line === '---' || line.startsWith('***')) {
          continue
        }
        const styleMatch = line.match(/^Style:\s*(.*)/i)
        if (styleMatch) {
          style = styleMatch[1].trim()
        } else {
          // Remove wrapping quotes if present
          const cleanLine = line.replace(/^["'“”]|["'“”]$/g, '').trim()
          if (cleanLine && !cleanLine.toLowerCase().startsWith('style:')) {
            textParagraphs.push(cleanLine)
          }
        }
      }

      if (textParagraphs.length > 0) {
        // Join distinct paragraphs with double line break to preserve 2-paragraph structure
        const formattedText = textParagraphs.join('\n\n')
        options.push({
          option: (options.length + 1) as 1 | 2 | 3,
          text: formattedText.replace(/^:\s*/, '').trim(),
          style,
        })
      }
    }
  }

  // If regex block split didn't find enough options, try section fallback
  if (options.length < 3) {
    const lines = cleanResponse.split('\n').map((l) => l.trim()).filter(Boolean)
    for (const line of lines) {
      if (options.length >= 3) break
      const match = line.match(/^(?:(?:\d+\.|\*|-)\s*)?(?:\[?Option\s*\d\]?:\s*)?["'“”]?(.*?)["'“”]?$/i)
      if (match && match[1] && match[1].length > 25 && !match[1].toLowerCase().startsWith('style:')) {
        options.push({
          option: (options.length + 1) as 1 | 2 | 3,
          text: match[1].trim(),
          style: options.length === 0 ? 'Value-Add Warmth' : options.length === 1 ? 'Grounded Perspective' : 'Relatable Connection',
        })
      }
    }
  }

  // Ensure 3 meaningful options are always returned
  const fallbackDefaults = getFallbackOptions()
  while (options.length < 3) {
    options.push(fallbackDefaults[options.length])
  }

  return options.slice(0, 3)
}

function getFallbackOptions(): CommentOption[] {
  return [
    { option: 1, text: 'This perspective highlights a critical point often overlooked in modern executive workflows.\n\nTaking the time to build systems that actually support the work makes all the difference 😊', style: 'Value-Add Warmth' },
    { option: 2, text: 'The gap between surface expectations and the actual work is so real.\n\nStaying intentional about the foundation keeps momentum steady ❤️', style: 'Grounded Perspective' },
    { option: 3, text: 'This resonates deeply with what we see across the ecosystem.\n\nLove seeing conversations that bring this level of clarity and care 🤗', style: 'Relatable Connection' },
  ]
}
