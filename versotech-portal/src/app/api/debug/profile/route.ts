import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        user: null,
        profile: null
      })
    }

    // Get the profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile
    })

  } catch (error) {
    console.error('Debug profile error:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Check if user should be staff
    const isStaff = user.email?.includes('staff') ||
                   user.email?.includes('admin') ||
                   user.email?.includes('verso') ||
                   user.email?.includes('cto') ||
                   user.email?.includes('biz')

    const newRole = isStaff ? 'staff_admin' : 'investor'

    // Update the profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({
        error: 'Failed to update profile',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email
      },
      profile: updatedProfile,
      shouldBeStaff: isStaff,
      newRole: newRole
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error
    }, { status: 500 })
  }
}