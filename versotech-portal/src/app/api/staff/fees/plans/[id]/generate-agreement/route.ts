/**
 * Generate Introducer Agreement API (DOC 3)
 * POST /api/staff/fees/plans/[id]/generate-agreement
 *
 * Creates an introducer_agreement record from a fee plan's data.
 * Only works for fee plans linked to an introducer.
 *
 * After creating the record, triggers n8n workflow to generate the PDF document.
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
import { triggerWorkflow } from '@/lib/trigger-workflow';

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

    // Fetch user profile for workflow trigger
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('display_name, role, title')
      .eq('id', user.id)
      .single();

    // Fetch the fee plan with all needed data including deal's arranger
    // Include COMPLETE introducer data for document generation
    const { data: feePlan, error: planError } = await supabase
      .from('fee_plans')
      .select(`
        *,
        fee_components (*),
        introducer:introducer_id (
          id,
          legal_name,
          contact_name,
          email,
          address_line_1,
          address_line_2,
          city,
          state_province,
          postal_code,
          country,
          default_commission_bps
        ),
        deal:deal_id (
          id,
          name,
          company_name,
          offer_unit_price,
          arranger_entity_id
        )
      `)
      .eq('id', feePlanId)
      .single();

    if (planError || !feePlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 });
    }

    // Check that this is an introducer fee plan (NOT a partner fee plan)
    if (!feePlan.introducer_id) {
      return NextResponse.json(
        { error: 'Fee plan is not linked to an introducer' },
        { status: 400 }
      );
    }

    // Ensure this is NOT a partner fee plan - only introducers get this agreement type
    if (feePlan.partner_id) {
      return NextResponse.json(
        { error: 'This endpoint is for introducer agreements. Use generate-placement-agreement for partner fee plans.' },
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

    // === TRIGGER n8n WORKFLOW TO GENERATE PDF ===
    // Build the complete payload for document generation
    const introducer = feePlan.introducer as any;
    const deal = feePlan.deal as any;

    // Build introducer address from components
    const addressParts = [
      introducer?.address_line_1,
      introducer?.address_line_2,
      introducer?.city,
      [introducer?.state_province, introducer?.postal_code].filter(Boolean).join(' '),
      introducer?.country
    ].filter(Boolean);
    const introducerAddress = addressParts.join(', ');

    // Build non-circumvention text
    let nonCircumventionPeriod: string;
    if (feePlan.non_circumvention_months === null || feePlan.non_circumvention_months === undefined) {
      nonCircumventionPeriod = 'an indefinite period of time';
    } else {
      nonCircumventionPeriod = `a period of ${feePlan.non_circumvention_months} months`;
    }

    // Build hurdle rate text
    let hurdleRateText: string;
    if (!hurdleRateBps || hurdleRateBps === 0) {
      hurdleRateText = 'with no hurdle rate';
    } else {
      hurdleRateText = `with a ${(hurdleRateBps / 100).toFixed(2)}% hurdle rate`;
    }

    // Build performance cap text
    let performanceCapText: string;
    if (!hasPerformanceCap) {
      performanceCapText = ' and no cap';
    } else {
      performanceCapText = ` with a ${performanceCapPercent}% cap`;
    }

    // Build VAT text
    let vatRegistrationText = '';
    if (feePlan.vat_registration_number) {
      vatRegistrationText = ` VAT Registration: ${feePlan.vat_registration_number}`;
    }

    // Fee calculations
    const subscriptionFeePercent = (subscriptionFeeBps / 100).toFixed(2);
    const subscriptionFeeDecimal = (subscriptionFeeBps / 10000).toFixed(4);
    const performanceFeePercent = (performanceFeeBps / 100).toFixed(2);
    const performanceFeeDecimal = (performanceFeeBps / 10000).toFixed(2);

    // Format date
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Example calculations
    const exampleShares = 10000;
    const examplePricePerShare = deal?.offer_unit_price || 23.52;
    const exampleRedemptionPrice = 50.00;
    const examplePurchasePrice = exampleShares * examplePricePerShare;
    const exampleIntroductionFee = examplePurchasePrice * (subscriptionFeeBps / 10000);
    const exampleRedemptionTotal = exampleShares * exampleRedemptionPrice;
    const exampleProfit = exampleRedemptionTotal - examplePurchasePrice;
    const examplePerformanceFee = exampleProfit * (performanceFeeBps / 10000);

    // Trigger n8n workflow with all data needed for HTML template
    const workflowResult = await triggerWorkflow({
      workflowKey: 'generate-introducer-agreement',
      payload: {
        // Agreement identifiers
        agreement_id: agreement.id,
        document_id: referenceNumber,
        reference_number: referenceNumber,

        // Dates
        agreement_date: formatDate(agreement.effective_date),
        effective_date: formatDate(agreement.effective_date),

        // Introducer info
        introducer_name: introducer?.legal_name || '',
        introducer_address: introducerAddress,
        introducer_signatory_name: introducer?.contact_name || '',
        introducer_email: introducer?.email || '',

        // Company/Deal
        company_name: deal?.company_name || deal?.name || '',
        deal_id: feePlan.deal_id,

        // VERSO info (hardcoded)
        verso_representative_name: 'Julien MACHOT',
        verso_representative_title: 'Managing Partner',

        // Computed text fields
        non_circumvention_period: nonCircumventionPeriod,
        hurdle_rate_text: hurdleRateText,
        performance_cap_text: performanceCapText,
        vat_registration_text: vatRegistrationText,

        // Fee percentages
        subscription_fee_percent: subscriptionFeePercent,
        subscription_fee_decimal: subscriptionFeeDecimal,
        performance_fee_percent: performanceFeePercent,
        performance_fee_decimal: performanceFeeDecimal,

        // Payment days
        subscription_fee_payment_days: subscriptionPaymentDays,
        performance_fee_payment_days: performancePaymentDays,

        // Agreement terms
        governing_law: feePlan.governing_law || 'British Virgin Islands',
        agreement_duration_months: feePlan.agreement_duration_months || 36,

        // Example calculations (formatted)
        example_shares: exampleShares.toLocaleString(),
        example_price_per_share: examplePricePerShare.toFixed(2),
        example_purchase_price: examplePurchasePrice.toLocaleString(),
        example_introduction_fee: exampleIntroductionFee.toLocaleString(),
        example_redemption_price: exampleRedemptionPrice.toFixed(2),
        example_redemption_total: exampleRedemptionTotal.toLocaleString(),
        example_profit: exampleProfit.toLocaleString(),
        example_performance_fee: examplePerformanceFee.toLocaleString(),

        // Raw values for n8n (in case it needs to do its own calculations)
        raw_subscription_fee_bps: subscriptionFeeBps,
        raw_performance_fee_bps: performanceFeeBps,
        raw_hurdle_rate_bps: hurdleRateBps,
        raw_has_performance_cap: hasPerformanceCap,
        raw_performance_cap_percent: performanceCapPercent,
      },
      entityType: 'introducer_agreement',
      entityId: agreement.id,
      user: {
        id: user.id,
        email: user.email || '',
        displayName: userProfile?.display_name || '',
        role: userProfile?.role || 'staff',
        title: userProfile?.title || undefined,
      },
    });

    if (!workflowResult.success) {
      console.error('Failed to trigger n8n workflow:', workflowResult.error);
      // Don't fail the request - the agreement was created successfully
      // The PDF generation can be retried or done manually
      return NextResponse.json({
        success: true,
        agreement_id: agreement.id,
        workflow_run_id: workflowResult.workflow_run_id,
        pdf_generated: false,
        message: 'Introducer agreement created but PDF generation failed',
      });
    }

    console.log('n8n workflow triggered successfully:', workflowResult.workflow_run_id);

    // Handle binary PDF response from n8n
    let pdfUrl: string | null = null;
    if (workflowResult.n8n_response) {
      try {
        const n8nResponse = workflowResult.n8n_response;
        console.log('📦 n8n response structure:', Object.keys(n8nResponse));

        // Extract PDF buffer from various response formats
        let pdfBuffer: Buffer | null = null;

        if (n8nResponse.binary && Buffer.isBuffer(n8nResponse.binary)) {
          // Direct buffer from trigger-workflow.ts binary handling
          pdfBuffer = n8nResponse.binary;
        } else if (n8nResponse.raw && typeof n8nResponse.raw === 'string') {
          // Latin1-encoded string (common when Content-Type not set correctly)
          pdfBuffer = Buffer.from(n8nResponse.raw, 'latin1');
        } else if (n8nResponse.data && typeof n8nResponse.data === 'string') {
          // Base64-encoded data
          pdfBuffer = Buffer.from(n8nResponse.data, 'base64');
        } else if (typeof n8nResponse === 'string') {
          // Direct string response
          pdfBuffer = Buffer.from(n8nResponse, 'latin1');
        }

        if (pdfBuffer && pdfBuffer.length > 0) {
          // Verify PDF signature (PDF files start with %PDF)
          const signature = pdfBuffer.slice(0, 4).toString();
          console.log('📄 File signature:', signature, 'size:', pdfBuffer.length, 'bytes');

          if (signature !== '%PDF') {
            console.warn('⚠️ File does not appear to be a valid PDF (signature:', signature, ')');
          }

          // Generate filename: IA-YYMMDD-XXX_IntroducerName.pdf
          const safeIntroducerName = (introducer?.legal_name || 'Unknown')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
          const fileName = `${referenceNumber}_${safeIntroducerName}.pdf`;

          // Upload to Supabase Storage
          const fileKey = `introducer-agreements/${feePlan.deal_id}/${agreement.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('deal-documents')
            .upload(fileKey, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true
            });

          if (uploadError) {
            console.error('❌ Failed to upload introducer agreement PDF:', uploadError);
          } else {
            console.log('✅ Introducer agreement PDF uploaded:', fileKey);

            // Get public URL (or signed URL for private bucket)
            const { data: urlData } = supabase.storage
              .from('deal-documents')
              .getPublicUrl(fileKey);

            pdfUrl = urlData?.publicUrl || fileKey;

            // Update the introducer agreement record with pdf_url
            const { error: pdfUpdateError } = await supabase
              .from('introducer_agreements')
              .update({ pdf_url: fileKey })
              .eq('id', agreement.id);

            if (pdfUpdateError) {
              console.error('❌ Failed to update introducer agreement with PDF URL:', pdfUpdateError);
            } else {
              console.log('✅ Introducer agreement updated with PDF URL');
            }
          }
        } else {
          console.warn('⚠️ No binary PDF data found in n8n response');
        }
      } catch (pdfError) {
        console.error('❌ Error processing PDF from n8n:', pdfError);
        // Don't fail - the agreement record exists, PDF can be regenerated
      }
    }

    return NextResponse.json({
      success: true,
      agreement_id: agreement.id,
      workflow_run_id: workflowResult.workflow_run_id,
      pdf_generated: !!pdfUrl,
      pdf_url: pdfUrl,
      message: pdfUrl
        ? 'Introducer agreement created and PDF generated successfully'
        : 'Introducer agreement created, PDF generation in progress',
    });
  } catch (error) {
    console.error('Unexpected error generating agreement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
