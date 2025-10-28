import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard-preferences
 * Get current user's dashboard preferences
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch dashboard preferences
    const { data: preferences, error: prefError } = await supabase
      .from('dashboard_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no preferences exist, return defaults
    if (prefError && prefError.code === 'PGRST116') {
      return NextResponse.json({
        preferences: {
          user_id: user.id,
          layout_config: {},
          widget_order: [],
          custom_metrics: {},
          notification_settings: {
            email_notifications: true,
            push_notifications: true,
            deal_updates: true,
            message_notifications: true,
            weekly_summary: true
          },
          theme_settings: {
            mode: 'light',
            accent_color: '#0066FF'
          }
        }
      })
    }

    if (prefError) {
      return NextResponse.json(
        { error: 'Failed to fetch preferences', details: prefError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ preferences })
  } catch (error: any) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/dashboard-preferences
 * Update current user's dashboard preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Define allowed fields for update
    const allowedFields = [
      'layout_config',
      'widget_order',
      'custom_metrics',
      'notification_settings',
      'theme_settings'
    ]

    // Filter out any fields that aren't allowed
    const updates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Ensure there's something to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Check if preferences already exist
    const { data: existing } = await supabase
      .from('dashboard_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('dashboard_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update preferences', details: error.message },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('dashboard_preferences')
        .insert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create preferences', details: error.message },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      preferences: result,
      message: 'Preferences updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
