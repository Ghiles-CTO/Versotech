import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'
import { getInvestorAccountApprovalReadiness } from '@/lib/kyc/investor-account-approval-readiness'

async function resolveAccountApprovalAssignee(serviceSupabase: ReturnType<typeof createServiceClient>) {
  const { data: ceo } = await serviceSupabase
    .from('profiles')
    .select('id')
    .eq('role', 'ceo')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ceo?.id) {
    return ceo.id as string
  }

  const { data: staffAdmin } = await serviceSupabase
    .from('profiles')
    .select('id')
    .eq('role', 'staff_admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (staffAdmin?.id as string | undefined) ?? null
}

export async function POST() {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { link: investorUser, error: investorUserError } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id, role, is_primary'
    )

    if (investorUserError || !investorUser?.investor_id) {
      return NextResponse.json({ error: 'Investor account not found' }, { status: 404 })
    }

    const canSubmit = investorUser.is_primary === true || investorUser.role === 'admin'
    if (!canSubmit) {
      return NextResponse.json(
        { error: 'Only primary contacts or admins can submit account approval' },
        { status: 403 }
      )
    }

    const readiness = await getInvestorAccountApprovalReadiness({
      supabase: serviceSupabase,
      investorId: investorUser.investor_id,
    })

    if (!readiness) {
      return NextResponse.json({ error: 'Investor account not found' }, { status: 404 })
    }

    const accountStatus = (readiness.accountApprovalStatus || '').toLowerCase()
    if (accountStatus === 'approved' || accountStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Account approval submission is not available for this account status' },
        { status: 409 }
      )
    }

    if (readiness.hasPendingApproval) {
      return NextResponse.json(
        { error: 'Account approval is already under review' },
        { status: 409 }
      )
    }

    if (!readiness.isReady) {
      return NextResponse.json(
        {
          error: 'KYC is not fully approved for account submission',
          missing: readiness.missingItems,
        },
        { status: 400 }
      )
    }

    const nowIso = new Date().toISOString()
    const assignedTo = await resolveAccountApprovalAssignee(serviceSupabase)
    const requestedBy = user.id || assignedTo

    if (!requestedBy) {
      return NextResponse.json(
        { error: 'Unable to determine approval requester' },
        { status: 500 }
      )
    }

    const { data: createdApproval, error: approvalInsertError } = await serviceSupabase
      .from('approvals')
      .insert({
        entity_type: 'account_activation',
        entity_id: readiness.investorId,
        status: 'pending',
        priority: 'medium',
        requested_by: requestedBy,
        assigned_to: assignedTo,
        entity_metadata: {
          entity_table: 'investors',
          entity_name: readiness.investorName,
          persona_type: 'investor',
        },
        created_at: nowIso,
      })
      .select('id')
      .single()

    if (approvalInsertError || !createdApproval?.id) {
      if ((approvalInsertError as { code?: string } | null)?.code === '23505') {
        return NextResponse.json(
          { error: 'Account approval is already under review' },
          { status: 409 }
        )
      }

      console.error('[submit-account-approval] Failed to create approval:', approvalInsertError)
      return NextResponse.json(
        { error: 'Failed to submit account approval' },
        { status: 500 }
      )
    }

    const { error: statusUpdateError } = await serviceSupabase
      .from('investors')
      .update({
        account_approval_status: 'pending_approval',
        updated_at: nowIso,
      })
      .eq('id', readiness.investorId)

    if (statusUpdateError) {
      console.error('[submit-account-approval] Failed to set account status:', statusUpdateError)

      await serviceSupabase
        .from('approvals')
        .update({
          status: 'cancelled',
          notes: 'Auto-cancelled due to account status update failure during manual submission.',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', createdApproval.id)
        .eq('status', 'pending')

      return NextResponse.json(
        { error: 'Failed to submit account approval' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      approval_id: createdApproval.id,
      message: 'Account submitted for approval',
    })
  } catch (error) {
    console.error('[submit-account-approval] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

