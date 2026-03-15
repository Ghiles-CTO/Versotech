import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SignatureStorageManager } from '@/lib/signature/storage'
import { readActivePersonaCookieValues } from '@/lib/kyc/active-introducer-link'

export async function GET(
  request: NextRequest,
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
    const serviceSupabase = createServiceClient()
    const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(request.cookies)
    const { data: agreement, error: agreementError } = await serviceSupabase
      .from('introducer_agreements')
      .select('id, introducer_id, arranger_id, pdf_url, signed_pdf_url')
      .eq('id', id)
      .single()

    if (agreementError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (!isStaff) {
      const allowIntroducerContext =
        !cookiePersonaType ||
        (cookiePersonaType === 'introducer' &&
          (!cookiePersonaId || cookiePersonaId === agreement.introducer_id))

      const allowArrangerContext =
        !cookiePersonaType ||
        (cookiePersonaType === 'arranger' &&
          !!agreement.arranger_id &&
          (!cookiePersonaId || cookiePersonaId === agreement.arranger_id))

      const [{ data: introducerUser }, { data: arrangerUser }] = await Promise.all([
        allowIntroducerContext
          ? serviceSupabase
              .from('introducer_users')
              .select('introducer_id')
              .eq('user_id', user.id)
              .eq('introducer_id', agreement.introducer_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        allowArrangerContext && agreement.arranger_id
          ? serviceSupabase
              .from('arranger_users')
              .select('arranger_id')
              .eq('user_id', user.id)
              .eq('arranger_id', agreement.arranger_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ])

      if (!introducerUser && !arrangerUser) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const fileKey = agreement.signed_pdf_url || agreement.pdf_url
    if (!fileKey) {
      return NextResponse.json({ error: 'Agreement PDF not available' }, { status: 404 })
    }

    const storageManager = new SignatureStorageManager(serviceSupabase)

    let signedUrl: string
    try {
      signedUrl = await storageManager.getSignedUrl(fileKey, 3600)
    } catch (signedUrlError) {
      return NextResponse.json(
        { error: signedUrlError instanceof Error ? signedUrlError.message : 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    const fileName = fileKey.split('/').pop() || 'Introducer Agreement.pdf'

    return NextResponse.json({
      success: true,
      url: signedUrl,
      fileName,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Introducer agreement download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
