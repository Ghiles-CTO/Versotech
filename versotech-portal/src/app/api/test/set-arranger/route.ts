import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

/**
 * GET /api/test/set-arranger
 * List all arranger entities for E2E testing
 */
export async function GET(request: Request) {
  try {
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

    // Get all arranger entities
    const { data: arrangers, error } = await supabase
      .from('arranger_entities')
      .select('id, legal_name, email, status')
      .order('legal_name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      arranger_entities: arrangers,
      count: arrangers?.length || 0
    })
  } catch (error) {
    console.error('Test set-arranger GET error:', error)
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 500 })
  }
}

/**
 * POST /api/test/set-arranger
 * Set the arranger entity on a deal for E2E testing
 */
export async function POST(request: Request) {
  try {
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const { deal_id, arranger_entity_id } = body

    if (!deal_id) {
      return NextResponse.json({ error: 'deal_id required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // If no arranger_entity_id provided, use the first one (VERSO Management Ltd)
    let entityId = arranger_entity_id
    if (!entityId) {
      const { data: firstArranger } = await supabase
        .from('arranger_entities')
        .select('id, legal_name')
        .limit(1)
        .single()

      if (!firstArranger) {
        return NextResponse.json({ error: 'No arranger entities found' }, { status: 404 })
      }
      entityId = firstArranger.id
      console.log('Using default arranger:', firstArranger.legal_name, entityId)
    }

    // Update the deal
    const { data: deal, error: updateError } = await supabase
      .from('deals')
      .update({ arranger_entity_id: entityId })
      .eq('id', deal_id)
      .select('id, name, arranger_entity_id')
      .single()

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to update deal',
        details: updateError.message
      }, { status: 500 })
    }

    // Get arranger entity name for confirmation
    const { data: arranger } = await supabase
      .from('arranger_entities')
      .select('legal_name')
      .eq('id', entityId)
      .single()

    return NextResponse.json({
      message: 'Arranger entity set on deal',
      deal_id: deal.id,
      deal_name: deal.name,
      arranger_entity_id: entityId,
      arranger_name: arranger?.legal_name
    })
  } catch (error) {
    console.error('Test set-arranger POST error:', error)
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 500 })
  }
}
