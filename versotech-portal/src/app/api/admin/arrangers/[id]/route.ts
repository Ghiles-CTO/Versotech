import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile.role.startsWith('staff_') || profile.role === 'ceo')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()
    const { data: arranger, error } = await serviceSupabase
      .from('arranger_entities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[GET /api/admin/arrangers/[id]] Failed to fetch arranger', error)
      return NextResponse.json({ error: 'Arranger not found' }, { status: 404 })
    }

    return NextResponse.json({ arranger })
  } catch (error) {
    console.error('[GET /api/admin/arrangers/[id]] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'staff_admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()

    // Build update object with only provided fields
    const updates: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    const allowedFields = [
      'legal_name',
      'registration_number',
      'tax_id',
      'regulator',
      'license_number',
      'license_type',
      'license_expiry_date',
      'email',
      'phone',
      'address',
      'kyc_status',
      'kyc_approved_at',
      'kyc_approved_by',
      'kyc_expires_at',
      'kyc_notes',
      'metadata',
      'status',
      'type',
      // Individual KYC fields
      'first_name',
      'middle_name',
      'last_name',
      'name_suffix',
      'date_of_birth',
      'country_of_birth',
      'nationality',
      // Phone fields
      'phone_mobile',
      'phone_office',
      // US Tax compliance
      'is_us_citizen',
      'is_us_taxpayer',
      'us_taxpayer_id',
      'country_of_tax_residency',
      // ID Document
      'id_type',
      'id_number',
      'id_issue_date',
      'id_expiry_date',
      'id_issuing_country',
      // Residential Address
      'residential_street',
      'residential_line_2',
      'residential_city',
      'residential_state',
      'residential_postal_code',
      'residential_country',
    ]

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    // If approving KYC, set approved_by
    if (updates.kyc_status === 'approved' && !updates.kyc_approved_by) {
      updates.kyc_approved_by = user.id
    }

    const serviceSupabase = createServiceClient()
    const { data: arranger, error } = await serviceSupabase
      .from('arranger_entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/admin/arrangers/[id]] Failed to update arranger', error)
      return NextResponse.json({ error: 'Failed to update arranger' }, { status: 500 })
    }

    return NextResponse.json({ arranger })
  } catch (error) {
    console.error('[PATCH /api/admin/arrangers/[id]] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'staff_admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()
    const { error } = await serviceSupabase
      .from('arranger_entities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/admin/arrangers/[id]] Failed to delete arranger', error)
      return NextResponse.json({ error: 'Failed to delete arranger' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/arrangers/[id]] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
