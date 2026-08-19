'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import type { FeedbackAction } from '@/lib/shared/types'
import {
  FaRegCircleCheck,
  FaRegPenToSquare,
  FaRegBookmark,
  FaRegTrashCan,
} from 'react-icons/fa6'

interface FeedbackActionsProps {
  onAction: (action: FeedbackAction) => void
  className?: string
}

export function FeedbackActions({ onAction, className = '' }: FeedbackActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleAction = (action: FeedbackAction) => {
    if (action === 'keep_in_memory' || action === 'forget') {
      if (containerRef.current) {
        const xOffset = action === 'keep_in_memory' ? 100 : -100
        gsap.to(containerRef.current, {
          x: xOffset,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => onAction(action),
        })
        return
      }
    }
    onAction(action)
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-wrap items-center gap-2 pt-2 border-t border-[#ECE7DD] ${className}`}
    >
      <button
        type="button"
        onClick={() => handleAction('accept')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5EE] hover:bg-[#BEE7A5] hover:text-[#193E07] text-[#18181B] text-[11px] font-bold rounded-full transition-all border border-[#ECE7DD] cursor-pointer"
      >
        <FaRegCircleCheck className="text-xs" />
        <span>Accept</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('edit')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5EE] hover:bg-[#FEE775] hover:text-[#3D3200] text-[#18181B] text-[11px] font-bold rounded-full transition-all border border-[#ECE7DD] cursor-pointer"
      >
        <FaRegPenToSquare className="text-xs" />
        <span>Edit</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('keep_in_memory')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5EE] hover:bg-[#FFBBE2] hover:text-[#4C0028] text-[#18181B] text-[11px] font-bold rounded-full transition-all border border-[#ECE7DD] cursor-pointer"
        title="Remember this style preference for future prompts"
      >
        <FaRegBookmark className="text-xs" />
        <span>Keep in Memory</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('forget')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5EE] hover:bg-[#FFF0F7] hover:text-[#C20067] text-[#9E9B92] hover:border-[#FFBBE2] text-[11px] font-bold rounded-full transition-all border border-[#ECE7DD] cursor-pointer"
        title="Forget this pattern"
      >
        <FaRegTrashCan className="text-xs" />
        <span>Forget</span>
      </button>
    </div>
  )
}
