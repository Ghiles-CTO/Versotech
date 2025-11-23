import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/backfill-tasks
 * Backfill onboarding tasks for existing investors who don't have any tasks
 * Authentication: Staff Admin only
 *
 * This utility finds all investor users who have no onboarding tasks and creates them.
 * Useful for fixing users who were invited before the automation was implemented.
 */
export async function POST(request: Request) {
  try {
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff admin role
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff admin access required' }, { status: 403 })
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    const body = await request.json()
    const { user_id, investor_id, dry_run = false } = body

    const results = {
      processed: 0,
      created_tasks: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    }

    // If specific user_id and investor_id provided, backfill just that user
    if (user_id && investor_id) {
      const result = await backfillUser(supabase, user_id, investor_id, dry_run)
      results.processed = 1
      results.created_tasks = result.tasks_created
      results.details.push(result)

      return NextResponse.json(results, { status: 200 })
    }

    // Otherwise, find all investors with users but missing onboarding tasks
    const { data: investorUsers, error: fetchError } = await supabase
      .from('investor_users')
      .select(`
        user_id,
        investor_id,
        investors!inner(legal_name, onboarding_status),
        profiles!inner(email, display_name)
      `)

    if (fetchError) {
      console.error('Error fetching investor users:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch investor users' }, { status: 500 })
    }

    // Check each user for missing onboarding tasks
    for (const iu of investorUsers || []) {
      try {
        // Check if user has any onboarding tasks
        const { data: existingTasks } = await supabase
          .from('tasks')
          .select('id, category')
          .eq('owner_user_id', iu.user_id)
          .eq('category', 'onboarding')

        // If no onboarding tasks, backfill
        if (!existingTasks || existingTasks.length === 0) {
          const result = await backfillUser(supabase, iu.user_id, iu.investor_id, dry_run)
          results.processed++
          results.created_tasks += result.tasks_created
          results.details.push({
            user_email: (iu as any).profiles.email,
            investor_name: (iu as any).investors.legal_name,
            ...result
          })
        } else {
          results.skipped++
          results.details.push({
            user_email: (iu as any).profiles.email,
            investor_name: (iu as any).investors.legal_name,
            status: 'skipped',
            reason: `Already has ${existingTasks.length} onboarding tasks`
          })
        }
      } catch (err: any) {
        console.error(`Error processing user ${iu.user_id}:`, err)
        results.errors++
        results.details.push({
          user_id: iu.user_id,
          status: 'error',
          error: err.message
        })
      }
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error('API /admin/backfill-tasks POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Backfill tasks for a single user
 */
async function backfillUser(
  supabase: any,
  user_id: string,
  investor_id: string,
  dry_run: boolean
): Promise<{
  user_id: string
  investor_id: string
  status: string
  tasks_created: number
  task_titles?: string[]
}> {
  if (dry_run) {
    // In dry run mode, just count what would be created
    const { data: templates } = await supabase
      .from('task_templates')
      .select('title')
      .eq('trigger_event', 'investor_created')

    return {
      user_id,
      investor_id,
      status: 'dry_run',
      tasks_created: templates?.length || 0,
      task_titles: templates?.map((t: any) => t.title)
    }
  }

  // Call the database function to create tasks
  const { data: createdTasks, error: createError } = await supabase
    .rpc('create_tasks_from_templates', {
      p_user_id: user_id,
      p_investor_id: investor_id,
      p_trigger_event: 'investor_created'
    })

  if (createError) {
    throw new Error(`Task creation failed: ${createError.message}`)
  }

  return {
    user_id,
    investor_id,
    status: 'success',
    tasks_created: createdTasks?.length || 0,
    task_titles: createdTasks?.map((t: any) => t.title)
  }
}

/**
 * GET /api/admin/backfill-tasks
 * Get statistics about users needing backfill
 */
export async function GET(request: Request) {
  try {
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff admin access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    // Find users with no onboarding tasks
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select(`
        user_id,
        investor_id,
        investors!inner(legal_name, onboarding_status),
        profiles!inner(email, display_name, created_at)
      `)

    const needsBackfill = []
    const hasTasks = []

    for (const iu of investorUsers || []) {
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id, category')
        .eq('owner_user_id', iu.user_id)
        .eq('category', 'onboarding')

      if (!existingTasks || existingTasks.length === 0) {
        needsBackfill.push({
          user_id: iu.user_id,
          email: (iu as any).profiles.email,
          display_name: (iu as any).profiles.display_name,
          investor_name: (iu as any).investors.legal_name,
          created_at: (iu as any).profiles.created_at
        })
      } else {
        hasTasks.push({
          user_id: iu.user_id,
          email: (iu as any).profiles.email,
          task_count: existingTasks.length
        })
      }
    }

    return NextResponse.json({
      total_users: investorUsers?.length || 0,
      needs_backfill: needsBackfill.length,
      has_tasks: hasTasks.length,
      users_needing_backfill: needsBackfill,
      summary: {
        message: `${needsBackfill.length} users need onboarding tasks created`,
        action: 'POST to /api/admin/backfill-tasks to create tasks'
      }
    }, { status: 200 })

  } catch (error) {
    console.error('API /admin/backfill-tasks GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
