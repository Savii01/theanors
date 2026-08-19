'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  className?: string
}

export function ProgressBar({ current, total, label, className = '' }: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0

  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        width: `${percentage}%`,
        duration: 0.45,
        ease: 'power2.out',
      })
    }
  }, [percentage])

  return (
    <div className={`p-4 bg-white border border-[#ECE7DD] rounded-[20px] shadow-2xs ${className}`}>
      <div className="flex items-center justify-between text-[12px] font-bold text-[#18181B] mb-2">
        <span>{label || 'Batch Progress'}</span>
        <span className="px-2 py-0.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-full text-[11px]">
          {percentage}% ({current}/{total})
        </span>
      </div>
      <div className="w-full h-3.5 bg-[#F7F5EE] rounded-full overflow-hidden p-0.5 border border-[#ECE7DD]">
        <div
          ref={fillRef}
          className="h-full bg-[#A9CBFA] rounded-full transition-all"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  )
}
