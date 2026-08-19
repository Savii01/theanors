'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { LimitAlert } from '@/components/ui/LimitAlert'
import { ChatbotPanel } from '@/components/ui/ChatbotPanel'
import { FeedbackActions } from '@/components/ui/FeedbackActions'
import { LLM_MODELS } from '@/lib/shared/types'
import type { CommentOption, ModelLimits } from '@/lib/shared/types'
import {
  FaRegCopy,
  FaRegCircleCheck,
  FaBolt,
  FaLink,
  FaDownload,
} from 'react-icons/fa6'

interface CommentCard {
  postLink: string
  options: CommentOption[]
  selectedOption?: number
  posted: boolean
}

export default function EngagementPage() {
  const cardsRef = useRef<HTMLDivElement>(null)
  const [masterPrompt, setMasterPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('allam-2-7b')
  const [limits, setLimits] = useState<ModelLimits>({})
  const [postLinks, setPostLinks] = useState('')
  const [commentCards, setCommentCards] = useState<CommentCard[]>([])
  const [loading, setLoading] = useState(false)
  const [limitHit, setLimitHit] = useState('')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings/prompts/engagement')
      .then((r) => r.json())
      .then((data) => setMasterPrompt(data.prompt ?? ''))
      .catch(() => {})

    fetch('/api/settings/model-limits')
      .then((r) => r.json())
      .then((data) => setLimits(data.limits ?? {}))
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    const links = postLinks.split('\n').map((l) => l.trim()).filter(Boolean)
    if (links.length === 0) return

    setLoading(true)
    setLimitHit('')

    try {
      const res = await fetch('/api/engagement/generate-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postLinks: links,
          postContents: links.map(() => ''),
          platforms: links.map(() => 'linkedin_personal'),
          modelId: selectedModel,
          userId: 'default',
        }),
      })

      if (res.status === 429) {
        const model = LLM_MODELS.find((m) => m.id === selectedModel)
        setLimitHit(model?.name ?? selectedModel)
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data.results) {
        setCommentCards(
          data.results.map((r: { postLink: string; options: CommentOption[] }) => ({
            postLink: r.postLink,
            options: r.options,
            posted: false,
          }))
        )
      }
    } catch (error) {
      console.error('Generation failed:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (cardsRef.current && commentCards.length > 0) {
      gsap.from(cardsRef.current.children, {
        opacity: 0,
        y: 16,
        stagger: 0.08,
        duration: 0.4,
        ease: 'power2.out',
      })
    }
  }, [commentCards.length])

  const handleMarkPosted = async (index: number, selectedOption: number) => {
    setCommentCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, posted: true, selectedOption } : card
      )
    )
  }

  const postedCount = commentCards.filter((c) => c.posted).length
  const totalCount = commentCards.length

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Workflow Header */}
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold text-[#18181B] tracking-tight">
          Engagement Management
        </h1>
        <p className="text-[13px] text-[#7A776E] mt-0.5">
          Generate 3 tailored comment options per LinkedIn network post to build founder authority and relationships.
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

      {/* Assistant Master Prompt */}
      <ChatbotPanel
        workflowName="Engagement"
        masterPrompt={masterPrompt}
        onUpdate={setMasterPrompt}
      />

      {/* Batch Input Card */}
      <Card
        title="Batch Post Links"
        subtitle="Paste 5–30 LinkedIn post URLs (one link per line)"
        action={
          <Button
            variant="dark"
            onClick={handleGenerate}
            disabled={loading || !postLinks.trim()}
            className="inline-flex items-center gap-1.5"
          >
            <FaBolt className="text-xs" />
            <span>{loading ? 'Generating comments...' : 'Generate 3 Options Each'}</span>
          </Button>
        }
      >
        <Textarea
          value={postLinks}
          onChange={setPostLinks}
          rows={5}
          placeholder="https://linkedin.com/posts/example-founder-post-1&#10;https://linkedin.com/posts/example-founder-post-2&#10;https://linkedin.com/posts/example-founder-post-3"
          helpText="Each URL receives 3 distinct angles: (1) Insightful value-add, (2) Engaging question, (3) Contrarian/agreement perspective."
        />
      </Card>

      {/* Progress Tracker */}
      {commentCards.length > 0 && (
        <ProgressBar
          current={postedCount}
          total={totalCount}
          label="LinkedIn Batch Progress"
        />
      )}

      {/* Comment Cards List */}
      <div ref={cardsRef} className="space-y-4">
        {commentCards.map((card, index) => (
          <Card
            key={card.postLink + index}
            className="hover:border-[#151518]/30 transition-all"
            action={
              card.posted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BEE7A5] text-[#193E07] text-[11px] font-bold">
                  <FaRegCircleCheck className="text-xs" />
                  <span>Posted</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#F7F5EE] text-[#7A776E] border border-[#ECE7DD] text-[11px] font-bold">
                  Pending
                </span>
              )
            }
          >
            <div className="mb-3">
              <a
                href={card.postLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-bold text-[#4E85D4] hover:underline break-all inline-flex items-center gap-1.5"
              >
                <FaLink className="text-[11px]" />
                <span>{card.postLink}</span>
              </a>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {card.options.map((opt) => {
                const isSelected = card.selectedOption === opt.option
                const isCopied = copiedText === opt.text

                return (
                  <div
                    key={opt.option}
                    onClick={() => handleMarkPosted(index, opt.option)}
                    className={`p-3.5 rounded-[18px] border transition-all cursor-pointer select-none
                      ${
                        isSelected
                          ? 'bg-[#BEE7A5] border-[#8BC968] text-[#193E07] shadow-xs'
                          : 'bg-[#F7F5EE] border-[#ECE7DD] hover:bg-white hover:border-[#151518]'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                            ${isSelected ? 'bg-[#193E07] text-white' : 'bg-white border border-[#ECE7DD] text-[#18181B]'}`}
                        >
                          {opt.option}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                          {opt.style || `Option ${opt.option}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(opt.text)
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer
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
                    </div>

                    <p className="text-[13px] leading-relaxed">{opt.text}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-3.5">
              <FeedbackActions onAction={() => {}} />
            </div>
          </Card>
        ))}
      </div>

      {/* CSV Export Bar */}
      {commentCards.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            variant="secondary"
            onClick={() => {
              window.open('/api/engagement/export-csv?batchId=current', '_blank')
            }}
            className="inline-flex items-center gap-1.5"
          >
            <FaDownload className="text-xs" />
            <span>Export Batch as CSV</span>
          </Button>
        </div>
      )}
    </div>
  )
}
