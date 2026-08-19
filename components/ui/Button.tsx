'use client'

import { useRef } from 'react'
import gsap from 'gsap'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'pink' | 'green' | 'tertiary' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (disabled) return
    if (btnRef.current) {
      gsap.timeline()
        .to(btnRef.current, { scale: 0.96, duration: 0.08, ease: 'power1.inOut' })
        .to(btnRef.current, { scale: 1, duration: 0.12, ease: 'power2.out' })
    }
    onClick?.()
  }

  const baseStyles =
    'font-bold rounded-full transition-all inline-flex items-center justify-center gap-2 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'

  const variantStyles = {
    primary:
      'bg-[#151518] text-white hover:bg-[#28282D] active:bg-[#0A0A0C] shadow-xs',
    dark:
      'bg-[#151518] text-white hover:bg-[#28282D] active:bg-[#0A0A0C] shadow-xs',
    secondary:
      'bg-white text-[#18181B] border border-[#ECE7DD] hover:bg-[#F7F5EE] hover:border-[#DCD7CD] shadow-2xs',
    pink:
      'bg-[#FFBBE2] text-[#4C0028] border border-[#F3A0CE] hover:bg-[#FFA5D6] shadow-xs',
    green:
      'bg-[#BEE7A5] text-[#193E07] border border-[#8BC968] hover:bg-[#B0DF94] shadow-xs',
    tertiary:
      'bg-transparent text-[#18181B] hover:text-[#FF88C2] hover:bg-[#F7F5EE]',
  }

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-[12px] h-8',
    md: 'px-5 py-2 text-[13px] h-10',
    lg: 'px-7 py-3 text-[14px] h-12',
  }

  return (
    <button
      ref={btnRef}
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}
