import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Company domains that are allowed to self-register as staff
const COMPANY_DOMAINS = ['versotech.com', 'verso.com']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // SECURITY: Role is NOT accepted from client - always derived server-side
    const { userId, email, displayName } = body

    if (!userId || !email || !displayName) {
      return NextResponse.json({
        error: 'Missing required fields (userId, email, displayName)'
      }, { status: 400 })
    }

    // Verify the requesting user is authenticated
    const authSupabase = await createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Use service client to bypass RLS
    const serviceSupabase = createServiceClient()

    // SECURITY: Check if profile was pre-created by admin invitation
    // If so, use the admin-assigned role
    const { data: existingProfile } = await serviceSupabase
      .from('profiles')
      .select('role, display_name')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    let role = 'investor'

    if (existingProfile?.role) {
      // Admin already created profile with assigned role (invitation flow)
      role = existingProfile.role
      console.log('[create-profile] Using admin-assigned role from existing profile:', role)
    } else {
      // Derive role from email domain
      const emailDomain = email.toLowerCase().split('@')[1]
      if (COMPANY_DOMAINS.includes(emailDomain)) {
        role = 'staff_ops'
        console.log('[create-profile] Company email detected, assigning staff_ops role')
      }
    }

    console.log('[create-profile] Creating/updating profile:', {
      userId,
      email,
      displayName,
      role
    })

    // Use upsert to handle both new profiles and updating existing invited profiles
    const { data: profile, error: createError } = await serviceSupabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email.toLowerCase(),
        role: role,
        display_name: displayName,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single()

    if (createError) {
      console.error('[create-profile] Failed to create profile:', createError)
      return NextResponse.json({
        error: 'Failed to create profile',
        details: createError.message
      }, { status: 500 })
    }

    console.log('[create-profile] Profile created successfully:', email, role, displayName)

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('[create-profile] Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}


