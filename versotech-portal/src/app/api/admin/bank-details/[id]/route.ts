import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/bank-details/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceClient = createServiceClient()

    const { data: bankDetail, error } = await serviceClient
      .from('bank_details')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !bankDetail) {
      return NextResponse.json({ error: 'Bank details not found' }, { status: 404 })
    }

    return NextResponse.json({ bankDetail })
  } catch (error) {
    console.error('[bank-details] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/bank-details/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'staff_admin') {
      return NextResponse.json({ error: 'Only staff admins can update bank details' }, { status: 403 })
    }

    const body = await request.json()
    const {
      bank_name,
      account_holder_name,
      account_number,
      routing_number,
      swift_bic,
      iban,
      currency,
      is_primary,
      notes,
    } = body

    const serviceClient = createServiceClient()

    // Get current bank detail to check entity info
    const { data: currentBankDetail, error: fetchError } = await serviceClient
      .from('bank_details')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentBankDetail) {
      return NextResponse.json({ error: 'Bank details not found' }, { status: 404 })
    }

    // If setting as primary, unset existing primary account
    if (is_primary && !currentBankDetail.is_primary) {
      await serviceClient
        .from('bank_details')
        .update({ is_primary: false })
        .eq('entity_type', currentBankDetail.entity_type)
        .eq('entity_id', currentBankDetail.entity_id)
        .eq('is_primary', true)
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}
    if (bank_name !== undefined) updateData.bank_name = bank_name
    if (account_holder_name !== undefined) updateData.account_holder_name = account_holder_name
    if (account_number !== undefined) updateData.account_number = account_number || null
    if (routing_number !== undefined) updateData.routing_number = routing_number || null
    if (swift_bic !== undefined) updateData.swift_bic = swift_bic || null
    if (iban !== undefined) updateData.iban = iban || null
    if (currency !== undefined) updateData.currency = currency
    if (is_primary !== undefined) updateData.is_primary = is_primary
    if (notes !== undefined) updateData.notes = notes || null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: bankDetail, error } = await serviceClient
      .from('bank_details')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[bank-details] Error updating bank details:', error)
      return NextResponse.json({ error: 'Failed to update bank details' }, { status: 500 })
    }

    // Log activity
    await serviceClient.from('audit_logs').insert({
      action: 'bank_details_updated',
      entity_type: 'bank_details',
      entity_id: id,
      actor_id: user.id,
      details: { updated_fields: Object.keys(updateData) },
    })

    return NextResponse.json({ bankDetail })
  } catch (error) {
    console.error('[bank-details] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/bank-details/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'staff_admin') {
      return NextResponse.json({ error: 'Only staff admins can delete bank details' }, { status: 403 })
    }

    const serviceClient = createServiceClient()

    // Get bank detail info before deletion for audit log
    const { data: bankDetail, error: fetchError } = await serviceClient
      .from('bank_details')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !bankDetail) {
      return NextResponse.json({ error: 'Bank details not found' }, { status: 404 })
    }

    const { error } = await serviceClient
      .from('bank_details')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[bank-details] Error deleting bank details:', error)
      return NextResponse.json({ error: 'Failed to delete bank details' }, { status: 500 })
    }

    // Log activity
    await serviceClient.from('audit_logs').insert({
      action: 'bank_details_deleted',
      entity_type: 'bank_details',
      entity_id: id,
      actor_id: user.id,
      details: {
        entity_type: bankDetail.entity_type,
        entity_id: bankDetail.entity_id,
        bank_name: bankDetail.bank_name,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[bank-details] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
