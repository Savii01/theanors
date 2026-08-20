import { NextRequest, NextResponse } from 'next/server'
import { chatWithModel } from '@/lib/shared/llm-client'
import { assemblePrompt } from '@/lib/shared/prompt-assembly'
import { fetchLinkPreview } from '@/lib/shared/link-fetcher'
import { getNeon, getSupabaseAdmin } from '@/lib/shared/database'
import type { WorkflowType } from '@/lib/shared/types'

const VALID_WORKFLOWS: WorkflowType[] = ['engagement', 'captions', 'scripting', 'newsletter', 'comments']
const DEFAULT_USER_ID = 'default'

// Ensure DB table exists
async function ensureTable() {
  try {
    const neon = getNeon()
    await neon`
      CREATE TABLE IF NOT EXISTS workflow_chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(100) NOT NULL,
        workflow VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `
  } catch (err) {
    console.warn('Neon ensure workflow_chat_history warning:', err)
  }
}

// GET: Load saved conversation history for this workflow
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workflow = searchParams.get('workflow') as WorkflowType

  if (!workflow || !VALID_WORKFLOWS.includes(workflow)) {
    return NextResponse.json({ error: 'Valid workflow is required' }, { status: 400 })
  }

  await ensureTable()

  try {
    const neon = getNeon()
    const rows = (await neon`
      SELECT role, content, created_at
      FROM workflow_chat_history
      WHERE user_id = ${DEFAULT_USER_ID} AND workflow = ${workflow}
      ORDER BY created_at ASC
      LIMIT 100;
    `) as { role: 'user' | 'assistant'; content: string; created_at: string }[]

    return NextResponse.json({ messages: rows || [] })
  } catch (neonErr) {
    console.warn('Neon load chat history warning:', neonErr)
    // Supabase fallback
    try {
      const supabase = getSupabaseAdmin()
      const { data } = await supabase
        .from('workflow_chat_history')
        .select('role, content, created_at')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('workflow', workflow)
        .order('created_at', { ascending: true })

      return NextResponse.json({ messages: data || [] })
    } catch {
      return NextResponse.json({ messages: [] })
    }
  }
}

// POST: Generate AI reply and save both messages to persistent history
interface ChatRequestBody {
  modelId: string
  workflow: WorkflowType
  messages: { role: 'user' | 'assistant'; content: string }[]
  workflowContext?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json()
    const { modelId, workflow, messages, workflowContext } = body

    if (!modelId || !workflow || !messages?.length) {
      return NextResponse.json({ error: 'modelId, workflow, and messages are required' }, { status: 400 })
    }

    if (!VALID_WORKFLOWS.includes(workflow)) {
      return NextResponse.json({ error: `Invalid workflow. Must be one of: ${VALID_WORKFLOWS.join(', ')}` }, { status: 400 })
    }

    await ensureTable()

    // Assemble the full system prompt from brand voice + master prompt + learned memory
    const { systemPrompt } = await assemblePrompt({
      userId: DEFAULT_USER_ID,
      workflowType: workflow,
      userRequest: '',
    })

    // Build enriched context from live workflow state
    let liveContext = workflowContext?.trim() || ''

    // Scan for URLs in workflowContext and last user message
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const lastUserContent = messages[messages.length - 1]?.content || ''
    const foundUrls = Array.from(new Set([
      ...(workflowContext || '').match(urlRegex) || [],
      ...lastUserContent.match(urlRegex) || [],
    ])).slice(0, 5)

    if (foundUrls.length > 0) {
      const previews = await Promise.all(foundUrls.map(fetchLinkPreview))
      liveContext += '\n\n=== EXTRACTED LINK CONTENT & AUTHORS ===\n' + previews
        .map(
          (p) =>
            `• URL: ${p.url}\n  Author: ${p.authorName || 'Unknown'} (${p.authorFirstName || 'Unknown'})\n  Topic: ${p.topic || 'General'}\n  Preview: ${p.previewText}`
        )
        .join('\n\n')
    }

    // Bound live context to under 1500 chars to avoid TPM overages
    const boundedContext = liveContext.length > 1500 ? liveContext.slice(0, 1500) + '...' : liveContext

    // Append live workspace context to system prompt
    const effectiveSystemPrompt = [
      systemPrompt,
      boundedContext &&
        `=== CURRENT WORKSPACE CONTEXT ===\n${boundedContext}\n\nYou are Clara Chukwu's AI Assistant. Keep answers short, warm, and grounded.`,
    ]
      .filter(Boolean)
      .join('\n\n')

    const reply = await chatWithModel({
      modelId,
      messages,
      systemPrompt: effectiveSystemPrompt,
    })

    // Persist latest turn (user question + AI response) to Database
    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg && lastUserMsg.role === 'user') {
      try {
        const neon = getNeon()
        await neon`
          INSERT INTO workflow_chat_history (user_id, workflow, role, content, created_at)
          VALUES 
            (${DEFAULT_USER_ID}, ${workflow}, 'user', ${lastUserMsg.content}, now()),
            (${DEFAULT_USER_ID}, ${workflow}, 'assistant', ${reply}, now());
        `
      } catch (saveErr) {
        console.warn('Neon save chat message warning:', saveErr)
      }

      try {
        const supabase = getSupabaseAdmin()
        await supabase.from('workflow_chat_history').insert([
          { user_id: DEFAULT_USER_ID, workflow, role: 'user', content: lastUserMsg.content },
          { user_id: DEFAULT_USER_ID, workflow, role: 'assistant', content: reply },
        ])
      } catch (supaErr) {
        console.warn('Supabase save chat message warning:', supaErr)
      }
    }

    return NextResponse.json({ reply })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Chat API error:', message)

    if (message.includes('limit') || message.includes('429')) {
      return NextResponse.json({ error: 'Daily model limit exceeded', detail: message }, { status: 429 })
    }

    return NextResponse.json({ error: 'Chat generation failed', detail: message }, { status: 500 })
  }
}

// DELETE: Clear conversation history
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workflow = searchParams.get('workflow') as WorkflowType

  if (!workflow || !VALID_WORKFLOWS.includes(workflow)) {
    return NextResponse.json({ error: 'Valid workflow is required' }, { status: 400 })
  }

  try {
    const neon = getNeon()
    await neon`
      DELETE FROM workflow_chat_history
      WHERE user_id = ${DEFAULT_USER_ID} AND workflow = ${workflow};
    `
  } catch (err) {
    console.warn('Neon delete chat history warning:', err)
  }

  try {
    const supabase = getSupabaseAdmin()
    await supabase
      .from('workflow_chat_history')
      .delete()
      .eq('user_id', DEFAULT_USER_ID)
      .eq('workflow', workflow)
  } catch (supaErr) {
    console.warn('Supabase delete chat history warning:', supaErr)
  }

  return NextResponse.json({ success: true, message: 'Chat history cleared' })
}
