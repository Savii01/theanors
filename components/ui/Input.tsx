'use client'

import React from 'react'

interface InputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  type?: string
  id?: string
  helpText?: string
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  type = 'text',
  id,
  helpText,
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[12px] font-bold text-[#18181B] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-[#F7F5EE] border rounded-[16px] text-[13px] text-[#18181B] placeholder-[#9E9B92]
          transition-all focus:outline-hidden focus:bg-white focus:border-[#151518] focus:ring-2 focus:ring-[#151518]/10
          ${error ? 'border-[#FF88C2] bg-[#FFF0F7]' : 'border-[#ECE7DD]'}
          ${disabled ? 'bg-[#EAE7DE] text-[#9E9B92] cursor-not-allowed' : ''}
          ${className}`}
      />
      {error && <p className="text-[11px] text-[#C20067] font-semibold mt-1">{error}</p>}
      {helpText && !error && <p className="text-[11px] text-[#7A776E] mt-1">{helpText}</p>}
    </div>
  )
}

interface TextareaProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  rows?: number
  id?: string
  helpText?: string
  onBlur?: () => void
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  rows = 4,
  id,
  helpText,
  onBlur,
}: TextareaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[12px] font-bold text-[#18181B] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-3 bg-[#F7F5EE] border rounded-[18px] text-[13px] text-[#18181B] placeholder-[#9E9B92]
          transition-all focus:outline-hidden focus:bg-white focus:border-[#151518] focus:ring-2 focus:ring-[#151518]/10
          ${error ? 'border-[#FF88C2] bg-[#FFF0F7]' : 'border-[#ECE7DD]'}
          ${disabled ? 'bg-[#EAE7DE] text-[#9E9B92] cursor-not-allowed' : ''}
          ${className}`}
      />
      {error && <p className="text-[11px] text-[#C20067] font-semibold mt-1">{error}</p>}
      {helpText && !error && <p className="text-[11px] text-[#7A776E] mt-1">{helpText}</p>}
    </div>
  )
}
