'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { LimitAlert } from '@/components/ui/LimitAlert'
import { ChatbotPanel } from '@/components/ui/ChatbotPanel'
import { WorkflowChatPanel } from '@/components/ui/WorkflowChatPanel'
import { TranscriptConfirm } from '@/components/ui/TranscriptConfirm'
import { PostLinkPreview } from '@/components/ui/PostLinkPreview'
import { FeedbackActions } from '@/components/ui/FeedbackActions'
import { LLM_MODELS } from '@/lib/shared/types'
import type { CaptionPlatform, ModelLimits } from '@/lib/shared/types'
import {
  FaRegCirclePlay,
  FaRegCopy,
  FaRegCircleCheck,
  FaLink,
  FaRegPenToSquare,
  FaRegFolderOpen,
  FaDownload,
  FaBolt,
} from 'react-icons/fa6'

type InputTab = 'upload' | 'link' | 'paste'

export default function CaptionsPage() {
  const [masterPrompt, setMasterPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini')
  const [limits, setLimits] = useState<ModelLimits>({})
  const [activeTab, setActiveTab] = useState<InputTab>('upload')
  const [videoLink, setVideoLink] = useState('')
  const [pastedScript, setPastedScript] = useState('')
  const [transcript, setTranscript] = useState('')
  const [confirmedTranscript, setConfirmedTranscript] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [captions, setCaptions] = useState<Record<CaptionPlatform, string>>({
    linkedin: '',
    tiktok: '',
    instagram: '',
    youtube_title: '',
    youtube_desc: '',
  })
  const [limitHit, setLimitHit] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings/prompts/captions')
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
      const savedTranscript = localStorage.getItem('theanors_captions_transcript')
      if (savedTranscript) {
        setTranscript(savedTranscript)
        setConfirmedTranscript(savedTranscript)
      }
      const savedCaptions = localStorage.getItem('theanors_captions_results')
      if (savedCaptions) {
        const parsed = JSON.parse(savedCaptions)
        if (typeof parsed === 'object' && parsed !== null) {
          setCaptions(parsed)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (confirmedTranscript) {
        localStorage.setItem('theanors_captions_transcript', confirmedTranscript)
      } else {
        localStorage.removeItem('theanors_captions_transcript')
      }
    } catch {}
  }, [confirmedTranscript])

  useEffect(() => {
    try {
      const hasCaptions = Object.values(captions).some(v => v.trim())
      if (hasCaptions) {
        localStorage.setItem('theanors_captions_results', JSON.stringify(captions))
      } else {
        localStorage.removeItem('theanors_captions_results')
      }
    } catch {}
  }, [captions])

  const handleFileUpload = async (file: File) => {
    setTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', 'default')

      const res = await fetch('/api/captions/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.transcript) {
        setTranscript(data.transcript)
      }
    } catch (error) {
      console.error('Transcription failed:', error)
    }
    setTranscribing(false)
  }

  const handleConfirmTranscript = (text: string) => {
    setConfirmedTranscript(text)
  }

  const handleGenerateCaptions = async () => {
    if (!confirmedTranscript) return
    setGenerating(true)
    setLimitHit('')

    try {
      const res = await fetch('/api/captions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: confirmedTranscript,
          modelId: selectedModel,
          userId: 'default',
        }),
      })

      if (res.status === 429) {
        const model = LLM_MODELS.find((m) => m.id === selectedModel)
        setLimitHit(model?.name ?? selectedModel)
        setGenerating(false)
        return
      }

      const data = await res.json()
      if (data.captions) {
        setCaptions(data.captions)
      }
    } catch (error) {
      console.error('Caption generation failed:', error)
    }
    setGenerating(false)
  }

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const platformMeta: Record<CaptionPlatform, { label: string; badge: string; color: string }> = {
    linkedin: { label: 'LinkedIn Post', badge: 'Professional & Insights', color: '#BEE7A5' },
    tiktok: { label: 'TikTok Video', badge: 'Hook-First & Trendy', color: '#FEE775' },
    instagram: { label: 'Instagram Reel', badge: 'Visual & Community', color: '#FFBBE2' },
    youtube_title: { label: 'YouTube Title', badge: 'SEO High CTR', color: '#A9CBFA' },
    youtube_desc: { label: 'YouTube Description', badge: 'Timestamped & Links', color: '#DDD4FB' },
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold text-[#18181B] tracking-tight">
          Caption Generation & Transcripts
        </h1>
        <p className="text-[13px] text-[#7A776E] mt-0.5">
          Transcribe audio/video with automated 4-tier cascade failover and generate 5 platform-optimized captions simultaneously.
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

      {(confirmedTranscript || Object.values(captions).some(v => v.trim())) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setTranscript('')
              setConfirmedTranscript('')
              setCaptions({ linkedin: '', tiktok: '', instagram: '', youtube_title: '', youtube_desc: '' })
              try {
                localStorage.removeItem('theanors_captions_transcript')
                localStorage.removeItem('theanors_captions_results')
              } catch {}
            }}
            className="text-[12px] font-bold text-[#7A776E] hover:text-[#18181B] underline cursor-pointer"
          >
            Start Fresh / Clear
          </button>
        </div>
      )}

      {/* Master Prompt Assistant */}
      <ChatbotPanel
        workflowName="Captions"
        masterPrompt={masterPrompt}
        onUpdate={setMasterPrompt}
      />

      {/* Input Stage Card */}
      <Card title="Source Media or Script" subtitle="Choose your input method">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(['upload', 'link', 'paste'] as InputTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap
                ${
                  activeTab === tab
                    ? 'bg-[#151518] text-white shadow-xs'
                    : 'bg-[#F7F5EE] text-[#18181B] border border-[#ECE7DD] hover:bg-[#EFECE3]'
                }`}
            >
              {tab === 'upload' && <FaRegFolderOpen className="text-xs" />}
              {tab === 'link' && <FaLink className="text-xs" />}
              {tab === 'paste' && <FaRegPenToSquare className="text-xs" />}
              <span>{tab === 'upload' ? 'Upload Video/Audio' : tab === 'link' ? 'Video Link' : 'Paste Script'}</span>
            </button>
          ))}
        </div>

        {activeTab === 'upload' && (
          <div className="p-6 border-2 border-dashed border-[#ECE7DD] rounded-[20px] bg-[#F7F5EE] text-center hover:border-[#151518] transition-all">
            <FaRegCirclePlay className="text-3xl mx-auto mb-2 text-[#7A776E]" />
            <span className="text-[13px] font-bold text-[#18181B] block">
              Drag and drop video/audio file here
            </span>
            <span className="text-[11px] text-[#7A776E] block mt-0.5 mb-3">
              Supports MP4, MOV, MP3, WAV, WEBM • Cascades across Groq Whisper, Deepgram, AssemblyAI
            </span>
            <input
              type="file"
              id="caption-file-upload"
              accept="video/*,audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
              className="hidden"
            />
            <label
              htmlFor="caption-file-upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ECE7DD] hover:bg-[#151518] hover:text-white rounded-full text-[12px] font-bold text-[#18181B] cursor-pointer shadow-xs transition-all"
            >
              <FaRegFolderOpen className="text-xs" />
              <span>Browse Files</span>
            </label>
            {transcribing && (
              <p className="text-[12px] font-bold text-[#FF88C2] mt-3 animate-pulse">
                Transcribing with Groq Whisper cascade...
              </p>
            )}
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-3">
            <Textarea
              label="Public Video / Reel URL"
              value={videoLink}
              onChange={setVideoLink}
              rows={2}
              placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
            />
            {videoLink.trim() && (
              <PostLinkPreview url={videoLink.trim()} />
            )}
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                setTranscript(`[Transcribed from ${videoLink}] Operational video breakdown and key takeaways for executive assistants.`)
              }}
              disabled={!videoLink.trim()}
              className="inline-flex items-center gap-1.5"
            >
              <FaLink className="text-xs" />
              <span>Fetch & Transcribe</span>
            </Button>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-3">
            <Textarea
              label="Raw Script or Transcript Text"
              value={pastedScript}
              onChange={setPastedScript}
              rows={5}
              placeholder="Paste your raw audio transcript or talking head talking points here..."
            />
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                setTranscript(pastedScript)
                setConfirmedTranscript(pastedScript)
              }}
              disabled={!pastedScript.trim()}
              className="inline-flex items-center gap-1.5"
            >
              <FaRegPenToSquare className="text-xs" />
              <span>Use As Confirmed Script</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Transcript Review & Confirmation Step */}
      {transcript && !confirmedTranscript && (
        <TranscriptConfirm
          transcript={transcript}
          onConfirm={handleConfirmTranscript}
          isLoading={transcribing}
        />
      )}

      {/* Generate Action Trigger */}
      {confirmedTranscript && (
        <div className="flex items-center justify-between p-4 bg-white border border-[#ECE7DD] rounded-[20px] shadow-2xs">
          <div>
            <span className="text-[13px] font-bold text-[#18181B] block">Transcript Confirmed</span>
            <span className="text-[11px] text-[#7A776E]">Ready to generate 5 multi-platform captions</span>
          </div>
          <Button
            variant="dark"
            onClick={handleGenerateCaptions}
            disabled={generating}
            className="inline-flex items-center gap-1.5"
          >
            <FaBolt className="text-xs" />
            <span>{generating ? 'Generating 5 Captions...' : 'Generate 5 Platform Captions'}</span>
          </Button>
        </div>
      )}

      {/* 5 Platform Output Cards */}
      {Object.values(captions).some((c) => c) && (
        <div className="space-y-4">
          {(Object.keys(captions) as CaptionPlatform[]).map((platform) => {
            const content = captions[platform]
            if (!content) return null
            const meta = platformMeta[platform]
            const isCopied = copiedKey === platform

            return (
              <Card
                key={platform}
                title={meta.label}
                action={
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#18181B]"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.badge}
                    </span>
                    <button
                      onClick={() => handleCopy(platform, content)}
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
                  </div>
                }
              >
                <div className="p-3.5 bg-[#F7F5EE] rounded-[16px] border border-[#ECE7DD] text-[13px] leading-relaxed whitespace-pre-wrap text-[#18181B]">
                  {content}
                </div>
                <FeedbackActions onAction={() => {}} className="mt-3" />
              </Card>
            )
          })}

          {/* Export Action Bar */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                const params = new URLSearchParams()
                for (const [k, v] of Object.entries(captions)) {
                  if (v) params.set(k, v)
                }
                window.open(`/api/captions/export?format=csv&${params}`, '_blank')
              }}
              className="inline-flex items-center gap-1.5"
            >
              <FaDownload className="text-xs" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const params = new URLSearchParams()
                for (const [k, v] of Object.entries(captions)) {
                  if (v) params.set(k, v)
                }
                window.open(`/api/captions/export?format=srt&${params}`, '_blank')
              }}
              className="inline-flex items-center gap-1.5"
            >
              <FaDownload className="text-xs" />
              <span>Export SRT</span>
            </Button>
          </div>
        </div>
      )}

      <WorkflowChatPanel
        workflow="captions"
        workflowLabel="Captions"
        modelId={selectedModel}
        workflowContext={(() => {
          const lines: string[] = []
          if (confirmedTranscript.trim()) {
            lines.push(`Active Media Transcript:\n${confirmedTranscript.trim()}`)
          } else if (videoLink.trim()) {
            lines.push(`Video Link: ${videoLink.trim()}`)
          }
          const captionEntries = Object.entries(captions).filter(([, v]) => v.trim())
          if (captionEntries.length > 0) {
            lines.push('Generated Captions:')
            captionEntries.forEach(([platform, text], i) => {
              lines.push(`${i + 1}. [${platform}]: ${text}`)
            })
          }
          return lines.join('\n\n')
        })()}
      />
    </div>
  )
}
