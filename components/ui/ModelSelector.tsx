'use client'

import React from 'react'
import type { ModelLimits } from '@/lib/shared/types'
import { FaBolt } from 'react-icons/fa6'

interface ModelOption {
  id: string
  name: string
}

interface ModelSelectorProps {
  models: ModelOption[]
  selected: string
  onSelect: (modelId: string) => void
  limits: ModelLimits
  className?: string
}

export function ModelSelector({
  models,
  selected,
  onSelect,
  limits,
  className = '',
}: ModelSelectorProps) {
  const currentModel = models.find((m) => m.id === selected)
  const currentLimit = limits[selected]
  const currentRemaining = currentLimit ? currentLimit.total - currentLimit.used : null

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-[#ECE7DD] rounded-[20px] shadow-2xs ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#FEE775] text-[#3D3200] flex items-center justify-center font-bold text-xs shadow-2xs">
          <FaBolt className="text-xs" />
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-wider font-bold text-[#7A776E]">
            Active Intelligence Model
          </span>
          <span className="block text-[13px] font-bold text-[#18181B]">
            {currentModel?.name || selected}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {currentRemaining !== null && (
          <span className="px-2.5 py-1 bg-[#F7F5EE] border border-[#ECE7DD] text-[#18181B] text-[11px] font-bold rounded-full">
            {currentRemaining} req left
          </span>
        )}
        <select
          className="px-3.5 py-1.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-full text-[12px] font-bold text-[#18181B] cursor-pointer hover:bg-[#EAE7DE] focus:outline-hidden focus:ring-2 focus:ring-[#151518]/10 transition-all"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          {models.map((m) => {
            const limit = limits[m.id]
            const remaining = limit ? limit.total - limit.used : '—'
            return (
              <option key={m.id} value={m.id}>
                {m.name} ({remaining} left)
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}
