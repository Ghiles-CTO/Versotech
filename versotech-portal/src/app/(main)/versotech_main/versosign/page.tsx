import { createClient, createServiceClient } from '@/lib/supabase/server'
import { VersoSignPageClient } from '@/app/(staff)/versotech/staff/versosign/versosign-page-client'
import { AlertCircle } from 'lucide-react'
import type { SignatureGroup, SignatureTask, ExpiredSignature } from '@/app/(staff)/versotech/staff/versosign/page'
import { IntroducerAgreementSigningSection } from './introducer-agreement-signing-section'

export const dynamic = 'force-dynamic'

type IntroducerAgreementForSigning = {
  id: string
  status: string
  default_commission_bps: number | null
  introducer: {
    id: string
    legal_name: string
    email: string | null
  }
  ceo_signature_request_id: string | null
  introducer_signature_request_id: string | null
  pdf_url: string | null
  created_at: string
}

/**
 * VersoSign Page for Unified Portal (versotech_main)
 *
 * Persona-aware signature management:
 * - Staff/CEO personas: Full access to all signature tasks
 * - Lawyers: Access to subscription pack signature tasks for their assigned deals
 * - Investors/Partners/CPs: Access to their own signature tasks (countersignatures, sub packs)
 */
export default async function VersoSignPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view VersoSign.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  // Check user personas for access level
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isStaff = personas?.some((p: any) => p.persona_type === 'staff') || false
  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false
  const isIntroducer = personas?.some((p: any) => p.persona_type === 'introducer') || false

  // Get introducer IDs if user has introducer persona
  let introducerIds: string[] = []
  if (isIntroducer) {
    const { data: introducerLinks } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id')
      .eq('user_id', user.id)
    introducerIds = introducerLinks?.map(link => link.introducer_id) || []
  }

  // Fetch introducer agreements pending signature
  let introducerAgreementsForSigning: IntroducerAgreementForSigning[] = []

  if (isStaff) {
    // CEO/Staff: See agreements approved and waiting for CEO signature
    const { data: agreementsData } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        id, status, default_commission_bps, pdf_url, created_at,
        ceo_signature_request_id, introducer_signature_request_id,
        introducer:introducer_id (id, legal_name, email)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    introducerAgreementsForSigning = (agreementsData as unknown as IntroducerAgreementForSigning[]) || []
  } else if (isIntroducer && introducerIds.length > 0) {
    // Introducer: See their agreements pending their signature
    const { data: agreementsData } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        id, status, default_commission_bps, pdf_url, created_at,
        ceo_signature_request_id, introducer_signature_request_id,
        introducer:introducer_id (id, legal_name, email)
      `)
      .in('introducer_id', introducerIds)
      .eq('status', 'pending_introducer_signature')
      .order('created_at', { ascending: false })

    introducerAgreementsForSigning = (agreementsData as unknown as IntroducerAgreementForSigning[]) || []
  }

  // Get investor IDs if user has investor persona
  let investorIds: string[] = []
  const hasInvestorAccess = personas?.some((p: any) => p.persona_type === 'investor') || false
  if (hasInvestorAccess) {
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    investorIds = investorLinks?.map(link => link.investor_id) || []
  }

  // Fetch signature tasks for this user
  // Staff see all tasks, others see only tasks assigned to them (by user_id OR investor_id)
  let tasksQuery = serviceSupabase
    .from('tasks')
    .select('*')
    .in('kind', ['countersignature', 'subscription_pack_signature', 'other'])

  // Build filter based on whether user has investor IDs
  if (investorIds.length > 0) {
    // For investors: tasks owned by user OR by their investor IDs
    tasksQuery = tasksQuery.or(
      `owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`
    )
  } else {
    // For non-investors: just tasks owned by the user directly
    tasksQuery = tasksQuery.eq('owner_user_id', user.id)
  }

  const { data: tasks } = await tasksQuery
    .order('due_at', { ascending: true, nullsFirst: false })

  // Fetch expired signature requests (staff/CEO only)
  let expiredSignatures: ExpiredSignature[] = []
  if (isStaff) {
    const { data: expiredData } = await serviceSupabase
      .from('signature_requests')
      .select(`
        id, signer_name, signer_email, document_type,
        token_expires_at, created_at, investor_id,
        investor:investors(display_name, legal_name)
      `)
      .eq('status', 'expired')
      .order('token_expires_at', { ascending: false })
      .limit(50)
    expiredSignatures = (expiredData as unknown as ExpiredSignature[]) || []
  }

  // If user has no signature tasks and no agreements to sign and is not staff/lawyer/introducer, show appropriate message
  const hasTasks = tasks && tasks.length > 0
  const hasAgreementsToSign = introducerAgreementsForSigning.length > 0
  if (!hasTasks && !hasAgreementsToSign && !isStaff && !isLawyer && !isIntroducer) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Signature Tasks
          </h3>
          <p className="text-muted-foreground">
            You don&apos;t have any pending signature tasks at this time.
          </p>
        </div>
      </div>
    )
  }

  // Sort by priority (high → medium → low), then by due_at
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const allTasks = ((tasks as SignatureTask[]) || []).sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 99
    const pB = priorityOrder[b.priority] ?? 99
    if (pA !== pB) return pA - pB
    if (!a.due_at && !b.due_at) return 0
    if (!a.due_at) return 1
    if (!b.due_at) return -1
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
  })

  // Group tasks by type
  const signatureGroups: SignatureGroup[] = [
    {
      category: 'countersignatures',
      title: 'Pending Countersignatures',
      description: 'Subscription agreements awaiting your countersignature',
      tasks: allTasks.filter(t =>
        t.kind === 'countersignature' &&
        (t.status === 'pending' || t.status === 'in_progress')
      )
    },
    {
      category: 'follow_ups',
      title: 'Manual Follow-ups Required',
      description: 'Investors without platform accounts - manual intervention needed',
      tasks: allTasks.filter(t =>
        t.metadata?.issue === 'investor_no_user_account' &&
        t.status === 'pending'
      )
    },
    {
      category: 'other',
      title: 'Completed Signatures',
      description: 'Recently completed signature tasks',
      tasks: allTasks.filter(t =>
        (t.kind === 'countersignature' || t.kind === 'subscription_pack_signature') &&
        t.status === 'completed'
      ).slice(0, 10) // Show last 10 completed
    },
    {
      category: 'expired',
      title: 'Expired Signatures',
      description: 'Signature requests that have expired - may need to be resent',
      tasks: [],
      expiredSignatures: expiredSignatures
    }
  ]

  // Get stats for dashboard
  const stats = {
    pending: allTasks.filter(t => t.status === 'pending').length,
    in_progress: allTasks.filter(t => t.status === 'in_progress').length,
    completed_today: allTasks.filter(t =>
      t.status === 'completed' &&
      t.completed_at &&
      new Date(t.completed_at).toDateString() === new Date().toDateString()
    ).length,
    overdue: allTasks.filter(t =>
      t.status === 'pending' &&
      t.due_at &&
      new Date(t.due_at) < new Date()
    ).length,
    expired: expiredSignatures.length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Introducer Agreement Signing Section */}
      {(isStaff || isIntroducer) && introducerAgreementsForSigning.length > 0 && (
        <IntroducerAgreementSigningSection
          agreements={introducerAgreementsForSigning}
          isStaff={isStaff}
        />
      )}

      {/* Standard VersaSign Tasks */}
      <VersoSignPageClient
        userId={user.id}
        signatureGroups={signatureGroups}
        stats={stats}
      />
    </div>
  )
}
