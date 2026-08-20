import { getSupabaseAdmin, getNeon } from './database'
import type { WorkflowType } from './types'

interface AssemblePromptParams {
  userId: string
  workflowType: WorkflowType
  userRequest: string
}

interface AssembledPrompt {
  systemPrompt: string
  userPrompt: string
}

export async function assemblePrompt({
  userId,
  workflowType,
  userRequest,
}: AssemblePromptParams): Promise<AssembledPrompt> {
  let globalBrandVoice = ''
  let masterWorkflowPrompt = ''
  let preferenceContext = ''

  // 1. Fetch from Neon DB
  try {
    const neon = getNeon()
    const settings = (await neon`
      SELECT global_brand_voice FROM user_settings WHERE user_id = ${userId} LIMIT 1;
    `) as { global_brand_voice?: string }[]

    if (settings.length > 0 && settings[0].global_brand_voice) {
      globalBrandVoice = settings[0].global_brand_voice
    }

    const prompts = (await neon`
      SELECT prompt_text FROM prompts WHERE user_id = ${userId} AND workflow = ${workflowType} LIMIT 1;
    `) as { prompt_text?: string }[]

    if (prompts.length > 0 && prompts[0].prompt_text) {
      masterWorkflowPrompt = prompts[0].prompt_text
    }

    const rows = await neon`
      SELECT preference_type, preference_value, frequency_selected
      FROM user_preferences
      WHERE user_id = ${userId} AND workflow = ${workflowType}
      ORDER BY frequency_selected DESC
      LIMIT 5
    `
    const prefs = rows as { preference_type: string; preference_value: string }[]
    if (prefs.length > 0) {
      preferenceContext = '\nUser preference patterns:\n' + prefs
        .map((p) => `- ${p.preference_type}: ${p.preference_value}`)
        .join('\n')
    }

    // Also fetch recent user training prompts from chat history
    try {
      const chatRows = (await neon`
        SELECT role, content
        FROM workflow_chat_history
        WHERE user_id = ${userId} AND workflow = ${workflowType} AND role = 'user'
        ORDER BY created_at DESC
        LIMIT 3;
      `) as { role: string; content: string }[]

      if (chatRows.length > 0) {
        preferenceContext += '\nRecent User Training & Style Directives from Chat:\n' + chatRows
          .map((c) => `• "${c.content.slice(0, 150)}"`)
          .join('\n')
      }
    } catch {
      // Table might not exist yet
    }
  } catch (neonErr) {
    console.warn('Neon assemblePrompt fallback warning:', neonErr)
  }

  // 2. Fallback to Supabase
  if (!globalBrandVoice || !masterWorkflowPrompt) {
    try {
      const supabase = getSupabaseAdmin()
      if (!globalBrandVoice) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('global_brand_voice')
          .eq('user_id', userId)
          .single()
        if (settings && (settings as { global_brand_voice?: string }).global_brand_voice) {
          globalBrandVoice = (settings as { global_brand_voice?: string }).global_brand_voice || ''
        }
      }

      if (!masterWorkflowPrompt) {
        const { data: promptData } = await supabase
          .from('prompts')
          .select('prompt_text')
          .eq('user_id', userId)
          .eq('workflow', workflowType)
          .single()
        if (promptData && (promptData as { prompt_text?: string }).prompt_text) {
          masterWorkflowPrompt = (promptData as { prompt_text?: string }).prompt_text || ''
        }
      }
    } catch (supabaseErr) {
      console.warn('Supabase assemblePrompt fallback warning:', supabaseErr)
    }
  }

  // Keep brand voice focused and prevent 413 / payload overflow
  const cleanBrandVoice =
    globalBrandVoice.length > 2500
      ? globalBrandVoice.slice(0, 2500) + '...\n[Voice summary: Warm, grounded, systems-driven, professional]'
      : globalBrandVoice

  const systemPrompt = [
    cleanBrandVoice && `Brand Voice:\n${cleanBrandVoice}`,
    masterWorkflowPrompt && `Workflow Instructions:\n${masterWorkflowPrompt}`,
    preferenceContext && `Self-Training Context:\n${preferenceContext}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    systemPrompt: systemPrompt || 'You are Clara Chukwu, founder of Boss Behind The Boss.',
    userPrompt: userRequest,
  }
}
