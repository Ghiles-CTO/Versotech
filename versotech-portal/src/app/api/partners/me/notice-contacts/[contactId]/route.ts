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
 * PATCH /api/partners/me/notice-contacts/[contactId]
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

    const { data: partnerLinks } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .limit(1)

    if (!partnerLinks || partnerLinks.length === 0) {
      return NextResponse.json({ error: 'No partner profile found' }, { status: 404 })
    }

    const partnerId = partnerLinks[0].partner_id

    const { data: existingContact } = await serviceSupabase
      .from('entity_notice_contacts')
      .select('id')
      .eq('id', contactId)
      .eq('partner_id', partnerId)
      .single()

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateNoticeContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
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

    const { data: updatedContact, error: updateError } = await serviceSupabase
      .from('entity_notice_contacts')
      .update(updatePayload)
      .eq('id', contactId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update notice contact' }, { status: 500 })
    }

    return NextResponse.json({ contact: updatedContact })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/partners/me/notice-contacts/[contactId]
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

    const { data: partnerLinks } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .limit(1)

    if (!partnerLinks || partnerLinks.length === 0) {
      return NextResponse.json({ error: 'No partner profile found' }, { status: 404 })
    }

    const partnerId = partnerLinks[0].partner_id

    const { error: deleteError } = await serviceSupabase
      .from('entity_notice_contacts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', contactId)
      .eq('partner_id', partnerId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete notice contact' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
