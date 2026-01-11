import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Role mapping from dialog values to database values
const ROLE_MAP: Record<string, string> = {
  'ubo': 'beneficial_owner',
  'signatory': 'authorized_signatory',
  'authorized_representative': 'authorized_signatory',
  'beneficiary': 'beneficial_owner',
}

const memberSchema = z.object({
  // Name fields - support both full_name OR individual parts
  full_name: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  name_suffix: z.string().optional().nullable(),

  // Role - accept both old and new role values
  role: z.string().min(1, 'Role is required'),
  role_title: z.string().optional().nullable(),

  // Contact info
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),

  // Address
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),

  // Personal info
  nationality: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),

  // Tax info
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().optional().nullable(),

  // ID document
  id_type: z.string().optional().nullable(),
  id_number: z.string().optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // Ownership
  ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  is_beneficial_owner: z.boolean().optional(),
  is_signatory: z.boolean().optional(),

  // Dates
  effective_from: z.string().optional().nullable(),
})

/**
 * GET /api/investors/me/members
 * Fetch all members of the current investor entity
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Check if any of the linked investors is an entity type
    const { data: investors, error: investorsError } = await serviceSupabase
      .from('investors')
      .select('id, type, display_name')
      .in('id', investorIds)
      .in('type', ['entity', 'institutional'])

    if (investorsError) {
      console.error('Error fetching investors:', investorsError)
      return NextResponse.json({ error: 'Failed to fetch investor info' }, { status: 500 })
    }

    if (!investors || investors.length === 0) {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type investor'
      })
    }

    // Get members for entity-type investors
    const entityInvestorIds = investors.map(i => i.id)
    const { data: members, error: membersError } = await serviceSupabase
      .from('investor_members')
      .select('*')
      .in('investor_id', entityInvestorIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      investors: investors
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/investors/me/members
 * Add a new member to the investor entity
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get primary investor ID for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Verify investor is entity type
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('id, type')
      .eq('id', investorId)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    if (!['entity', 'institutional'].includes(investor.type || '')) {
      return NextResponse.json({
        error: 'Members can only be added to entity-type investors'
      }, { status: 400 })
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

    // Compute full_name from parts if not provided
    let fullName = memberData.full_name
    if (!fullName && (memberData.first_name || memberData.last_name)) {
      const nameParts = [
        memberData.first_name,
        memberData.middle_name,
        memberData.last_name,
        memberData.name_suffix
      ].filter(Boolean)
      fullName = nameParts.join(' ')
    }

    if (!fullName) {
      return NextResponse.json(
        { error: 'Name is required (either full_name or first_name/last_name)' },
        { status: 400 }
      )
    }

    // Map role if needed (e.g., 'ubo' → 'beneficial_owner')
    const dbRole = ROLE_MAP[memberData.role] || memberData.role

    // Determine if beneficial owner or signatory from role
    const isBeneficialOwner = memberData.is_beneficial_owner ||
      ['ubo', 'beneficial_owner', 'beneficiary'].includes(memberData.role)
    const isSignatory = memberData.is_signatory ||
      ['signatory', 'authorized_signatory', 'authorized_representative'].includes(memberData.role)

    // Create new member with all fields
    const { data: newMember, error: insertError } = await serviceSupabase
      .from('investor_members')
      .insert({
        investor_id: investorId,
        // Name fields
        full_name: fullName,
        first_name: memberData.first_name || null,
        middle_name: memberData.middle_name || null,
        last_name: memberData.last_name || null,
        name_suffix: memberData.name_suffix || null,
        // Role
        role: dbRole,
        role_title: memberData.role_title || null,
        // Contact
        email: memberData.email || null,
        phone: memberData.phone || memberData.phone_mobile || null,
        phone_mobile: memberData.phone_mobile || null,
        phone_office: memberData.phone_office || null,
        // Address
        residential_street: memberData.residential_street || null,
        residential_line_2: memberData.residential_line_2 || null,
        residential_city: memberData.residential_city || null,
        residential_state: memberData.residential_state || null,
        residential_postal_code: memberData.residential_postal_code || null,
        residential_country: memberData.residential_country || null,
        // Personal info
        nationality: memberData.nationality || null,
        date_of_birth: memberData.date_of_birth || null,
        country_of_birth: memberData.country_of_birth || null,
        // Tax info
        is_us_citizen: memberData.is_us_citizen || false,
        is_us_taxpayer: memberData.is_us_taxpayer || false,
        us_taxpayer_id: memberData.us_taxpayer_id || null,
        country_of_tax_residency: memberData.country_of_tax_residency || null,
        tax_id_number: memberData.tax_id_number || null,
        // ID document
        id_type: memberData.id_type || null,
        id_number: memberData.id_number || null,
        id_issue_date: memberData.id_issue_date || null,
        id_expiry_date: memberData.id_expiry_date || null,
        id_issuing_country: memberData.id_issuing_country || null,
        // Ownership & status
        ownership_percentage: memberData.ownership_percentage || null,
        is_beneficial_owner: isBeneficialOwner,
        is_signatory: isSignatory,
        // Dates & metadata
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
        kyc_status: 'not_started',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating member:', insertError)
      return NextResponse.json(
        { error: 'Failed to create member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
