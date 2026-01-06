/**
 * Generate Introducer Agreement API (DOC 3)
 * POST /api/staff/fees/plans/[id]/generate-agreement
 *
 * Creates an introducer_agreement record from a fee plan's data.
 * Only works for fee plans linked to an introducer.
 *
 * Maps ALL fields from DOC 3:
 * - Subscription fee rate (introduction fee)
 * - Performance fee rate (carried interest)
 * - Hurdle rate
 * - Performance cap
 * - Payment timing
 * - Non-circumvention period
 * - VAT registration
 * - Agreement duration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: feePlanId } = await params;

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the fee plan with all needed data including deal's arranger
    const { data: feePlan, error: planError } = await supabase
      .from('fee_plans')
      .select(`
        *,
        fee_components (*),
        introducer:introducer_id (
          id,
          legal_name,
          default_commission_bps
        ),
        deal:deal_id (
          id,
          name,
          arranger_entity_id
        )
      `)
      .eq('id', feePlanId)
      .single();

    if (planError || !feePlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 });
    }

    // Check that this is an introducer fee plan
    if (!feePlan.introducer_id) {
      return NextResponse.json(
        { error: 'Fee plan is not linked to an introducer' },
        { status: 400 }
      );
    }

    // Check if agreement already generated
    if (feePlan.generated_agreement_id) {
      return NextResponse.json(
        { error: 'Agreement already generated for this fee plan' },
        { status: 400 }
      );
    }

    // Extract fee components
    const subscriptionComponent = feePlan.fee_components?.find(
      (c: any) => c.kind === 'subscription'
    );
    const performanceComponent = feePlan.fee_components?.find(
      (c: any) => c.kind === 'performance'
    );

    // Extract all values from fee plan and components
    const subscriptionFeeBps = subscriptionComponent?.rate_bps || 0;
    const performanceFeeBps = performanceComponent?.rate_bps || 0;
    const hurdleRateBps = performanceComponent?.hurdle_rate_bps || null;
    const hasPerformanceCap = performanceComponent?.has_no_cap === false;
    const performanceCapPercent = hasPerformanceCap ? performanceComponent?.performance_cap_percent : null;
    const subscriptionPaymentDays = subscriptionComponent?.payment_days_after_event || 3;
    const performancePaymentDays = performanceComponent?.payment_days_after_event || 10;

    // Build payment terms text for DOC 3
    const hurdleText = hurdleRateBps ? `${(hurdleRateBps / 100).toFixed(2)}% hurdle rate` : 'no hurdle rate';
    const capText = hasPerformanceCap && performanceCapPercent ? `${performanceCapPercent}% cap` : 'no cap';
    const paymentTerms = `Introduction Fee: ${subscriptionPaymentDays} business days after completion. Performance Fee (${hurdleText}, ${capText}): ${performancePaymentDays} business days after redemption.`;

    // Calculate expiry date
    const expiryDate = feePlan.agreement_duration_months
      ? new Date(
          Date.now() + feePlan.agreement_duration_months * 30 * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0]
      : null;

    // Generate reference number (format: IA-YYMMDD-SEQ)
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const { count: todayCount } = await supabase
      .from('introducer_agreements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().split('T')[0]);
    const seq = String((todayCount || 0) + 1).padStart(3, '0');
    const referenceNumber = `IA-${dateStr}-${seq}`;

    // Get arranger_id from deal
    const arrangerId = feePlan.deal?.arranger_entity_id || null;

    // Create the introducer agreement with ALL fields
    const { data: agreement, error: agreementError } = await supabase
      .from('introducer_agreements')
      .insert({
        introducer_id: feePlan.introducer_id,
        deal_id: feePlan.deal_id,
        fee_plan_id: feePlan.id,
        arranger_id: arrangerId,
        reference_number: referenceNumber,
        agreement_type: 'standard',
        // Fee rates
        default_commission_bps: subscriptionFeeBps,
        performance_fee_bps: performanceFeeBps,
        hurdle_rate_bps: hurdleRateBps,
        // Performance cap
        has_performance_cap: hasPerformanceCap,
        performance_cap_percent: performanceCapPercent,
        commission_cap_amount: null, // Calculated at transaction time if needed
        // Payment timing
        subscription_fee_payment_days: subscriptionPaymentDays,
        performance_fee_payment_days: performancePaymentDays,
        payment_terms: paymentTerms,
        // Agreement terms
        effective_date: new Date().toISOString().split('T')[0],
        expiry_date: expiryDate,
        non_circumvention_months: feePlan.non_circumvention_months, // null = indefinite
        vat_registration_number: feePlan.vat_registration_number,
        governing_law: feePlan.governing_law || 'British Virgin Islands',
        // Status
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (agreementError) {
      console.error('Error creating introducer agreement:', agreementError);
      return NextResponse.json(
        { error: 'Failed to create agreement', details: agreementError.message },
        { status: 500 }
      );
    }

    // Link the agreement back to the fee plan and update status
    const { error: updateError } = await supabase
      .from('fee_plans')
      .update({
        generated_agreement_id: agreement.id,
        status: 'pending_signature'  // Agreement generated, awaiting signature
      })
      .eq('id', feePlanId);

    if (updateError) {
      console.error('Error linking agreement to fee plan:', updateError);
      // Don't fail - the agreement was created successfully
    }

    return NextResponse.json({
      success: true,
      agreement_id: agreement.id,
      message: 'Introducer agreement created successfully',
    });
  } catch (error) {
    console.error('Unexpected error generating agreement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
