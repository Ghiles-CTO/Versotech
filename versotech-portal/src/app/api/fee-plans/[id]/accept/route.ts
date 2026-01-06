/**
 * Fee Plan Accept Endpoint
 *
 * POST /api/fee-plans/[id]/accept
 *
 * Allows an introducer/partner to accept their fee model agreement.
 * Per Fred's requirements:
 * - Introducers/partners must accept fee models before investor dispatch
 * - "As soon as he accepts it, it means that the fee model is definitely
 *    associated to the introducer for that particular investment opportunity"
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

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the fee plan with entity info
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

    // Verify the user has permission to accept this fee plan
    // User must be linked to the entity that owns this fee plan
    // Check BOTH direct user_id AND junction tables (multi-user support)
    let hasPermission = false;
    let entityType = '';

    if (feePlan.introducer_id) {
      entityType = 'introducer';
      // Check direct user_id
      if (feePlan.introducer?.user_id === user.id) {
        hasPermission = true;
      }
      // Check introducer_users junction table
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
      // Check direct user_id
      if (feePlan.partner?.user_id === user.id) {
        hasPermission = true;
      }
      // Check partner_users junction table
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
      // Check direct user_id
      if (feePlan.commercial_partner?.user_id === user.id) {
        hasPermission = true;
      }
      // Check commercial_partner_users junction table
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

    // Also allow staff/admin to accept on behalf
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
        { error: 'You do not have permission to accept this fee model' },
        { status: 403 }
      );
    }

    // Check current status - can only accept if sent/pending_signature
    const acceptableStatuses = ['sent', 'pending_signature'];
    if (!acceptableStatuses.includes(feePlan.status)) {
      // Allow accepting draft plans for now (they can be sent + accepted in one step)
      if (feePlan.status === 'draft') {
        // First mark as sent, then accept
      } else if (feePlan.status === 'accepted') {
        return NextResponse.json(
          { error: 'Fee model is already accepted' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: `Cannot accept fee model with status: ${feePlan.status}` },
          { status: 400 }
        );
      }
    }

    // Update fee plan to accepted status
    const now = new Date().toISOString();
    const { data: updatedPlan, error: updateError } = await supabase
      .from('fee_plans')
      .update({
        status: 'accepted',
        accepted_at: now,
        accepted_by: user.id,
        updated_at: now,
      })
      .eq('id', feePlanId)
      .select()
      .single();

    if (updateError) {
      console.error('Error accepting fee plan:', updateError);
      return NextResponse.json(
        { error: 'Failed to accept fee model' },
        { status: 500 }
      );
    }

    // Audit log the acceptance
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.FEE_PLANS,
      entity_id: feePlanId,
      metadata: {
        action: 'accept_fee_model',
        entity_type: entityType,
        deal_id: feePlan.deal_id,
        term_sheet_id: feePlan.term_sheet_id,
        previous_status: feePlan.status,
        new_status: 'accepted',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Fee model accepted successfully',
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/fee-plans/[id]/accept:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
