import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const generateInvoiceSchema = z.object({
  investor_id: z.string().uuid().optional(),
  up_to_date: z.string().optional() // ISO date string
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    
    // Get the authenticated user from regular client
    const regularSupabase = await createClient()
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dealId = params.id

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = generateInvoiceSchema.parse(body)
    
    const upToDate = validatedData.up_to_date || new Date().toISOString().split('T')[0]
    const investorId = validatedData.investor_id || null

    // Verify deal exists
    const { data: deal } = await supabase
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

    // Call the database function to generate invoices
    const { data: invoiceId, error } = await supabase
      .rpc('fn_invoice_fees', {
        p_deal_id: dealId,
        p_investor_id: investorId,
        p_up_to_date: upToDate
      })

    if (error) {
      console.error('Invoice generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate invoices' },
        { status: 500 }
      )
    }

    if (!invoiceId) {
      return NextResponse.json({
        success: true,
        invoiceId: null,
        message: 'No accrued fees found to invoice'
      })
    }

    // Get the created invoice with details
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        invoice_lines (
          *,
          fee_events:fee_event_id (
            event_date,
            period_start,
            period_end,
            fee_components:fee_component_id (
              kind,
              calc_method
            )
          )
        )
      `)
      .eq('id', invoiceId)
      .single()

    // Log invoice generation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'invoices',
      entity_id: invoiceId,
      metadata: {
        endpoint: `/api/deals/${dealId}/invoices/generate`,
        deal_name: deal.name,
        investor_id: investorId,
        up_to_date: upToDate,
        invoice_total: invoice?.total || 0,
        line_count: invoice?.invoice_lines?.length || 0
      }
    })

    return NextResponse.json({
      success: true,
      invoice,
      message: 'Invoice generated successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/invoices/generate POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
