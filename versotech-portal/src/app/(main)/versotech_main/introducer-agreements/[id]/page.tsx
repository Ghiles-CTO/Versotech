import { cookies } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { AgreementDetailClient } from './agreement-detail-client'
import { readActivePersonaCookieValues } from '@/lib/kyc/active-introducer-link'

type ViewerRole = 'staff' | 'introducer' | 'arranger'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AgreementDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

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

  const cookieStore = await cookies()
  const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(cookieStore)

  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id,
  })

  const isStaff = personas?.some((persona: any) => persona.persona_type === 'staff')

  const allowIntroducerContext =
    !cookiePersonaType ||
    cookiePersonaType === 'staff' ||
    (cookiePersonaType === 'introducer' && (!cookiePersonaId || cookiePersonaId === agreement.introducer_id))

  const allowArrangerContext =
    !cookiePersonaType ||
    cookiePersonaType === 'staff' ||
    (cookiePersonaType === 'arranger' &&
      !!agreement.arranger_id &&
      (!cookiePersonaId || cookiePersonaId === agreement.arranger_id))

  const [{ data: introducerLink }, { data: arrangerLink }] = await Promise.all([
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

  let viewerRole: ViewerRole | null = null

  if (cookiePersonaType === 'introducer' && introducerLink) {
    viewerRole = 'introducer'
  } else if (cookiePersonaType === 'arranger' && arrangerLink) {
    viewerRole = 'arranger'
  } else if (isStaff) {
    viewerRole = 'staff'
  } else if (introducerLink) {
    viewerRole = 'introducer'
  } else if (arrangerLink) {
    viewerRole = 'arranger'
  }

  if (!viewerRole) {
    notFound()
  }

  return (
    <AgreementDetailClient
      agreement={agreement}
      viewerRole={viewerRole}
      currentUserId={user.id}
    />
  )
}
