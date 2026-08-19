'use client'

import { useState } from 'react'
import { Textarea } from './Input'
import { Button } from './Button'

interface TranscriptConfirmProps {
  transcript: string
  onConfirm: (confirmedText: string) => void
  isLoading?: boolean
  className?: string
}

export function TranscriptConfirm({
  transcript,
  onConfirm,
  isLoading = false,
  className = '',
}: TranscriptConfirmProps) {
  const [text, setText] = useState(transcript)

  return (
    <div className={`bg-white border border-[#E0E0E0] rounded p-3 mb-3 ${className}`}>
      <div className="bg-[#FFF8E1] border border-[#FFB300] rounded px-3 py-2 mb-3 text-[12px] text-[#333333]">
        Please review and correct the transcript before proceeding.
      </div>
      <Textarea
        label="Transcript"
        value={text}
        onChange={setText}
        rows={8}
      />
      <Button
        onClick={() => onConfirm(text)}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Confirm Transcript'}
      </Button>
    </div>
  )
}
