'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { ModelLimits, LLMModel } from '@/lib/shared/types'
import { FaBolt, FaChevronDown, FaCheck } from 'react-icons/fa6'

type ModelOption = Pick<LLMModel, 'id' | 'name' | 'provider' | 'dailyLimit' | 'available'>

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
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentModel = models.find((m) => m.id === selected)
  const currentLimit = limits[selected]
  const currentRemaining = currentLimit ? currentLimit.total - currentLimit.used : null

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (modelId: string) => {
    onSelect(modelId)
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-[#ECE7DD] rounded-[22px] shadow-2xs transition-all ${className}`}
    >
      {/* Left info badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#FEE775] text-[#3D3200] flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0">
          <FaBolt className="text-xs" />
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider font-bold text-[#7A776E]">
            Active Intelligence Model
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="block text-[13px] font-bold text-[#18181B]">
              {currentModel?.name || selected}
            </span>
            {currentModel?.provider && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  currentModel.provider === 'gemini'
                    ? 'bg-[#A9CBFA] text-[#0C2D57]'
                    : 'bg-[#FEE775] text-[#3D3200]'
                }`}
              >
                {currentModel.provider}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side trigger button & dropdown */}
      <div className="flex items-center gap-2">
        {currentRemaining !== null && (
          <span className="px-2.5 py-1 bg-[#F7F5EE] border border-[#ECE7DD] text-[#18181B] text-[11px] font-bold rounded-full">
            {currentRemaining} req left
          </span>
        )}

        {/* Custom Branded Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer border ${
              isOpen
                ? 'bg-[#151518] text-white border-[#151518] shadow-xs'
                : 'bg-[#F7F5EE] text-[#18181B] border-[#ECE7DD] hover:bg-[#EAE7DE]'
            }`}
          >
            <span>{currentModel?.name || selected}</span>
            <FaChevronDown
              className={`text-[10px] transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#FF88C2]' : 'text-[#7A776E]'
              }`}
            />
          </button>

          {/* Floating Dropdown Popover */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[320px] bg-white border border-[#ECE7DD] rounded-[20px] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#ECE7DD] mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#7A776E]">
                  Select AI Engine
                </span>
                <span className="text-[10px] font-medium text-[#9E9B92]">
                  {models.length} options
                </span>
              </div>

              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-0.5">
                {models.map((m) => {
                  const limit = limits[m.id]
                  const remaining = limit ? limit.total - limit.used : '—'
                  const isSelected = m.id === selected
                  const provider = m.provider ?? (m.id === 'gemini' ? 'gemini' : 'groq')

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelect(m.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-[14px] text-left transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-[#151518] text-white shadow-2xs'
                          : 'hover:bg-[#F7F5EE] text-[#18181B]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold truncate">
                              {m.name}
                            </span>
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : provider === 'gemini'
                                  ? 'bg-[#A9CBFA] text-[#0C2D57]'
                                  : 'bg-[#FEE775] text-[#3D3200]'
                              }`}
                            >
                              {provider}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] block mt-0.5 ${
                              isSelected ? 'text-neutral-300' : 'text-[#7A776E]'
                            }`}
                          >
                            {m.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/15 text-white'
                              : 'bg-[#F7F5EE] border border-[#ECE7DD] text-[#7A776E]'
                          }`}
                        >
                          {remaining} left
                        </span>
                        {isSelected && (
                          <FaCheck className="text-[10px] text-[#FF88C2]" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
