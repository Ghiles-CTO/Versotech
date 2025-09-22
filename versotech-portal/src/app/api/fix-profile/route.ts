import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Determine the correct role based on email
    const isStaff = user.email?.includes('staff') ||
                   user.email?.includes('admin') ||
                   user.email?.includes('verso') ||
                   user.email?.includes('cto') ||
                   user.email?.includes('biz')

    const correctRole = isStaff ? 'staff_admin' : 'investor'

    // Update the profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ role: correctRole })
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({
        error: 'Failed to update profile',
        details: error
      }, { status: 500 })
    }

    // Determine the correct redirect URL
    const redirectUrl = correctRole.startsWith('staff_')
      ? '/versotech/staff'
      : '/versoholdings/dashboard'

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email
      },
      profile: updatedProfile,
      shouldBeStaff: isStaff,
      correctRole: correctRole,
      redirectUrl: redirectUrl
    })

  } catch (error) {
    console.error('Fix profile error:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error
    }, { status: 500 })
  }
}