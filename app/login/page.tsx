'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/shared/supabase-browser'

import { getAppUrl } from '@/lib/env'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

function getErrorMessage(error?: string): string | null {
  if (error === 'unauthorized') return 'This Google account is not on the authorized admin whitelist for Theanors.'
  if (error === 'auth_failed') return 'Google authentication could not be completed. Please try again.'
  return null
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = use(searchParams)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    () => getErrorMessage(resolvedSearchParams?.error)
  )
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const baseUrl = getAppUrl()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
      }
    } catch {
      setErrorMessage('Failed to connect to Google authentication.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5EE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white border border-[#ECE7DD] rounded-[28px] p-8 shadow-xs">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#151518] text-white font-bold text-xl mb-3 shadow-xs">
            <span className="font-display">th</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF88C2] ml-0.5 mt-2" />
          </div>
          <h1 className="text-[26px] font-bold text-[#18181B] font-display tracking-tight">theanors</h1>
          <p className="text-[13px] text-[#7A776E] mt-1 font-medium">
            Content Operations Platform
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-[#FFBBE2] border border-[#F3A0CE] rounded-[18px] text-[12px] text-[#4C0028] font-medium flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 px-5 bg-[#151518] hover:bg-[#28282D] active:bg-[#0A0A0C] text-white rounded-full font-bold text-[13px] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none shadow-xs cursor-pointer"
          >
            {/* Google SVG Icon */}
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-[#ECE7DD] text-center">
          <p className="text-[11px] text-[#9E9B92]">
            Restricted Admin Access • Shared Workspace
          </p>
        </div>
      </div>
    </div>
  )
}
