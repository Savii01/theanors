'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { LimitAlert } from '@/components/ui/LimitAlert'
import { ChatbotPanel } from '@/components/ui/ChatbotPanel'
import { WorkflowChatPanel } from '@/components/ui/WorkflowChatPanel'
import { FeedbackActions } from '@/components/ui/FeedbackActions'
import { LLM_MODELS } from '@/lib/shared/types'
import type { CommentOption, ModelLimits } from '@/lib/shared/types'
import {
  FaRegUser,
  FaRegBuilding,
  FaInstagram,
  FaTiktok,
  FaRegCircleCheck,
  FaRegCopy,
  FaBolt,
  FaXmark,
} from 'react-icons/fa6'

type Platform = 'personal_linkedin' | 'company_linkedin' | 'instagram' | 'tiktok'

export default function CommentsPage() {
  const [masterPrompt, setMasterPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini')
  const [limits, setLimits] = useState<ModelLimits>({})
  const [postLink, setPostLink] = useState('')
  const [platform, setPlatform] = useState<Platform>('personal_linkedin')
  const [options, setOptions] = useState<CommentOption[]>([])
  const [posted, setPosted] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [limitHit, setLimitHit] = useState('')
  const [copiedOption, setCopiedOption] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/settings/prompts/comments')
      .then((r) => r.json())
      .then((data) => setMasterPrompt(data.prompt ?? ''))
      .catch(() => {})

    fetch('/api/settings/model-limits')
      .then((r) => r.json())
      .then((data) => setLimits(data.limits ?? {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theanors_initial_comments_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.postLink) setPostLink(parsed.postLink)
        if (parsed.platform) setPlatform(parsed.platform)
        if (Array.isArray(parsed.options) && parsed.options.length > 0) setOptions(parsed.options)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const hasState = postLink || options.length > 0
      if (hasState) {
        localStorage.setItem('theanors_initial_comments_state', JSON.stringify({
          postLink,
          platform,
          options,
        }))
      } else {
        localStorage.removeItem('theanors_initial_comments_state')
      }
    } catch {}
  }, [postLink, platform, options])

  const handleGenerate = async () => {
    if (!postLink.trim()) return
    setLoading(true)
    setLimitHit('')
    try {
      const res = await fetch('/api/comments/generate-initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postLink, platform, modelId: selectedModel, userId: 'default' }),
      })
      if (res.status === 429) {
        setLimitHit(LLM_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel)
        setLoading(false)
        return
      }
      const data = await res.json()
      setOptions(data.options ?? [])
    } catch (error) {
      console.error('Generate failed:', error)
    }
    setLoading(false)
  }

  const handleCopy = (option: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedOption(option)
    setTimeout(() => setCopiedOption(null), 2000)
  }

  const handleMarkPosted = (optionNumber: number) => {
    setPosted((prev) => ({ ...prev, [optionNumber]: true }))
  }

  const handleRejectOption = (optionNumber: number) => {
    setOptions((prev) => prev.filter((o) => o.option !== optionNumber))
  }

  const platforms: { value: Platform; label: string; icon: React.ReactNode }[] = [
    { value: 'personal_linkedin', label: 'Personal LinkedIn', icon: <FaRegUser className="text-xs" /> },
    { value: 'company_linkedin', label: 'Company Page', icon: <FaRegBuilding className="text-xs" /> },
    { value: 'instagram', label: 'Instagram', icon: <FaInstagram className="text-xs" /> },
    { value: 'tiktok', label: 'TikTok', icon: <FaTiktok className="text-xs" /> },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold text-[#18181B] tracking-tight">
          Initial First-Comment Generator
        </h1>
        <p className="text-[13px] text-[#7A776E] mt-0.5">
          Generate 3 strategic initial comment options to pin immediately after publishing your own post to drive algorithm velocity.
        </p>
      </div>

      {/* Model Selector & Limit Alert */}
      <ModelSelector
        models={LLM_MODELS}
        selected={selectedModel}
        onSelect={setSelectedModel}
        limits={limits}
      />

      {limitHit && <LimitAlert modelName={limitHit} />}

      {(postLink || options.length > 0) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setPostLink('')
              setOptions([])
              setPosted({})
              try { localStorage.removeItem('theanors_initial_comments_state') } catch {}
            }}
            className="text-[12px] font-bold text-[#7A776E] hover:text-[#18181B] underline cursor-pointer"
          >
            Start Fresh / Clear
          </button>
        </div>
      )}

      {/* Master Prompt Assistant */}
      <ChatbotPanel
        workflowName="Initial Comments"
        masterPrompt={masterPrompt}
        onUpdate={setMasterPrompt}
      />

      {/* Input Card */}
      <Card
        title="Your Published Post"
        subtitle="Paste your published post URL or caption text"
        action={
          <Button
            variant="dark"
            onClick={handleGenerate}
            disabled={loading || !postLink.trim()}
            className="inline-flex items-center gap-1.5"
          >
            <FaBolt className="text-xs" />
            <span>{loading ? 'Crafting 3 comments...' : 'Generate 3 Options'}</span>
          </Button>
        }
      >
        <Input
          label="Post URL or Content"
          value={postLink}
          onChange={setPostLink}
          placeholder="https://linkedin.com/posts/... or paste key points from your post"
        />

        <div className="mt-4">
          <label className="block text-[12px] font-bold text-[#18181B] mb-2">
            Target Platform & Voice Mode
          </label>
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => {
              const isSelected = platform === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  className={`px-4 py-2 text-[12px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-2
                    ${
                      isSelected
                        ? 'bg-[#151518] text-white shadow-xs'
                        : 'bg-[#F7F5EE] text-[#18181B] border border-[#ECE7DD] hover:bg-[#EFECE3]'
                    }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* 3 Comment Cards */}
      {options.length > 0 && (
        <div className="space-y-4">
          {options.map((opt) => {
            const isPosted = posted[opt.option]
            const isCopied = copiedOption === opt.option

            return (
              <Card
                key={opt.option}
                title={`Option ${opt.option}`}
                subtitle={opt.style}
                action={
                  <div className="flex items-center gap-2">
                    {isPosted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BEE7A5] text-[#193E07] text-[11px] font-bold">
                        <FaRegCircleCheck className="text-xs" />
                        <span>Posted & Pinned</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPosted(opt.option)}
                        className="px-3 py-1 bg-[#F7F5EE] hover:bg-[#BEE7A5] hover:text-[#193E07] text-[#18181B] text-[11px] font-bold rounded-full transition-all border border-[#ECE7DD] cursor-pointer"
                      >
                        Mark as Posted
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(opt.option, opt.text)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer
                        ${
                          isCopied
                            ? 'bg-[#151518] text-white border-[#151518]'
                            : 'bg-white hover:bg-[#F7F5EE] text-[#18181B] border-[#ECE7DD]'
                        }`}
                    >
                      {isCopied ? (
                        <>
                          <FaRegCircleCheck className="text-[10px]" /> Copied
                        </>
                      ) : (
                        <>
                          <FaRegCopy className="text-[10px]" /> Copy
                        </>
                      )}
                    </button>
                    {!isPosted && (
                      <button
                        onClick={() => handleRejectOption(opt.option)}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white hover:bg-[#FEE775] text-[#7A776E] hover:text-[#18181B] border border-[#ECE7DD] transition-all cursor-pointer"
                        title="Reject option"
                      >
                        <FaXmark className="text-[11px]" />
                      </button>
                    )}
                  </div>
                }
              >
                <div className="p-4 bg-[#F7F5EE] rounded-[18px] border border-[#ECE7DD] text-[13px] leading-relaxed text-[#18181B]">
                  {opt.text}
                </div>
                <FeedbackActions onAction={() => {}} className="mt-3.5" />
              </Card>
            )
          })}
        </div>
      )}

      <WorkflowChatPanel
        workflow="comments"
        workflowLabel="Initial Comments"
        modelId={selectedModel}
        workflowContext={(() => {
          const lines: string[] = []
          if (postLink.trim()) lines.push(`Post URL: ${postLink.trim()}`)
          lines.push(`Platform: ${platform.replace(/_/g, ' ')}`)
          if (options.length > 0) {
            lines.push('Generated Initial Comments:')
            options.forEach((opt, i) => {
              const status = posted[i] ? ' [POSTED]' : ''
              lines.push(`Option ${i + 1} (${opt.style}): ${opt.text}${status}`)
            })
          }
          return lines.join('\n\n')
        })()}
      />
    </div>
  )
}
