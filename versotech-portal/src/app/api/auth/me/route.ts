import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user from Supabase session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user || userError) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Get user profile for role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        error: 'Profile not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
        displayName: profile.display_name,
        createdAt: profile.created_at
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({
      error: 'Failed to get user data'
    }, { status: 500 })
  }
}
