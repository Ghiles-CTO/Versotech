import { NextResponse } from 'next/server'
import { createSmartClient } from '@/lib/supabase/smart-client'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { z } from 'zod'

const updateEntitySchema = z.object({
  legal_jurisdiction: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSmartClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    const { id } = await params

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { data: entity, error: entityError } = await supabase
      .from('vehicles')
      .select(`
        id,
        name,
        type,
        domicile,
        currency,
        formation_date,
        legal_jurisdiction,
        registration_number,
        notes,
        created_at
      `)
      .eq('id', id)
      .single()

    if (entityError || !entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    const { data: directors } = await supabase
      .from('entity_directors')
      .select('id, full_name, role, email, effective_from, effective_to, notes, created_at')
      .eq('vehicle_id', id)
      .order('effective_from', { ascending: false })

    const { data: latestEvent } = await supabase
      .from('entity_events')
      .select('id, event_type, description, created_at')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: deals } = await supabase
      .from('deals')
      .select('id, name, status, deal_type, created_at')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      entity,
      directors: directors || [],
      latest_event: latestEvent,
      deals: deals || []
    })

  } catch (error) {
    console.error('Entity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSmartClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    const { id } = await params

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateEntitySchema.parse(body)

    const { data: entity, error: updateError } = await supabase
      .from('vehicles')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !entity) {
      return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 })
    }

    // Log the change as an entity event
    await supabase
      .from('entity_events')
      .insert({
        vehicle_id: id,
        event_type: 'metadata_update',
        description: 'Entity metadata updated',
        changed_by: user.id.startsWith('demo-') ? null : user.id,
        payload: validatedData
      })

    return NextResponse.json({ entity })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Entity update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}