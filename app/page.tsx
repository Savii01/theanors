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
} from 'react-icons/fa6'

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
