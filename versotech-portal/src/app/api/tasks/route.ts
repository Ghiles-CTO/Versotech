import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * PATCH /api/tasks
 * Update task status and metadata
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { id, status, started_at, completed_at } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Verify task belongs to user (via various ownership methods)
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('id, owner_user_id, owner_investor_id, owner_ceo_entity_id, related_deal_id')
      .eq('id', id)
      .single()

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check authorization through multiple ownership paths
    let hasPermission = task.owner_user_id === user.id

    // Check if user is linked to owner_investor_id
    if (!hasPermission && task.owner_investor_id) {
      const { data: investorLink } = await supabase
        .from('investor_users')
        .select('id')
        .eq('investor_id', task.owner_investor_id)
        .eq('user_id', user.id)
        .single()

      hasPermission = !!investorLink
    }

    // Check if user is a CEO user (for tasks owned by CEO entity)
    if (!hasPermission && task.owner_ceo_entity_id) {
      const { data: ceoUser } = await supabase
        .from('ceo_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      hasPermission = !!ceoUser
    }

    // Check if user is arranger for the related deal (arranger tasks have no owner, use related_deal_id)
    if (!hasPermission && task.related_deal_id) {
      const { data: arrangerLink } = await supabase
        .from('arranger_users')
        .select('arranger_id')
        .eq('user_id', user.id)

      if (arrangerLink && arrangerLink.length > 0) {
        // Check if any of user's arranger entities is the arranger for this deal
        const arrangerIds = arrangerLink.map(a => a.arranger_id)
        const { data: deal } = await supabase
          .from('deals')
          .select('arranger_entity_id')
          .eq('id', task.related_deal_id)
          .single()

        hasPermission = deal && arrangerIds.includes(deal.arranger_entity_id)
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update this task' },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, any> = {}
    if (status) updates.status = status
    if (started_at) updates.started_at = started_at
    if (completed_at) updates.completed_at = completed_at

    // Update task
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating task:', updateError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json({ task: updatedTask }, { status: 200 })
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
