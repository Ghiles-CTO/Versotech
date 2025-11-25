import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  // SECURITY: Never trust metadataRole for staff roles
  // Staff roles should ONLY come from:
  // 1. Admin-created profiles (invitation flow)
  // 2. Company email domain validation

  if (portal === 'staff') {
    // For staff portal: require company email domain
    // Non-company emails must have pre-existing profile from admin invitation
    if (isStaffEmail(email)) {
      return 'staff_ops'
    }
    // DENY - non-company email trying to access staff portal
    // They must have a pre-existing profile created by admin invitation
    return null
  }

  // For investor portal: always default to investor
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

    // Clear any existing session first to prevent conflicts
    // This is critical for fixing "Invalid Refresh Token" errors on re-login
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (signOutError) {
      console.warn('[signin] Pre-signin signOut warning (non-fatal):', signOutError)
      // Non-fatal, continue with sign-in
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('[signin] Supabase sign-in error:', {
        message: error.message,
        status: error.status,
        name: error.name
      })

      // Provide specific error messages based on error type
      if (error.message?.toLowerCase().includes('invalid login credentials')) {
        return NextResponse.json({
          error: 'Invalid email or password. Please check your credentials and try again.'
        }, { status: 401 })
      }

      if (error.message?.toLowerCase().includes('email not confirmed')) {
        return NextResponse.json({
          error: 'Please confirm your email address before signing in.'
        }, { status: 403 })
      }

      if (error.message?.toLowerCase().includes('refresh') ||
          error.message?.toLowerCase().includes('session')) {
        return NextResponse.json({
          error: 'Session conflict detected. Please try again.'
        }, { status: 409 })
      }

      if (error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('too many')) {
        return NextResponse.json({
          error: 'Too many login attempts. Please wait a moment and try again.'
        }, { status: 429 })
      }

      // Generic error for unknown cases
      return NextResponse.json({
        error: 'Authentication failed. Please try again or contact support if the problem persists.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 401 })
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
