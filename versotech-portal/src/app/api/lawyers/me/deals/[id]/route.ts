/**
 * Lawyer Deal Detail API
 * GET /api/lawyers/me/deals/[id] - Get COMPREHENSIVE deal details for lawyer review
 *
 * Returns ALL deal data the lawyer needs:
 * - Full deal info (company, terms, thesis, sector, stage, etc.)
 * - Assignment info (role, status, assigned date)
 * - Escrow status (committed vs funded)
 * - All subscriptions with investor details
 * - ALL documents (lawyers see everything, not just published)
 * - FAQs
 * - Fee payment summary
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()
  const { id: dealId } = await params

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get lawyer entity for current user
    const { data: lawyerUser, error: lawyerUserError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, role, is_primary, can_sign')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerUserError || !lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'Lawyer profile not found' }, { status: 404 })
    }

    // Verify lawyer is assigned to this deal
    const { data: assignment, error: assignmentError } = await serviceSupabase
      .from('deal_lawyer_assignments')
      .select('id, role, status, assigned_at, notes, completed_at, assigned_by')
      .eq('deal_id', dealId)
      .eq('lawyer_id', lawyerUser.lawyer_id)
      .maybeSingle()

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'You are not assigned to this deal' },
        { status: 403 }
      )
    }

    // Get FULL deal details - ALL fields the lawyer needs
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select(`
        id,
        name,
        company_name,
        company_logo_url,
        company_website,
        deal_type,
        status,
        currency,
        target_amount,
        raised_amount,
        minimum_investment,
        maximum_investment,
        offer_unit_price,
        open_at,
        close_at,
        created_at,
        description,
        investment_thesis,
        sector,
        stage,
        location,
        stock_type,
        deal_round,
        vehicle_id
      `)
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Get vehicle info if exists
    let vehicleInfo = null
    if (deal.vehicle_id) {
      const { data: vehicle } = await serviceSupabase
        .from('vehicles')
        .select('id, name, legal_name, vehicle_type')
        .eq('id', deal.vehicle_id)
        .maybeSingle()
      vehicleInfo = vehicle
    }

    // Get subscriptions on this deal with investor info
    // Note: subscriptions table uses 'commitment' not 'commitment_amount'
    // Note: investors table uses 'legal_name' not 'company_name'
    const { data: subscriptions, error: subsError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        id,
        commitment,
        funded_amount,
        currency,
        status,
        signed_at,
        created_at,
        investors!inner (
          id,
          legal_name,
          display_name
        )
      `)
      .eq('deal_id', dealId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError)
    }

    // Calculate escrow totals
    const escrowStats = {
      total_committed: 0,
      total_funded: 0,
      pending_confirmations: 0,
      currency: deal.currency || 'USD'
    }

    const formattedSubscriptions = (subscriptions || []).map(sub => {
      // Note: column is 'commitment' not 'commitment_amount'
      const commitment = Number((sub as any).commitment) || 0
      const funded = Number(sub.funded_amount) || 0

      escrowStats.total_committed += commitment
      escrowStats.total_funded += funded

      // Count pending (signed but not fully funded)
      if (sub.signed_at && funded < commitment) {
        escrowStats.pending_confirmations++
      }

      // Handle investors - it's a single object from !inner join
      // Note: column is 'legal_name' not 'company_name'
      const investor = sub.investors as unknown as { id: string; legal_name: string | null; display_name: string | null } | null

      return {
        id: sub.id,
        investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
        investor_entity: investor?.legal_name || null,
        commitment_amount: commitment,
        funded_amount: funded,
        currency: sub.currency || deal.currency || 'USD',
        status: sub.status,
        signed_at: sub.signed_at,
        funding_status: funded >= commitment ? 'funded' :
                       funded > 0 ? 'partial' :
                       sub.signed_at ? 'awaiting_funding' : 'pending_signature'
      }
    })

    // Get ALL documents for this deal - lawyers see EVERYTHING (not just published)
    const { data: documents, error: docsError } = await serviceSupabase
      .from('documents')
      .select(`
        id,
        name,
        type,
        description,
        is_published,
        file_key,
        external_url,
        link_type,
        file_size_bytes,
        mime_type,
        created_at
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
    }

    // Format documents - client will use /api/documents/[id]/download for signed URLs
    const formattedDocuments = (documents || []).map(doc => {
      return {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        description: doc.description,
        is_published: doc.is_published,
        has_file: !!doc.file_key,
        external_url: doc.external_url,
        file_size_bytes: doc.file_size_bytes,
        mime_type: doc.mime_type,
        created_at: doc.created_at
      }
    })

    // Get FAQs for this deal
    const { data: faqs, error: faqsError } = await serviceSupabase
      .from('deal_faqs')
      .select('id, question, answer, display_order, created_at')
      .eq('deal_id', dealId)
      .order('display_order', { ascending: true })

    if (faqsError) {
      console.error('Error fetching FAQs:', faqsError)
    }

    // Get fee payment summary
    // Partner commissions
    const { data: partnerFees } = await serviceSupabase
      .from('partner_commissions')
      .select('amount, status')
      .eq('deal_id', dealId)

    // Introducer commissions
    const { data: introducerFees } = await serviceSupabase
      .from('introducer_commissions')
      .select('amount, status')
      .eq('deal_id', dealId)

    // Commercial partner commissions
    const { data: cpFees } = await serviceSupabase
      .from('commercial_partner_commissions')
      .select('amount, status')
      .eq('deal_id', dealId)

    // Calculate fee totals
    const calculateFeeTotals = (fees: { amount: number; status: string }[] | null) => {
      const pending = (fees || [])
        .filter(f => !['paid', 'cancelled'].includes(f.status))
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
      const paid = (fees || [])
        .filter(f => f.status === 'paid')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
      return { pending, paid }
    }

    const feeSummary = {
      partner_fees: calculateFeeTotals(partnerFees),
      introducer_fees: calculateFeeTotals(introducerFees),
      cp_fees: calculateFeeTotals(cpFees)
    }

    // Get who assigned this deal
    let assignedByName = null
    if (assignment.assigned_by) {
      const { data: assigner } = await serviceSupabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', assignment.assigned_by)
        .maybeSingle()
      assignedByName = assigner?.display_name || assigner?.email || null
    }

    return NextResponse.json({
      deal: {
        id: deal.id,
        name: deal.name,
        company_name: deal.company_name,
        company_logo_url: deal.company_logo_url,
        company_website: deal.company_website,
        deal_type: deal.deal_type,
        status: deal.status,
        currency: deal.currency,
        target_amount: deal.target_amount,
        raised_amount: deal.raised_amount,
        minimum_investment: deal.minimum_investment,
        maximum_investment: deal.maximum_investment,
        offer_unit_price: deal.offer_unit_price,
        open_at: deal.open_at,
        close_at: deal.close_at,
        description: deal.description,
        investment_thesis: deal.investment_thesis,
        sector: deal.sector,
        stage: deal.stage,
        location: deal.location,
        stock_type: deal.stock_type,
        deal_round: deal.deal_round
      },
      vehicle: vehicleInfo,
      assignment: {
        id: assignment.id,
        role: assignment.role,
        status: assignment.status,
        assigned_at: assignment.assigned_at,
        assigned_by: assignedByName,
        notes: assignment.notes,
        completed_at: assignment.completed_at
      },
      escrow: escrowStats,
      subscriptions: formattedSubscriptions,
      documents: formattedDocuments,
      faqs: faqs || [],
      fee_summary: feeSummary
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/lawyers/me/deals/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
