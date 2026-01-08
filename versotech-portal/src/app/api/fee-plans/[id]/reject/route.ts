/**
 * Fee Plan Reject Endpoint
 *
 * POST /api/fee-plans/[id]/reject
 *
 * Allows a partner/introducer/commercial partner to reject a fee model.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: feePlanId } = await params;
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rejectionReason = typeof body?.reason === 'string' ? body.reason.trim() : '';

    const { data: feePlan, error: planError } = await serviceSupabase
      .from('fee_plans')
      .select(`
        *,
        introducer:introducers(id, user_id),
        partner:partners(id, user_id),
        commercial_partner:commercial_partners(id, user_id)
      `)
      .eq('id', feePlanId)
      .single();

    if (planError || !feePlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 });
    }

    let hasPermission = false;
    let entityType = '';

    if (feePlan.introducer_id) {
      entityType = 'introducer';
      if (feePlan.introducer?.user_id === user.id) {
        hasPermission = true;
      }
      if (!hasPermission) {
        const { data: introducerUser } = await serviceSupabase
          .from('introducer_users')
          .select('user_id')
          .eq('introducer_id', feePlan.introducer_id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (introducerUser) {
          hasPermission = true;
        }
      }
    } else if (feePlan.partner_id) {
      entityType = 'partner';
      if (feePlan.partner?.user_id === user.id) {
        hasPermission = true;
      }
      if (!hasPermission) {
        const { data: partnerUser } = await serviceSupabase
          .from('partner_users')
          .select('user_id')
          .eq('partner_id', feePlan.partner_id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (partnerUser) {
          hasPermission = true;
        }
      }
    } else if (feePlan.commercial_partner_id) {
      entityType = 'commercial_partner';
      if (feePlan.commercial_partner?.user_id === user.id) {
        hasPermission = true;
      }
      if (!hasPermission) {
        const { data: cpUser } = await serviceSupabase
          .from('commercial_partner_users')
          .select('user_id')
          .eq('commercial_partner_id', feePlan.commercial_partner_id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (cpUser) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      const { data: profile } = await serviceSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role?.startsWith('staff_') || profile?.role === 'ceo') {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to reject this fee model' },
        { status: 403 }
      );
    }

    const rejectableStatuses = ['sent', 'pending_signature', 'draft'];
    if (!rejectableStatuses.includes(feePlan.status)) {
      if (feePlan.status === 'rejected') {
        return NextResponse.json(
          { error: 'Fee model is already rejected' },
          { status: 400 }
        );
      }
      if (feePlan.status === 'accepted') {
        return NextResponse.json(
          { error: 'Fee model is already accepted and cannot be rejected' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Cannot reject fee model with status: ${feePlan.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data: updatedPlan, error: updateError } = await supabase
      .from('fee_plans')
      .update({
        status: 'rejected',
        accepted_at: null,
        accepted_by: null,
        updated_at: now,
      })
      .eq('id', feePlanId)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting fee plan:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject fee model' },
        { status: 500 }
      );
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.FEE_PLANS,
      entity_id: feePlanId,
      metadata: {
        action: 'reject_fee_model',
        entity_type: entityType,
        deal_id: feePlan.deal_id,
        term_sheet_id: feePlan.term_sheet_id,
        previous_status: feePlan.status,
        new_status: 'rejected',
        rejection_reason: rejectionReason || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Fee model rejected successfully',
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/fee-plans/[id]/reject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
