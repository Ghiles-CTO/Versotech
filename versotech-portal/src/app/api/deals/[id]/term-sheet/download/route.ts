import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient()

  // Get user profile to check role
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'

  // If not staff, verify investor has access to this deal
  if (!isStaff) {
    // Check if user is a member of this deal (via deal_memberships)
    const { data: membership } = await serviceSupabase
      .from('deal_memberships')
      .select('user_id')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied to this deal' }, { status: 403 })
    }
  }

  // Get the published term sheet for this deal
  const { data: termSheet, error: fetchError } = await serviceSupabase
    .from('deal_fee_structures')
    .select('term_sheet_attachment_key, status')
    .eq('deal_id', dealId)
    .eq('status', 'published')
    .single()

  if (fetchError || !termSheet) {
    // Fallback to any term sheet if no published one
    const { data: anyTermSheet } = await serviceSupabase
      .from('deal_fee_structures')
      .select('term_sheet_attachment_key, status')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!anyTermSheet?.term_sheet_attachment_key) {
      return NextResponse.json({ error: 'No term sheet attachment found' }, { status: 404 })
    }

    // Generate signed URL for the attachment
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'
    const { data: signedUrlData, error: urlError } = await serviceSupabase.storage
      .from(bucket)
      .createSignedUrl(anyTermSheet.term_sheet_attachment_key, 3600) // 1 hour expiry

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('Failed to generate signed URL', urlError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    return NextResponse.json({ download_url: signedUrlData.signedUrl })
  }

  if (!termSheet.term_sheet_attachment_key) {
    return NextResponse.json({ error: 'No term sheet attachment found' }, { status: 404 })
  }

  // Generate signed URL for the attachment
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'
  const { data: signedUrlData, error: urlError } = await serviceSupabase.storage
    .from(bucket)
    .createSignedUrl(termSheet.term_sheet_attachment_key, 3600) // 1 hour expiry

  if (urlError || !signedUrlData?.signedUrl) {
    console.error('Failed to generate signed URL', urlError)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  return NextResponse.json({ download_url: signedUrlData.signedUrl })
}
