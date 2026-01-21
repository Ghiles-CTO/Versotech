/**
 * Arranger Introducer Commissions API
 * GET /api/arrangers/me/introducer-commissions - List commissions for arranger's introducers
 * POST /api/arrangers/me/introducer-commissions - Create new commission record
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

// Schema for creating an introducer commission
const createCommissionSchema = z.object({
  introducer_id: z.string().uuid(),
  deal_id: z.string().uuid().optional(),
  investor_id: z.string().uuid().optional(),
  introduction_id: z.string().uuid().optional(),
  fee_plan_id: z.string().uuid().optional(),
  basis_type: z.enum(['invested_amount', 'spread', 'management_fee', 'performance_fee']),
  rate_bps: z.number().int().min(0).max(10000),
  base_amount: z.number().min(0).optional(),
  accrual_amount: z.number().min(0),
  currency: z.string().default('USD'),
  payment_due_date: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/arrangers/me/introducer-commissions
 * List commissions for introducers in arranger's network
 *
 * Query params:
 * - introducer_id: Filter by specific introducer
 * - deal_id: Filter by specific deal
 * - status: Filter by status (accrued, invoice_requested, invoice_submitted, invoiced, paid, cancelled, rejected)
 * - limit: Pagination limit (default 50)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const introducerId = searchParams.get('introducer_id')
    const dealId = searchParams.get('deal_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = serviceSupabase
      .from('introducer_commissions')
      .select(`
        *,
        introducer:introducers(id, legal_name, email, logo_url),
        deal:deals(id, name, company_name, currency),
        investor:investors(id, legal_name, display_name)
      `, { count: 'exact' })
      .eq('arranger_id', arrangerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (introducerId) {
      query = query.eq('introducer_id', introducerId)
    }
    if (dealId) {
      query = query.eq('deal_id', dealId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: commissions, error, count } = await query

    if (error) {
      console.error('[arranger/introducer-commissions] Error fetching:', error)
      return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
    }

    // Calculate summary stats
    const { data: summaryData } = await serviceSupabase
      .from('introducer_commissions')
      .select('status, accrual_amount')
      .eq('arranger_id', arrangerId)

    const summary = {
      total_accrued: 0,
      total_invoice_requested: 0,
      total_invoice_submitted: 0,
      total_invoiced: 0,
      total_paid: 0,
      total_cancelled: 0,
      total_rejected: 0,
      total_owed: 0, // accrued + invoice_requested + invoice_submitted + invoiced
      count_by_status: {
        accrued: 0,
        invoice_requested: 0,
        invoice_submitted: 0,
        invoiced: 0,
        paid: 0,
        cancelled: 0,
        rejected: 0,
      },
    }

    ;(summaryData || []).forEach((c: any) => {
      const amount = Number(c.accrual_amount) || 0
      if (c.status === 'accrued') {
        summary.total_accrued += amount
        summary.count_by_status.accrued++
      } else if (c.status === 'invoice_requested') {
        summary.total_invoice_requested += amount
        summary.count_by_status.invoice_requested++
      } else if (c.status === 'invoice_submitted') {
        summary.total_invoice_submitted += amount
        summary.count_by_status.invoice_submitted++
      } else if (c.status === 'invoiced') {
        summary.total_invoiced += amount
        summary.count_by_status.invoiced++
      } else if (c.status === 'paid') {
        summary.total_paid += amount
        summary.count_by_status.paid++
      } else if (c.status === 'cancelled') {
        summary.total_cancelled += amount
        summary.count_by_status.cancelled++
      } else if (c.status === 'rejected') {
        summary.total_rejected += amount
        summary.count_by_status.rejected++
      }
    })

    summary.total_owed = summary.total_accrued + summary.total_invoice_requested + summary.total_invoice_submitted + summary.total_invoiced

    // Transform response (normalize joined data)
    const transformedCommissions = (commissions || []).map((c: any) => ({
      ...c,
      introducer: Array.isArray(c.introducer) ? c.introducer[0] : c.introducer,
      deal: Array.isArray(c.deal) ? c.deal[0] : c.deal,
      investor: Array.isArray(c.investor) ? c.investor[0] : c.investor,
    }))

    return NextResponse.json({
      data: transformedCommissions,
      summary,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('[arranger/introducer-commissions] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/arrangers/me/introducer-commissions
 * Create a new commission record for an introducer
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Parse and validate body
    const body = await request.json()
    const validation = createCommissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify introducer exists
    const { data: introducer, error: introducerError } = await serviceSupabase
      .from('introducers')
      .select('id, legal_name')
      .eq('id', data.introducer_id)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    // GAP-9 FIX: Verify introducer has a valid signed agreement
    const today = new Date().toISOString().split('T')[0]
    const { data: validAgreement } = await serviceSupabase
      .from('introducer_agreements')
      .select('id, status, signed_date, expiry_date')
      .eq('introducer_id', data.introducer_id)
      .eq('status', 'active')
      .not('signed_date', 'is', null)
      .or(`expiry_date.is.null,expiry_date.gte.${today}`)
      .limit(1)
      .maybeSingle()

    if (!validAgreement) {
      return NextResponse.json({
        error: 'No valid introducer agreement',
        message: 'Cannot create commission without an active signed introducer agreement'
      }, { status: 400 })
    }

    // If deal_id provided, verify it belongs to this arranger
    if (data.deal_id) {
      const { data: deal, error: dealError } = await serviceSupabase
        .from('deals')
        .select('id, arranger_entity_id')
        .eq('id', data.deal_id)
        .single()

      if (dealError || !deal) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
      }

      if (deal.arranger_entity_id !== arrangerId) {
        return NextResponse.json({ error: 'Deal does not belong to your entity' }, { status: 403 })
      }
    }

    // GAP-9 FIX: Check for duplicate commission
    // Prevent creating multiple commissions for the same (introducer, deal, investor, basis_type)
    if (data.deal_id && data.investor_id) {
      const { data: existingCommission } = await serviceSupabase
        .from('introducer_commissions')
        .select('id')
        .eq('introducer_id', data.introducer_id)
        .eq('deal_id', data.deal_id)
        .eq('investor_id', data.investor_id)
        .eq('basis_type', data.basis_type)
        .maybeSingle()

      if (existingCommission) {
        return NextResponse.json({
          error: 'Duplicate commission',
          message: 'A commission already exists for this introducer, deal, investor, and basis type combination'
        }, { status: 400 })
      }
    }

    // Create commission record
    const { data: commission, error: createError } = await serviceSupabase
      .from('introducer_commissions')
      .insert({
        introducer_id: data.introducer_id,
        deal_id: data.deal_id || null,
        investor_id: data.investor_id || null,
        introduction_id: data.introduction_id || null,
        arranger_id: arrangerId,
        fee_plan_id: data.fee_plan_id || null,
        basis_type: data.basis_type,
        rate_bps: data.rate_bps,
        base_amount: data.base_amount || null,
        accrual_amount: data.accrual_amount,
        currency: data.currency,
        status: 'accrued',
        payment_due_date: data.payment_due_date || null,
        notes: data.notes || null,
      })
      .select(`
        *,
        introducer:introducers(id, legal_name, email),
        deal:deals(id, name, currency)
      `)
      .single()

    if (createError) {
      console.error('[arranger/introducer-commissions] Error creating:', createError)
      return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 })
    }

    // GAP-7 FIX: Audit log commission creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.COMMISSION_CREATED,
      entity: AuditEntities.INTRODUCER_COMMISSIONS,
      entity_id: commission.id,
      metadata: {
        introducer_id: data.introducer_id,
        deal_id: data.deal_id,
        investor_id: data.investor_id,
        basis_type: data.basis_type,
        accrual_amount: data.accrual_amount,
        currency: data.currency,
        created_by: 'arranger',
      },
    })

    // Transform response
    const transformed = {
      ...commission,
      introducer: Array.isArray(commission.introducer) ? commission.introducer[0] : commission.introducer,
      deal: Array.isArray(commission.deal) ? commission.deal[0] : commission.deal,
    }

    return NextResponse.json({ data: transformed }, { status: 201 })
  } catch (error) {
    console.error('[arranger/introducer-commissions] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
