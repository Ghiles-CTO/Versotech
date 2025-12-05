import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { triggerWorkflow } from '@/lib/trigger-workflow'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Trigger certificate generation for a subscription
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: subscriptionId } = await params
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await clientSupabase
      .from('profiles')
      .select('id, email, role, display_name, title')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role?.startsWith('staff_')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()

    // Get subscription with investor and vehicle details
    const { data: subscription, error: subError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        id,
        commitment,
        funded_amount,
        status,
        subscription_date,
        num_shares,
        units,
        price_per_share,
        investor:investor_id (
          id,
          legal_name,
          email
        ),
        vehicle:vehicle_id (
          id,
          name,
          type,
          series,
          fund_id
        )
      `)
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Only allow certificate generation for active (fully funded) subscriptions
    if (subscription.status !== 'active') {
      return NextResponse.json({
        error: 'Certificate can only be generated for fully funded (active) subscriptions',
        current_status: subscription.status
      }, { status: 400 })
    }

    // Check if certificate already exists
    const { data: existingCert } = await serviceSupabase
      .from('documents')
      .select('id, file_name, created_at')
      .eq('type', 'certificate')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingCert) {
      return NextResponse.json({
        warning: 'Certificate already exists for this subscription',
        existing_certificate: existingCert
      })
    }

    // Trigger the certificate generation workflow
    const workflowResult = await triggerWorkflow({
      workflowKey: 'generate-investment-certificate',
      payload: {
        subscription_id: subscriptionId,
        investor_id: (subscription.investor as any)?.id,
        investor_name: (subscription.investor as any)?.legal_name,
        investor_email: (subscription.investor as any)?.email,
        vehicle_id: (subscription.vehicle as any)?.id,
        vehicle_name: (subscription.vehicle as any)?.name,
        vehicle_type: (subscription.vehicle as any)?.type,
        vehicle_series: (subscription.vehicle as any)?.series,
        commitment_amount: subscription.commitment,
        funded_amount: subscription.funded_amount,
        shares: subscription.num_shares || subscription.units,
        price_per_share: subscription.price_per_share,
        subscription_date: subscription.subscription_date,
        certificate_date: new Date().toISOString().split('T')[0],
        include_watermark: true
      },
      entityType: 'subscription',
      entityId: subscriptionId,
      user: {
        id: profile.id,
        email: profile.email || user.email || '',
        displayName: profile.display_name,
        role: profile.role,
        title: profile.title
      }
    })

    if (!workflowResult.success) {
      console.error('Certificate workflow trigger failed:', workflowResult.error)

      // Even if n8n workflow is not set up, log the attempt
      await auditLogger.log({
        actor_user_id: profile.id,
        action: AuditActions.CREATE,
        entity: 'documents' as any,
        entity_id: subscriptionId,
        metadata: {
          type: 'certificate_generation_requested',
          subscription_id: subscriptionId,
          investor_id: (subscription.investor as any)?.id,
          vehicle_id: (subscription.vehicle as any)?.id,
          workflow_error: workflowResult.error,
          status: 'pending_n8n_setup'
        }
      })

      return NextResponse.json({
        success: false,
        message: 'Certificate generation requested but workflow not fully configured',
        subscription_id: subscriptionId,
        investor: (subscription.investor as any)?.legal_name,
        vehicle: (subscription.vehicle as any)?.name,
        note: 'The n8n workflow for certificate generation needs to be set up. The request has been logged.'
      })
    }

    // Audit log successful trigger
    await auditLogger.log({
      actor_user_id: profile.id,
      action: AuditActions.CREATE,
      entity: 'documents' as any,
      entity_id: subscriptionId,
      metadata: {
        type: 'certificate_generation_triggered',
        subscription_id: subscriptionId,
        investor_id: (subscription.investor as any)?.id,
        vehicle_id: (subscription.vehicle as any)?.id,
        workflow_run_id: workflowResult.workflow_run_id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Certificate generation workflow triggered',
      workflow_run_id: workflowResult.workflow_run_id,
      subscription: {
        id: subscriptionId,
        investor: (subscription.investor as any)?.legal_name,
        vehicle: (subscription.vehicle as any)?.name,
        status: subscription.status
      }
    })

  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Check certificate status for a subscription
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: subscriptionId } = await params
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Check for existing certificate
    const { data: certificate } = await serviceSupabase
      .from('documents')
      .select('id, file_name, storage_path, created_at, file_size')
      .eq('type', 'certificate')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Check for pending workflow runs
    const { data: pendingWorkflow } = await serviceSupabase
      .from('workflow_runs')
      .select('id, status, created_at, started_at')
      .eq('workflow_key', 'generate-investment-certificate')
      .eq('entity_id', subscriptionId)
      .in('status', ['queued', 'running'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      subscription_id: subscriptionId,
      has_certificate: !!certificate,
      certificate: certificate || null,
      pending_generation: !!pendingWorkflow,
      pending_workflow: pendingWorkflow || null
    })

  } catch (error) {
    console.error('Certificate status check error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
