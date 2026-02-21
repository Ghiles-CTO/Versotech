/**
 * Lawyer Profile API (Self-Service)
 * GET /api/lawyers/me/profile - Get lawyer's own profile
 * PATCH /api/lawyers/me/profile - Update editable profile fields
 * PUT /api/lawyers/me/profile - Upload logo (multipart form)
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for lawyer self-service profile updates
// Note: KYC status, is_active, and firm_name are admin-managed (read-only for lawyers)
const profileUpdateSchema = z.object({
  // Display fields
  display_name: z.string().min(1).max(255).optional(),
  primary_contact_name: z.string().min(1).max(255).optional(),
  primary_contact_email: z.string().email().max(255).optional().nullable(),
  primary_contact_phone: z.string().max(50).optional().nullable(),

  // Address fields
  address_line_1: z.string().max(255).optional().nullable(),
  address_line_2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state_province: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(2).optional().nullable(),

  // Phone numbers
  phone: z.string().max(30).optional().nullable(),
  phone_mobile: z.string().max(30).optional().nullable(),
  phone_office: z.string().max(30).optional().nullable(),
  website: z.string().url().max(255).optional().nullable().or(z.literal('')),

  // Entity info
  registration_number: z.string().max(100).optional().nullable(),
  country_of_incorporation: z.string().max(2).optional().nullable(),
  tax_id: z.string().max(50).optional().nullable(),

  // Entity type
  type: z.enum(['individual', 'entity']).optional(),

  // Individual KYC fields (for type='individual')
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  middle_initial: z.string().max(5).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().max(2).optional().nullable(),
  nationality: z.string().max(2).optional().nullable(),

  // US Tax compliance
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().max(2).optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // ID Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit']).optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().max(2).optional().nullable(),

  // Proof of Address
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),

  // Residential Address (for individuals)
  residential_street: z.string().max(255).optional().nullable(),
  residential_line_2: z.string().max(255).optional().nullable(),
  residential_city: z.string().max(100).optional().nullable(),
  residential_state: z.string().max(100).optional().nullable(),
  residential_postal_code: z.string().max(20).optional().nullable(),
  residential_country: z.string().max(2).optional().nullable(),
})

/**
 * GET /api/lawyers/me/profile
 * Returns the current lawyer's profile including entity details
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find lawyer entity for current user via lawyer_users bridge table
    const { data: lawyerUser, error: lawyerUserError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, role, is_primary, can_sign')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerUserError || !lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'Lawyer profile not found' }, { status: 404 })
    }

    // Get lawyer entity details
    const { data: lawyer, error: lawyerError } = await serviceSupabase
      .from('lawyers')
      .select('*')
      .eq('id', lawyerUser.lawyer_id)
      .single()

    if (lawyerError || !lawyer) {
      return NextResponse.json({ error: 'Lawyer entity not found' }, { status: 404 })
    }

    // Get user profile info
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    // Get assigned deals count
    const { count: assignedDealsCount } = await serviceSupabase
      .from('deal_lawyer_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('lawyer_id', lawyerUser.lawyer_id)
      .eq('status', 'active')

    return NextResponse.json({
      lawyer,
      lawyerUser: {
        role: lawyerUser.role,
        is_primary: lawyerUser.is_primary,
        can_sign: lawyerUser.can_sign || false,
      },
      profile,
      stats: {
        assignedDealsCount: assignedDealsCount || 0,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/lawyers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/lawyers/me/profile
 * Update profile fields - self-service for lawyers
 * Note: KYC status, is_active, and firm_name are NOT updateable (admin-managed)
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find lawyer entity for current user
    const { data: lawyerUser, error: lawyerUserError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerUserError || !lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'Lawyer profile not found' }, { status: 404 })
    }

    // Admins and primary contacts can update entity profile details
    if (lawyerUser.role !== 'admin' && !lawyerUser.is_primary) {
      return NextResponse.json(
        { error: 'Only admin or primary users can update the lawyer profile' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = profileUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // Filter out empty/undefined values and build update object
    const updateFields: Record<string, string | boolean | null> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        // Convert empty strings to null for optional string fields
        if (typeof value === 'string') {
          updateFields[key] = value === '' ? null : value
        } else {
          updateFields[key] = value
        }
      }
    }

    // Check there's something to update
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Update the lawyer entity
    const { data: updatedLawyer, error: updateError } = await serviceSupabase
      .from('lawyers')
      .update(updateFields)
      .eq('id', lawyerUser.lawyer_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating lawyer profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      lawyer: updatedLawyer,
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/lawyers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const BUCKET = 'public-assets'
const LOGO_FOLDER = 'lawyer-logos'

/**
 * PUT /api/lawyers/me/profile
 * Upload logo - multipart form data
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find lawyer entity for current user
    const { data: lawyerUser, error: lawyerUserError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerUserError || !lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'Lawyer profile not found' }, { status: 404 })
    }

    // Only admin users can upload logo
    if (lawyerUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin users can upload the firm logo' },
        { status: 403 }
      )
    }

    const lawyerId = lawyerUser.lawyer_id

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadType = formData.get('type') as string | null

    if (!file || uploadType !== 'logo') {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WEBP' }, { status: 400 })
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
    }

    // Generate filename: lawyer-logos/{lawyerId}/logo.{ext}
    const fileExt = file.type.split('/')[1]
    const filePath = `${LOGO_FOLDER}/${lawyerId}/logo.${fileExt}`

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Delete old logo if exists
    const { data: existingFiles } = await serviceSupabase
      .storage
      .from(BUCKET)
      .list(`${LOGO_FOLDER}/${lawyerId}`)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${LOGO_FOLDER}/${lawyerId}/${f.name}`)
      await serviceSupabase.storage.from(BUCKET).remove(filesToDelete)
    }

    // Upload new logo
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

    // Get public URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    // Update lawyer record with new logo URL
    const { data: updatedLawyer, error: updateError } = await serviceSupabase
      .from('lawyers')
      .update({ logo_url: publicUrl })
      .eq('id', lawyerId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating lawyer logo URL:', updateError)
      // Try to clean up uploaded file
      await serviceSupabase.storage.from(BUCKET).remove([filePath])
      return NextResponse.json({ error: 'Failed to save logo URL' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logo_url: publicUrl,
      lawyer: updatedLawyer,
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/lawyers/me/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
