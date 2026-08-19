'use client'

import React from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  variant?: 'white' | 'yellow' | 'pink' | 'green' | 'blue' | 'lavender'
  action?: React.ReactNode
}

export function Card({
  title,
  subtitle,
  children,
  className = '',
  variant = 'white',
  action,
}: CardProps) {
  const variantStyles = {
    white: 'bg-white border border-[#ECE7DD] text-[#18181B] shadow-2xs',
    yellow: 'bg-[#FEE775] border border-[#E6CF4B] text-[#3D3200] shadow-2xs',
    pink: 'bg-[#FFBBE2] border border-[#F3A0CE] text-[#4C0028] shadow-2xs',
    green: 'bg-[#BEE7A5] border border-[#8BC968] text-[#193E07] shadow-2xs',
    blue: 'bg-[#A9CBFA] border border-[#75A7EC] text-[#082956] shadow-2xs',
    lavender: 'bg-[#DDD4FB] border border-[#B2A2F0] text-[#2B1869] shadow-2xs',
  }

  return (
    <div
      className={`relative rounded-[22px] p-6 transition-all ${variantStyles[variant]} ${className}`}
    >
      {/* Card Header */}
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div>
            {title && <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>}
            {subtitle && <p className="text-[12px] opacity-75 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Card Content */}
      <div>{children}</div>
    </div>
  )
}
