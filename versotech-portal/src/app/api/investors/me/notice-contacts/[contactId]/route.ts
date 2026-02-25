import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateNoticeContactSchema = z.object({
  contact_type: z.enum(['legal', 'tax', 'compliance', 'accounting', 'general', 'other']).optional(),
  contact_name: z.string().min(1).optional(),
  contact_title: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  address_2: z.string().optional().nullable(),
  address_line_1: z.string().optional().nullable(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state_province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  preferred_method: z.enum(['email', 'mail', 'both']).optional().nullable(),
  receive_copies: z.boolean().optional(),
})

/**
 * PATCH /api/investors/me/notice-contacts/[contactId]
 * Update a notice contact
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()
  const { contactId } = await params

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Verify contact belongs to this investor
    const { data: existingContact, error: fetchError } = await serviceSupabase
      .from('entity_notice_contacts')
      .select('id')
      .eq('id', contactId)
      .eq('investor_id', investorId)
      .single()

    if (fetchError || !existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = updateNoticeContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const normalizedAddressLine1 =
      parsed.data.address !== undefined ? parsed.data.address : parsed.data.address_line_1
    const normalizedAddressLine2 =
      parsed.data.address_2 !== undefined ? parsed.data.address_2 : parsed.data.address_line_2
    const updatePayload: Record<string, unknown> = {
      ...parsed.data,
      email: parsed.data.email || null,
      updated_at: new Date().toISOString(),
    }
    delete updatePayload.address
    delete updatePayload.address_2
    if (normalizedAddressLine1 !== undefined) {
      updatePayload.address_line_1 = normalizedAddressLine1 === '' ? null : normalizedAddressLine1
    }
    if (normalizedAddressLine2 !== undefined) {
      updatePayload.address_line_2 = normalizedAddressLine2 === '' ? null : normalizedAddressLine2
    }

    // Update contact
    const { data: updatedContact, error: updateError } = await serviceSupabase
      .from('entity_notice_contacts')
      .update(updatePayload)
      .eq('id', contactId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating notice contact:', updateError)
      return NextResponse.json({ error: 'Failed to update notice contact' }, { status: 500 })
    }

    return NextResponse.json({ contact: updatedContact })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/investors/me/notice-contacts/[contactId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/investors/me/notice-contacts/[contactId]
 * Soft-delete a notice contact
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()
  const { contactId } = await params

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Soft-delete the contact
    const { error: deleteError } = await serviceSupabase
      .from('entity_notice_contacts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', contactId)
      .eq('investor_id', investorId)

    if (deleteError) {
      console.error('Error deleting notice contact:', deleteError)
      return NextResponse.json({ error: 'Failed to delete notice contact' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/investors/me/notice-contacts/[contactId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
