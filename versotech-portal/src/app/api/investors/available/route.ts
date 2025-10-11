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

    // Get all investor users with their entities
    const { data: investorUsers, error: investorError} = await supabase
      .from('investor_users')
      .select(`
        user_id,
        investor_id,
        profiles:user_id (
          id,
          display_name,
          email,
          role
        )
      `)

    if (investorError) {
      console.error('Error fetching investors:', investorError)
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 })
    }

    // Now get entity info separately to avoid join issues
    const investorIds = (investorUsers || []).map((u: any) => u.investor_id).filter(Boolean)
    
    let entitiesMap = new Map()
    if (investorIds.length > 0) {
      const { data: entities } = await supabase
        .from('investor_entities')
        .select('id, entity_name, entity_type')
        .in('id', investorIds)
      
      entities?.forEach(entity => {
        entitiesMap.set(entity.id, entity)
      })
    }

    // Normalize the data with entity information
    const investors = (investorUsers || [])
      .filter((item: any) => item.profiles) // Filter out any without profile data
      .map((item: any) => {
        const profile = item.profiles
        const entity = entitiesMap.get(item.investor_id)
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
          role: profile.role || 'investor',
          investor_id: item.investor_id,
          entity_name: entity?.entity_name || null,
          entity_type: entity?.entity_type || null,
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


