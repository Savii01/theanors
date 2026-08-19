import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/shared/llm-client'
import { getNeon, getSupabaseAdmin } from '@/lib/shared/database'

const DEFAULT_USER_ID = 'default'

export async function POST(req: NextRequest) {
  try {
    const { workflow, currentPrompt, userMessage, history = [] } = await req.json()

    if (!workflow || !userMessage) {
      return NextResponse.json({ error: 'Missing workflow or userMessage' }, { status: 400 })
    }

    const conversationHistory = history
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n')

    const coachPrompt = `You are an expert AI Prompt Engineer and Model Coach for the "${workflow}" workflow of a content operations platform.
The user is giving you feedback, pointing out a mistake, or giving instructions on how future AI outputs should look.

CURRENT SYSTEM PROMPT FOR "${workflow}":
"""
${currentPrompt || '(Default instructions)'}
"""

PREVIOUS CHAT HISTORY:
${conversationHistory || '(No previous history)'}

USER FEEDBACK / CORRECTION:
"${userMessage}"

YOUR TASK:
1. Explain clearly to the user what rule you have learned and how you're adjusting the prompt.
2. Formulate an improved, refined SYSTEM PROMPT that incorporates the user's correction seamlessly into the existing rules.
3. Formulate a short 1-line learned preference rule (e.g., "Always keep comments under 2 sentences" or "Never include rhetorical questions as hooks").

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS (using these exact XML tags):
<reply>
Your friendly, conversational response explaining the adjustments and learned behavior.
</reply>
<learned_rule>
Short one-sentence rule learned from this correction
</learned_rule>
<updated_prompt>
The complete, updated system prompt text incorporating all past and new rules
</updated_prompt>`

    const responseText = await generateText({
      modelId: 'allam-2-7b',
      prompt: coachPrompt,
      globalBrandVoice: '',
      masterWorkflowPrompt: 'You are an AI Prompt Coach that helps users train and customize content models.',
    })

    // Extract tags
    const replyMatch = responseText.match(/<reply>([\s\S]*?)<\/reply>/i)
    const ruleMatch = responseText.match(/<learned_rule>([\s\S]*?)<\/learned_rule>/i)
    const promptMatch = responseText.match(/<updated_prompt>([\s\S]*?)<\/updated_prompt>/i)

    const reply = replyMatch ? replyMatch[1].trim() : responseText
    const learnedRule = ruleMatch ? ruleMatch[1].trim() : ''
    const updatedPrompt = promptMatch ? promptMatch[1].trim() : currentPrompt

    // Save learned rule to Neon DB & Supabase user_preferences table
    if (learnedRule) {
      try {
        const neon = getNeon()
        await neon`
          CREATE TABLE IF NOT EXISTS user_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(100) NOT NULL,
            workflow VARCHAR(50) NOT NULL,
            preference_type VARCHAR(100) NOT NULL,
            preference_value TEXT NOT NULL,
            frequency_selected INT DEFAULT 1,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );
        `
        await neon`
          INSERT INTO user_preferences (user_id, workflow, preference_type, preference_value, frequency_selected, updated_at)
          VALUES (${DEFAULT_USER_ID}, ${workflow}, 'rule', ${learnedRule}, 1, now());
        `
      } catch (err) {
        console.warn('Neon save user preference warning:', err)
      }

      try {
        const supabase = getSupabaseAdmin()
        await supabase.from('user_preferences').insert({
          user_id: DEFAULT_USER_ID,
          workflow,
          preference_type: 'rule',
          preference_value: learnedRule,
          frequency_selected: 1,
        })
      } catch (err) {
        console.warn('Supabase save user preference warning:', err)
      }
    }

    // Also auto-save the updated prompt to prompts table
    if (updatedPrompt && updatedPrompt !== currentPrompt) {
      try {
        const neon = getNeon()
        await neon`
          INSERT INTO prompts (user_id, workflow, prompt_text, updated_at)
          VALUES (${DEFAULT_USER_ID}, ${workflow}, ${updatedPrompt}, now())
          ON CONFLICT (user_id, workflow)
          DO UPDATE SET prompt_text = ${updatedPrompt}, updated_at = now();
        `
      } catch (err) {
        console.warn('Neon auto-save prompt warning:', err)
      }
    }

    return NextResponse.json({
      reply,
      learnedRule,
      updatedPrompt,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Prompt coach error:', message)
    return NextResponse.json({ error: 'Failed to process prompt correction' }, { status: 500 })
  }
}
