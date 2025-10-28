import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'

// DELETE - Remove a filter view
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireStaffAuth()
    const { id: viewId } = await context.params

    const supabase = await createClient()

    // Delete the filter view (only if it belongs to the current user)
    const { error } = await supabase
      .from('staff_filter_views')
      .delete()
      .eq('id', viewId)
      .eq('user_id', profile.id) // Ensure user can only delete their own views

    if (error) {
      console.error('Failed to delete filter view:', error)
      throw error
    }

    return NextResponse.json({
      message: 'Filter view deleted successfully'
    })
  } catch (error) {
    console.error('Filter view DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete filter view' },
      { status: 500 }
    )
  }
}

// PATCH - Update a filter view (e.g., rename or set as default)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireStaffAuth()
    const { id: viewId } = await context.params
    const body = await request.json()
    const { name, is_default, filters } = body

    const supabase = await createClient()

    // Build update object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (is_default !== undefined) updates.is_default = is_default
    if (filters !== undefined) updates.filters = filters
    updates.updated_at = new Date().toISOString()

    // If setting as default, unset all other defaults for this entity type
    if (is_default) {
      const { data: view } = await supabase
        .from('staff_filter_views')
        .select('entity_type')
        .eq('id', viewId)
        .single()

      if (view) {
        await supabase
          .from('staff_filter_views')
          .update({ is_default: false })
          .eq('user_id', profile.id)
          .eq('entity_type', view.entity_type)
      }
    }

    // Update the filter view
    const { data, error } = await supabase
      .from('staff_filter_views')
      .update(updates)
      .eq('id', viewId)
      .eq('user_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update filter view:', error)
      throw error
    }

    return NextResponse.json({
      view: data,
      message: 'Filter view updated successfully'
    })
  } catch (error) {
    console.error('Filter view PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update filter view' },
      { status: 500 }
    )
  }
}
