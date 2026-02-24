import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { syncUserSignatoryFromMember } from '@/lib/kyc/member-signatory-sync'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const memberSchema = z.object({
  // Role
  role: z.enum([
    'director', 'shareholder', 'beneficial_owner', 'authorized_signatory',
    'officer', 'partner', 'ubo', 'signatory', 'authorized_representative',
    'beneficiary', 'trustee', 'managing_member', 'general_partner',
    'limited_partner', 'other'
  ]),
  role_title: z.string().optional().nullable(),

  // Structured name
  full_name: z.string().min(1, 'Full name is required'),
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),

  // Personal Info
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),

  // Contact
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),

  // Residential Address
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),

  // US Tax compliance
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // ID Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other']).optional().nullable(),
  id_number: z.string().optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // Proof of Address tracking
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),

  // Ownership
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

/**
 * GET /api/staff/investors/[id]/members
 * Fetch all members of an investor entity
 * Authentication: Staff only
 */
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    // Verify investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, type, legal_name')
      .eq('id', id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    // Get all members for this investor
    const { data: members, error: membersError } = await supabase
      .from('investor_members')
      .select('*')
      .eq('investor_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      investor: {
        id: investor.id,
        type: investor.type,
        legal_name: investor.legal_name
      }
    })
  } catch (error) {
    console.error('API /staff/investors/[id]/members GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/staff/investors/[id]/members
 * Add a new member to an investor entity
 * Authentication: Staff only
 */
export async function POST(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    // Verify investor exists and is entity type
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, type')
      .eq('id', id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = memberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const memberData = parsed.data

    // Create new member with all KYC fields
    const { data: newMember, error: insertError } = await supabase
      .from('investor_members')
      .insert({
        investor_id: id,
        // Role
        role: memberData.role,
        role_title: memberData.role_title,
        // Name
        full_name: memberData.full_name,
        first_name: memberData.first_name,
        middle_name: memberData.middle_name,
        last_name: memberData.last_name,
        name_suffix: memberData.name_suffix,
        // Personal
        date_of_birth: memberData.date_of_birth,
        country_of_birth: memberData.country_of_birth,
        nationality: memberData.nationality,
        // Contact
        email: memberData.email || null,
        phone: memberData.phone,
        phone_mobile: memberData.phone_mobile,
        phone_office: memberData.phone_office,
        // Address
        residential_street: memberData.residential_street,
        residential_line_2: memberData.residential_line_2,
        residential_city: memberData.residential_city,
        residential_state: memberData.residential_state,
        residential_postal_code: memberData.residential_postal_code,
        residential_country: memberData.residential_country,
        // Tax
        is_us_citizen: memberData.is_us_citizen || false,
        is_us_taxpayer: memberData.is_us_taxpayer || false,
        us_taxpayer_id: memberData.us_taxpayer_id,
        country_of_tax_residency: memberData.country_of_tax_residency,
        tax_id_number: memberData.tax_id_number,
        // ID Document
        id_type: memberData.id_type,
        id_number: memberData.id_number,
        id_issue_date: memberData.id_issue_date,
        id_expiry_date: memberData.id_expiry_date,
        id_issuing_country: memberData.id_issuing_country,
        // Proof of Address
        proof_of_address_date: memberData.proof_of_address_date,
        proof_of_address_expiry: memberData.proof_of_address_expiry,
        // Ownership
        ownership_percentage: memberData.ownership_percentage,
        is_beneficial_owner: memberData.is_beneficial_owner || false,
        is_signatory: memberData.is_signatory || false,
        can_sign: memberData.can_sign || false,
        signature_specimen_url: memberData.signature_specimen_url,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        // Metadata
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating member:', insertError)
      return NextResponse.json(
        { error: 'Failed to create member', details: insertError.message },
        { status: 500 }
      )
    }

    if (newMember?.id) {
      await syncUserSignatoryFromMember({
        supabase,
        entityType: 'investor',
        entityId: id,
        memberId: newMember.id,
      })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('API /staff/investors/[id]/members POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
