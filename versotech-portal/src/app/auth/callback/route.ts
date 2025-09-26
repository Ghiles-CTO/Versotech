import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const STAFF_ROLES = new Set(['staff_admin', 'staff_ops', 'staff_rm'])
const STAFF_DOMAINS = ['@versotech.com', '@verso.com']

const resolveRedirectPath = (next: string | null, role: string) => {
  const defaultPath = STAFF_ROLES.has(role) ? '/versotech/staff' : '/versoholdings/dashboard'

  if (!next) {
    return defaultPath
  }

  if (!next.startsWith('/')) {
    return defaultPath
  }

  if (next.startsWith('/versotech') && !STAFF_ROLES.has(role)) {
    return defaultPath
  }

  if (next.startsWith('/versoholdings') && STAFF_ROLES.has(role)) {
    return defaultPath
  }

  return next
}

const deriveDisplayName = (email: string | null, metadata: Record<string, any>) => {
  return (
    metadata?.full_name ||
    metadata?.display_name ||
    email?.split('@')[0] ||
    'User'
  )
}

const isStaffEmail = (email: string | null) => {
  if (!email) return false
  return STAFF_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain))
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const next = requestUrl.searchParams.get('next')
  const portalContext = requestUrl.searchParams.get('portal') ?? 'investor'
  const origin = requestUrl.origin

  const investorLogin = `${origin}/versoholdings/login`
  const staffLogin = `${origin}/versotech/login`

  if (error) {
    console.error('[auth] OAuth callback error:', error, requestUrl.searchParams.get('error_description'))
    const loginUrl = portalContext === 'staff' ? staffLogin : investorLogin
    return NextResponse.redirect(`${loginUrl}?error=auth_failed`)
  }

  if (!code) {
    const loginUrl = portalContext === 'staff' ? staffLogin : investorLogin
    return NextResponse.redirect(`${loginUrl}?error=auth_failed`)
  }

  try {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data?.user) {
      console.error('[auth] Failed to exchange code for session:', exchangeError)
      const loginUrl = portalContext === 'staff' ? staffLogin : investorLogin
      return NextResponse.redirect(`${loginUrl}?error=auth_failed`)
    }

    const user = data.user
    const email = user.email?.toLowerCase() ?? null
    const metadataRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[auth] Error loading user profile:', profileError)
      const loginUrl = portalContext === 'staff' ? staffLogin : investorLogin
      return NextResponse.redirect(`${loginUrl}?error=profile_not_found`)
    }

    let role = profile?.role ?? metadataRole ?? 'investor'

    if (!profile) {
      if (portalContext === 'staff') {
        let staffRole: string | null = null

        if (metadataRole && STAFF_ROLES.has(metadataRole)) {
          staffRole = metadataRole
        } else if (isStaffEmail(email)) {
          staffRole = 'staff_ops'
        }

        if (!staffRole) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${staffLogin}?error=staff_access_required`)
        }

        role = staffRole
      } else {
        if (metadataRole && STAFF_ROLES.has(metadataRole)) {
          role = metadataRole
        } else {
          role = 'investor'
        }
      }

      const displayName = deriveDisplayName(email, user.user_metadata ?? {})

      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role,
          display_name: displayName,
          created_at: new Date().toISOString(),
        })

      if (createError) {
        console.error('[auth] Failed to create profile during OAuth callback:', createError)
        const loginUrl = portalContext === 'staff' ? staffLogin : investorLogin
        return NextResponse.redirect(`${loginUrl}?error=profile_creation_failed`)
      }
    } else {
      if (portalContext === 'staff' && !STAFF_ROLES.has(profile.role)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${staffLogin}?error=staff_access_required`)
      }

      if (portalContext === 'investor' && STAFF_ROLES.has(profile.role)) {
        const redirectUrl = new URL('/versotech/staff', origin)
        return NextResponse.redirect(redirectUrl)
      }

      role = profile.role
    }

    const redirectPath = resolveRedirectPath(next, role)
    const redirectUrl = new URL(redirectPath, origin)

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error('[auth] Unexpected error in OAuth callback:', err)
    const loginUrl = portalContext === 'staff' ? staffLogin : investorLogin
    return NextResponse.redirect(`${loginUrl}?error=auth_failed`)
  }
}
