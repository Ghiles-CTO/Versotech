import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const noticeContactSchema = z.object({
  contact_type: z.enum(['legal', 'tax', 'compliance', 'accounting', 'general', 'other']),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_title: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
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
 * GET /api/arrangers/me/notice-contacts
 * Fetch all notice contacts for the current arranger entity
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger entity ID for this user
    const { data: arrangerLinks, error: linksError } = await serviceSupabase
      .from('arranger_entity_users')
      .select('arranger_entity_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !arrangerLinks || arrangerLinks.length === 0) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
    }

    const arrangerEntityId = arrangerLinks[0].arranger_entity_id

    // Get notice contacts for this arranger
    const { data: contacts, error: contactsError } = await serviceSupabase
      .from('entity_notice_contacts')
      .select('*')
      .eq('arranger_entity_id', arrangerEntityId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (contactsError) {
      console.error('Error fetching notice contacts:', contactsError)
      return NextResponse.json({ error: 'Failed to fetch notice contacts' }, { status: 500 })
    }

    return NextResponse.json({ contacts: contacts || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/arrangers/me/notice-contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/arrangers/me/notice-contacts
 * Add a new notice contact for the arranger entity
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger entity ID for this user
    const { data: arrangerLinks, error: linksError } = await serviceSupabase
      .from('arranger_entity_users')
      .select('arranger_entity_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !arrangerLinks || arrangerLinks.length === 0) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
    }

    const arrangerEntityId = arrangerLinks[0].arranger_entity_id

    // Parse and validate request body
    const body = await request.json()
    const parsed = noticeContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const contactData = parsed.data

    // Create new notice contact
    const { data: newContact, error: insertError } = await serviceSupabase
      .from('entity_notice_contacts')
      .insert({
        arranger_entity_id: arrangerEntityId,
        contact_type: contactData.contact_type,
        contact_name: contactData.contact_name,
        contact_title: contactData.contact_title,
        email: contactData.email || null,
        phone: contactData.phone,
        address_line_1: contactData.address_line_1,
        address_line_2: contactData.address_line_2,
        city: contactData.city,
        state_province: contactData.state_province,
        postal_code: contactData.postal_code,
        country: contactData.country,
        preferred_method: contactData.preferred_method || 'email',
        receive_copies: contactData.receive_copies ?? true,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating notice contact:', insertError)
      return NextResponse.json({ error: 'Failed to create notice contact' }, { status: 500 })
    }

    return NextResponse.json({ contact: newContact }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/arrangers/me/notice-contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
