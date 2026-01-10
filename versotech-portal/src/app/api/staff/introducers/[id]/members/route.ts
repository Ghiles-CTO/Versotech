import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const memberSchema = z.object({
  role: z.enum([
    'director', 'shareholder', 'beneficial_owner', 'authorized_signatory',
    'officer', 'partner', 'ubo', 'signatory', 'authorized_representative',
    'beneficiary', 'trustee', 'managing_member', 'general_partner',
    'limited_partner', 'other'
  ]),
  role_title: z.string().optional().nullable(),
  full_name: z.string().min(1, 'Full name is required'),
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other']).optional().nullable(),
  id_number: z.string().optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),
  ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  is_beneficial_owner: z.boolean().optional(),
  is_signatory: z.boolean().optional(),
  can_sign: z.boolean().optional(),
  signature_specimen_url: z.string().optional().nullable(),
  effective_from: z.string().optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: introducer, error: introducerError } = await supabase
      .from('introducers')
      .select('id, type, legal_name')
      .eq('id', id)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    const { data: members, error: membersError } = await supabase
      .from('introducer_members')
      .select('*')
      .eq('introducer_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      introducer: { id: introducer.id, type: introducer.type, legal_name: introducer.legal_name }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: introducer, error: introducerError } = await supabase
      .from('introducers')
      .select('id')
      .eq('id', id)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = memberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }

    const d = parsed.data
    const { data: newMember, error: insertError } = await supabase
      .from('introducer_members')
      .insert({
        introducer_id: id,
        role: d.role, role_title: d.role_title,
        full_name: d.full_name, first_name: d.first_name, middle_name: d.middle_name,
        last_name: d.last_name, name_suffix: d.name_suffix,
        date_of_birth: d.date_of_birth, country_of_birth: d.country_of_birth, nationality: d.nationality,
        email: d.email || null, phone: d.phone, phone_mobile: d.phone_mobile, phone_office: d.phone_office,
        residential_street: d.residential_street, residential_line_2: d.residential_line_2,
        residential_city: d.residential_city, residential_state: d.residential_state,
        residential_postal_code: d.residential_postal_code, residential_country: d.residential_country,
        is_us_citizen: d.is_us_citizen || false, is_us_taxpayer: d.is_us_taxpayer || false,
        us_taxpayer_id: d.us_taxpayer_id, country_of_tax_residency: d.country_of_tax_residency,
        tax_id_number: d.tax_id_number,
        id_type: d.id_type, id_number: d.id_number, id_issue_date: d.id_issue_date,
        id_expiry_date: d.id_expiry_date, id_issuing_country: d.id_issuing_country,
        proof_of_address_date: d.proof_of_address_date, proof_of_address_expiry: d.proof_of_address_expiry,
        ownership_percentage: d.ownership_percentage,
        is_beneficial_owner: d.is_beneficial_owner || false,
        is_signatory: d.is_signatory || false, can_sign: d.can_sign || false,
        signature_specimen_url: d.signature_specimen_url,
        effective_from: d.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id, is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating member:', insertError)
      return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
