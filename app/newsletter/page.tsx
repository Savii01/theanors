'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { LimitAlert } from '@/components/ui/LimitAlert'
import { ChatbotPanel } from '@/components/ui/ChatbotPanel'
import { FeedbackActions } from '@/components/ui/FeedbackActions'
import { LLM_MODELS } from '@/lib/shared/types'
import type { ThemeRecord, ModelLimits } from '@/lib/shared/types'
import type { ValidationResult } from '@/lib/modules/newsletter/newsletter.types'
import {
  FaRegFileExcel,
  FaRegLightbulb,
  FaRegCircleCheck,
  FaPlus,
  FaXmark,
  FaDownload,
  FaMagnifyingGlass,
  FaBolt,
  FaRegNewspaper,
  FaRegTrashCan,
} from 'react-icons/fa6'

type NewsletterTab = 'themes' | 'compose'

export default function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<NewsletterTab>('themes')
  const [masterPrompt, setMasterPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('allam-2-7b')
  const [limits, setLimits] = useState<ModelLimits>({})
  const [themeHistory, setThemeHistory] = useState<ThemeRecord[]>([])
  const [generatedThemes, setGeneratedThemes] = useState<string[]>([])
  const [selectedTheme, setSelectedTheme] = useState('')
  const [customTheme, setCustomTheme] = useState('')
  const [postLinks, setPostLinks] = useState<string[]>(['', ''])
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [newsletterContent, setNewsletterContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [limitHit, setLimitHit] = useState('')

  useEffect(() => {
    fetch('/api/settings/prompts/newsletter')
      .then((r) => r.json())
      .then((data) => setMasterPrompt(data.prompt ?? ''))
      .catch(() => {})

    fetch('/api/settings/model-limits')
      .then((r) => r.json())
      .then((data) => setLimits(data.limits ?? {}))
      .catch(() => {})

    // Load persisted theme history from Neon DB
    fetch('/api/newsletter/theme-history')
      .then((r) => r.json())
      .then((data) => {
        if (data.themes?.length > 0) {
          setThemeHistory(data.themes)
        }
      })
      .catch(() => {})
  }, [])

  const handleExcelUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/newsletter/upload-excel', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) {
        console.error('Excel upload error:', data.error)
        return
      }
      // Merge with any existing history (DB may already have some)
      setThemeHistory((prev) => {
        const existing = new Set(prev.map((t) => t.theme))
        const newThemes = (data.themes ?? []).filter((t: { theme: string }) => !existing.has(t.theme))
        return [...prev, ...newThemes]
      })
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleGenerateThemes = async () => {
    setLoading(true)
    setLimitHit('')
    try {
      const res = await fetch('/api/newsletter/generate-themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeHistory, modelId: selectedModel, userId: 'default' }),
      })
      if (res.status === 429) {
        setLimitHit(LLM_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel)
        setLoading(false)
        return
      }
      const data = await res.json()
      setGeneratedThemes(data.themes ?? [])
    } catch (error) {
      console.error('Generate themes failed:', error)
    }
    setLoading(false)
  }

  const handleDeleteTheme = (index: number) => {
    setGeneratedThemes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearAllThemes = () => {
    setGeneratedThemes([])
  }

  const handleClearThemeHistory = async () => {
    setThemeHistory([])
    try {
      await fetch('/api/newsletter/theme-history', { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete theme history from DB:', err)
    }
  }

  const handleValidate = async () => {
    const theme = customTheme || selectedTheme
    const links = postLinks.filter((l) => l.trim())
    if (!theme || links.length < 2) return

    setLoading(true)
    setLimitHit('')
    try {
      const res = await fetch('/api/newsletter/validate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, postLinks: links, modelId: selectedModel, userId: 'default' }),
      })
      if (res.status === 429) {
        setLimitHit(LLM_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (res.ok && data && Array.isArray(data.posts)) {
        setValidation(data)
      } else {
        console.error('Validation error response:', data)
      }
    } catch (error) {
      console.error('Validate failed:', error)
    }
    setLoading(false)
  }

  const handleGenerateContent = async () => {
    const theme = customTheme || selectedTheme
    const links = postLinks.filter((l) => l.trim())
    if (!theme || links.length < 2) return

    setLoading(true)
    setLimitHit('')
    try {
      const res = await fetch('/api/newsletter/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, posts: links, modelId: selectedModel, userId: 'default' }),
      })
      if (res.status === 429) {
        setLimitHit(LLM_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (res.ok && data?.content) {
        setNewsletterContent(data.content)
      }
    } catch (error) {
      console.error('Generate content failed:', error)
    }
    setLoading(false)
  }

  const handleExportWord = async () => {
    const res = await fetch('/api/newsletter/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newsletterContent }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'weekly-newsletter.docx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold text-[#18181B] tracking-tight">
          Newsletter Operations
        </h1>
        <p className="text-[13px] text-[#7A776E] mt-0.5">
          Two dedicated operations: (1) Generate & curate fresh themes from historical memory, and (2) Synthesize weekly editions from approved themes and posts.
        </p>
      </div>

      {/* Primary Workflow Sub-Mode Switcher */}
      <div className="flex gap-2 p-1.5 bg-white border border-[#ECE7DD] rounded-full shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap
            ${
              activeTab === 'themes'
                ? 'bg-[#151518] text-white shadow-xs'
                : 'text-[#7A776E] hover:text-[#18181B] hover:bg-[#F7F5EE]'
            }`}
        >
          <FaRegLightbulb className="text-xs" />
          <span>Job 1: Theme Memory & Idea Generator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap
            ${
              activeTab === 'compose'
                ? 'bg-[#151518] text-white shadow-xs'
                : 'text-[#7A776E] hover:text-[#18181B] hover:bg-[#F7F5EE]'
            }`}
        >
          <FaRegNewspaper className="text-xs" />
          <span>Job 2: Draft Newsletter from Theme</span>
        </button>
      </div>

      {/* Model Selector & Limit Alert */}
      <ModelSelector
        models={LLM_MODELS}
        selected={selectedModel}
        onSelect={setSelectedModel}
        limits={limits}
      />

      {limitHit && <LimitAlert modelName={limitHit} />}

      {/* Master Prompt Assistant */}
      <ChatbotPanel
        workflowName="Newsletter"
        masterPrompt={masterPrompt}
        onUpdate={setMasterPrompt}
      />

      {/* =========================================================================
          JOB 1: THEME MEMORY & IDEA GENERATION
          ========================================================================= */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          {/* Historical Sheet Upload */}
          <Card
            title="Historical Theme Memory (.xlsx / .csv)"
            subtitle="Upload your tracking sheet for automatic local parsing (no external Google Sheets API required)"
          >
            <div className="p-6 border-2 border-dashed border-[#ECE7DD] rounded-[20px] bg-[#F7F5EE] text-center hover:border-[#151518] transition-all">
              <FaRegFileExcel className="text-3xl mx-auto mb-2 text-[#4C7C2C]" />
              <span className="text-[13px] font-bold text-[#18181B] block">
                Upload Historical Theme Tracker
              </span>
              <span className="text-[11px] text-[#7A776E] block mt-0.5 mb-3">
                Analyzes historical topics and ratings to prevent repetition and identify viral patterns
              </span>
              <input
                type="file"
                id="excel-upload-tab"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleExcelUpload(f)
                }}
                className="hidden"
              />
              <label
                htmlFor="excel-upload-tab"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ECE7DD] hover:bg-[#151518] hover:text-white rounded-full text-[12px] font-bold text-[#18181B] cursor-pointer shadow-xs transition-all"
              >
                <FaRegFileExcel className="text-xs" />
                <span>Select Spreadsheet</span>
              </label>
            </div>

            {themeHistory.length > 0 && (
              <div className="mt-3 p-3 bg-[#BEE7A5] text-[#193E07] rounded-[16px] text-[12px] font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaRegCircleCheck className="text-sm" />
                  <span>Loaded {themeHistory.length} historical theme records into active memory</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearThemeHistory}
                  title="Clear loaded spreadsheet memory"
                  className="p-1 text-[#193E07] hover:text-[#C20067] cursor-pointer"
                >
                  <FaRegTrashCan className="text-xs" />
                </button>
              </div>
            )}
          </Card>

          {/* Theme Generator */}
          <Card
            title="Generate Fresh Weekly Theme Angles"
            subtitle="Synthesizes unaddressed angles and strategic frameworks from your brand memory"
            action={
              <div className="flex items-center gap-2">
                {generatedThemes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllThemes}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#FFBBE2] text-[#18181B] hover:text-[#4C0028] text-[11px] font-bold rounded-full border border-[#ECE7DD] transition-all cursor-pointer"
                    title="Delete all generated themes"
                  >
                    <FaRegTrashCan className="text-[10px]" />
                    <span>Clear All</span>
                  </button>
                )}
                <Button
                  variant="dark"
                  size="sm"
                  onClick={handleGenerateThemes}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5"
                >
                  <FaRegLightbulb className="text-xs" />
                  <span>{loading ? 'Brainstorming...' : 'Generate 5 Theme Ideas'}</span>
                </Button>
              </div>
            }
          >
            {generatedThemes.length > 0 ? (
              <div className="space-y-2.5">
                {generatedThemes.map((theme, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-[18px] flex items-center justify-between gap-3 hover:bg-white transition-all group"
                  >
                    <span className="text-[13px] font-medium text-[#18181B] flex-1">{theme}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteTheme(i)}
                        title="Delete this theme"
                        className="w-8 h-8 rounded-full bg-white hover:bg-[#FFBBE2] text-[#9E9B92] hover:text-[#4C0028] border border-[#ECE7DD] flex items-center justify-center transition-all cursor-pointer"
                      >
                        <FaRegTrashCan className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTheme(theme)
                          setActiveTab('compose')
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-[#151518] hover:text-white text-[#18181B] text-[11px] font-bold rounded-full border border-[#ECE7DD] transition-all cursor-pointer whitespace-nowrap"
                      >
                        Use For Newsletter →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-[#F7F5EE] rounded-[18px] border border-[#ECE7DD]">
                <p className="text-[12px] text-[#7A776E]">
                  Click &quot;Generate 5 Theme Ideas&quot; above to brainstorm themes using your brand voice and historical memory.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================================================================
          JOB 2: DRAFT NEWSLETTER FROM THEME
          ========================================================================= */}
      {activeTab === 'compose' && (
        <div className="space-y-6">
          {/* Step 1: Active Theme */}
          <Card
            title="Step 1: Set Active Edition Theme"
            subtitle="Use a curated theme from Job 1 or enter a custom weekly topic"
          >
            {selectedTheme && (
              <div className="mb-3 p-3 bg-[#BEE7A5] text-[#193E07] rounded-[16px] text-[12px] font-bold flex items-center justify-between">
                <span>Selected Theme: {selectedTheme}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTheme('')}
                  className="text-[11px] underline ml-2 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            <Input
              label="Active Theme Topic"
              value={customTheme || selectedTheme}
              onChange={(v) => {
                setCustomTheme(v)
                setSelectedTheme('')
              }}
              placeholder="e.g. The 3 Delegation Frameworks Top Founders Use with EAs..."
            />
          </Card>

          {/* Step 2: Source Content Inputs */}
          <Card
            title="Step 2: Source LinkedIn Posts & Content"
            subtitle="Provide 2+ post links or key points to synthesize into this edition"
          >
            <div className="space-y-2.5">
              {postLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F7F5EE] border border-[#ECE7DD] text-xs font-bold flex items-center justify-center text-[#7A776E] flex-shrink-0">
                    {i + 1}
                  </span>
                  <Input
                    value={link}
                    onChange={(v) => {
                      const next = [...postLinks]
                      next[i] = v
                      setPostLinks(next)
                    }}
                    placeholder={`Post ${i + 1} URL or bullet text...`}
                    className="flex-1 mb-0"
                  />
                  {postLinks.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPostLinks(postLinks.filter((_, j) => j !== i))}
                      className="text-xs text-[#FF88C2] hover:text-[#C20067] p-1.5 cursor-pointer"
                    >
                      <FaXmark className="text-sm" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPostLinks([...postLinks, ''])}
                className="inline-flex items-center gap-1.5"
              >
                <FaPlus className="text-xs" />
                <span>Add Another Post</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleValidate}
                  disabled={loading || (!selectedTheme && !customTheme) || postLinks.filter((l) => l.trim()).length < 2}
                  className="inline-flex items-center gap-1.5"
                >
                  <FaMagnifyingGlass className="text-xs" />
                  <span>{loading ? 'Analyzing...' : 'Validate Cohesion'}</span>
                </Button>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={handleGenerateContent}
                  disabled={loading || (!selectedTheme && !customTheme) || postLinks.filter((l) => l.trim()).length < 2}
                  className="inline-flex items-center gap-1.5"
                >
                  <FaBolt className="text-xs" />
                  <span>{loading ? 'Drafting...' : 'Generate Full Newsletter'}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Cohesion Report */}
          {validation && (
            <Card
              title="Theme Cohesion Analysis"
              subtitle="Evaluates alignment between chosen theme and individual posts"
              action={
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                    validation.passed
                      ? 'bg-[#BEE7A5] text-[#193E07]'
                      : 'bg-[#FFBBE2] text-[#4C0028]'
                  }`}
                >
                  Score: {validation.overallScore ?? '—'}/10 • {validation.passed ? 'Passed' : 'Needs Review'}
                </span>
              }
            >
              {validation.cohesionRationale && (
                <p className="text-[13px] text-[#18181B] leading-relaxed mb-3">
                  {validation.cohesionRationale}
                </p>
              )}

              {Array.isArray(validation.posts) && validation.posts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#ECE7DD]">
                  {validation.posts.map((p, i) => (
                    <div key={i} className="p-3 bg-[#F7F5EE] rounded-[16px] border border-[#ECE7DD]">
                      <div className="flex items-center justify-between text-[12px] font-bold text-[#18181B] mb-1">
                        <span className="truncate mr-2">{p.postLink}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-[#ECE7DD] text-[10px]">
                          Fit: {p.fitScore}/10
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A776E]">{p.rationale}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Generated Newsletter Output */}
          {newsletterContent && (
            <Card
              title="Weekly Newsletter Edition Draft"
              subtitle="Ready for final review and export"
              action={
                <Button
                  variant="dark"
                  size="sm"
                  onClick={handleExportWord}
                  className="inline-flex items-center gap-1.5"
                >
                  <FaDownload className="text-xs" />
                  <span>Export as Word (.docx)</span>
                </Button>
              }
            >
              <div className="p-5 bg-[#F7F5EE] rounded-[20px] border border-[#ECE7DD] text-[13px] leading-relaxed whitespace-pre-wrap text-[#18181B]">
                {newsletterContent}
              </div>

              <FeedbackActions onAction={() => {}} className="mt-3.5" />
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
