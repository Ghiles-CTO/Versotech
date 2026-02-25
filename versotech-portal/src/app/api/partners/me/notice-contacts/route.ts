import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const noticeContactSchema = z.object({
  contact_type: z.enum(['legal', 'tax', 'compliance', 'accounting', 'general', 'other']),
  contact_name: z.string().min(1, 'Contact name is required'),
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
 * GET /api/partners/me/notice-contacts
 * Fetch all notice contacts for the current partner entity
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get partner ID for this user
    const { data: partnerLinks, error: linksError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !partnerLinks || partnerLinks.length === 0) {
      return NextResponse.json({ error: 'No partner profile found' }, { status: 404 })
    }

    const partnerId = partnerLinks[0].partner_id

    // Get notice contacts for this partner
    const { data: contacts, error: contactsError } = await serviceSupabase
      .from('entity_notice_contacts')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (contactsError) {
      console.error('Error fetching notice contacts:', contactsError)
      return NextResponse.json({ error: 'Failed to fetch notice contacts' }, { status: 500 })
    }

    const normalizedContacts = (contacts || []).map(contact => ({
      ...contact,
      address: contact.address_line_1,
      address_2: contact.address_line_2,
    }))

    return NextResponse.json({ contacts: normalizedContacts })
  } catch (error) {
    console.error('Unexpected error in GET /api/partners/me/notice-contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/partners/me/notice-contacts
 * Add a new notice contact for the partner entity
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get partner ID for this user
    const { data: partnerLinks, error: linksError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .limit(1)

    if (linksError || !partnerLinks || partnerLinks.length === 0) {
      return NextResponse.json({ error: 'No partner profile found' }, { status: 404 })
    }

    const partnerId = partnerLinks[0].partner_id

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
        partner_id: partnerId,
        contact_type: contactData.contact_type,
        contact_name: contactData.contact_name,
        contact_title: contactData.contact_title,
        email: contactData.email || null,
        phone: contactData.phone,
        address_line_1: contactData.address ?? contactData.address_line_1 ?? null,
        address_line_2: contactData.address_2 ?? contactData.address_line_2 ?? null,
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
    console.error('Unexpected error in POST /api/partners/me/notice-contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
