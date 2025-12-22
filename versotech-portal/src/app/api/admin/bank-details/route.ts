import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/bank-details?entity_type=investor&entity_id=uuid
export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entity_type and entity_id are required' },
        { status: 400 }
      )
    }

    // Validate entity type
    const validEntityTypes = ['investor', 'introducer', 'arranger', 'lawyer', 'partner', 'commercial_partner']
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity_type' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceClient()

    const { data: bankDetails, error } = await serviceClient
      .from('bank_details')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[bank-details] Error fetching bank details:', error)
      return NextResponse.json({ error: 'Failed to fetch bank details' }, { status: 500 })
    }

    return NextResponse.json({ bankDetails: bankDetails || [] })
  } catch (error) {
    console.error('[bank-details] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/bank-details
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Only staff admins can add bank details' }, { status: 403 })
    }

    const body = await request.json()
    const {
      entity_type,
      entity_id,
      bank_name,
      account_holder_name,
      account_number,
      routing_number,
      swift_bic,
      iban,
      currency = 'USD',
      is_primary = false,
      notes,
    } = body

    // Validate required fields
    if (!entity_type || !entity_id || !bank_name || !account_holder_name) {
      return NextResponse.json(
        { error: 'entity_type, entity_id, bank_name, and account_holder_name are required' },
        { status: 400 }
      )
    }

    // Validate entity type
    const validEntityTypes = ['investor', 'introducer', 'arranger', 'lawyer', 'partner', 'commercial_partner']
    if (!validEntityTypes.includes(entity_type)) {
      return NextResponse.json(
        { error: 'Invalid entity_type' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceClient()

    // If setting as primary, unset existing primary account
    if (is_primary) {
      await serviceClient
        .from('bank_details')
        .update({ is_primary: false })
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .eq('is_primary', true)
    }

    // Insert new bank details
    const { data: bankDetail, error } = await serviceClient
      .from('bank_details')
      .insert({
        entity_type,
        entity_id,
        bank_name,
        account_holder_name,
        account_number: account_number || null,
        routing_number: routing_number || null,
        swift_bic: swift_bic || null,
        iban: iban || null,
        currency,
        is_primary,
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('[bank-details] Error creating bank details:', error)
      return NextResponse.json({ error: 'Failed to create bank details' }, { status: 500 })
    }

    // Log activity
    await serviceClient.from('audit_logs').insert({
      action: 'bank_details_created',
      entity_type: 'bank_details',
      entity_id: bankDetail.id,
      actor_id: user.id,
      details: { entity_type, entity_id, bank_name },
    })

    return NextResponse.json({ bankDetail }, { status: 201 })
  } catch (error) {
    console.error('[bank-details] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
