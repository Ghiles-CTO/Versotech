/**
 * Arranger Commercial Partner Commission Detail API
 * GET /api/arrangers/me/commercial-partner-commissions/[id] - Get commission details
 * PATCH /api/arrangers/me/commercial-partner-commissions/[id] - Update commission
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for updating a commission
const updateCommissionSchema = z.object({
  status: z.enum(['accrued', 'invoice_requested', 'invoice_submitted', 'invoiced', 'paid', 'cancelled', 'rejected']).optional(),
  invoice_id: z.string().uuid().optional(),
  payment_reference: z.string().optional(),
  payment_due_date: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/arrangers/me/commercial-partner-commissions/[id]
 * Get details of a specific commercial partner commission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Fetch commission with related data
    const { data: commission, error } = await serviceSupabase
      .from('commercial_partner_commissions')
      .select(`
        *,
        commercial_partner:commercial_partners(id, name, legal_name, logo_url),
        deal:deals(id, name, company_name, currency),
        investor:investors(id, legal_name, display_name)
      `)
      .eq('id', id)
      .eq('arranger_id', arrangerId)
      .single()

    if (error || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Transform response
    const transformed = {
      ...commission,
      commercial_partner: Array.isArray(commission.commercial_partner) ? commission.commercial_partner[0] : commission.commercial_partner,
      deal: Array.isArray(commission.deal) ? commission.deal[0] : commission.deal,
      investor: Array.isArray(commission.investor) ? commission.investor[0] : commission.investor,
    }

    return NextResponse.json({ data: transformed })
  } catch (error) {
    console.error('[arranger/commercial-partner-commissions/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/arrangers/me/commercial-partner-commissions/[id]
 * Update a commercial partner commission (status, notes, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify commission exists and belongs to this arranger
    const { data: existingCommission, error: fetchError } = await serviceSupabase
      .from('commercial_partner_commissions')
      .select('id, status, arranger_id')
      .eq('id', id)
      .eq('arranger_id', arrangerId)
      .single()

    if (fetchError || !existingCommission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = updateCommissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        accrued: ['invoice_requested', 'cancelled'],
        invoice_requested: ['invoice_submitted', 'cancelled'],
        invoice_submitted: ['invoiced', 'rejected'],
        invoiced: ['paid', 'cancelled'],
        rejected: ['invoice_submitted', 'cancelled'],
        paid: [], // Cannot transition from paid
        cancelled: [], // Cannot transition from cancelled
      }

      const currentStatus = existingCommission.status
      const newStatus = data.status

      if (currentStatus !== newStatus && !validTransitions[currentStatus]?.includes(newStatus)) {
        return NextResponse.json(
          { error: `Cannot transition from '${currentStatus}' to '${newStatus}'` },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (data.status) updateData.status = data.status
    if (data.invoice_id) updateData.invoice_id = data.invoice_id
    if (data.payment_reference !== undefined) updateData.payment_reference = data.payment_reference
    if (data.payment_due_date !== undefined) updateData.payment_due_date = data.payment_due_date
    if (data.notes !== undefined) updateData.notes = data.notes

    // If marking as paid, set paid_at
    if (data.status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    // Update commission
    const { data: updatedCommission, error: updateError } = await serviceSupabase
      .from('commercial_partner_commissions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        commercial_partner:commercial_partners(id, name, legal_name),
        deal:deals(id, name, currency)
      `)
      .single()

    if (updateError) {
      console.error('[arranger/commercial-partner-commissions/[id]] Error updating:', updateError)
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'updated',
      entity_type: 'commercial_partner_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Commercial partner commission updated',
        changes: data,
        previous_status: existingCommission.status,
        new_status: data.status || existingCommission.status,
      },
      timestamp: new Date().toISOString(),
    })

    // Transform response
    const transformed = {
      ...updatedCommission,
      commercial_partner: Array.isArray(updatedCommission.commercial_partner) ? updatedCommission.commercial_partner[0] : updatedCommission.commercial_partner,
      deal: Array.isArray(updatedCommission.deal) ? updatedCommission.deal[0] : updatedCommission.deal,
    }

    return NextResponse.json({ data: transformed })
  } catch (error) {
    console.error('[arranger/commercial-partner-commissions/[id]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
