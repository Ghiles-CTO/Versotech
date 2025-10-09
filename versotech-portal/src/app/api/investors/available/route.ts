import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'

/**
 * Get list of available investors for group creation
 * API Route: /api/investors/available
 * Access: Staff only
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user (supports Supabase auth and demo mode)
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff
    const userRole = user.user_metadata?.role || user.role
    const isStaff = ['staff_admin', 'staff_ops', 'staff_rm'].includes(userRole)
    
    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden - Staff access only' }, { status: 403 })
    }

    // Get all investor users
    const { data: investorUsers, error: investorError } = await supabase
      .from('investor_users')
      .select(`
        user_id,
        profiles:user_id (
          id,
          display_name,
          email,
          role
        )
      `)
      .order('profiles(display_name)')

    if (investorError) {
      console.error('Error fetching investors:', investorError)
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 })
    }

    // Normalize the data
    const investors = (investorUsers || [])
      .filter((item: any) => item.profiles) // Filter out any without profile data
      .map((item: any, index: number) => {
        const profile = item.profiles
        const baseDisplayName = profile.display_name?.trim()

        // Provide fallback display names if needed
        let displayName = baseDisplayName
        if (!displayName) {
          const emailPrefix = profile.email?.split('@')[0] || 'Investor'
          displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
        }

        return {
          id: profile.id,
          display_name: displayName,
          email: profile.email || null,
          role: profile.role || 'investor'
        }
      })

    return NextResponse.json({
      investors
    })

  } catch (error) {
    console.error('Get available investors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


