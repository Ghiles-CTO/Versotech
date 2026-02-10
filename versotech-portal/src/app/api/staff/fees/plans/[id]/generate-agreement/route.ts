/**
 * Generate Introducer Agreement API (DOC 3)
 * POST /api/staff/fees/plans/[id]/generate-agreement
 *
 * Creates an introducer_agreement record from a fee plan's data.
 * Only works for fee plans linked to an introducer.
 *
 * After creating the record, triggers n8n workflow to generate the PDF document.
 *
 * NEW TEMPLATE STRUCTURE (3-party):
 * - Vehicle/Issuer + General Partner details
 * - Arranger entity details
 * - Introducer details
 * - Schedule I: Dynamic subscriber table (pre-rendered HTML)
 * - Conditional performance fee section
 * - Conditional signature blocks (entity vs individual)
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
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { triggerWorkflow } from '@/lib/trigger-workflow';
import { detectAnchors, getPlacementsFromAnchors, getRequiredAnchorsForIntroducerAgreement, validateRequiredAnchors } from '@/lib/signature/anchor-detector';

// Helper functions for formatting
function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'USD 0.00';
  return `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
}

function formatAddress(entity: { address?: string | null; city?: string | null; country?: string | null } | null): string {
  if (!entity) return '';
  const parts = [entity.address, entity.city, entity.country].filter(Boolean);
  return parts.join(', ');
}

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
    // Include introducer type for conditional signature blocks
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
          default_commission_bps,
          type
        ),
        deal:deal_id (
          id,
          name,
          company_name,
          offer_unit_price,
          arranger_entity_id,
          vehicle_id
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

    // Generate reference number (NEW format: YYYYMMDDSEQ)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // 20260108
    const { count: todayCount } = await supabase
      .from('introducer_agreements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().split('T')[0]);
    const seq = String((todayCount || 0) + 1).padStart(3, '0');
    const referenceNumber = `${dateStr}${seq}`; // e.g., 20260108001

    // Get arranger_id from deal
    const arrangerId = feePlan.deal?.arranger_entity_id || null;
    const vehicleId = feePlan.deal?.vehicle_id || null;

    // === FETCH VEHICLE DATA (for 3-party structure) ===
    let vehicle: {
      name: string | null;
      domicile: string | null;
      address: string | null;
      registration_number: string | null;
      legal_jurisdiction: string | null;
      issuer_gp_name: string | null;
      issuer_gp_description: string | null;
      issuer_gp_address: string | null;
      issuer_gp_rcc_number: string | null;
    } | null = null;

    if (vehicleId) {
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select(`
          name,
          domicile,
          address,
          registration_number,
          legal_jurisdiction,
          issuer_gp_name,
          issuer_gp_description,
          issuer_gp_address,
          issuer_gp_rcc_number
        `)
        .eq('id', vehicleId)
        .single();
      vehicle = vehicleData;
    }

    // === FETCH ARRANGER DATA ===
    let arranger: {
      legal_name: string | null;
      address: string | null;
      registration_number: string | null;
      city: string | null;
      country: string | null;
    } | null = null;

    if (arrangerId) {
      const { data: arrangerData } = await supabase
        .from('arranger_entities')
        .select('legal_name, address, registration_number, city, country')
        .eq('id', arrangerId)
        .single();
      arranger = arrangerData;
    }

    // === FETCH SCHEDULE I DATA (subscriptions from this introducer for this deal) ===
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select(`
        commitment,
        num_shares,
        bd_fee_percent,
        bd_fee_amount,
        investor:investor_id (
          legal_name
        )
      `)
      .eq('introducer_id', feePlan.introducer_id)
      .eq('deal_id', feePlan.deal_id)
      .in('status', ['signed', 'funded', 'active']);

    // Pre-render Schedule I HTML table
    const scheduleRows = (subscribers || []).map((s: any) => `
      <tr>
        <td>${s.investor?.legal_name || 'Unknown Investor'}</td>
        <td>${formatCurrency(s.commitment)}</td>
        <td>${s.bd_fee_percent ? s.bd_fee_percent + '%' : ''}</td>
        <td>${formatNumber(s.num_shares)}</td>
        <td>${formatCurrency(s.bd_fee_amount)}</td>
      </tr>
    `).join('');

    // Calculate totals
    const totalCapital = (subscribers || []).reduce((sum: number, s: any) => sum + (s.commitment || 0), 0);
    const totalFee = (subscribers || []).reduce((sum: number, s: any) => sum + (s.bd_fee_amount || 0), 0);

    // Add totals row
    const scheduleTotalRow = `
      <tr class="totals-row">
        <td><strong>TOTALS</strong></td>
        <td><strong>${formatCurrency(totalCapital)}</strong></td>
        <td></td>
        <td></td>
        <td><strong>${formatCurrency(totalFee)}</strong></td>
      </tr>
    `;

    // If no subscribers, show placeholder
    const scheduleTableHtml = (subscribers || []).length > 0
      ? scheduleRows + scheduleTotalRow
      : '<tr><td colspan="5" style="text-align:center; font-style:italic;">No subscriptions completed yet</td></tr>';

    // Introducer type for conditional signature blocks
    const introducerType = (feePlan.introducer as any)?.type || 'entity';
    const isEntity = introducerType === 'entity';
    const isIndividual = introducerType === 'individual';

    const introducer = feePlan.introducer as any;

    // Fetch introducer signatories (multi-signatory support)
    const maxSignatories = 5;
    const { data: introducerUsers, error: introducerUsersError } = await supabase
      .from('introducer_users')
      .select(`
        user_id,
        role,
        is_primary,
        can_sign,
        profiles:user_id (
          display_name,
          email
        )
      `)
      .eq('introducer_id', feePlan.introducer_id)
      .eq('can_sign', true)
      .order('is_primary', { ascending: false });

    if (introducerUsersError) {
      console.error('Error fetching introducer signatories:', introducerUsersError);
    }

    const introducerSignatories = (introducerUsers || [])
      .map((user, index) => {
        // Handle both array and object cases for profiles join
        const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;
        return {
          name: profile?.display_name || introducer?.contact_name || introducer?.legal_name || `Signatory ${index + 1}`,
        };
      })
      .slice(0, maxSignatories);

    if ((introducerUsers || []).length > maxSignatories) {
      console.warn(`⚠️ Introducer has more than ${maxSignatories} signatories; extra signers will not be included in the agreement.`);
    }

    if (introducerSignatories.length === 0) {
      introducerSignatories.push({
        name: introducer?.contact_name || introducer?.legal_name || 'Introducer',
      });
    }

    const getIntroducerAnchorId = (number: number): string => {
      return number === 1 ? 'party_b' : `party_b_${number}`;
    };

    const ANCHOR_CSS = 'position:absolute;left:50%;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;transform:translateX(-50%);';

    const entitySignatureHtml = isEntity
      ? introducerSignatories.map((signatory, index) => {
          const number = index + 1;
          const anchorId = getIntroducerAnchorId(number);
          return `
      <div style="margin-top: 10px; margin-bottom: 20px; text-align:center;">
        <div class="signature-line" style="margin:3cm auto 0.2cm; position:relative;">
          <span style="${ANCHOR_CSS}">SIG_ANCHOR:${anchorId}</span>
        </div>
        <div class="signature-name">${signatory.name}</div>
        <div class="signature-title">Authorised Signatory ${number}</div>
      </div>
      `;
        }).join('')
      : '';

    const individualSigner = introducerSignatories[0]
      ? introducerSignatories[0]
      : { name: introducer?.contact_name || introducer?.legal_name || 'Introducer' };

    const individualSignatureHtml = isIndividual
      ? `
      <div style="margin-top: 10px; margin-bottom: 20px; text-align:center;">
        <div class="signature-line" style="margin:3cm auto 0.2cm; position:relative;">
          <span style="${ANCHOR_CSS}">SIG_ANCHOR:party_b</span>
        </div>
        <div class="signature-name">${individualSigner.name}</div>
        <div class="signature-title">Introducer</div>
      </div>
      `
      : '';

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

    // === PRE-RENDER CONDITIONAL SECTIONS ===
    // Performance fee section HTML (only if performance fee > 0)
    const hasPerformanceFee = performanceFeeBps > 0;
    const performanceFeeHtml = hasPerformanceFee ? `
      <p class="sub-header">Performance Fee Determination:</p>
      <p>The Performance Fee should be calculated as a carried interest of <span class="bold">${performanceFeePercent}%</span> ${hurdleRateText}${performanceCapText}, to be applied on the gross performance calculated at the time of the redemption of the investment opportunity.</p>
    ` : '';

    // Performance fee example HTML (only if performance fee > 0)
    const performanceFeeExampleHtml = hasPerformanceFee ? `
      <p>In case the same investment returns a price per share at redemption ("RP") of USD ${exampleRedemptionPrice.toFixed(2)} per share, then the following Performance Fee ("Fp") shall apply:</p>
      <p class="formula">RP = (${exampleShares.toLocaleString()} x ${exampleRedemptionPrice.toFixed(2)})</p>
      <p class="formula">RP = ${exampleRedemptionTotal.toLocaleString()}</p>
      <p class="formula">Fp = [(${exampleShares.toLocaleString()} x ${exampleRedemptionPrice.toFixed(2)}) - (${exampleShares.toLocaleString()} x ${examplePricePerShare.toFixed(2)})] x ${performanceFeeDecimal}</p>
      <p class="formula">Fp = ${exampleProfit.toLocaleString()} x ${performanceFeeDecimal}</p>
      <p class="formula">Fp = ${examplePerformanceFee.toLocaleString()}</p>
      <p>The Performance Fee payable to the Introducer would be equal to <span class="bold">USD ${examplePerformanceFee.toLocaleString()}</span> only.</p>
    ` : '';

    // Performance fee payment terms HTML (only if performance fee > 0)
    const performanceFeePaymentHtml = hasPerformanceFee ? `
      <p>The performance fee is payable by the Arranger no later than <span class="bold">${performancePaymentDays} business days</span> post redemption ("Redemption") or exit, defined by default as the end of any regulatory lock-up period (typically 6 to 9 months post IPO, on NASDAQ or NYSE, United States).</p>
    ` : '';

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

        // === VEHICLE/ISSUER FIELDS (Party 1) ===
        vehicle_name: vehicle?.name || '',
        vehicle_description: 'a Luxembourg special limited partnership (société en commandite spéciale)',
        vehicle_address: vehicle?.address || '',
        vehicle_registration_country: vehicle?.domicile || 'Luxembourg',
        vehicle_registration_number: vehicle?.registration_number || '',
        vehicle_gp_name: vehicle?.issuer_gp_name || '',
        vehicle_gp_description: vehicle?.issuer_gp_description || 'a private limited liability company (société à responsabilité limitée)',
        vehicle_gp_address: vehicle?.issuer_gp_address || vehicle?.address || '',
        vehicle_gp_registration_number: vehicle?.issuer_gp_rcc_number || '',

        // === ARRANGER FIELDS (Party 2) ===
        arranger_name: arranger?.legal_name || 'VERSO Management Ltd',
        arranger_address: arranger ? formatAddress(arranger) : 'Trident Chambers, Wickhams Cay, Road Town, Tortola, British Virgin Islands',
        arranger_registration_number: arranger?.registration_number || '1901463',

        // === INTRODUCER FIELDS (Party 3) ===
        introducer_name: introducer?.legal_name || '',
        introducer_address: introducerAddress,
        introducer_signatory_name: introducer?.contact_name || '',
        introducer_email: introducer?.email || '',
        introducer_type: introducerType,

        // Company/Deal
        company_name: deal?.company_name || deal?.name || '',
        deal_id: feePlan.deal_id,

        // VERSO info (for signature)
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

        // === SCHEDULE I (pre-rendered HTML) ===
        schedule_table_html: scheduleTableHtml,
        schedule_total_capital: formatCurrency(totalCapital),
        schedule_total_fee: formatCurrency(totalFee),
        schedule_subscriber_count: (subscribers || []).length,

        // === CONDITIONAL FLAGS ===
        has_performance_fee: hasPerformanceFee,
        is_entity: isEntity,
        is_individual: isIndividual,

        // === PRE-RENDERED CONDITIONAL HTML ===
        performance_fee_html: performanceFeeHtml,
        performance_fee_example_html: performanceFeeExampleHtml,
        performance_fee_payment_html: performanceFeePaymentHtml,
        entity_signature_html: entitySignatureHtml,
        individual_signature_html: individualSignatureHtml,

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

          // Generate filename: Fee_Agreement_{company}_{introducer}_{reference}.pdf
          const safeCompanyName = (deal?.company_name || deal?.name || 'Company')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 30);
          const safeIntroducerName = (introducer?.legal_name || 'Unknown')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 30);
          const fileName = `Fee_Agreement_${safeCompanyName}_${safeIntroducerName}_${referenceNumber}.pdf`;

          // Upload to Supabase Storage (use service client to bypass RLS)
          const serviceSupabase = createServiceClient();
          const fileKey = `introducer-agreements/${feePlan.deal_id}/${agreement.id}/${fileName}`;
          const { error: uploadError } = await serviceSupabase.storage
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
            const { data: urlData } = serviceSupabase.storage
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

              // Mark workflow as completed now that document is stored
              // Use serviceSupabase to bypass RLS on workflow_runs table
              if (workflowResult?.workflow_run_id) {
                const serviceSupabaseForWorkflow = createServiceClient();
                await serviceSupabaseForWorkflow.from('workflow_runs').update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  result_doc_id: null // Introducer agreements don't use documents table
                }).eq('id', workflowResult.workflow_run_id);
                console.log('✅ Workflow run marked as completed');
              }

              // === CREATE CEO SIGNATURE TASK IN VERSOSIGN ===
              // Automatically queue the agreement for CEO signature
              // Use the CURRENT user who is generating the agreement as the signer
              console.log('📝 Creating CEO signature request and task...');

              try {
                // Use the current user (who generated the agreement) as the CEO signer
                // This ensures the person initiating the agreement is the one who signs it
                const ceoUser = {
                  id: user.id,
                  email: user.email || '',
                  display_name: userProfile?.display_name || 'CEO'
                };

                if (!ceoUser.email) {
                  console.warn('⚠️ Current user has no email for signature task');
                } else {
                  console.log('👔 Found CEO user:', ceoUser.email);

                  // Generate signing token
                  const crypto = await import('crypto');
                  const signingToken = crypto.randomUUID();
                  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

                  let signaturePlacements: any[] | null = null;
                  try {
                    const anchors = await detectAnchors(new Uint8Array(pdfBuffer));
                    if (anchors.length > 0) {
                      const introducerAnchorCount = isEntity ? introducerSignatories.length : 1;
                      const requiredAnchors = getRequiredAnchorsForIntroducerAgreement(introducerAnchorCount);
                      validateRequiredAnchors(anchors, requiredAnchors);
                      const placements = getPlacementsFromAnchors(anchors, 'party_a', 'introducer_agreement');
                      if (placements.length > 0) {
                        signaturePlacements = placements;
                      } else {
                        console.warn('⚠️ No signature placements found for CEO anchor (party_a)');
                      }
                    } else {
                      console.warn('⚠️ No anchors detected in introducer agreement PDF');
                    }
                  } catch (anchorError) {
                    console.error('❌ Failed to detect anchors for introducer agreement:', anchorError);
                  }

                  // Create signature request for CEO (use service client to bypass RLS)
                  const { data: signatureRequest, error: sigReqError } = await serviceSupabase
                    .from('signature_requests')
                    .insert({
                      // investor_id is nullable - don't set it for introducer agreements
                      introducer_id: feePlan.introducer_id,
                      introducer_agreement_id: agreement.id,
                      deal_id: feePlan.deal_id,
                      signer_user_id: ceoUser.id, // User-level signing verification
                      signer_email: ceoUser.email,
                      signer_name: ceoUser.display_name || 'CEO',
                      document_type: 'introducer_agreement',
                      signer_role: 'admin',
                      signature_position: 'party_a',
                      signing_token: signingToken,
                      token_expires_at: expiresAt.toISOString(),
                      unsigned_pdf_path: fileKey,
                      ...(signaturePlacements && signaturePlacements.length > 0
                        ? { signature_placements: signaturePlacements }
                        : {}),
                      status: 'pending',
                      created_by: user.id,
                    })
                    .select('id')
                    .single();

            if (sigReqError || !signatureRequest) {
              console.error('❌ Failed to create CEO signature request:', sigReqError);
            } else {
              console.log('✅ CEO signature request created:', signatureRequest.id);

                    // Update agreement with CEO signature request ID and status
                    await serviceSupabase
                      .from('introducer_agreements')
                      .update({
                        ceo_signature_request_id: signatureRequest.id,
                        status: 'pending_ceo_signature',
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', agreement.id);

                    // Create task for CEO in VERSOSign with detailed info
                    const signingUrl = `/sign/${signingToken}`;
                    const dealName = deal?.company_name || deal?.name || 'Unknown Deal';
                    const introducerName = introducer?.legal_name || 'Unknown Introducer';
                    const feeDescription = `${subscriptionFeePercent}% subscription fee${hasPerformanceFee ? `, ${performanceFeePercent}% performance fee` : ''}`;

                    const { error: taskError } = await serviceSupabase.from('tasks').insert({
                      owner_user_id: ceoUser.id,
                      kind: 'countersignature',
                      category: 'compliance',
                      title: `Sign Introducer Agreement: ${introducerName} → ${dealName}`,
                      description: `Review and sign the introducer fee agreement.\n\n` +
                        `• Introducer: ${introducerName}\n` +
                        `• Deal: ${dealName}\n` +
                        `• Fees: ${feeDescription}\n` +
                        `• Reference: ${referenceNumber}\n\n` +
                        `After you sign, the introducer will receive a signing link.`,
                      status: 'pending',
                      priority: 'high',
                      related_entity_type: 'signature_request',
                      related_entity_id: signatureRequest.id,
                      related_deal_id: feePlan.deal_id,
                      due_at: expiresAt.toISOString(),
                      action_url: signingUrl,
                      instructions: {
                        type: 'signature',
                        action_url: signingUrl,
                        signature_request_id: signatureRequest.id,
                        document_type: 'introducer_agreement',
                        introducer_id: feePlan.introducer_id,
                        introducer_name: introducerName,
                        introducer_email: introducer?.email,
                        deal_name: dealName,
                        agreement_id: agreement.id,
                        reference_number: referenceNumber,
                        fee_summary: feeDescription,
                      },
                    });

                    if (taskError) {
                      console.error('⚠️ Failed to create CEO task:', taskError);
                    } else {
                      console.log('✅ CEO task created in VERSOSign');
                    }
                  }
                }
              } catch (sigError) {
                console.error('❌ Error creating CEO signature task:', sigError);
                // Don't fail - the agreement and PDF exist, task can be created manually
              }
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
