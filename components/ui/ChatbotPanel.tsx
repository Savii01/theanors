'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Textarea } from './Input'
import {
  FaRegComments,
  FaChevronUp,
  FaChevronDown,
  FaRegPenToSquare,
  FaRegCircleCheck,
  FaRegBookmark,
  FaPaperPlane,
} from 'react-icons/fa6'

interface Message {
  role: 'user' | 'assistant'
  content: string
  learnedRule?: string
  updatedPrompt?: string
}

interface ChatbotPanelProps {
  workflowName: string
  masterPrompt: string
  onUpdate: (prompt: string) => void
  className?: string
}

export function ChatbotPanel({
  workflowName,
  masterPrompt,
  onUpdate,
  className = '',
}: ChatbotPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'editor'>('chat')
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your ${workflowName} AI Model Coach. Point out any mistakes in previous generations or give me specific style instructions, and I'll update the system prompt and train the model memory.`,
    },
  ])
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, activeTab])

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || chatInput.trim()
    if (!textToSend || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }]
    setMessages(newMessages)
    setChatInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/settings/prompt-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: workflowName.toLowerCase().replace(/\s+/g, '_'),
          currentPrompt: masterPrompt,
          userMessage: textToSend,
          history: messages.slice(-4),
        }),
      })

      const data = await res.json()
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            learnedRule: data.learnedRule,
            updatedPrompt: data.updatedPrompt,
          },
        ])

        if (data.updatedPrompt) {
          onUpdate(data.updatedPrompt)
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue updating the prompt. Please try again or use the Direct Editor tab.',
        },
      ])
    }

    setLoading(false)
  }

  const handleBlur = () => {
    setSaving(true)
    fetch('/api/settings/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow: workflowName.toLowerCase().replace(/\s+/g, '_'),
        prompt: masterPrompt,
      }),
    })
      .then(() => setSaving(false))
      .catch(() => setSaving(false))
  }

  return (
    <div className={`mb-5 overflow-hidden rounded-[22px] border border-[#ECE7DD] bg-white shadow-2xs transition-all ${className}`}>
      {/* Assistant Header Banner */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-start sm:items-center justify-between p-4 bg-[#F7F5EE] hover:bg-[#EFECE3] transition-colors gap-3"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-[#151518] text-white flex items-center justify-center text-xs font-bold shadow-2xs flex-shrink-0 mt-0.5 sm:mt-0">
            <FaRegComments className="text-xs text-[#FF88C2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold text-[#18181B]">
                {workflowName} AI Model Coach & Corrections
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFBBE2] text-[#4C0028] text-[10px] font-bold whitespace-nowrap">
                Self-Training Active
              </span>
            </div>
            <p className="text-[11px] text-[#7A776E] mt-0.5 truncate sm:whitespace-normal">
              Correct mistakes conversationally to train the model and auto-refine system instructions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 pt-1 sm:pt-0">
          {saving && <span className="text-[10px] text-[#7A776E] font-medium hidden sm:inline">Auto-saving...</span>}
          <div className="w-7 h-7 rounded-full bg-white border border-[#ECE7DD] flex items-center justify-center text-xs text-[#18181B] font-bold">
            {isOpen ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
          </div>
        </div>
      </div>

      {/* Expandable Coach Area */}
      {isOpen && (
        <div className="p-4 border-t border-[#ECE7DD] bg-white space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-[#ECE7DD] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer
                ${
                  activeTab === 'chat'
                    ? 'bg-[#151518] text-white shadow-xs'
                    : 'bg-[#F7F5EE] text-[#7A776E] hover:text-[#18181B]'
                }`}
            >
              <FaRegComments className="text-xs" />
              <span>Model Correction Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer
                ${
                  activeTab === 'editor'
                    ? 'bg-[#151518] text-white shadow-xs'
                    : 'bg-[#F7F5EE] text-[#7A776E] hover:text-[#18181B]'
                }`}
            >
              <FaRegPenToSquare className="text-xs" />
              <span>Direct System Prompt Editor</span>
            </button>
          </div>

          {/* TAB 1: Chat & Mistake Correction */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                <span className="text-[#7A776E] font-bold flex-shrink-0">Quick corrections:</span>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Make all outputs punchier and under 2 sentences.')}
                  className="px-2.5 py-1 bg-[#F7F5EE] hover:bg-[#FEE775] text-[#18181B] rounded-full border border-[#ECE7DD] transition-all cursor-pointer whitespace-nowrap"
                >
                  ✂️ Shorter & punchier
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Never use generic hashtags or corporate buzzwords.')}
                  className="px-2.5 py-1 bg-[#F7F5EE] hover:bg-[#FFBBE2] text-[#18181B] rounded-full border border-[#ECE7DD] transition-all cursor-pointer whitespace-nowrap"
                >
                  🚫 No hashtags/clichés
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Adopt a more direct, data-driven authoritative founder tone.')}
                  className="px-2.5 py-1 bg-[#F7F5EE] hover:bg-[#BEE7A5] text-[#18181B] rounded-full border border-[#ECE7DD] transition-all cursor-pointer whitespace-nowrap"
                >
                  📈 Data-driven tone
                </button>
              </div>

              {/* Chat messages list */}
              <div className="max-h-[280px] overflow-y-auto space-y-2.5 p-3 bg-[#F7F5EE] rounded-[18px] border border-[#ECE7DD]">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-[16px] text-[12px] leading-relaxed
                        ${
                          msg.role === 'user'
                            ? 'bg-[#151518] text-white'
                            : 'bg-white border border-[#ECE7DD] text-[#18181B]'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Learned rule badge */}
                      {msg.learnedRule && (
                        <div className="mt-2 pt-2 border-t border-[#ECE7DD] flex items-center gap-1.5 text-[10px] font-bold text-[#193E07] bg-[#BEE7A5]/40 px-2 py-1 rounded-[10px]">
                          <FaRegBookmark className="text-[10px] text-[#193E07]" />
                          <span>Learned & Stored Rule: &quot;{msg.learnedRule}&quot;</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 p-2 text-[11px] text-[#7A776E]">
                    <div className="w-2 h-2 rounded-full bg-[#FF88C2] animate-ping" />
                    <span>Analyzing mistake and updating master model prompt...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tell the model what to fix, change, or avoid in future outputs..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-full text-[12px] text-[#18181B] placeholder-[#9E9B92] outline-hidden focus:border-[#151518] transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !chatInput.trim()}
                  className="px-4 py-2.5 bg-[#151518] hover:bg-[#2A2A2E] disabled:opacity-40 text-white rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all flex-shrink-0"
                >
                  <FaPaperPlane className="text-xs" />
                  <span>Train</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Direct Editor */}
          {activeTab === 'editor' && (
            <div className="space-y-2">
              <Textarea
                label="Workflow Master System Instructions"
                value={masterPrompt}
                onChange={onUpdate}
                onBlur={handleBlur}
                rows={6}
                placeholder="Define specific constraints, rules, tone, and formatting for this workflow..."
                helpText="Changes auto-save on blur and apply instantly to all subsequent generations."
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBlur}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F7F5EE] hover:bg-[#BEE7A5] hover:text-[#193E07] text-[#18181B] text-[11px] font-bold rounded-full transition-all border border-[#ECE7DD] cursor-pointer"
                >
                  <FaRegCircleCheck className="text-xs" />
                  <span>{saving ? 'Saved' : 'Save System Prompt'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
