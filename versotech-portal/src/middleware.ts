import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { parseDemoSession, isStaffDemoRole, isInvestorDemoRole, DEMO_COOKIE_NAME } from '@/lib/demo-session'

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
      console.log('[middleware] Auth code detected, skipping auth check:', { code: code?.substring(0, 8) + '...', error })
      return supabaseResponse
    }

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/versoholdings/login',
      '/versotech/login',
      '/logout'
    ]

    const isPublicRoute = publicRoutes.includes(pathname)
    const isLoginRoute = pathname === '/versoholdings/login' || pathname === '/versotech/login'

    // SECURE: Use getUser() which validates against Supabase Auth server
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      const demoCookie = request.cookies.get(DEMO_COOKIE_NAME)

      if (demoCookie) {
        console.log('[middleware] Raw demo cookie value:', demoCookie.value);

        try {
          const demoSession = parseDemoSession(demoCookie.value);

          if (demoSession) {
            const isStaffDemo = isStaffDemoRole(demoSession.role);
            const isInvestorDemo = isInvestorDemoRole(demoSession.role);

            console.log('[middleware] Parsed demo session:', {
              pathname,
              ...demoSession,
              isStaffDemo,
              isInvestorDemo
            });

            if (pathname.startsWith('/versotech')) {
              if (pathname === '/versotech/login') {
                // Don't check auth for login page
                return NextResponse.next({ request })
              }
              if (isStaffDemo) {
                console.log('[middleware] Allowing staff demo access to:', pathname)
                return NextResponse.next({ request })
              }
              console.log('[middleware] Blocking non-staff demo from:', pathname)
              return NextResponse.redirect(new URL('/versotech/login?error=auth_required', request.url))
            }

            if (pathname.startsWith('/versoholdings')) {
              if (isInvestorDemo || !demoSession.role) {
                return NextResponse.next({ request })
              }
              return NextResponse.redirect(new URL('/versoholdings/login?error=auth_required', request.url))
            }

            if (pathname === '/versotech/login' && isStaffDemo) {
              return NextResponse.redirect(new URL('/versotech/staff', request.url))
            }

            if (pathname === '/versoholdings/login' && isInvestorDemo) {
              return NextResponse.redirect(new URL('/versoholdings/dashboard', request.url))
            }

            // Don't redirect from home page, let users choose their portal
            if (pathname === '/') {
              return NextResponse.next({ request })
            }
          } else {
            console.log('[middleware] Invalid demo session format');
          }
        } catch (err) {
          console.error('[middleware] Error parsing demo cookie:', err);
        }
      }

      if (isPublicRoute) {
        const response = NextResponse.next({
          request,
        })

        if (isLoginRoute) {
          response.cookies.delete('sb-access-token')
          response.cookies.delete('sb-refresh-token')
          response.cookies.set('sb-access-token', '', { maxAge: 0 })
          response.cookies.set('sb-refresh-token', '', { maxAge: 0 })
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

      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      response.cookies.set('sb-access-token', '', { maxAge: 0 })
      response.cookies.set('sb-refresh-token', '', { maxAge: 0 })

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

    let effectiveProfile = profile

    if ((profileError && profileError.code === 'PGRST116') || !profile) {
      console.warn('[auth] Missing profile detected, attempting to provision default profile', { userId: user.id })

      const staffRoles = ['staff_admin', 'staff_ops', 'staff_rm']
      const metadataRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : null
      const derivedRole = metadataRole && staffRoles.includes(metadataRole) ? metadataRole : 'investor'
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.display_name ||
        user.email?.split('@')[0] ||
        'User'

      const { data: createdProfile, error: createProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: derivedRole,
          display_name: displayName,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select('*')
        .single()

      if (createProfileError || !createdProfile) {
        console.error('[auth] Failed to provision profile automatically:', createProfileError)
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/versoholdings/login?error=profile_not_found', request.url))
      }

      effectiveProfile = createdProfile
    } else if (profileError) {
      console.error('[auth] Error fetching user profile:', profileError)
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/versoholdings/login?error=profile_not_found', request.url))
    }

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
