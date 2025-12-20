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
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
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
  // Residential Address
  residential_street: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),
  // Phone numbers
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),
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
      'residential_street',
      'residential_city',
      'residential_state',
      'residential_postal_code',
      'residential_country',
      'phone_mobile',
      'phone_office',
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
