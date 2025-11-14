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

    // SECURE: Use getUser() which validates against Supabase Auth server
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Handle refresh token errors specifically
    if (userError) {
      const isRefreshTokenError =
        userError.message?.includes('refresh') ||
        userError.message?.includes('Invalid Refresh Token')

      if (isRefreshTokenError) {
        console.log('[auth] Refresh token error detected, clearing session:', userError.message)
        // Clear the invalid session
        await supabase.auth.signOut({ scope: 'local' })

        // Clear cookies
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

    if (userError || !user) {
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

      console.log('[auth] Authentication failed:', userError?.message || 'No user found')

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

    // If profile doesn't exist, sign out and redirect to login with error
    // Profile should be created during signup or OAuth callback
    if (profileError || !profile) {
      console.error('[auth] Profile not found for authenticated user:', { userId: user.id, error: profileError })
      await supabase.auth.signOut()
      
      // Determine which portal to redirect to
      const loginUrl = pathname.startsWith('/versotech') 
        ? '/versotech/login?error=profile_not_found'
        : '/versoholdings/login?error=profile_not_found'
      
      return NextResponse.redirect(new URL(loginUrl, request.url))
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
