import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Relaxed UUID regex that accepts test UUIDs
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validation schema for invoice generation
const generateInvoiceSchema = z.object({
  investor_id: z.string().regex(uuidPattern, 'Invalid investor ID format').optional(),
  up_to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can generate invoices)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to generate invoices' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const validation = generateInvoiceSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { investor_id, up_to_date } = validation.data
    const invoiceDate = up_to_date || new Date().toISOString().split('T')[0]

    // Use service client for database operations
    const serviceSupabase = createServiceClient()

    // Verify deal exists
    const { data: deal } = await serviceSupabase
      .from('deals')
      .select('id, name, status')
      .eq('id', dealId)
      .single()

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check if there are any accrued fee events to invoice
    let feeEventsQuery = serviceSupabase
      .from('fee_events')
      .select('id, investor_id, computed_amount')
      .eq('deal_id', dealId)
      .eq('status', 'accrued')
      .lte('event_date', invoiceDate)

    if (investor_id) {
      feeEventsQuery = feeEventsQuery.eq('investor_id', investor_id)
    }

    const { data: feeEvents } = await feeEventsQuery

    if (!feeEvents || feeEvents.length === 0) {
      return NextResponse.json(
        { error: 'No accrued fee events found to invoice' },
        { status: 400 }
      )
    }

    // Call the database function to generate invoice
    const { data: invoiceResult, error: invoiceError } = await serviceSupabase
      .rpc('fn_invoice_fees', {
        p_deal_id: dealId,
        p_investor_id: investor_id || null,
        p_up_to_date: invoiceDate
      })

    if (invoiceError) {
      console.error('Invoice generation error:', invoiceError)
      return NextResponse.json(
        { error: invoiceError.message || 'Failed to generate invoice' },
        { status: 500 }
      )
    }

    const invoiceId = invoiceResult

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'No invoice was generated - no eligible fee events found' },
        { status: 400 }
      )
    }

    // Get the created invoice with details
    const { data: invoice } = await serviceSupabase
      .from('invoices')
      .select(`
        *,
        investors (
          legal_name,
          country
        ),
        invoice_lines (
          *,
          fee_events (
            event_date,
            period_start,
            period_end,
            fee_components (
              kind,
              calc_method,
              rate_bps,
              frequency
            )
          )
        )
      `)
      .eq('id', invoiceId)
      .single()

    // Log the invoice generation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.INVOICES,
      entity_id: invoiceId,
      metadata: {
        deal_id: dealId,
        investor_id: investor_id || 'all',
        up_to_date: invoiceDate,
        total_amount: invoice?.total?.toString(),
        generated_by: profile.display_name
      }
    })

    return NextResponse.json({
      success: true,
      invoice_id: invoiceId,
      invoice,
      message: `Successfully generated invoice for ${invoice?.investors?.legal_name || 'investor'} - Total: ${invoice?.currency} ${invoice?.total}`
    })

  } catch (error) {
    console.error('Invoice generation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to view invoices for a deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const status = searchParams.get('status')
    const investorId = searchParams.get('investor_id')

    // Use service client for database operations (RLS will still apply)
    const serviceSupabase = createServiceClient()

    // Build query (RLS will handle access control)
    let query = serviceSupabase
      .from('invoices')
      .select(`
        *,
        investors (
          legal_name,
          country
        ),
        invoice_lines (
          *,
          fee_events (
            event_date,
            period_start,
            period_end,
            fee_components (
              kind,
              calc_method,
              rate_bps
            )
          )
        )
      `)
      .eq('deal_id', dealId)

    if (status) {
      query = query.eq('status', status)
    }
    if (investorId) {
      query = query.eq('investor_id', investorId)
    }

    const { data: invoices, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const totalAmount = invoices?.reduce((sum, invoice) => sum + parseFloat(invoice.total || '0'), 0) || 0
    const invoicesByStatus = invoices?.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      invoices: invoices || [],
      summary: {
        total_amount: totalAmount,
        invoice_count: invoices?.length || 0,
        by_status: invoicesByStatus
      }
    })

  } catch (error) {
    console.error('Invoices GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}