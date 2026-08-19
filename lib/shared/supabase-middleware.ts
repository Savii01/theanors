import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')

  if (isPublicAsset) {
    return supabaseResponse
  }

  // Check email whitelist if configured
  const allowedEmailsRaw = process.env.ALLOWED_ADMIN_EMAILS || ''
  const allowedEmails = allowedEmailsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const isEmailAllowed = (email?: string) => {
    if (allowedEmails.length === 0) return true // If no whitelist configured, permit authenticated users
    if (!email) return false
    return allowedEmails.includes(email.toLowerCase())
  }

  // Unauthenticated user trying to access protected route
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user
  if (user) {
    // If user's email is not in the whitelist, block them
    if (!isEmailAllowed(user.email)) {
      if (!isAuthRoute || pathname !== '/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }
    } else if (pathname === '/login') {
      // Allowed user visiting /login gets redirected to Dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
