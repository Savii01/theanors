'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { createClient } from '@/lib/shared/supabase-browser'
import {
  FaRegCommentDots,
  FaRegCirclePlay,
  FaRegPenToSquare,
  FaRegNewspaper,
  FaArrowRight,
  FaPlus,
  FaRegFolderOpen,
  FaRegCalendar,
  FaRegComments,
  FaLightbulb,
  FaBrain,
} from 'react-icons/fa6'

interface RecentEntry {
  id: string
  workflow: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

function getDynamicGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function extractFirstName(email?: string): string {
  if (!email) return 'Admin'
  const username = email.split('@')[0]
  // Extract alphabetic characters only to strip trailing numbers like savii90491 -> Savii
  const cleanName = username.replace(/[0-9_.-]/g, '')
  if (cleanName.length > 0) {
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase()
  }
  return username.charAt(0).toUpperCase() + username.slice(1)
}

export default function DashboardPage() {
  const router = useRouter()
  const [brandVoice, setBrandVoice] = useState('')
  const [saving, setSaving] = useState(false)
  const [userName, setUserName] = useState('Admin')
  const greeting = getDynamicGreeting()
  const supabase = createClient()

  // Recent AI chat history state
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([])
  const [recentTotalCount, setRecentTotalCount] = useState(0)
  const [chatFilter, setChatFilter] = useState<string>('all')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserName(extractFirstName(user.email))
      }
    })

    fetch('/api/settings/brand-voice')
      .then((r) => r.json())
      .then((data) => setBrandVoice(data.brandVoice ?? ''))
      .catch(() => {})

    fetch('/api/chat/recent')
      .then((r) => r.json())
      .then((data) => {
        setRecentEntries(data.entries ?? [])
        setRecentTotalCount(data.totalCount ?? 0)
      })
      .catch(() => {})
  }, [supabase.auth])

  const handleSaveBrandVoice = () => {
    setSaving(true)
    fetch('/api/settings/brand-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandVoice }),
    })
      .then(() => setSaving(false))
      .catch(() => setSaving(false))
  }

  // Workflow color/badge mapping
  const workflowMeta: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string; link: string }> = {
    engagement: { label: 'Engagement', bgColor: '#FEE775', textColor: '#3D3200', borderColor: '#E6CF4B', link: '/engagement' },
    captions: { label: 'Captions', bgColor: '#FFBBE2', textColor: '#4C0028', borderColor: '#F3A0CE', link: '/captions' },
    scripting: { label: 'Scripting', bgColor: '#BEE7A5', textColor: '#193E07', borderColor: '#8BC968', link: '/scripting' },
    newsletter: { label: 'Newsletter', bgColor: '#A9CBFA', textColor: '#082956', borderColor: '#75A7EC', link: '/newsletter' },
    comments: { label: 'Comments', bgColor: '#DDD4FB', textColor: '#2B1869', borderColor: '#B2A2F0', link: '/comments' },
  }

  const formatRelativeTime = (iso: string): string => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay === 1) return 'Yesterday'
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredEntries = chatFilter === 'all'
    ? recentEntries
    : recentEntries.filter((e) => e.workflow === chatFilter)

  // Group consecutive user+assistant pairs into conversation turns
  interface ConversationTurn {
    workflow: string
    userMsg: RecentEntry
    assistantMsg: RecentEntry | null
  }

  const conversationTurns: ConversationTurn[] = []
  for (let i = 0; i < filteredEntries.length; i++) {
    const entry = filteredEntries[i]
    if (entry.role === 'assistant') {
      // Check if previous entry is a user message from same workflow
      const prev = conversationTurns.length > 0 ? conversationTurns[conversationTurns.length - 1] : null
      if (prev && prev.workflow === entry.workflow && !prev.assistantMsg) {
        prev.assistantMsg = entry
      } else {
        conversationTurns.push({ workflow: entry.workflow, userMsg: entry, assistantMsg: null })
      }
    } else {
      conversationTurns.push({ workflow: entry.workflow, userMsg: entry, assistantMsg: null })
    }
  }

  const currentDate = new Date()
  const todayDay = currentDate.getDate()

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
      {/* Main Column (8 cols on XL) */}
      <div className="xl:col-span-8 space-y-7">
        {/* Dynamic Greeting Hero */}
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#18181B] tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-[13px] text-[#7A776E] mt-1 max-w-2xl leading-relaxed">
            Theanors is active and synchronized. 5 automated workflows are ready with multi-model LLM intelligence and cascading failover.
          </p>
        </div>

        {/* 4 Neo-Pastel Metric Cards with Balanced Typography & Proper Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Pastel Yellow - Engagement Operations */}
          <Link href="/engagement">
            <Card
              variant="yellow"
              title="Engagement Ops"
              className="h-full hover:scale-[1.01] cursor-pointer"
            >
              <div className="grid grid-cols-3 gap-2 mt-2 mb-4">
                <div>
                  <span className="text-[15px] font-bold block text-[#3D3200] leading-tight">30 posts</span>
                  <span className="text-[10px] uppercase font-bold text-[#3D3200]/70 tracking-wider">Daily Batch</span>
                </div>
                <div>
                  <span className="text-[15px] font-bold block text-[#3D3200] leading-tight">3 options</span>
                  <span className="text-[10px] uppercase font-bold text-[#3D3200]/70 tracking-wider">Per Post</span>
                </div>
                <div>
                  <span className="text-[15px] font-bold block text-[#3D3200] leading-tight">100%</span>
                  <span className="text-[10px] uppercase font-bold text-[#3D3200]/70 tracking-wider">Free Models</span>
                </div>
              </div>

              {/* Bar Chart & Action Link */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E6CF4B]/50">
                <div className="flex items-end gap-1.5 h-6">
                  <div className="w-2 h-3 bg-[#3D3200] rounded-full" />
                  <div className="w-2 h-5 bg-[#3D3200] rounded-full" />
                  <div className="w-2 h-2 bg-[#3D3200]/30 rounded-full" />
                  <div className="w-2 h-6 bg-[#3D3200] rounded-full" />
                  <div className="w-2 h-4 bg-[#3D3200]/40 rounded-full" />
                </div>
                <span className="text-[11px] font-bold text-[#3D3200] inline-flex items-center gap-1">
                  Open Flow <FaArrowRight className="text-[10px]" />
                </span>
              </div>
            </Card>
          </Link>

          {/* Card 2: Pastel Pink - Captions & Video Transcription */}
          <Link href="/captions">
            <Card
              variant="pink"
              title="Captions & Audio"
              className="h-full hover:scale-[1.01] cursor-pointer"
            >
              <div className="grid grid-cols-3 gap-2 mt-2 mb-4">
                <div>
                  <span className="text-[15px] font-bold block text-[#4C0028] leading-tight">8.0 hrs</span>
                  <span className="text-[10px] uppercase font-bold text-[#4C0028]/70 tracking-wider">Whisper Cap</span>
                </div>
                <div>
                  <span className="text-[15px] font-bold block text-[#4C0028] leading-tight">5 formats</span>
                  <span className="text-[10px] uppercase font-bold text-[#4C0028]/70 tracking-wider">Platforms</span>
                </div>
                <div>
                  <span className="text-[15px] font-bold block text-[#4C0028] leading-tight">4-Tier</span>
                  <span className="text-[10px] uppercase font-bold text-[#4C0028]/70 tracking-wider">Cascade</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F3A0CE]/50">
                <span className="text-[11px] font-semibold text-[#4C0028]/80">
                  Groq ➔ Deepgram ➔ Assembly
                </span>
                <span className="text-[11px] font-bold text-[#4C0028] inline-flex items-center gap-1">
                  Transcribe <FaArrowRight className="text-[10px]" />
                </span>
              </div>
            </Card>
          </Link>

          {/* Card 3: Pastel Sage Green - Content Scripting */}
          <Link href="/scripting">
            <Card
              variant="green"
              title="Content Scripting"
              className="h-full hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-2 mt-2 mb-4">
                <span className="px-2.5 py-1 bg-white/70 rounded-full text-[11px] font-bold text-[#193E07]">
                  Talking Head
                </span>
                <span className="px-2.5 py-1 bg-white/70 rounded-full text-[11px] font-bold text-[#193E07]">
                  Carousel
                </span>
                <span className="px-2.5 py-1 bg-white/70 rounded-full text-[11px] font-bold text-[#193E07]">
                  Trend Acting
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#8BC968]/50">
                <span className="text-[11px] font-semibold text-[#193E07]/80">4 Video Formats</span>
                <span className="text-[11px] font-bold text-[#193E07] inline-flex items-center gap-1">
                  Open Flow <FaArrowRight className="text-[10px]" />
                </span>
              </div>
            </Card>
          </Link>

          {/* Card 4: Pastel Sky Blue - Newsletter & Intelligence */}
          <Link href="/newsletter">
            <Card
              variant="blue"
              title="Weekly Newsletter"
              className="h-full hover:scale-[1.01] cursor-pointer"
            >
              <div className="grid grid-cols-3 gap-2 mt-2 mb-4">
                <div>
                  <span className="text-[15px] font-bold block text-[#082956] leading-tight">Excel</span>
                  <span className="text-[10px] uppercase font-bold text-[#082956]/70 tracking-wider">Memory</span>
                </div>
                <div>
                  <span className="text-[15px] font-bold block text-[#082956] leading-tight">Cohesion</span>
                  <span className="text-[10px] uppercase font-bold text-[#082956]/70 tracking-wider">AI Scoring</span>
                </div>
                <div>
                  <span className="text-[15px] font-bold block text-[#082956] leading-tight">Word</span>
                  <span className="text-[10px] uppercase font-bold text-[#082956]/70 tracking-wider">.docx</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#75A7EC]/50">
                <span className="text-[11px] font-semibold text-[#082956]/80">Local Spreadsheet Parser</span>
                <span className="text-[11px] font-bold text-[#082956] inline-flex items-center gap-1">
                  Generate <FaArrowRight className="text-[10px]" />
                </span>
              </div>
            </Card>
          </Link>
        </div>

        {/* Global Brand Voice Editor Card */}
        <Card
          title="Global Brand Voice & Persona"
          subtitle="Injected automatically into the Prompt Assembly Engine for all selected AI models"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveBrandVoice}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Voice'}
            </Button>
          }
        >
          <Textarea
            value={brandVoice}
            onChange={setBrandVoice}
            onBlur={handleSaveBrandVoice}
            rows={4}
            placeholder="e.g. Authentic founder voice: sharp, data-informed, punchy 1-2 sentence insights, no corporate jargon, authoritative but warm tone..."
            helpText="Auto-saves on blur. Changes update live across Engagement, Captions, Scripts, and Newsletters."
          />
        </Card>

        {/* Recent AI Training & Chat History */}
        <Card
          title="Recent AI Training & Chat History"
          subtitle="Conversations and training interactions across all workflows"
          action={
            recentTotalCount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F7F5EE] border border-[#ECE7DD] rounded-full text-[11px] font-bold text-[#18181B]">
                  <FaRegComments className="text-[10px] text-[#FF88C2]" />
                  {recentTotalCount} turns
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#BEE7A5] text-[#193E07] rounded-full text-[10px] font-bold">
                  <FaBrain className="text-[9px]" />
                  Learning Active
                </span>
              </div>
            ) : undefined
          }
        >
          {/* Workflow Filter Tabs */}
          {recentTotalCount > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'engagement', label: 'Engagement' },
                { key: 'captions', label: 'Captions' },
                { key: 'scripting', label: 'Scripting' },
                { key: 'newsletter', label: 'Newsletter' },
                { key: 'comments', label: 'Comments' },
              ].map((f) => {
                const isActive = chatFilter === f.key
                const meta = f.key !== 'all' ? workflowMeta[f.key] : null
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setChatFilter(f.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap border
                      ${
                        isActive
                          ? f.key === 'all'
                            ? 'bg-[#151518] text-white border-[#151518] shadow-xs'
                            : 'shadow-xs'
                          : 'bg-white text-[#7A776E] border-[#ECE7DD] hover:text-[#18181B] hover:bg-[#F7F5EE]'
                      }`}
                    style={
                      isActive && meta
                        ? { backgroundColor: meta.bgColor, color: meta.textColor, borderColor: meta.borderColor }
                        : isActive && f.key === 'all'
                          ? undefined
                          : undefined
                    }
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Conversation Feed */}
          {conversationTurns.length > 0 ? (
            <div className="space-y-2.5">
              {conversationTurns.slice(0, 8).map((turn, i) => {
                const meta = workflowMeta[turn.workflow] || { label: turn.workflow, bgColor: '#F7F5EE', textColor: '#18181B', borderColor: '#ECE7DD', link: '/' + turn.workflow }
                return (
                  <div
                    key={turn.userMsg.id + i}
                    className="p-3.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-[18px] hover:bg-white hover:border-[#151518]/20 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: meta.bgColor, color: meta.textColor }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-[#9E9B92] font-mono">
                        {formatRelativeTime(turn.userMsg.created_at)}
                      </span>
                    </div>

                    {/* User message */}
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className="px-1.5 py-0.5 bg-[#151518] text-white text-[8px] font-bold rounded-full mt-0.5 flex-shrink-0">
                        YOU
                      </span>
                      <p className="text-[12px] text-[#18181B] leading-relaxed line-clamp-2">
                        {turn.userMsg.content}
                      </p>
                    </div>

                    {/* Assistant response snippet */}
                    {turn.assistantMsg && (
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-[#FF88C2] text-[#4C0028] text-[8px] font-bold rounded-full mt-0.5 flex-shrink-0">
                          AI
                        </span>
                        <p className="text-[11px] text-[#7A776E] leading-relaxed line-clamp-2">
                          {turn.assistantMsg.content}
                        </p>
                      </div>
                    )}

                    {/* Link to workflow chat */}
                    <div className="mt-2.5 pt-2 border-t border-[#ECE7DD] opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => router.push(meta.link)}
                        className="text-[10px] font-bold text-[#FF88C2] hover:text-[#4C0028] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Open {meta.label} Chat <FaArrowRight className="text-[9px]" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 px-4 text-center bg-[#F7F5EE] rounded-[20px] border border-[#ECE7DD]">
              <FaLightbulb className="text-2xl mx-auto mb-2 text-[#FF88C2]" />
              <span className="text-[13px] font-bold text-[#18181B] block">
                No AI conversations yet
              </span>
              <span className="text-[11px] text-[#7A776E] block mt-1 max-w-[300px] mx-auto leading-relaxed">
                Open any workflow and click &quot;Chat with AI&quot; to start training your model. Every correction and instruction is saved here.
              </span>
            </div>
          )}

          {/* Quick Stats Footer */}
          {recentTotalCount > 0 && (
            <div className="mt-3 pt-3 border-t border-[#ECE7DD] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Object.entries(workflowMeta).map(([key, meta]) => {
                  const count = recentEntries.filter((e) => e.workflow === key).length
                  if (count === 0) return null
                  return (
                    <span
                      key={key}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: meta.bgColor, color: meta.textColor }}
                    >
                      {meta.label}: {count}
                    </span>
                  )
                })}
              </div>
              <span className="text-[10px] text-[#9E9B92]">
                {recentEntries.length} recent of {recentTotalCount} total
              </span>
            </div>
          )}
        </Card>

        {/* Operations Activity & Quick Launcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Operations Activity: Clean Empty State (No Mock Data) */}
          <Card title="Recent Operations Activity" subtitle="Real-time execution log">
            <div className="py-6 px-4 text-center bg-[#F7F5EE] rounded-[18px] border border-[#ECE7DD]">
              <FaRegFolderOpen className="text-2xl mx-auto mb-2 text-[#9E9B92]" />
              <span className="text-[12px] font-bold text-[#18181B] block">
                No operations executed yet today
              </span>
              <span className="text-[11px] text-[#7A776E] block mt-0.5">
                Run batches in Engagement, Captions, or Scripting to see real-time execution records here.
              </span>
            </div>
          </Card>

          {/* Quick Workflow Launcher with Medium Round Buttons */}
          <Card title="Quick Workflow Launcher" subtitle="Jump straight to content production">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push('/engagement')}
                className="p-3 bg-[#F7F5EE] hover:bg-white border border-[#ECE7DD] hover:border-[#151518] rounded-[16px] transition-all text-left cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FaRegCommentDots className="text-sm text-[#3D3200] group-hover:scale-110 transition-transform" />
                  <span className="text-[12px] font-bold text-[#18181B]">Engagement</span>
                </div>
                <span className="text-[10px] text-[#7A776E] block">Batch comments</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/captions')}
                className="p-3 bg-[#F7F5EE] hover:bg-white border border-[#ECE7DD] hover:border-[#151518] rounded-[16px] transition-all text-left cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FaRegCirclePlay className="text-sm text-[#4C0028] group-hover:scale-110 transition-transform" />
                  <span className="text-[12px] font-bold text-[#18181B]">Captions</span>
                </div>
                <span className="text-[10px] text-[#7A776E] block">5 platform outputs</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/scripting')}
                className="p-3 bg-[#F7F5EE] hover:bg-white border border-[#ECE7DD] hover:border-[#151518] rounded-[16px] transition-all text-left cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FaRegPenToSquare className="text-sm text-[#193E07] group-hover:scale-110 transition-transform" />
                  <span className="text-[12px] font-bold text-[#18181B]">Scripting</span>
                </div>
                <span className="text-[10px] text-[#7A776E] block">4 video formats</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/newsletter')}
                className="p-3 bg-[#F7F5EE] hover:bg-white border border-[#ECE7DD] hover:border-[#151518] rounded-[16px] transition-all text-left cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FaRegNewspaper className="text-sm text-[#082956] group-hover:scale-110 transition-transform" />
                  <span className="text-[12px] font-bold text-[#18181B]">Newsletter</span>
                </div>
                <span className="text-[10px] text-[#7A776E] block">Excel synthesis</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Column: Month Calendar & Today's Timeline Schedule */}
      <div className="xl:col-span-4 space-y-6">
        {/* Calendar Widget */}
        <Card title="Content Calendar" subtitle="May 2026" className="bg-white">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-[#7A776E] mb-2.5">
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
            <span>SU</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[12px]">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1
              const isToday = day === todayDay || (todayDay > 31 && day === 15)

              return (
                <div
                  key={day}
                  className={`h-8 flex items-center justify-center rounded-full text-[12px] cursor-pointer transition-all
                    ${
                      isToday
                        ? 'bg-[#FF88C2] text-[#4C0028] font-bold shadow-xs'
                        : 'text-[#7A776E] hover:bg-[#F7F5EE]'
                    }`}
                >
                  <span>{day}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#ECE7DD]">
            <Button
              variant="dark"
              size="sm"
              onClick={() => router.push('/engagement')}
              className="w-full inline-flex items-center justify-center gap-1.5"
            >
              <FaPlus className="text-xs" />
              <span>Add Content Batch</span>
            </Button>
          </div>
        </Card>

        {/* Daily Schedule & Timeline: Clean Empty State (No Mock Data) */}
        <Card title="Daily Schedule & Timeline" subtitle="Content milestones for today">
          <div className="py-7 px-4 text-center bg-[#F7F5EE] rounded-[18px] border border-[#ECE7DD]">
            <FaRegCalendar className="text-2xl mx-auto mb-2 text-[#9E9B92]" />
            <span className="text-[12px] font-bold text-[#18181B] block">
              No scheduled milestones for today
            </span>
            <span className="text-[11px] text-[#7A776E] block mt-0.5">
              Content operations and scheduled tasks will automatically populate here as you run batches.
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
