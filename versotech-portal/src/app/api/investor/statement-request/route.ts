import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { z } from 'zod'

const statementRequestSchema = z.object({
  vehicle_id: z.string().uuid().optional(), // Optional - all vehicles if not specified
  as_of_date: z.string().optional(), // Defaults to today
})

/**
 * POST /api/investor/statement-request
 *
 * Allows investors to request a Position Statement (Statement of Holdings).
 * This triggers the generate-position-statement workflow in n8n.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Get the user's investor entity
    const { data: investorLink } = await supabase
      .from('investor_users')
      .select('investor_id, investors(id, legal_name, display_name)')
      .eq('user_id', user.id)
      .single()

    if (!investorLink || !investorLink.investor_id) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 403 })
    }

    const investorRaw = investorLink.investors as unknown
    const investor = (Array.isArray(investorRaw) ? investorRaw[0] : investorRaw) as { id: string; legal_name: string; display_name: string | null }

    // Get user profile for the workflow
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, display_name, role, title')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const validated = statementRequestSchema.parse(body)

    const asOfDate = validated.as_of_date || new Date().toISOString().split('T')[0]

    // Check if there's already a pending request (prevent spam)
    const { data: recentRequest } = await supabase
      .from('workflow_runs')
      .select('id, created_at, status')
      .eq('workflow_key', 'generate-position-statement')
      .eq('triggered_by', user.id)
      .in('status', ['queued', 'running'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (recentRequest && recentRequest.length > 0) {
      const requestTime = new Date(recentRequest[0].created_at)
      const hoursSince = (Date.now() - requestTime.getTime()) / (1000 * 60 * 60)

      if (hoursSince < 1) {
        return NextResponse.json({
          error: 'A statement request is already being processed. Please wait before requesting another.',
          pending_request_id: recentRequest[0].id
        }, { status: 429 })
      }
    }

    // Trigger the workflow
    const result = await triggerWorkflow({
      workflowKey: 'generate-position-statement',
      payload: {
        investor_id: investorLink.investor_id,
        investor_name: investor.display_name || investor.legal_name,
        vehicle_id: validated.vehicle_id || null,
        as_of_date: asOfDate,
        requested_by_user: true,
        include_performance_metrics: true,
        include_distribution_history: true,
      },
      entityType: 'investor',
      entityId: investorLink.investor_id,
      user: {
        id: profile.id,
        email: profile.email || '',
        displayName: profile.display_name || undefined,
        role: profile.role || 'investor',
        title: profile.title || undefined,
      }
    })

    if (!result.success) {
      // If workflow isn't configured, create a placeholder notification
      // The statement will be generated manually by staff
      await supabase.from('investor_notifications').insert({
        user_id: user.id,
        investor_id: investorLink.investor_id,
        title: 'Statement Request Received',
        message: `Your position statement request has been received. A member of our team will prepare your statement and notify you when it's ready.`,
        link: '/versotech_main/documents'
      })

      // Create a task for staff
      await supabase.from('tasks').insert({
        title: `Position Statement Request - ${investor.display_name || investor.legal_name}`,
        description: `Investor requested a position statement as of ${asOfDate}. Please generate and upload to their documents.`,
        status: 'pending',
        priority: 'normal',
        assignee_type: 'role',
        assignee_role: 'staff_ops',
        related_entity_type: 'investor',
        related_entity_id: investorLink.investor_id,
        created_by: user.id,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      })

      return NextResponse.json({
        success: true,
        message: 'Your statement request has been submitted. You will be notified when it\'s ready.',
        workflow_configured: false,
      })
    }

    // Notify user that request is being processed
    await supabase.from('investor_notifications').insert({
      user_id: user.id,
      investor_id: investorLink.investor_id,
      title: 'Statement Being Generated',
      message: `Your position statement as of ${asOfDate} is being generated. You'll receive another notification when it's ready.`,
      link: '/versotech_main/documents'
    })

    return NextResponse.json({
      success: true,
      message: 'Your position statement is being generated. You will be notified when it\'s ready.',
      workflow_run_id: result.workflow_run_id,
      workflow_configured: true,
    })
  } catch (error) {
    console.error('Statement request error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process statement request' }, { status: 500 })
  }
}

/**
 * GET /api/investor/statement-request
 *
 * Check status of recent statement requests
 */
export async function GET(request: NextRequest) {
  try {
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Get recent statement workflow runs for this user
    const { data: requests } = await supabase
      .from('workflow_runs')
      .select('id, status, created_at, completed_at, output_data')
      .eq('workflow_key', 'generate-position-statement')
      .eq('triggered_by', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      requests: requests || []
    })
  } catch (error) {
    console.error('Statement request status error:', error)
    return NextResponse.json({ error: 'Failed to get statement request status' }, { status: 500 })
  }
}
