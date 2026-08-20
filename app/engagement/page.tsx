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
import { WorkflowChatPanel } from '@/components/ui/WorkflowChatPanel'
import { FeedbackActions } from '@/components/ui/FeedbackActions'
import { PostLinkPreview } from '@/components/ui/PostLinkPreview'
import { LLM_MODELS } from '@/lib/shared/types'
import type { CommentOption, ModelLimits, FeedbackAction } from '@/lib/shared/types'
import {
  FaRegCopy,
  FaRegCircleCheck,
  FaBolt,
  FaLink,
  FaDownload,
  FaXmark,
  FaPenToSquare,
  FaRegBookmark,
} from 'react-icons/fa6'

interface CommentCard {
  id: string
  postLink: string
  options: CommentOption[]
  selectedOption?: number
  posted: boolean
}

export default function EngagementPage() {
  const [masterPrompt, setMasterPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini')
  const [limits, setLimits] = useState<ModelLimits>({})
  const [postLinks, setPostLinks] = useState('')
  const [commentCards, setCommentCards] = useState<CommentCard[]>([])
  const [loading, setLoading] = useState(false)
  const [limitHit, setLimitHit] = useState('')
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [editingState, setEditingState] = useState<{
    cardId: string
    optionNumber: number
    text: string
  } | null>(null)

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

  // Restore persisted state on mount
  useEffect(() => {
    try {
      const savedLinks = localStorage.getItem('theanors_engagement_postLinks')
      if (savedLinks) setPostLinks(savedLinks)

      const savedCards = localStorage.getItem('theanors_engagement_cards')
      if (savedCards) {
        const parsed = JSON.parse(savedCards)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCommentCards(parsed)
        }
      }
    } catch {}
  }, [])

  // Auto-save postLinks
  useEffect(() => {
    try {
      if (postLinks) {
        localStorage.setItem('theanors_engagement_postLinks', postLinks)
      } else {
        localStorage.removeItem('theanors_engagement_postLinks')
      }
    } catch {}
  }, [postLinks])

  // Auto-save commentCards
  useEffect(() => {
    try {
      if (commentCards.length > 0) {
        localStorage.setItem('theanors_engagement_cards', JSON.stringify(commentCards))
      } else {
        localStorage.removeItem('theanors_engagement_cards')
      }
    } catch {}
  }, [commentCards])

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
      if (data.results && Array.isArray(data.results)) {
        setCommentCards(
          data.results.map((r: { postLink: string; options: CommentOption[] }, idx: number) => ({
            id: `card-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
            postLink: r.postLink,
            options: r.options || [],
            posted: false,
          }))
        )
      }
    } catch (error) {
      console.error('Generation failed:', error)
    }

    setLoading(false)
  }

  const handleMarkPosted = (cardId: string, selectedOption: number) => {
    setCommentCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              posted: card.selectedOption === selectedOption && card.posted ? false : true,
              selectedOption: card.selectedOption === selectedOption && card.posted ? undefined : selectedOption,
            }
          : card
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

  const handleRejectOption = (cardId: string, optionNumber: number) => {
    setCommentCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              options: card.options.filter((o) => o.option !== optionNumber),
              selectedOption: card.selectedOption === optionNumber ? undefined : card.selectedOption,
            }
          : card
      )
    )
  }

  const handleSaveEditedText = (cardId: string, optionNumber: number, newText: string) => {
    setCommentCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              options: card.options.map((o) =>
                o.option === optionNumber ? { ...o, text: newText.trim() } : o
              ),
            }
          : card
      )
    )
    setEditingState(null)
  }

  const handleFeedbackAction = (cardId: string, action: FeedbackAction) => {
    const card = commentCards.find((c) => c.id === cardId)
    if (!card || card.options.length === 0) return

    const selectedOpt =
      card.options.find((o) => o.option === (card.selectedOption || card.options[0].option)) ||
      card.options[0]

    if (action === 'accept') {
      handleMarkPosted(cardId, selectedOpt.option)
    } else if (action === 'edit') {
      setEditingState({
        cardId,
        optionNumber: selectedOpt.option,
        text: selectedOpt.text,
      })
    } else if (action === 'keep_in_memory') {
      fetch('/api/settings/prompt-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: 'engagement',
          currentPrompt: masterPrompt,
          userMessage: `Remember this approved comment style: "${selectedOpt.text.slice(0, 140)}"`,
          history: [],
        }),
      }).catch(() => {})
      setCopiedText(`memory-${cardId}`)
      setTimeout(() => setCopiedText(null), 2500)
    } else if (action === 'forget') {
      setCommentCards((prev) => prev.filter((c) => c.id !== cardId))
    }
  }

  const handleStartNewBatch = () => {
    if (commentCards.length > 0 && !confirm('Start a new batch? This will clear current generated comments.')) {
      return
    }
    setPostLinks('')
    setCommentCards([])
    try {
      localStorage.removeItem('theanors_engagement_postLinks')
      localStorage.removeItem('theanors_engagement_cards')
    } catch {}
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

        {/* Link previews */}
        {postLinks.split('\n').filter((l) => l.trim()).length > 0 && (
          <div className="mt-3 space-y-2">
            {postLinks
              .split('\n')
              .filter((l) => l.trim())
              .slice(0, 10)
              .map((link, i) => (
                <PostLinkPreview key={i} url={link.trim()} />
              ))}
          </div>
        )}
      </Card>

      {/* Progress & Batch Summary */}
      {commentCards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold px-1">
            <span className="text-[#193E07] inline-flex items-center gap-1.5 bg-[#BEE7A5]/60 px-2.5 py-1 rounded-full border border-[#8BC968]/40">
              <FaRegCircleCheck className="text-xs text-[#193E07]" />
              <span>All {totalCount} Posts Generated ({totalCount * 3} Comment Options Ready)</span>
            </span>
            <span className="text-[#7A776E]">
              {postedCount} of {totalCount} posted to LinkedIn
            </span>
          </div>

          <ProgressBar
            current={postedCount}
            total={totalCount}
            label="LinkedIn Review & Posting Progress"
          />
        </div>
      )}

      {/* Comment Cards List */}
      <div className="space-y-4">
        {commentCards.map((card) => (
          <Card
            key={card.id}
            className="hover:border-[#151518]/30 transition-all shadow-xs"
            action={
              card.posted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BEE7A5] text-[#193E07] text-[11px] font-bold">
                  <FaRegCircleCheck className="text-xs" />
                  <span>Posted</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#F7F5EE] text-[#7A776E] border border-[#ECE7DD] text-[11px] font-bold">
                  Ready to Post
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
                const isEditing =
                  editingState?.cardId === card.id &&
                  editingState?.optionNumber === opt.option

                return (
                  <div
                    key={opt.option}
                    onClick={() => handleMarkPosted(card.id, opt.option)}
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

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingState({
                              cardId: card.id,
                              optionNumber: opt.option,
                              text: opt.text,
                            })
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border border-[#ECE7DD] bg-white hover:bg-[#F7F5EE] text-[#18181B] cursor-pointer"
                          title="Edit this option"
                        >
                          <FaPenToSquare className="text-[10px]" />
                          <span>Edit</span>
                        </button>

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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRejectOption(card.id, opt.option)
                          }}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-[#FEE775] text-[#7A776E] hover:text-[#18181B] border border-[#ECE7DD] transition-all cursor-pointer"
                          title="Reject option"
                        >
                          <FaXmark className="text-[10px]" />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={editingState.text}
                          onChange={(e) =>
                            setEditingState({ ...editingState, text: e.target.value })
                          }
                          className="w-full p-3 bg-white border border-[#151518] rounded-[14px] text-[13px] leading-relaxed outline-hidden focus:ring-1 focus:ring-[#151518]"
                          rows={4}
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingState(null)}
                            className="px-3 py-1 bg-white hover:bg-[#F7F5EE] border border-[#ECE7DD] rounded-full text-[11px] font-bold text-[#7A776E] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveEditedText(card.id, opt.option, editingState.text)
                            }
                            className="px-3.5 py-1 bg-[#151518] hover:bg-[#28282D] text-white rounded-full text-[11px] font-bold shadow-xs cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13px] leading-relaxed font-normal whitespace-pre-wrap">
                        {opt.text}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {copiedText === `memory-${card.id}` && (
              <div className="mt-2.5 p-2 bg-[#FFBBE2]/50 text-[#4C0028] rounded-[12px] text-[11px] font-bold flex items-center gap-1.5 border border-[#FF88C2]/40">
                <FaRegBookmark className="text-[10px]" />
                <span>Saved to AI Learning Memory!</span>
              </div>
            )}

            <div className="mt-3.5">
              <FeedbackActions onAction={(action) => handleFeedbackAction(card.id, action)} />
            </div>
          </Card>
        ))}
      </div>

      {/* Batch Actions Bar */}
      {commentCards.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleStartNewBatch}
            className="text-[12px] font-bold text-[#7A776E] hover:text-[#18181B] underline cursor-pointer"
          >
            Start New Batch / Clear
          </button>
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

      <WorkflowChatPanel
        workflow="engagement"
        workflowLabel="Engagement"
        modelId={selectedModel}
        workflowContext={(() => {
          const lines: string[] = []
          if (postLinks.trim()) {
            lines.push(`Active Batch Post Links Input:\n${postLinks.trim()}`)
          }
          if (commentCards.length > 0) {
            lines.push(
              `Generated Comment Cards (${commentCards.length} posts):\n` +
                commentCards
                  .map(
                    (c, i) =>
                      `Post #${i + 1} (${c.postLink}):\n` +
                      c.options
                        .map((o) => `  Option ${o.option} (${o.style || 'Custom'}):\n  ${o.text}`)
                        .join('\n\n') +
                      `\n  Status: ${c.posted ? `Posted (Selected Option ${c.selectedOption})` : 'Ready to post'}`
                  )
                  .join('\n\n---\n\n')
            )
          }
          return lines.join('\n\n')
        })()}
      />
    </div>
  )
}
