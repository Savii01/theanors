'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  FaRegComments,
  FaXmark,
  FaPaperPlane,
  FaRegTrashCan,
  FaRegClock,
  FaRegCopy,
  FaRegCircleCheck,
  FaRegBookmark,
  FaBrain,
} from 'react-icons/fa6'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface WorkflowChatPanelProps {
  workflow: string
  workflowLabel: string
  modelId: string
  workflowContext?: string
}

export function WorkflowChatPanel({
  workflow,
  workflowLabel,
  modelId,
  workflowContext,
}: WorkflowChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => setMounted(true), [])

  const storageKey = `theanors_chat_${workflow}`

  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch {}

    let cancelled = false
    fetch(`/api/chat?workflow=${encodeURIComponent(workflow)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.messages) && data.messages.length > 0) {
          const serverMsgs: ChatMessage[] = data.messages.map(
            (m: { role: 'user' | 'assistant'; content: string; created_at?: string }) => ({
              role: m.role,
              content: m.content,
              timestamp: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : undefined,
            })
          )
          setMessages(serverMsgs)
          try {
            localStorage.setItem(storageKey, JSON.stringify(serverMsgs))
          } catch {}
        }
      })
      .catch((err) => console.warn('Failed to load server chat history:', err))

    return () => {
      cancelled = true
    }
  }, [workflow, storageKey])

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, activeTab])

  useEffect(() => {
    if (isOpen && activeTab === 'chat' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen, activeTab])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage: ChatMessage = { role: 'user', content: text, timestamp: nowTime }
    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages))
    } catch {}

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          workflow,
          messages: updatedMessages,
          workflowContext: workflowContext || '',
        }),
      })

      const data = await res.json()
      if (res.ok && data.reply) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        const finalMsgs = [...updatedMessages, assistantMessage]
        setMessages(finalMsgs)
        try {
          localStorage.setItem(storageKey, JSON.stringify(finalMsgs))
        } catch {}
      } else {
        const errorMsg = data.error || data.detail || 'Unable to generate response.'
        const fallbackMsg: ChatMessage = {
          role: 'assistant',
          content: `⚠️ ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, fallbackMsg])
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network connection error'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errMsg}. Please verify model selection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = async () => {
    if (!confirm(`Clear all saved conversation history for ${workflowLabel}?`)) return
    setMessages([])
    setInput('')
    try {
      localStorage.removeItem(storageKey)
      await fetch(`/api/chat?workflow=${encodeURIComponent(workflow)}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Failed to clear chat history:', err)
    }
  }

  const handleCopyMessage = (idx: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!mounted) return null

  return createPortal(
    <>
      {/* Fixed Trigger Button — always visible in viewport, never scrolls */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[55] px-4 py-2.5 bg-[#151518] hover:bg-[#222226] text-white rounded-full text-[12px] font-bold shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105 border border-white/10"
      >
        <FaRegComments className="text-[#FF88C2] text-[13px]" />
        <span className="hidden sm:inline">Chat with {workflowLabel} AI</span>
        <span className="sm:hidden">AI Chat</span>
        {messages.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#FF88C2] text-[#4C0028] text-[10px] font-bold flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>

      {/* Modal — only mounts when open */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-in Modal Container */}
          <div className="fixed top-0 right-0 h-full w-full max-w-[460px] bg-white shadow-2xl z-[60] flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="p-4 border-b border-[#ECE7DD] bg-[#F7F5EE]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#151518] text-white flex items-center justify-center flex-shrink-0">
                    <FaRegComments className="text-xs text-[#FF88C2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#18181B] truncate">
                        {workflowLabel} Assistant
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#BEE7A5] text-[#193E07] text-[9px] font-bold">
                        <FaBrain className="text-[8px]" />
                        Learning Memory
                      </span>
                    </div>
                    <span className="text-[10px] text-[#7A776E] block truncate">
                      History trained • {messages.length} exchanges saved
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearChat}
                      title="Clear saved conversation"
                      className="w-8 h-8 rounded-full bg-white hover:bg-[#FFBBE2] text-[#9E9B92] hover:text-[#4C0028] border border-[#ECE7DD] flex items-center justify-center transition-all cursor-pointer"
                    >
                      <FaRegTrashCan className="text-[11px]" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white hover:bg-[#FFBBE2] text-[#9E9B92] hover:text-[#4C0028] border border-[#ECE7DD] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <FaXmark className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Navigation Pill Switcher */}
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#ECE7DD]">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1.5 px-3 text-[11px] font-bold rounded-full transition-all cursor-pointer text-center ${
                    activeTab === 'chat'
                      ? 'bg-[#151518] text-white shadow-xs'
                      : 'bg-white border border-[#ECE7DD] text-[#7A776E] hover:text-[#18181B]'
                  }`}
                >
                  Active Chat ({messages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-1.5 px-3 text-[11px] font-bold rounded-full transition-all cursor-pointer text-center ${
                    activeTab === 'history'
                      ? 'bg-[#151518] text-white shadow-xs'
                      : 'bg-white border border-[#ECE7DD] text-[#7A776E] hover:text-[#18181B]'
                  }`}
                >
                  Saved Training History
                </button>
              </div>
            </div>

            {/* TAB 1: Active Chat View */}
            {activeTab === 'chat' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-[#F7F5EE] border border-[#ECE7DD] flex items-center justify-center mx-auto mb-3 text-[#151518]">
                      <FaBrain className="text-lg text-[#FF88C2]" />
                    </div>
                    <p className="text-[13px] font-bold text-[#18181B]">
                      Train Your {workflowLabel} AI
                    </p>
                    <p className="text-[11px] text-[#7A776E] mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Every instruction, correction, and feedback you give here is automatically saved and remembered to guide future generations.
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3.5 rounded-[18px] text-[12px] leading-relaxed shadow-2xs group relative ${
                        msg.role === 'user'
                          ? 'bg-[#151518] text-white rounded-br-xs'
                          : 'bg-[#F7F5EE] border border-[#ECE7DD] text-[#18181B] rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      <div
                        className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
                          msg.role === 'user'
                            ? 'border-white/10 text-neutral-400'
                            : 'border-[#ECE7DD] text-[#7A776E]'
                        }`}
                      >
                        <span className="flex items-center gap-1 font-mono">
                          <FaRegClock className="text-[9px]" />
                          {msg.timestamp || 'Just now'}
                        </span>

                        {msg.role === 'assistant' && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(i, msg.content)}
                            className="inline-flex items-center gap-1 hover:text-[#18181B] transition-colors cursor-pointer"
                          >
                            {copiedIndex === i ? (
                              <>
                                <FaRegCircleCheck className="text-[#193E07]" />
                                <span className="text-[#193E07] font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <FaRegCopy />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 p-3 bg-[#F7F5EE] border border-[#ECE7DD] rounded-[16px] max-w-[200px] text-[11px] text-[#7A776E]">
                    <div className="w-2 h-2 rounded-full bg-[#FF88C2] animate-ping" />
                    <span className="font-bold">AI is thinking & learning...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            )}

            {/* TAB 2: Saved Training History View */}
            {activeTab === 'history' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F5EE]">
                {messages.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-[20px] border border-[#ECE7DD] p-6">
                    <FaRegBookmark className="text-2xl mx-auto mb-2 text-[#9E9B92]" />
                    <p className="text-[12px] font-bold text-[#18181B]">No conversation memory saved yet</p>
                    <p className="text-[11px] text-[#7A776E] mt-1">
                      Start chatting to build a continuous memory trail for {workflowLabel}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-[#7A776E] uppercase tracking-wider">
                        Full Session Log ({messages.length} entries)
                      </span>
                      <span className="text-[10px] text-[#193E07] font-bold bg-[#BEE7A5] px-2 py-0.5 rounded-full">
                        Synced with DB
                      </span>
                    </div>

                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white border border-[#ECE7DD] rounded-[16px] shadow-2xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              m.role === 'user'
                                ? 'bg-[#151518] text-white'
                                : 'bg-[#FFBBE2] text-[#4C0028]'
                            }`}
                          >
                            {m.role === 'user' ? '👤 Your Prompt' : '🤖 AI Response'}
                          </span>
                          <span className="text-[10px] text-[#9E9B92] font-mono">
                            {m.timestamp || `#${idx + 1}`}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#18181B] leading-relaxed whitespace-pre-wrap">
                          {m.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 border-t border-[#ECE7DD] bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Teach or ask your ${workflowLabel} AI...`}
                  rows={1}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-[16px] text-[12px] text-[#18181B] placeholder-[#9E9B92] outline-hidden focus:border-[#151518] transition-all resize-none min-h-[42px] max-h-[120px]"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.currentTarget
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2.5 bg-[#151518] hover:bg-[#2A2A2E] disabled:opacity-40 text-white rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all flex-shrink-0 h-10.5"
                >
                  <FaPaperPlane className="text-[10px]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
