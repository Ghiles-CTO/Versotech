import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * GET /api/investors/me
 * Fetch the current user's investor profile
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
      // Return 200 with null investor instead of 404 to avoid log noise
      // This allows profile page to gracefully check if user has investor entity
      return NextResponse.json({ investor: null, exists: false }, { status: 200 })
    }

    // Get the first (primary) investor
    const investorId = investorLinks[0].investor_id

    // Fetch investor data
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('*')
      .eq('id', investorId)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    return NextResponse.json({ investor })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const updateInvestorSchema = z.object({
  // Personal Info (for individual investors)
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),

  // Residential Address
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),

  // Phone numbers
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),

  // US Tax compliance (FATCA)
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // ID Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit']).optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // Representative info (for entity-type investors)
  representative_name: z.string().optional().nullable(),
  representative_title: z.string().optional().nullable(),
})

/**
 * PATCH /api/investors/me
 * Update the current user's investor profile
 */
export async function PATCH(request: Request) {
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

    const investorId = investorLinks[0].investor_id

    // Parse and validate request body
    const body = await request.json()
    const parsed = updateInvestorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Build update object (only include non-undefined values)
    const updateData: Record<string, any> = {}
    const validFields = [
      // Personal Info
      'first_name',
      'middle_name',
      'last_name',
      'name_suffix',
      'date_of_birth',
      'country_of_birth',
      'nationality',
      // Residential Address
      'residential_street',
      'residential_line_2',
      'residential_city',
      'residential_state',
      'residential_postal_code',
      'residential_country',
      // Phone
      'phone_mobile',
      'phone_office',
      // US Tax compliance
      'is_us_citizen',
      'is_us_taxpayer',
      'us_taxpayer_id',
      'country_of_tax_residency',
      'tax_id_number',
      // ID Document
      'id_type',
      'id_number',
      'id_issue_date',
      'id_expiry_date',
      'id_issuing_country',
      // Representative
      'representative_name',
      'representative_title',
    ]

    for (const field of validFields) {
      if (parsed.data[field as keyof typeof parsed.data] !== undefined) {
        updateData[field] = parsed.data[field as keyof typeof parsed.data]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    // Update investor
    const { data: updatedInvestor, error: updateError } = await serviceSupabase
      .from('investors')
      .update(updateData)
      .eq('id', investorId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating investor:', updateError)
      return NextResponse.json({ error: 'Failed to update investor' }, { status: 500 })
    }

    return NextResponse.json({ investor: updatedInvestor })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/investors/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
