'use client'

import { useState, useEffect } from 'react'

function calculateTimeLeft() {
  const now = new Date()
  // 1AM WAT = 0AM UTC
  const nextReset = new Date(now)
  nextReset.setUTCHours(0, 0, 0, 0)
  if (now >= nextReset) {
    nextReset.setDate(nextReset.getDate() + 1)
  }
  const diff = nextReset.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export function CountdownTimer({ className = '' }: { className?: string }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#F7F5EE] border border-[#ECE7DD] rounded-full text-[11px] font-bold text-[#18181B] shadow-2xs ${className}`}
      title="Daily Quota Reset at 1:00 AM WAT"
    >
      <span className="w-2 h-2 rounded-full bg-[#8BC968] animate-pulse" />
      <span>Reset in {timeLeft}</span>
    </div>
  )
}
