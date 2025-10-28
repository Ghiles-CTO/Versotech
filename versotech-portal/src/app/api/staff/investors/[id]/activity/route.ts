import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffAuth()
    const { id: investorId } = await context.params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await createClient()

    // Fetch activity feed for the investor
    let query = supabase
      .from('activity_feed')
      .select(`
        id,
        activity_type,
        entity_id,
        title,
        description,
        metadata,
        created_at,
        created_by,
        profiles!activity_feed_created_by_fkey (
          id,
          display_name,
          email
        )
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply type filter if specified
    if (type !== 'all') {
      query = query.eq('activity_type', type)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error('Failed to fetch activity feed:', error)
      throw error
    }

    // Transform the data to match our interface
    const transformedActivities = (activities || []).map((activity: any) => ({
      id: activity.id,
      type: activity.activity_type,
      action: activity.title,
      description: activity.description,
      metadata: activity.metadata || {},
      created_at: activity.created_at,
      created_by: activity.profiles ? {
        id: activity.profiles.id,
        display_name: activity.profiles.display_name,
        email: activity.profiles.email
      } : undefined
    }))

    return NextResponse.json({
      activities: transformedActivities,
      total: transformedActivities.length
    })
  } catch (error) {
    console.error('Activity feed API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    )
  }
}
