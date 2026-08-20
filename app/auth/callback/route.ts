import { NextResponse } from 'next/server'
import { createClient } from '@/lib/shared/supabase-server'
import { getAppUrl } from '@/lib/env'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Determine the correct base URL
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  
  let baseUrl = getAppUrl()
  if (forwardedHost) {
    baseUrl = `${forwardedProto}://${forwardedHost}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next.startsWith('/') ? next : `/${next}`}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`)
}
