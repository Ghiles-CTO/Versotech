import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateDemoCredentials } from '@/lib/demo-auth'
import { createDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'

type StaffRole = 'staff_admin' | 'staff_ops' | 'staff_rm'

type SupabaseProfile = {
  id: string
  email: string
  role: string
  display_name: string
  title?: string | null
  created_at?: string
}

const STAFF_ROLES: StaffRole[] = ['staff_admin', 'staff_ops', 'staff_rm']
const STAFF_DOMAINS = ['@versotech.com', '@verso.com']

const isStaffRole = (role: string | null | undefined): role is StaffRole => {
  return !!role && STAFF_ROLES.includes(role as StaffRole)
}

const isStaffEmail = (email: string | null | undefined): boolean => {
  if (!email) return false
  const lowered = email.toLowerCase()
  return STAFF_DOMAINS.some((domain) => lowered.endsWith(domain))
}

const deriveDisplayName = (user: { email?: string | null; user_metadata?: Record<string, unknown> }): string => {
  const metadata = user.user_metadata ?? {}

  if (typeof metadata === 'object' && metadata !== null) {
    const fullName = (metadata as Record<string, unknown>).full_name
    if (typeof fullName === 'string' && fullName.trim()) {
      return fullName
    }

    const displayName = (metadata as Record<string, unknown>).display_name
    if (typeof displayName === 'string' && displayName.trim()) {
      return displayName
    }
  }

  if (user.email) {
    const [localPart] = user.email.split('@')
    if (localPart) return localPart
  }

  return 'User'
}

const resolveDefaultRole = (
  portal: string,
  metadataRole: string | null,
  email: string | null
): string | null => {
  if (metadataRole && isStaffRole(metadataRole)) {
    return metadataRole
  }

  if (portal === 'staff') {
    if (isStaffEmail(email)) {
      return 'staff_ops'
    }
    return null
  }

  if (metadataRole === 'investor') {
    return 'investor'
  }

  return 'investor'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const portalContext = typeof body.portal === 'string' ? body.portal : 'investor'

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      const message = error.message?.toLowerCase() ?? ''

      if (message.includes('invalid login credentials')) {
        const demoUser = validateDemoCredentials(email, password)

        if (demoUser) {
          const demoRole = demoUser.role
          const isStaffDemo = isStaffRole(demoRole)

          if (portalContext === 'staff' && !isStaffDemo) {
            return NextResponse.json({ error: 'Staff access required. Please use your staff credentials.' }, { status: 403 })
          }
          
          if (portalContext === 'investor' && isStaffDemo) {
            return NextResponse.json({ error: 'Investor access required. Staff accounts cannot access the investor portal.' }, { status: 403 })
          }

          await supabase.auth.signOut()

          const redirectPath = isStaffDemo ? '/versotech/staff' : '/versoholdings/dashboard'
          const response = NextResponse.json({
            success: true,
            redirect: redirectPath,
            user: {
              id: demoUser.id,
              email: demoUser.email,
              role: demoUser.role,
              displayName: demoUser.display_name,
              demo: true
            }
          })

          response.cookies.delete('sb-access-token')
          response.cookies.delete('sb-refresh-token')

          const cookieValue = createDemoSession({
            id: demoUser.id,
            email: demoUser.email,
            role: demoUser.role,
            displayName: demoUser.display_name
          })
          
          response.cookies.set(DEMO_COOKIE_NAME, cookieValue, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // Always false for development
            path: '/',
            maxAge: 60 * 60 * 8
          })
          
          console.log('[auth] Demo user authenticated:', demoUser.email, 'role:', demoUser.role)

          return response
        }

        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      console.error('Supabase sign-in error:', error)
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 })
    }

    if (!data.user) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Authentication failed - no user data' }, { status: 401 })
    }

    if (!data.session) {
      await supabase.auth.signOut()
      return NextResponse.json({
        error: 'Email verification required. Please confirm your email before signing in.'
      }, { status: 403 })
    }

    const user = data.user
    const userEmail = user.email?.toLowerCase() ?? null
    const metadataRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : null

    const {
      data: profile,
      error: profileError
    } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<SupabaseProfile>()

    let resolvedProfile: SupabaseProfile | null = profile ?? null

    if ((profileError && profileError.code === 'PGRST116') || !profile) {
      const defaultRole = resolveDefaultRole(portalContext, metadataRole, userEmail)

      if (!defaultRole) {
        await supabase.auth.signOut()
        return NextResponse.json({
          error: 'Staff access required. Please contact an administrator.'
        }, { status: 403 })
      }

      const displayName = deriveDisplayName(user)

      const { data: createdProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: defaultRole,
          display_name: displayName,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select('*')
        .single<SupabaseProfile>()

      if (upsertError || !createdProfile) {
        console.error('Signin profile upsert error:', upsertError)
        await supabase.auth.signOut()
        return NextResponse.json({
          error: 'User profile could not be created'
        }, { status: 500 })
      }

      resolvedProfile = createdProfile
    } else if (profileError) {
      console.error('Signin profile fetch error:', profileError)
      await supabase.auth.signOut()
      return NextResponse.json({
        error: 'Failed to load user profile'
      }, { status: 500 })
    }

    if (!resolvedProfile) {
      await supabase.auth.signOut()
      return NextResponse.json({
        error: 'User profile not found'
      }, { status: 404 })
    }

    let redirectPath = '/versoholdings/dashboard'

    if (isStaffRole(resolvedProfile.role)) {
      redirectPath = '/versotech/staff'
    } else if (portalContext === 'staff') {
      await supabase.auth.signOut()
      return NextResponse.json({
        error: 'Staff access required. This account has investor-level access.'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      redirect: redirectPath,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: {
        id: user.id,
        email: user.email,
        role: resolvedProfile.role,
        displayName: resolvedProfile.display_name
      }
    })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
