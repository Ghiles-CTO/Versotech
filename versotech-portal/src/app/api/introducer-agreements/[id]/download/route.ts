import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()
    const { data: agreement, error: agreementError } = await serviceSupabase
      .from('introducer_agreements')
      .select('id, pdf_url, signed_pdf_url')
      .eq('id', id)
      .single()

    if (agreementError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    const fileKey = agreement.signed_pdf_url || agreement.pdf_url
    if (!fileKey) {
      return NextResponse.json({ error: 'Agreement PDF not available' }, { status: 404 })
    }

    const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
      .from('deal-documents')
      .createSignedUrl(fileKey, 3600)

    if (signedUrlError || !signedUrlData) {
      return NextResponse.json(
        { error: signedUrlError?.message || 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    const fileName = fileKey.split('/').pop() || 'Introducer Agreement.pdf'

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
      fileName,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Introducer agreement download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
