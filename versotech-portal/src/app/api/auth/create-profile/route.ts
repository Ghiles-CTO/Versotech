import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, displayName, role } = body

    if (!userId || !email || !displayName || !role) {
      return NextResponse.json({
        error: 'Missing required fields'
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

    // Use service client to create profile (bypasses RLS)
    const serviceSupabase = createServiceClient()

    console.log('[create-profile] Creating profile:', {
      userId,
      email,
      displayName,
      role
    })

    const { data: profile, error: createError } = await serviceSupabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: role,
        display_name: displayName,
        created_at: new Date().toISOString()
      })
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


