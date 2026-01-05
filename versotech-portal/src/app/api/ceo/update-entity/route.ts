/**
 * CEO Entity Update API
 * PUT /api/ceo/update-entity - Update Verso Capital entity information
 *
 * Only CEO admins can update the entity
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const entityUpdateSchema = z.object({
  // Entity identity
  legal_name: z.string().min(1).max(255).optional(),
  display_name: z.string().max(255).optional().nullable(),
  registration_number: z.string().max(100).optional().nullable(),
  tax_id: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  // Contact fields
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  registered_address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
})

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a CEO admin
    const { data: ceoUser, error: ceoUserError } = await serviceSupabase
      .from('ceo_users')
      .select('user_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (ceoUserError || !ceoUser) {
      return NextResponse.json({ error: 'Access denied. CEO membership required.' }, { status: 403 })
    }

    if (ceoUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin role required to update entity' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = entityUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // Filter out undefined values and build update object
    const updateFields: Record<string, string | null> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        updateFields[key] = value === '' ? null : value
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Add audit fields
    updateFields.updated_by = user.id

    // Get the CEO entity ID (there's only one)
    const { data: ceoEntity, error: entityError } = await serviceSupabase
      .from('ceo_entity')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (entityError || !ceoEntity) {
      return NextResponse.json({ error: 'CEO entity not found' }, { status: 404 })
    }

    // Update the CEO entity
    const { data: updatedEntity, error: updateError } = await serviceSupabase
      .from('ceo_entity')
      .update(updateFields)
      .eq('id', ceoEntity.id)
      .select()
      .single()

    if (updateError) {
      console.error('[ceo/update-entity] Error updating CEO entity:', updateError)
      return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Entity updated successfully',
      entity: updatedEntity,
    })
  } catch (error) {
    console.error('[ceo/update-entity] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
