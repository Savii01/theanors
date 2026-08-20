'use client'

import React, { useState, useEffect } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import type { LLMModel } from '@/lib/shared/types'
import {
  FaBolt,
  FaRegCircleCheck,
  FaRegCircleXmark,
  FaSpinner,
  FaArrowRotateRight,
} from 'react-icons/fa6'

interface TestResult {
  ok: boolean
  latencyMs: number
  error?: string
}

interface ModelWithOverride extends LLMModel {
  available: boolean
}

export function ModelManagementPanel({ className = '' }: { className?: string }) {
  const [models, setModels] = useState<ModelWithOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [testingId, setTestingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/settings/model-availability')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setModels(data.models ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleToggleAvailability = async (modelId: string, currentAvailable: boolean) => {
    const newAvailable = !currentAvailable

    // Optimistic update
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, available: newAvailable } : m))
    )

    try {
      await fetch('/api/settings/model-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, available: newAvailable }),
      })
    } catch {
      // Revert on failure
      setModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, available: currentAvailable } : m))
      )
    }
  }

  const handleTestModel = async (modelId: string) => {
    setTestingId(modelId)
    setTestResults((prev) => ({ ...prev, [modelId]: { ok: false, latencyMs: 0 } }))

    try {
      const res = await fetch('/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      })
      const result: TestResult = await res.json()
      setTestResults((prev) => ({ ...prev, [modelId]: result }))
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [modelId]: { ok: false, latencyMs: 0, error: 'Request failed' },
      }))
    }

    setTestingId(null)
  }

  if (loading) {
    return (
      <Card title="Model Availability Manager" subtitle="Loading models...">
        <div className="flex items-center justify-center p-8">
          <FaSpinner className="text-xl text-[#FF88C2] animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card
        title="Model Availability Manager"
        subtitle="Toggle active models and test live connectivity to each provider"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setLoading(true)
              fetch('/api/settings/model-availability')
                .then((r) => r.json())
                .then((data) => setModels(data.models ?? []))
                .catch(() => {})
                .finally(() => setLoading(false))
            }}
            className="inline-flex items-center gap-1.5"
          >
            <FaArrowRotateRight className="text-xs" />
            <span>Refresh</span>
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((model) => {
            const result = testResults[model.id]
            const isTesting = testingId === model.id

            return (
              <div
                key={model.id}
                className={`p-4 rounded-[20px] border transition-all ${
                  model.available
                    ? 'bg-white border-[#ECE7DD]'
                    : 'bg-[#F7F5EE] border-[#ECE7DD] opacity-60'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#18181B] truncate">
                        {model.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          model.provider === 'groq'
                            ? 'bg-[#FEE775] text-[#3D3200]'
                            : 'bg-[#A9CBFA] text-[#082956]'
                        }`}
                      >
                        {model.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#7A776E]">
                        {model.dailyLimit.toLocaleString()} req/day
                      </span>
                      {model.tokenLimit && (
                        <span className="text-[11px] text-[#7A776E]">
                          · {model.tokenLimit.toLocaleString()} tokens
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(model.id, model.available)}
                    className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ml-3 ${
                      model.available ? 'bg-[#BEE7A5] border border-[#8BC968]' : 'bg-[#ECE7DD] border border-[#DCD7CD]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-xs ${
                        model.available
                          ? 'left-[22px] bg-[#193E07]'
                          : 'left-0.5 bg-[#7A776E]'
                      }`}
                    />
                  </button>
                </div>

                {/* Test result badge */}
                {result && !isTesting && (
                  <div className="mb-2.5">
                    {result.ok ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BEE7A5] text-[#193E07] rounded-full text-[10px] font-bold">
                        <FaRegCircleCheck className="text-[10px]" />
                        <span>{result.latencyMs}ms</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF0F7] text-[#C20067] rounded-full text-[10px] font-bold">
                        <FaRegCircleXmark className="text-[10px]" />
                        <span>{result.error || 'Failed'}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Test button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTestModel(model.id)}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 w-full justify-center"
                >
                  {isTesting ? (
                    <>
                      <FaSpinner className="text-[10px] animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <FaBolt className="text-[10px]" />
                      <span>Test Model</span>
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
