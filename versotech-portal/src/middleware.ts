import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  try {
    // Skip middleware for static files and API routes
    if (
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/_next/image') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/api/') ||
      pathname === '/auth/callback' ||
      pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
    ) {
      return supabaseResponse
    }

    // Skip auth check if there's a confirmation code - let the client handle it
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (code || error) {
      console.log('[middleware] Auth code/error detected, skipping auth check:', { code: code?.substring(0, 8) + '...', error })

      // If there's an error param (like session_expired), clear cookies to prevent loops
      if (error) {
        console.log('[middleware] Clearing cookies due to error param:', error)

        // Redirect to same URL without error param to break the cycle
        const cleanUrl = new URL(request.url)
        cleanUrl.searchParams.delete('error')
        cleanUrl.searchParams.delete('code')

        const response = NextResponse.redirect(cleanUrl)

        // Delete Supabase auth cookies using correct names (project-specific)
        response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token')
        response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token-code-verifier')

        // Also set to empty as fallback
        response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token', '', {
          maxAge: 0,
          path: '/'
        })
        response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token-code-verifier', '', {
          maxAge: 0,
          path: '/'
        })

        return response
      }

      return supabaseResponse
    }

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/versoholdings/login',
      '/versotech/login',
      '/logout'
    ]

    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/sign/')
    const isLoginRoute = pathname === '/versoholdings/login' || pathname === '/versotech/login'

    // Step 1: Get session from cookies (no network call)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    let user = null
    let authError = null

    // Step 2: If session exists, validate and refresh if needed
    if (session) {
      // Check if access token is expired or about to expire
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
      const now = Date.now()
      const isExpired = expiresAt <= now
      const isExpiringSoon = expiresAt <= now + 300000 // Within 5 minutes (industry standard)

      if (isExpired || isExpiringSoon) {
        console.log('[middleware] Token expired or expiring soon, attempting refresh...', {
          expiresAt: new Date(expiresAt).toISOString(),
          now: new Date(now).toISOString(),
        })

        // Attempt to refresh the session with retry logic for transient failures
        let refreshAttempts = 0
        let refreshedSession = null
        let refreshError = null

        while (refreshAttempts < 3) {
          const { data, error } = await supabase.auth.refreshSession()

          if (!error && data.session) {
            refreshedSession = data.session
            console.log('[middleware] Token refreshed successfully',
              refreshAttempts > 0 ? `(after ${refreshAttempts + 1} attempts)` : '')
            break
          }

          refreshError = error
          refreshAttempts++

          // Don't retry on permanent errors
          if (error?.message?.includes('Invalid Refresh Token') ||
              error?.message?.includes('already been used')) {
            console.warn('[middleware] Permanent refresh error, not retrying:', error.message)
            break
          }

          if (refreshAttempts < 3) {
            console.warn(`[middleware] Token refresh attempt ${refreshAttempts} failed, retrying...`, error?.message)
            // Exponential backoff: 100ms, 200ms, 400ms
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, refreshAttempts - 1)))
          }
        }

        if (refreshError) {
          console.warn('[middleware] Token refresh failed after retries:', refreshError.message)
          // TODO: Add monitoring/alerting here for production
          // Example: Sentry.captureException(refreshError, { tags: { type: 'token_refresh_failure' } })
          authError = refreshError
        } else if (refreshedSession) {
          user = refreshedSession.user
        }
      } else {
        // Session is still valid, use it
        user = session.user
      }
    } else if (sessionError) {
      console.warn('[middleware] Session retrieval error:', sessionError.message)
      authError = sessionError
    }

    // Step 3: If we still don't have a user but had a session, try getUser as final validation
    if (!user && session && !authError) {
      const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.warn('[middleware] User validation failed:', userError.message)
        authError = userError
      } else {
        user = validatedUser
      }
    }

    // Step 4: Handle authentication failure
    const isRefreshTokenError = authError && (
      authError.message?.includes('refresh') ||
      authError.message?.includes('Invalid Refresh Token') ||
      authError.message?.includes('already been used')
    )

    if (isRefreshTokenError && authError) {
      console.log('[middleware] Refresh token error detected, clearing session:', authError.message)
      // TODO: Add monitoring/alerting here for production - this should be RARE with the fixes
      // Example: Sentry.captureException(authError, { tags: { type: 'refresh_token_already_used' } })
      // Clear the invalid session
      await supabase.auth.signOut({ scope: 'local' })

      // Only redirect if not already on a public route
      if (!isPublicRoute) {
        const response = NextResponse.redirect(
          new URL(
            pathname.startsWith('/versotech')
              ? '/versotech/login?error=session_expired'
              : '/versoholdings/login?error=session_expired',
            request.url
          )
        )
        response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token')
        response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token-code-verifier')
        response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token', '', { maxAge: 0, path: '/' })
        response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token-code-verifier', '', { maxAge: 0, path: '/' })
        return response
      }
    }

    if (authError || !user) {
      if (isPublicRoute) {
        const response = NextResponse.next({
          request,
        })

        if (isLoginRoute) {
          response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token')
          response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token-code-verifier')
          response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token', '', { maxAge: 0, path: '/' })
          response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token-code-verifier', '', { maxAge: 0, path: '/' })
        }

        return response
      }

      console.log('[auth] Authentication failed:', authError?.message || 'No user found')

      // Check if there's a portal context in the URL to redirect appropriately
      const portalParam = request.nextUrl.searchParams.get('portal')
      let redirectUrl: URL
      
      if (portalParam === 'staff' || pathname.startsWith('/versotech')) {
        redirectUrl = new URL('/versotech/login?error=auth_required', request.url)
      } else if (pathname.startsWith('/versoholdings')) {
        redirectUrl = new URL('/versoholdings/login?error=auth_required', request.url)
      } else {
        // Default to investor portal
        redirectUrl = new URL('/versoholdings/login?error=auth_required', request.url)
      }
      
      const response = NextResponse.redirect(redirectUrl)

      response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token')
      response.cookies.delete('sb-ipguxdssecfexudnvtia-auth-token-code-verifier')
      response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token', '', { maxAge: 0, path: '/' })
      response.cookies.set('sb-ipguxdssecfexudnvtia-auth-token-code-verifier', '', { maxAge: 0, path: '/' })

      return response
    }

    console.log('🔍 User authenticated:', {
      userId: user.id,
      email: user.email,
      pathname: pathname
    })

    if (isPublicRoute) {
      return supabaseResponse
    }


    // This check is now handled above - user is guaranteed to exist here

    // Get user profile for role-based access control
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Handle profile fetch errors - distinguish between permanent and transient failures
    if (profileError || !profile) {
      // PGRST116 = Profile record not found (permanent error - user needs to be signed out)
      if (profileError?.code === 'PGRST116' || !profile) {
        console.error('[auth] Profile not found for authenticated user (permanent error):', {
          userId: user.id,
          error: profileError
        })
        await supabase.auth.signOut()

        // Determine which portal to redirect to
        const loginUrl = pathname.startsWith('/versotech')
          ? '/versotech/login?error=profile_not_found'
          : '/versoholdings/login?error=profile_not_found'

        return NextResponse.redirect(new URL(loginUrl, request.url))
      } else {
        // Transient database error (connection timeout, etc.) - return 500, don't sign out
        console.error('[auth] Transient database error fetching profile:', {
          userId: user.id,
          error: profileError,
          errorCode: profileError?.code
        })
        // TODO: Add monitoring/alerting here for production
        // Example: Sentry.captureException(profileError, { tags: { type: 'profile_fetch_failure' } })

        return NextResponse.json(
          { error: 'Database error. Please try again.' },
          { status: 500 }
        )
      }
    }

    const effectiveProfile = profile

    // Role-based access control
    if (pathname.startsWith('/versoholdings') && effectiveProfile.role !== 'investor') {
      // Staff user trying to access investor portal
      if (['staff_admin', 'staff_ops', 'staff_rm'].includes(effectiveProfile.role)) {
        return NextResponse.redirect(new URL('/versotech/staff', request.url))
      }
      // Unknown role, redirect to investor login
      return NextResponse.redirect(new URL('/versoholdings/login', request.url))
    }

    if (pathname.startsWith('/versotech')) {
      // Only staff roles can access staff portal
      if (!['staff_admin', 'staff_ops', 'staff_rm'].includes(effectiveProfile.role)) {
        return NextResponse.redirect(new URL('/versoholdings/dashboard', request.url))
      }
    }

    console.log(`✅ Access granted: ${user.email} (${effectiveProfile.role}) → ${pathname}`)
    return supabaseResponse

  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login
    return NextResponse.redirect(new URL('/versoholdings/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
