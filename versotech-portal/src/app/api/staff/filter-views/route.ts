import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'

// GET - Fetch all filter views for the current user
export async function GET(request: NextRequest) {
  try {
    const profile = await requireStaffAuth()
    const { searchParams } = new URL(request.url)
    const entity = searchParams.get('entity') || 'investor'

    const supabase = await createClient()

    const { data: views, error } = await supabase
      .from('staff_filter_views')
      .select('*')
      .eq('user_id', profile.id)
      .eq('entity_type', entity)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch filter views:', error)
      throw error
    }

    return NextResponse.json({
      views: views || []
    })
  } catch (error) {
    console.error('Filter views GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter views' },
      { status: 500 }
    )
  }
}

// POST - Create a new filter view
export async function POST(request: NextRequest) {
  try {
    const profile = await requireStaffAuth()
    const body = await request.json()
    const { name, entity, filters } = body

    if (!name || !entity || !filters) {
      return NextResponse.json(
        { error: 'Missing required fields: name, entity, filters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create the filter view
    const { data: view, error } = await supabase
      .from('staff_filter_views')
      .insert({
        user_id: profile.id,
        name,
        entity_type: entity,
        filters,
        is_default: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create filter view:', error)
      throw error
    }

    return NextResponse.json({
      view,
      message: 'Filter view created successfully'
    })
  } catch (error) {
    console.error('Filter views POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create filter view' },
      { status: 500 }
    )
  }
}
