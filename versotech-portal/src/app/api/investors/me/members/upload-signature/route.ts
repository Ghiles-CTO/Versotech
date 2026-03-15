import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { resolveActiveInvestorLinkFromCookies } from '@/lib/kyc/active-investor-link'

/**
 * POST /api/investors/me/members/upload-signature
 * Upload a signature specimen image for an investor member
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { link: investorLink, error: investorLinkError } = await resolveActiveInvestorLinkFromCookies<{
      investor_id: string
    }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookieStore: request.cookies,
      select: 'investor_id',
    })

    if (investorLinkError || !investorLink?.investor_id) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }
    const investorId = investorLink.investor_id

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'png'
    const fileName = `signature_${timestamp}.${extension}`
    const storagePath = `${investorId}/signatures/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('investor-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = serviceSupabase.storage
      .from('investor-documents')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: storagePath,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
