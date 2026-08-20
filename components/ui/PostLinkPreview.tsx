'use client'

import React, { useState } from 'react'
import {
  FaLinkedin,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaGlobe,
  FaXmark,
  FaRegCircleCheck,
} from 'react-icons/fa6'

type Platform = 'linkedin' | 'instagram' | 'tiktok' | 'youtube' | 'generic'

interface PostLinkPreviewProps {
  url: string
  onConfirm?: () => void
  onRemove?: () => void
  className?: string
}

function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase()
  if (lower.includes('linkedin.com')) return 'linkedin'
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram'
  if (lower.includes('tiktok.com')) return 'tiktok'
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube'
  return 'generic'
}

const platformConfig: Record<Platform, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  linkedin: {
    label: 'LinkedIn',
    icon: <FaLinkedin className="text-sm" />,
    color: '#0A66C2',
    bgColor: '#E8F4FD',
  },
  instagram: {
    label: 'Instagram',
    icon: <FaInstagram className="text-sm" />,
    color: '#E4405F',
    bgColor: '#FDE8EC',
  },
  tiktok: {
    label: 'TikTok',
    icon: <FaTiktok className="text-sm" />,
    color: '#000000',
    bgColor: '#F0F0F0',
  },
  youtube: {
    label: 'YouTube',
    icon: <FaYoutube className="text-sm" />,
    color: '#FF0000',
    bgColor: '#FFE8E8',
  },
  generic: {
    label: 'Web Link',
    icon: <FaGlobe className="text-sm" />,
    color: '#7A776E',
    bgColor: '#F7F5EE',
  },
}

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.origin + parsed.pathname + parsed.search
  } catch {
    return url
  }
}

export function PostLinkPreview({
  url,
  onConfirm,
  onRemove,
  className = '',
}: PostLinkPreviewProps) {
  const [confirmed, setConfirmed] = useState(false)

  if (!url.trim()) return null

  const platform = detectPlatform(url)
  const config = platformConfig[platform]
  const cleanUrl = sanitizeUrl(url)

  const handleConfirm = () => {
    setConfirmed(true)
    onConfirm?.()
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-[16px] border transition-all ${
        confirmed
          ? 'bg-[#BEE7A5]/30 border-[#8BC968]'
          : 'bg-white border-[#ECE7DD]'
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: config.bgColor, color: config.color }}
        >
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: config.bgColor, color: config.color }}
            >
              {config.label}
            </span>
            {confirmed && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#193E07]">
                <FaRegCircleCheck className="text-[10px]" />
                Confirmed
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7A776E] mt-0.5 truncate">{cleanUrl}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {!confirmed && (
          <button
            type="button"
            onClick={handleConfirm}
            className="px-3 py-1 bg-[#BEE7A5] hover:bg-[#B0DF94] text-[#193E07] text-[10px] font-bold rounded-full border border-[#8BC968] transition-all cursor-pointer"
          >
            Confirm
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 rounded-full bg-white hover:bg-[#FFBBE2] text-[#9E9B92] hover:text-[#4C0028] border border-[#ECE7DD] flex items-center justify-center transition-all cursor-pointer"
          >
            <FaXmark className="text-[10px]" />
          </button>
        )}
      </div>
    </div>
  )
}
