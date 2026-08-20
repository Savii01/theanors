'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ChatbotPanel } from '@/components/ui/ChatbotPanel'
import { ModelManagementPanel } from '@/components/ui/ModelManagementPanel'
import gsap from 'gsap'
import {
  FaRegCommentDots,
  FaRegCirclePlay,
  FaRegPenToSquare,
  FaRegNewspaper,
  FaRegLightbulb,
  FaRegBookmark,
  FaRegTrashCan,
  FaRegFloppyDisk,
  FaRegSun,
  FaBolt,
} from 'react-icons/fa6'

type SettingsTab = 'brand' | 'prompts' | 'memory' | 'models'

const workflows = [
  { key: 'engagement', label: 'Engagement', icon: <FaRegCommentDots className="text-xs" /> },
  { key: 'captions', label: 'Captions', icon: <FaRegCirclePlay className="text-xs" /> },
  { key: 'scripting', label: 'Scripting', icon: <FaRegPenToSquare className="text-xs" /> },
  { key: 'newsletter', label: 'Newsletter', icon: <FaRegNewspaper className="text-xs" /> },
  { key: 'comments', label: 'Initial Comments', icon: <FaRegLightbulb className="text-xs" /> },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('brand')
  const [promptTab, setPromptTab] = useState('engagement')
  const [brandVoice, setBrandVoice] = useState('')
  const [prompts, setPrompts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [memories, setMemories] = useState<{ id: string; preference_type: string; preference_value: string; frequency_selected: number }[]>([])

  useEffect(() => {
    fetch('/api/settings/brand-voice')
      .then((r) => r.json())
      .then((data) => setBrandVoice(data.brandVoice ?? ''))
      .catch(() => {})

    fetch('/api/settings/prompts')
      .then((r) => r.json())
      .then((data) => setPrompts(data.prompts ?? {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'memory') {
      fetch('/api/settings/memories')
        .then((r) => r.json())
        .then((data) => setMemories(data.memories ?? []))
        .catch(() => {})
    }
  }, [activeTab])

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

  const handleSavePrompt = (workflow: string, prompt: string) => {
    fetch('/api/settings/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, prompt }),
    }).catch(() => {})
  }

  const handleDeleteMemory = (id: string, element: HTMLElement) => {
    gsap.timeline({
      onComplete: () => {
        setMemories((prev) => prev.filter((m) => m.id !== id))
        fetch(`/api/settings/memories?id=${id}`, { method: 'DELETE' }).catch(() => {})
      },
    })
      .to(element, { borderColor: '#ECE7DD', backgroundColor: '#F7F5EE', duration: 0.15 })
      .to(element, { x: -150, opacity: 0, duration: 0.25, ease: 'power2.in' })
  }

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'brand', label: 'Brand Voice', icon: <FaRegSun className="text-xs" /> },
    { key: 'prompts', label: 'Master Prompts', icon: <FaRegPenToSquare className="text-xs" /> },
    { key: 'memory', label: 'Learned Memory', icon: <FaRegBookmark className="text-xs" /> },
    { key: 'models', label: 'Models', icon: <FaBolt className="text-xs" /> },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold text-[#18181B] tracking-tight">
          Operations Settings & Voice
        </h1>
        <p className="text-[13px] text-[#7A776E] mt-0.5">
          Configure persistent founder brand voice, fine-tune individual workflow master prompts, and manage learned AI memory patterns.
        </p>
      </div>

      {/* Main Tab Pill Switcher */}
      <div className="flex gap-2 p-1.5 bg-white border border-[#ECE7DD] rounded-full shadow-2xs overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap
                ${
                  isActive
                    ? 'bg-[#151518] text-white shadow-xs'
                    : 'text-[#7A776E] hover:text-[#18181B] hover:bg-[#F7F5EE]'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Global Brand Voice */}
      {activeTab === 'brand' && (
        <Card
          title="Global Brand Voice & Persona Guidelines"
          subtitle="Injected into the Prompt Assembly Engine for all LLM generations across all 5 workflows"
          action={
            <Button
              variant="dark"
              size="sm"
              onClick={handleSaveBrandVoice}
              disabled={saving}
              className="inline-flex items-center gap-1.5"
            >
              <FaRegFloppyDisk className="text-xs" />
              <span>{saving ? 'Saving...' : 'Save Voice Changes'}</span>
            </Button>
          }
        >
          <Textarea
            value={brandVoice}
            onChange={setBrandVoice}
            onBlur={handleSaveBrandVoice}
            rows={8}
            placeholder="Describe the founder's authentic voice, tone modifiers, target audience context, core value proposition, topics to focus on, and phrases to strictly avoid..."
            helpText="Auto-saves on blur. All changes update instantly across the entire platform."
          />
        </Card>
      )}

      {/* Tab 2: Workflow Master Prompts */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <Card title="Workflow Master Prompt Editors" subtitle="Select a workflow to edit its system instructions">
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
              {workflows.map((w) => {
                const isSelected = promptTab === w.key
                return (
                  <button
                    key={w.key}
                    onClick={() => setPromptTab(w.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap
                      ${
                        isSelected
                          ? 'bg-[#FF88C2] text-[#4C0028] shadow-xs'
                          : 'bg-[#F7F5EE] text-[#18181B] border border-[#ECE7DD] hover:bg-[#EFECE3]'
                      }`}
                  >
                    <span>{w.icon}</span>
                    <span>{w.label}</span>
                  </button>
                )
              })}
            </div>

            <ChatbotPanel
              workflowName={workflows.find((w) => w.key === promptTab)?.label ?? ''}
              masterPrompt={prompts[promptTab] ?? ''}
              onUpdate={(prompt) => {
                setPrompts((prev) => ({ ...prev, [promptTab]: prompt }))
                handleSavePrompt(promptTab, prompt)
              }}
            />
          </Card>
        </div>
      )}

      {/* Tab 3: Stored Self-Training Memory */}
      {activeTab === 'memory' && (
        <Card
          title="Learned AI Preference Memory"
          subtitle="Patterns and style guidelines learned automatically from your 'Keep in Memory' decisions"
        >
          {memories.length === 0 ? (
            <div className="p-8 text-center bg-[#F7F5EE] rounded-[20px] border border-[#ECE7DD]">
              <FaRegBookmark className="text-3xl mx-auto mb-2 text-[#7A776E]" />
              <p className="text-[13px] font-bold text-[#18181B]">No learned memories stored yet</p>
              <p className="text-[11px] text-[#7A776E] mt-1">
                When generating comments or scripts, click &quot;Keep in Memory&quot; to train the system on your preferences.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="flex items-center justify-between p-3.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-[18px] transition-all hover:bg-white"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#DDD4FB] text-[#2B1869] text-[10px] font-bold">
                        {mem.preference_type}
                      </span>
                      <span className="text-[11px] text-[#7A776E]">Used {mem.frequency_selected} times</span>
                    </div>
                    <p className="text-[13px] font-medium text-[#18181B] mt-1">{mem.preference_value}</p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteMemory(mem.id, e.currentTarget.closest('div') as HTMLElement)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#FFBBE2] text-[#18181B] hover:text-[#4C0028] text-[11px] font-bold rounded-full border border-[#ECE7DD] transition-all cursor-pointer"
                  >
                    <FaRegTrashCan className="text-xs" />
                    <span>Forget</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Model Availability Management */}
      {activeTab === 'models' && (
        <ModelManagementPanel />
      )}
    </div>
  )
}
