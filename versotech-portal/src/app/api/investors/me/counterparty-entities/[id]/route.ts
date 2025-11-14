import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * PATCH /api/investors/me/counterparty-entities/[id]
 * Update a counterparty entity
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: entityId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify entity belongs to user's investor
    const { data: entity, error: entityError } = await serviceSupabase
      .from('investor_counterparty')
      .select('investor_id')
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Check user has access to this investor
    const { data: link, error: linkError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .eq('investor_id', entity.investor_id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse and validate request body
    const entitySchema = z.object({
      entity_type: z.enum(['trust', 'llc', 'partnership', 'family_office', 'law_firm', 'investment_bank', 'fund', 'corporation', 'other']).optional(),
      legal_name: z.string().min(1).optional(),
      registration_number: z.string().optional().nullable(),
      jurisdiction: z.string().optional().nullable(),
      tax_id: z.string().optional().nullable(),
      formation_date: z.string().optional().nullable(),
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
      is_active: z.boolean().optional(),
    })

    const body = await request.json()
    const parsed = entitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Update entity
    const { data: updatedEntity, error: updateError } = await serviceSupabase
      .from('investor_counterparty')
      .update(parsed.data)
      .eq('id', entityId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating counterparty entity:', updateError)
      return NextResponse.json(
        { error: 'Failed to update counterparty entity' },
        { status: 500 }
      )
    }

    return NextResponse.json({ entity: updatedEntity })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/investors/me/counterparty-entities/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/investors/me/counterparty-entities/[id]
 * Soft delete (set is_active = false) a counterparty entity
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: entityId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify entity belongs to user's investor
    const { data: entity, error: entityError } = await serviceSupabase
      .from('investor_counterparty')
      .select('investor_id')
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Check user has access to this investor
    const { data: link, error: linkError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .eq('investor_id', entity.investor_id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Soft delete by setting is_active = false
    const { error: deleteError } = await serviceSupabase
      .from('investor_counterparty')
      .update({ is_active: false })
      .eq('id', entityId)

    if (deleteError) {
      console.error('Error deleting counterparty entity:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete counterparty entity' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/investors/me/counterparty-entities/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
