/**
 * Mark Commission as Paid API
 * POST /api/staff/fees/commissions/[id]/mark-paid
 *
 * Marks a commission as paid and sends payment confirmation notifications
 * to both the entity (partner/introducer/CP) and the arranger.
 *
 * Implements User Story 2.2.7: Payment Confirmation Notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const markPaidSchema = z.object({
  payment_reference: z.string().optional(),
  // Accept both underscored (from new API) and hyphenated (legacy) formats
  entity_type: z.enum(['partner', 'introducer', 'commercial_partner', 'commercial-partner']).optional(),
  commission_type: z.enum(['partner', 'introducer', 'commercial-partner']).optional(),
});

// Configuration for different commission types (use underscored keys for consistency)
const COMMISSION_CONFIG = {
  'partner': {
    table: 'partner_commissions',
    userTable: 'partner_users',
    entityIdField: 'partner_id',
    entityTable: 'partners',
    commissionLink: '/versotech_main/my-commissions',
    arrangerLink: '/versotech_main/payment-requests',
  },
  'introducer': {
    table: 'introducer_commissions',
    userTable: 'introducer_users',
    entityIdField: 'introducer_id',
    entityTable: 'introducers',
    commissionLink: '/versotech_main/my-commissions',
    arrangerLink: '/versotech_main/payment-requests',
  },
  'commercial_partner': {
    table: 'commercial_partner_commissions',
    userTable: 'commercial_partner_users',
    entityIdField: 'commercial_partner_id',
    entityTable: 'commercial_partners',
    commissionLink: '/versotech_main/my-commissions',
    arrangerLink: '/versotech_main/payment-requests',
  },
} as const;

type EntityTypeKey = keyof typeof COMMISSION_CONFIG;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Staff role check - only staff can mark commissions as paid
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
      return NextResponse.json({ error: 'Forbidden - Staff only' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const validation = markPaidSchema.safeParse(body);
    const validData = validation.success ? validation.data : {};
    const payment_reference = validData.payment_reference;

    // Support both entity_type (new) and commission_type (legacy) parameters
    // Normalize commercial-partner to commercial_partner
    let entityType: EntityTypeKey = 'introducer';
    if (validData.entity_type) {
      entityType = validData.entity_type === 'commercial-partner'
        ? 'commercial_partner'
        : validData.entity_type as EntityTypeKey;
    } else if (validData.commission_type) {
      entityType = validData.commission_type === 'commercial-partner'
        ? 'commercial_partner'
        : validData.commission_type as EntityTypeKey;
    }

    const config = COMMISSION_CONFIG[entityType];

    // Fetch commission with details before updating
    const { data: commission, error: fetchError } = await serviceSupabase
      .from(config.table)
      .select(`
        id, status, accrual_amount, currency, arranger_id,
        ${config.entityIdField}
      `)
      .eq('id', id)
      .single();

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    const commissionData = commission as any;

    // Update commission status to paid
    const { error: updateError } = await serviceSupabase
      .from(config.table)
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_reference: payment_reference || null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error marking commission as paid:', updateError);
      return NextResponse.json({ error: 'Failed to mark commission as paid' }, { status: 500 });
    }

    // For introducer commissions, create an introduction record when paid
    let createdIntroductionId: string | null = null;
    if (entityType === 'introducer') {
      try {
        // Fetch full commission details
        const { data: fullCommission } = await serviceSupabase
          .from('introducer_commissions')
          .select('introducer_id, deal_id, investor_id, fee_plan_id, rate_bps')
          .eq('id', id)
          .single();

        if (fullCommission) {
          // Get investor email
          const { data: investor } = await serviceSupabase
            .from('investors')
            .select('email')
            .eq('id', fullCommission.investor_id)
            .single();

          const investorEmail = investor?.email || null;

          // Check if introduction already exists - must check BOTH:
          // 1. By (prospect_email, deal_id) - matches unique constraint
          // 2. By (prospect_investor_id, deal_id) - for linked investors
          let existingIntro: { id: string } | null = null;

          // First check by email (matches unique constraint)
          if (investorEmail) {
            const { data: byEmail } = await serviceSupabase
              .from('introductions')
              .select('id')
              .eq('prospect_email', investorEmail)
              .eq('deal_id', fullCommission.deal_id)
              .maybeSingle();
            existingIntro = byEmail;
          }

          // If not found by email, check by investor_id
          if (!existingIntro) {
            const { data: byInvestor } = await serviceSupabase
              .from('introductions')
              .select('id')
              .eq('prospect_investor_id', fullCommission.investor_id)
              .eq('deal_id', fullCommission.deal_id)
              .maybeSingle();
            existingIntro = byInvestor;
          }

          if (!existingIntro) {
            // Create introduction record
            // Note: If investor has no email, we need a placeholder to satisfy the unique constraint
            const emailForInsert = investorEmail || `investor-${fullCommission.investor_id}@placeholder.local`;

            const { data: introduction, error: introError } = await serviceSupabase
              .from('introductions')
              .insert({
                introducer_id: fullCommission.introducer_id,
                prospect_email: emailForInsert,
                prospect_investor_id: fullCommission.investor_id,
                deal_id: fullCommission.deal_id,
                status: 'allocated',
                introduced_at: new Date().toISOString().split('T')[0],
                commission_rate_override_bps: fullCommission.rate_bps,
                created_by: user.id,
              })
              .select('id')
              .single();

            if (introduction && !introError) {
              createdIntroductionId = introduction.id;
              // Link commission to introduction
              await serviceSupabase
                .from('introducer_commissions')
                .update({ introduction_id: introduction.id })
                .eq('id', id);

              console.log(`[mark-paid] Created introduction ${introduction.id} for commission ${id}`);
            } else if (introError) {
              // Check if it's a unique constraint violation - might be a race condition
              if (introError.code === '23505') {
                // Unique constraint violation - try to find and link existing
                const { data: existing } = await serviceSupabase
                  .from('introductions')
                  .select('id')
                  .eq('prospect_email', emailForInsert)
                  .eq('deal_id', fullCommission.deal_id)
                  .maybeSingle();

                if (existing) {
                  createdIntroductionId = existing.id;
                  await serviceSupabase
                    .from('introducer_commissions')
                    .update({ introduction_id: existing.id })
                    .eq('id', id);
                  console.log(`[mark-paid] Linked to existing introduction ${existing.id} after constraint conflict`);
                }
              } else {
                console.error('[mark-paid] Error creating introduction:', introError);
              }
              // Don't fail the payment - introduction is secondary
            }
          } else {
            // Link to existing introduction if not already linked
            createdIntroductionId = existingIntro.id;

            // Also update the introduction with investor_id if not set
            await serviceSupabase
              .from('introductions')
              .update({
                prospect_investor_id: fullCommission.investor_id,
                status: 'allocated' // Ensure status is updated
              })
              .eq('id', existingIntro.id)
              .is('prospect_investor_id', null); // Only if not already set

            await serviceSupabase
              .from('introducer_commissions')
              .update({ introduction_id: existingIntro.id })
              .eq('id', id);

            console.log(`[mark-paid] Linked commission ${id} to existing introduction ${existingIntro.id}`);
          }
        }
      } catch (introErr) {
        console.error('[mark-paid] Error in introduction creation:', introErr);
        // Don't fail the payment marking - introduction is a secondary concern
      }
    }

    // Get entity name for notifications
    const { data: entity } = await serviceSupabase
      .from(config.entityTable)
      .select('name, legal_name')
      .eq('id', commissionData[config.entityIdField])
      .single();

    const entityName = entity?.name || entity?.legal_name || 'Entity';

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: commissionData.currency || 'USD',
    }).format(commissionData.accrual_amount);

    const notifications: Array<{
      user_id: string;
      investor_id: null;
      title: string;
      message: string;
      link: string;
      type: string;
    }> = [];

    // 1. Notify entity users (partner/introducer/CP) that payment was made
    const { data: entityUsers } = await serviceSupabase
      .from(config.userTable)
      .select('user_id')
      .eq(config.entityIdField, commissionData[config.entityIdField]);

    if (entityUsers && entityUsers.length > 0) {
      for (const eu of entityUsers) {
        notifications.push({
          user_id: (eu as { user_id: string }).user_id,
          investor_id: null,
          title: 'Payment Confirmed',
          message: `Your commission payment of ${formattedAmount} has been processed.${payment_reference ? ` Reference: ${payment_reference}` : ''}`,
          link: config.commissionLink,
          type: 'introducer_payment_confirmed', // Use proper notification type from NotificationType
        });
      }
    }

    // 2. Notify arranger users that payment was completed
    const { data: arrangerUsers } = await serviceSupabase
      .from('arranger_users')
      .select('user_id')
      .eq('arranger_id', commissionData.arranger_id);

    if (arrangerUsers && arrangerUsers.length > 0) {
      for (const au of arrangerUsers) {
        notifications.push({
          user_id: (au as { user_id: string }).user_id,
          investor_id: null,
          title: 'Commission Payment Completed',
          message: `Payment of ${formattedAmount} to ${entityName} has been confirmed.${payment_reference ? ` Reference: ${payment_reference}` : ''}`,
          link: config.arrangerLink,
          type: 'introducer_payment_confirmed', // Use proper notification type from NotificationType
        });
      }
    }

    // Send all notifications
    if (notifications.length > 0) {
      await serviceSupabase.from('investor_notifications').insert(notifications);
      console.log(`[mark-paid] Sent ${notifications.length} payment confirmation notifications`);
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'marked_paid',
      entity_type: config.table.replace('_commissions', '_commission'),
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Commission marked as paid',
        entity_type: entityType,
        amount: commissionData.accrual_amount,
        currency: commissionData.currency,
        payment_reference: payment_reference || null,
        notifications_sent: notifications.length,
        introduction_id: createdIntroductionId,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Commission marked as paid',
      notifications_sent: notifications.length,
      introduction_id: createdIntroductionId,
    });
  } catch (error) {
    console.error('Error in mark-paid route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
