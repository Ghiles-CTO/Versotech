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

    // Verify task belongs to user
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('id, owner_user_id')
      .eq('id', id)
      .single()

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.owner_user_id !== user.id) {
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
