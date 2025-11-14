import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * GET /api/investors/me/counterparty-entities
 * Fetch all counterparty entities for the current investor
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
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

    // Fetch counterparty entities for these investors
    const { data: entities, error: entitiesError } = await serviceSupabase
      .from('investor_counterparty')
      .select('*')
      .in('investor_id', investorIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (entitiesError) {
      console.error('Error fetching counterparty entities:', entitiesError)
      return NextResponse.json(
        { error: 'Failed to fetch counterparty entities' },
        { status: 500 }
      )
    }

    return NextResponse.json({ entities: entities || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/counterparty-entities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/investors/me/counterparty-entities
 * Create a new counterparty entity for the current investor
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
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

    // Parse and validate request body
    const entitySchema = z.object({
      entity_type: z.enum(['trust', 'llc', 'partnership', 'family_office', 'law_firm', 'investment_bank', 'fund', 'corporation', 'other']),
      legal_name: z.string().min(1, 'Legal name is required'),
      registration_number: z.string().optional().nullable(),
      jurisdiction: z.string().optional().nullable(),
      tax_id: z.string().optional().nullable(),
      formation_date: z.string().optional().nullable(), // ISO date string
      registered_address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().optional(),
      }).optional().nullable(),
      representative_name: z.string().optional().nullable(),
      representative_title: z.string().optional().nullable(),
      representative_email: z.string().email().optional().nullable(),
      representative_phone: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })

    const body = await request.json()
    const parsed = entitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const entityData = parsed.data

    // Create new counterparty entity
    const { data: newEntity, error: insertError } = await serviceSupabase
      .from('investor_counterparty')
      .insert({
        investor_id: investorId,
        entity_type: entityData.entity_type,
        legal_name: entityData.legal_name,
        registration_number: entityData.registration_number,
        jurisdiction: entityData.jurisdiction,
        tax_id: entityData.tax_id,
        formation_date: entityData.formation_date,
        registered_address: entityData.registered_address,
        representative_name: entityData.representative_name,
        representative_title: entityData.representative_title,
        representative_email: entityData.representative_email,
        representative_phone: entityData.representative_phone,
        notes: entityData.notes,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating counterparty entity:', insertError)
      return NextResponse.json(
        { error: 'Failed to create counterparty entity' },
        { status: 500 }
      )
    }

    return NextResponse.json({ entity: newEntity }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/counterparty-entities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
