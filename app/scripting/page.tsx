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
import { FeedbackActions } from '@/components/ui/FeedbackActions'
import { LLM_MODELS } from '@/lib/shared/types'
import type { ScriptType, ModelLimits } from '@/lib/shared/types'
import {
  FaRegLightbulb,
  FaLink,
  FaRegFolderOpen,
  FaRegUser,
  FaRegImages,
  FaRegFileLines,
  FaRegComments,
  FaDownload,
  FaBolt,
} from 'react-icons/fa6'

type InputMode = 'topic' | 'video' | 'upload'

export default function ScriptingPage() {
  const [masterPrompt, setMasterPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini')
  const [limits, setLimits] = useState<ModelLimits>({})
  const [inputMode, setInputMode] = useState<InputMode>('topic')
  const [topic, setTopic] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [transcript, setTranscript] = useState('')
  const [confirmedTranscript, setConfirmedTranscript] = useState('')
  const [angles, setAngles] = useState<string[]>([])
  const [selectedAngle, setSelectedAngle] = useState('')
  const [scriptType, setScriptType] = useState<ScriptType>('talking_head')
  const [generatedScript, setGeneratedScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [limitHit, setLimitHit] = useState('')

  useEffect(() => {
    fetch('/api/settings/prompts/scripting')
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
      const saved = localStorage.getItem('theanors_scripting_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.topic) setTopic(parsed.topic)
        if (parsed.confirmedTranscript) setConfirmedTranscript(parsed.confirmedTranscript)
        if (parsed.selectedAngle) setSelectedAngle(parsed.selectedAngle)
        if (parsed.scriptType) setScriptType(parsed.scriptType)
        if (parsed.generatedScript) setGeneratedScript(parsed.generatedScript)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const hasState = topic || confirmedTranscript || generatedScript
      if (hasState) {
        localStorage.setItem('theanors_scripting_state', JSON.stringify({
          topic,
          confirmedTranscript,
          selectedAngle,
          scriptType,
          generatedScript,
        }))
      } else {
        localStorage.removeItem('theanors_scripting_state')
      }
    } catch {}
  }, [topic, confirmedTranscript, selectedAngle, scriptType, generatedScript])

  const handleBrainstorm = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setLimitHit('')
    try {
      const res = await fetch('/api/scripting/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, modelId: selectedModel, userId: 'default' }),
      })
      if (res.status === 429) {
        setLimitHit(LLM_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel)
        setLoading(false)
        return
      }
      const data = await res.json()
      setAngles(data.angles ?? [])
    } catch (error) {
      console.error('Brainstorm failed:', error)
    }
    setLoading(false)
  }

  const handleRepurpose = async () => {
    if (!confirmedTranscript) return
    setLoading(true)
    setLimitHit('')
    try {
      const res = await fetch('/api/scripting/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: confirmedTranscript, modelId: selectedModel, userId: 'default' }),
      })
      if (res.status === 429) {
        setLimitHit(LLM_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel)
        setLoading(false)
        return
      }
      const data = await res.json()
      setAngles(data.angles ?? [])
    } catch (error) {
      console.error('Repurpose failed:', error)
    }
    setLoading(false)
  }

  const handleGenerateScript = async () => {
    if (!selectedAngle) return
    setLoading(true)
    setLimitHit('')
    try {
      const res = await fetch('/api/scripting/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle: selectedAngle, type: scriptType, modelId: selectedModel, userId: 'default' }),
      })
      if (res.status === 429) {
        setLimitHit(LLM_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel)
        setLoading(false)
        return
      }
      const data = await res.json()
      setGeneratedScript(data.script ?? '')
    } catch (error) {
      console.error('Script generation failed:', error)
    }
    setLoading(false)
  }

  const handleExport = async (format: string) => {
    const res = await fetch('/api/scripting/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: generatedScript, format, title: `script-${scriptType}` }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `script.${format === 'word' ? 'docx' : format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const scriptTypes: { value: ScriptType; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'talking_head', label: 'Talking Head', icon: <FaRegUser className="text-base" />, desc: 'Direct-to-camera with 3s viral hook' },
    { value: 'carousel', label: 'Carousel', icon: <FaRegImages className="text-base" />, desc: 'Step-by-step slides for LinkedIn/IG' },
    { value: 'flyer', label: 'Flyer / One-Pager', icon: <FaRegFileLines className="text-base" />, desc: 'Punchy summary graphic script' },
    { value: 'trend_acting', label: 'Trend Acting', icon: <FaRegComments className="text-base" />, desc: 'POV / Dialogue / Relatable scenario' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold text-[#18181B] tracking-tight">
          Content Scripting Engine
        </h1>
        <p className="text-[13px] text-[#7A776E] mt-0.5">
          Brainstorm angles from raw ideas or repurpose video transcripts into 4 viral content formats.
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

      {(topic || confirmedTranscript || generatedScript) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setTopic('')
              setConfirmedTranscript('')
              setSelectedAngle('')
              setGeneratedScript('')
              try { localStorage.removeItem('theanors_scripting_state') } catch {}
            }}
            className="text-[12px] font-bold text-[#7A776E] hover:text-[#18181B] underline cursor-pointer"
          >
            Start Fresh / Clear
          </button>
        </div>
      )}

      {/* Master Prompt Assistant */}
      <ChatbotPanel
        workflowName="Scripting"
        masterPrompt={masterPrompt}
        onUpdate={setMasterPrompt}
      />

      {/* Step 1: Input Source */}
      <Card title="Step 1: Input Source" subtitle="Choose topic or repurpose existing video">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(['topic', 'video', 'upload'] as InputMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap
                ${
                  inputMode === mode
                    ? 'bg-[#151518] text-white shadow-xs'
                    : 'bg-[#F7F5EE] text-[#18181B] border border-[#ECE7DD] hover:bg-[#EFECE3]'
                }`}
            >
              {mode === 'topic' && <FaRegLightbulb className="text-xs" />}
              {mode === 'video' && <FaLink className="text-xs" />}
              {mode === 'upload' && <FaRegFolderOpen className="text-xs" />}
              <span>{mode === 'topic' ? 'Text Topic' : mode === 'video' ? 'Video Link' : 'Upload Video'}</span>
            </button>
          ))}
        </div>

        {inputMode === 'topic' && (
          <div className="space-y-3">
            <Textarea
              label="Core Topic or Raw Idea"
              value={topic}
              onChange={setTopic}
              rows={3}
              placeholder="e.g. Why most founders fail at daily delegating, and how executive assistants can run content ops..."
            />
            <Button
              variant="dark"
              onClick={handleBrainstorm}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-1.5"
            >
              <FaBolt className="text-xs" />
              <span>{loading ? 'Brainstorming angles...' : 'Brainstorm Strategic Angles'}</span>
            </Button>
          </div>
        )}

        {inputMode === 'video' && (
          <div className="space-y-3">
            <Textarea
              label="Public Video / Reel URL"
              value={videoLink}
              onChange={setVideoLink}
              rows={2}
              placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
            />
            <Button
              variant="dark"
              onClick={() => {
                setTranscript(`[Transcribed Video] Delegation and operational management framework for executive assistants.`)
                setConfirmedTranscript(`[Transcribed Video] Delegation and operational management framework for executive assistants.`)
                handleRepurpose()
              }}
              disabled={!videoLink.trim()}
              className="inline-flex items-center gap-1.5"
            >
              <FaLink className="text-xs" />
              <span>Fetch & Repurpose</span>
            </Button>
          </div>
        )}

        {inputMode === 'upload' && (
          <div className="p-6 border-2 border-dashed border-[#ECE7DD] rounded-[20px] bg-[#F7F5EE] text-center hover:border-[#151518] transition-all">
            <FaRegFolderOpen className="text-3xl mx-auto mb-2 text-[#7A776E]" />
            <span className="text-[13px] font-bold text-[#18181B] block">
              Upload Video to Extract Angles
            </span>
            <input
              type="file"
              id="script-file-upload"
              accept="video/*,audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setLoading(true)
                const formData = new FormData()
                formData.append('file', file)
                formData.append('userId', 'default')
                try {
                  const res = await fetch('/api/captions/transcribe', { method: 'POST', body: formData })
                  const data = await res.json()
                  if (data.transcript) {
                    setTranscript(data.transcript)
                  }
                } catch (error) {
                  console.error('Transcription failed:', error)
                }
                setLoading(false)
              }}
              className="hidden"
            />
            <label
              htmlFor="script-file-upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-3 bg-white border border-[#ECE7DD] hover:bg-[#151518] hover:text-white rounded-full text-[12px] font-bold text-[#18181B] cursor-pointer shadow-xs transition-all"
            >
              <FaRegFolderOpen className="text-xs" />
              <span>Choose Video File</span>
            </label>
          </div>
        )}
      </Card>

      {/* Transcript Review if from video */}
      {transcript && !confirmedTranscript && (
        <TranscriptConfirm
          transcript={transcript}
          onConfirm={(text) => {
            setConfirmedTranscript(text)
            handleRepurpose()
          }}
          isLoading={loading}
        />
      )}

      {/* Step 2: Select Angle */}
      {angles.length > 0 && (
        <Card title="Step 2: Select Strategic Angle" subtitle="Click an angle to choose it for script generation">
          <div className="space-y-2.5">
            {angles.map((angle, i) => {
              const isSelected = selectedAngle === angle
              return (
                <div
                  key={i}
                  onClick={() => setSelectedAngle(angle)}
                  className={`p-3.5 rounded-[18px] border transition-all cursor-pointer select-none
                    ${
                      isSelected
                        ? 'bg-[#BEE7A5] border-[#8BC968] text-[#193E07] shadow-xs'
                        : 'bg-[#F7F5EE] border-[#ECE7DD] hover:bg-white hover:border-[#151518]'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#ECE7DD] text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-medium leading-relaxed">{angle}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Step 3: Choose Format & Generate */}
      {selectedAngle && (
        <Card title="Step 3: Choose Format & Generate" subtitle="Select the video output format">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {scriptTypes.map((st) => {
              const isSelected = scriptType === st.value
              return (
                <div
                  key={st.value}
                  onClick={() => setScriptType(st.value)}
                  className={`p-3.5 rounded-[20px] border cursor-pointer transition-all select-none
                    ${
                      isSelected
                        ? 'bg-[#FEE775] border-[#E6CF4B] text-[#3D3200] shadow-xs'
                        : 'bg-[#F7F5EE] border-[#ECE7DD] hover:bg-white'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {st.icon}
                    <span className="text-[13px] font-bold">{st.label}</span>
                  </div>
                  <p className="text-[11px] opacity-80">{st.desc}</p>
                </div>
              )
            })}
          </div>

          <Button
            variant="dark"
            onClick={handleGenerateScript}
            disabled={loading}
            className="inline-flex items-center gap-1.5"
          >
            <FaBolt className="text-xs" />
            <span>{loading ? 'Generating complete script...' : 'Generate Structured Script'}</span>
          </Button>
        </Card>
      )}

      {/* Step 4: Output Script Card */}
      {generatedScript && (
        <Card
          title="Generated Video Script"
          subtitle={`Format: ${scriptTypes.find((s) => s.value === scriptType)?.label}`}
        >
          <div className="p-4 bg-[#F7F5EE] rounded-[18px] border border-[#ECE7DD] text-[13px] leading-relaxed whitespace-pre-wrap text-[#18181B]">
            {generatedScript}
          </div>

          <FeedbackActions onAction={() => {}} className="mt-3.5" />

          {/* Export Actions */}
          <div className="mt-4 flex flex-wrap gap-2 justify-end pt-3 border-t border-[#ECE7DD]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('markdown')}
              className="inline-flex items-center gap-1.5"
            >
              <FaDownload className="text-xs" />
              <span>Export Markdown</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center gap-1.5"
            >
              <FaDownload className="text-xs" />
              <span>Export PDF</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('word')}
              className="inline-flex items-center gap-1.5"
            >
              <FaDownload className="text-xs" />
              <span>Export Word (.docx)</span>
            </Button>
          </div>
        </Card>
      )}

      <WorkflowChatPanel
        workflow="scripting"
        workflowLabel="Scripting"
        modelId={selectedModel}
        workflowContext={(() => {
          const lines: string[] = []
          if (topic.trim()) lines.push(`Content Topic: ${topic.trim()}`)
          if (videoLink.trim()) lines.push(`Source Video: ${videoLink.trim()}`)
          if (confirmedTranscript.trim()) lines.push(`Confirmed Transcript:\n${confirmedTranscript.trim()}`)
          if (selectedAngle) lines.push(`Selected Angle: ${selectedAngle}`)
          lines.push(`Format: ${scriptType.replace(/_/g, ' ')}`)
          if (generatedScript.trim()) lines.push(`Generated Script:\n${generatedScript.trim()}`)
          return lines.join('\n\n')
        })()}
      />
    </div>
  )
}
