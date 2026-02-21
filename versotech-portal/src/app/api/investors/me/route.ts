import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'

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

    // Get the user's primary investor link deterministically.
    const { link: investorLink, error: linksError } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id'
    )

    if (linksError || !investorLink?.investor_id) {
      // Return 200 with null investor instead of 404 to avoid log noise
      // This allows profile page to gracefully check if user has investor entity
      return NextResponse.json({ investor: null, exists: false }, { status: 200 })
    }

    const investorId = investorLink.investor_id

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
  // Entity Info (for entity-type investors)
  display_name: z.string().max(200).optional().nullable(),
  legal_name: z.string().max(200).optional().nullable(),
  country_of_incorporation: z.string().optional().nullable(),

  // Personal Info (for individual investors)
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),

  // Residential Address (for individuals)
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),

  // Registered Address (for entities) - from EntityAddressEditDialog
  address_line_1: z.string().max(200).optional().nullable(),
  address_line_2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state_province: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().optional().nullable(),

  // Contact info
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),

  // US Tax compliance (FATCA)
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // ID Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other_government_id', 'other']).optional().nullable().or(z.literal('')),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // Proof of Address
  middle_initial: z.string().max(5).optional().nullable(),
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),

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

    const { link: investorLink, error: linksError } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id'
    )

    if (linksError || !investorLink?.investor_id) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLink.investor_id

    // Fetch investor to determine type (entity vs individual)
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('type')
      .eq('id', investorId)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    const isEntity = investor.type !== 'individual'

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
      // Entity Info
      'display_name',
      'legal_name',
      'country_of_incorporation',
      // Personal Info
      'first_name',
      'middle_name',
      'last_name',
      'name_suffix',
      'date_of_birth',
      'country_of_birth',
      'nationality',
      // Residential Address (for individuals - direct mapping)
      'residential_street',
      'residential_line_2',
      'residential_city',
      'residential_state',
      'residential_postal_code',
      'residential_country',
      // Contact
      'email',
      'phone',
      'phone_mobile',
      'phone_office',
      'website',
      // US Tax compliance
      'is_us_citizen',
      'is_us_taxpayer',
      'us_taxpayer_id',
      'tax_id_number',
      // ID Document
      'id_type',
      'id_number',
      'id_issue_date',
      'id_expiry_date',
      'id_issuing_country',
      // Proof of Address
      'middle_initial',
      'proof_of_address_date',
      'proof_of_address_expiry',
      // Representative
      'representative_name',
      'representative_title',
    ]

    for (const field of validFields) {
      if (parsed.data[field as keyof typeof parsed.data] !== undefined) {
        updateData[field] = parsed.data[field as keyof typeof parsed.data]
      }
    }

    // Map form field → DB column (country_of_tax_residency → tax_residency)
    if (parsed.data.country_of_tax_residency !== undefined) {
      updateData.tax_residency = parsed.data.country_of_tax_residency
    }

    // Handle address fields from EntityAddressEditDialog
    // These need to be mapped to correct DB columns based on investor type
    const dialogAddressFields = {
      address_line_1: parsed.data.address_line_1,
      address_line_2: parsed.data.address_line_2,
      city: parsed.data.city,
      state_province: parsed.data.state_province,
      postal_code: parsed.data.postal_code,
      country: parsed.data.country,
    }

    // Check if any address fields were provided
    const hasAddressFields = Object.values(dialogAddressFields).some(v => v !== undefined)

    if (hasAddressFields) {
      if (isEntity) {
        // Map to registered_* columns for entities
        if (dialogAddressFields.address_line_1 !== undefined) {
          updateData.registered_address_line_1 = dialogAddressFields.address_line_1
        }
        if (dialogAddressFields.address_line_2 !== undefined) {
          updateData.registered_address_line_2 = dialogAddressFields.address_line_2
        }
        if (dialogAddressFields.city !== undefined) {
          updateData.registered_city = dialogAddressFields.city
        }
        if (dialogAddressFields.state_province !== undefined) {
          updateData.registered_state = dialogAddressFields.state_province
        }
        if (dialogAddressFields.postal_code !== undefined) {
          updateData.registered_postal_code = dialogAddressFields.postal_code
        }
        if (dialogAddressFields.country !== undefined) {
          updateData.registered_country = dialogAddressFields.country
        }
      } else {
        // Map to residential_* columns for individuals
        if (dialogAddressFields.address_line_1 !== undefined) {
          updateData.residential_street = dialogAddressFields.address_line_1
        }
        if (dialogAddressFields.address_line_2 !== undefined) {
          updateData.residential_line_2 = dialogAddressFields.address_line_2
        }
        if (dialogAddressFields.city !== undefined) {
          updateData.residential_city = dialogAddressFields.city
        }
        if (dialogAddressFields.state_province !== undefined) {
          updateData.residential_state = dialogAddressFields.state_province
        }
        if (dialogAddressFields.postal_code !== undefined) {
          updateData.residential_postal_code = dialogAddressFields.postal_code
        }
        if (dialogAddressFields.country !== undefined) {
          updateData.residential_country = dialogAddressFields.country
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Convert empty strings to null for date columns (Postgres rejects "" for date type)
    const dateFields = ['date_of_birth', 'id_issue_date', 'id_expiry_date', 'proof_of_address_date', 'proof_of_address_expiry']
    for (const field of dateFields) {
      if (field in updateData && updateData[field] === '') {
        updateData[field] = null
      }
    }

    // Normalize legacy/empty id_type values.
    if (updateData.id_type === '') {
      updateData.id_type = null
    } else if (updateData.id_type === 'other') {
      updateData.id_type = 'other_government_id'
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
      return NextResponse.json({ error: 'Failed to update your profile' }, { status: 500 })
    }

    return NextResponse.json({ investor: updatedInvestor })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/investors/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
