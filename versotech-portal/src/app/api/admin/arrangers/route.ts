import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
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

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service client to bypass RLS
    const serviceSupabase = createServiceClient()
    const { data: arrangers, error } = await serviceSupabase
      .from('arranger_entities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/admin/arrangers] Failed to fetch arrangers', error)
      return NextResponse.json({ error: 'Failed to fetch arrangers' }, { status: 500 })
    }

    return NextResponse.json({ arrangers })
  } catch (error) {
    console.error('[GET /api/admin/arrangers] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
    const {
      legal_name,
      registration_number,
      tax_id,
      regulator,
      license_number,
      license_type,
      license_expiry_date,
      email,
      phone,
      address,
      kyc_status,
      kyc_notes,
      metadata,
      status,
    } = body

    if (!legal_name || typeof legal_name !== 'string' || !legal_name.trim()) {
      return NextResponse.json({ error: 'Legal name is required' }, { status: 400 })
    }

    // Use service client to bypass RLS
    const serviceSupabase = createServiceClient()
    const { data: arranger, error } = await serviceSupabase
      .from('arranger_entities')
      .insert({
        legal_name: legal_name.trim(),
        registration_number: registration_number || null,
        tax_id: tax_id || null,
        regulator: regulator || null,
        license_number: license_number || null,
        license_type: license_type || null,
        license_expiry_date: license_expiry_date || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        kyc_status: kyc_status || 'draft',
        kyc_notes: kyc_notes || null,
        metadata: metadata || {},
        status: status || 'active',
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/admin/arrangers] Failed to create arranger', error)
      return NextResponse.json({ error: 'Failed to create arranger' }, { status: 500 })
    }

    return NextResponse.json({ arranger }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/arrangers] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
