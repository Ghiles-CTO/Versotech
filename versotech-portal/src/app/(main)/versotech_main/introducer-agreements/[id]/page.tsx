import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { AgreementDetailClient } from './agreement-detail-client'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AgreementDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch agreement with introducer details
  const { data: agreement, error } = await supabase
    .from('introducer_agreements')
    .select(`
      *,
      introducer:introducer_id (
        id,
        legal_name,
        contact_name,
        email,
        phone,
        status,
        logo_url
      ),
      ceo_signature_request:ceo_signature_request_id (
        id,
        status,
        signer_name,
        signer_email,
        signature_timestamp,
        signed_pdf_path
      ),
      introducer_signature_request:introducer_signature_request_id (
        id,
        status,
        signer_name,
        signer_email,
        signature_timestamp,
        signed_pdf_path
      )
    `)
    .eq('id', id)
    .single()

  if (error || !agreement) {
    notFound()
  }

  // Check if user has access (is staff or the introducer)
  const role = user.user_metadata?.role || user.role
  const isStaff = role?.startsWith('staff_')

  if (!isStaff) {
    // Check if user is linked to this introducer
    const { data: introducerUser } = await supabase
      .from('introducer_users')
      .select('introducer_id')
      .eq('user_id', user.id)
      .single()

    if (!introducerUser || introducerUser.introducer_id !== agreement.introducer_id) {
      notFound()
    }
  }

  return (
    <AgreementDetailClient
      agreement={agreement}
      isStaff={isStaff}
      currentUserId={user.id}
    />
  )
}
