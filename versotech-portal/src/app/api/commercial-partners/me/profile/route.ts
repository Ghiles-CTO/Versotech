/**
 * Commercial Partner Profile API (Self-Service)
 * GET /api/commercial-partners/me/profile - Get commercial partner's own profile
 * PATCH /api/commercial-partners/me/profile - Update editable profile fields
 * PUT /api/commercial-partners/me/profile - Upload logo (multipart form)
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  // Identity / entity fields
  entity_id: z.string().uuid().optional(),
  type: z.enum(['individual', 'entity']).optional(),
  name: z.string().max(255).optional().nullable(),
  legal_name: z.string().max(255).optional().nullable(),
  cp_type: z.string().max(100).optional().nullable(),

  // Contact fields
  contact_name: z.string().max(255).optional().nullable(),
  contact_email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  contact_phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  phone_mobile: z.string().max(30).optional().nullable(),
  phone_office: z.string().max(30).optional().nullable(),
  website: z.string().url().max(255).optional().nullable().or(z.literal('')),

  // Address fields
  address_line_1: z.string().max(255).optional().nullable(),
  address_line_2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state_province: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(2).optional().nullable(),

  // Regulatory fields
  regulatory_status: z.string().max(100).optional().nullable(),
  regulatory_number: z.string().max(100).optional().nullable(),
  jurisdiction: z.string().max(100).optional().nullable(),
  payment_terms: z.string().max(100).optional().nullable(),
  contract_start_date: z.string().optional().nullable(),
  contract_end_date: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),

  // Individual KYC fields
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  middle_initial: z.string().max(5).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().max(2).optional().nullable(),
  nationality: z.string().max(2).optional().nullable(),

  // US tax / residency
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(50).optional().nullable(),
  country_of_tax_residency: z.string().max(2).optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // ID document fields
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other']).optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().max(2).optional().nullable(),

  // Residential address (individuals)
  residential_street: z.string().max(255).optional().nullable(),
  residential_line_2: z.string().max(255).optional().nullable(),
  residential_city: z.string().max(100).optional().nullable(),
  residential_state: z.string().max(100).optional().nullable(),
  residential_postal_code: z.string().max(20).optional().nullable(),
  residential_country: z.string().max(2).optional().nullable(),

  // Additional KYC
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),
})

/**
 * GET /api/commercial-partners/me/profile
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cpUser, error: cpUserError } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id, role, is_primary, can_sign, can_execute_for_clients')
      .eq('user_id', user.id)
      .maybeSingle()

    if (cpUserError || !cpUser?.commercial_partner_id) {
      return NextResponse.json({ error: 'Commercial partner profile not found' }, { status: 404 })
    }

    const { data: commercialPartner, error: cpError } = await serviceSupabase
      .from('commercial_partners')
      .select('*')
      .eq('id', cpUser.commercial_partner_id)
      .single()

    if (cpError || !commercialPartner) {
      return NextResponse.json({ error: 'Commercial partner entity not found' }, { status: 404 })
    }

    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({
      commercialPartner,
      commercialPartnerUser: {
        role: cpUser.role,
        is_primary: cpUser.is_primary,
        can_sign: cpUser.can_sign || false,
        can_execute_for_clients: cpUser.can_execute_for_clients || false,
      },
      profile,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commercial-partners/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/commercial-partners/me/profile
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cpUser, error: cpUserError } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (cpUserError || !cpUser?.commercial_partner_id) {
      return NextResponse.json({ error: 'Commercial partner profile not found' }, { status: 404 })
    }

    if (cpUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin users can update the commercial partner profile' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = profileUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data
    const updateFields: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'entity_id') continue
      if (value === undefined) continue
      if (typeof value === 'string') {
        updateFields[key] = value === '' ? null : value
      } else {
        updateFields[key] = value
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: updatedCommercialPartner, error: updateError } = await serviceSupabase
      .from('commercial_partners')
      .update(updateFields)
      .eq('id', cpUser.commercial_partner_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating commercial partner profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      commercialPartner: updatedCommercialPartner,
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/commercial-partners/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const BUCKET = 'public-assets'
const LOGO_FOLDER = 'commercial-partner-logos'

/**
 * PUT /api/commercial-partners/me/profile
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cpUser, error: cpUserError } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (cpUserError || !cpUser?.commercial_partner_id) {
      return NextResponse.json({ error: 'Commercial partner profile not found' }, { status: 404 })
    }

    if (cpUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin users can upload the commercial partner logo' },
        { status: 403 }
      )
    }

    const cpId = cpUser.commercial_partner_id
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadType = formData.get('type') as string | null

    if (!file || uploadType !== 'logo') {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WEBP' }, { status: 400 })
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
    }

    const fileExt = file.type.split('/')[1]
    const filePath = `${LOGO_FOLDER}/${cpId}/logo.${fileExt}`
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const { data: existingFiles } = await serviceSupabase.storage
      .from(BUCKET)
      .list(`${LOGO_FOLDER}/${cpId}`)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(fileMeta => `${LOGO_FOLDER}/${cpId}/${fileMeta.name}`)
      await serviceSupabase.storage.from(BUCKET).remove(filesToDelete)
    }

    const { error: uploadError } = await serviceSupabase.storage
      .from(BUCKET)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Logo upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
    }

    const { data: { publicUrl } } = serviceSupabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    const { data: updatedCommercialPartner, error: updateError } = await serviceSupabase
      .from('commercial_partners')
      .update({ logo_url: publicUrl })
      .eq('id', cpId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating commercial partner logo URL:', updateError)
      await serviceSupabase.storage.from(BUCKET).remove([filePath])
      return NextResponse.json({ error: 'Failed to save logo URL' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logo_url: publicUrl,
      commercialPartner: updatedCommercialPartner,
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/commercial-partners/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
