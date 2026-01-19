import { createClient, createServiceClient } from '@/lib/supabase/server'
import { VersoSignPageClient } from '@/app/(staff)/versotech/staff/versosign/versosign-page-client'
import { AlertCircle } from 'lucide-react'
import type { SignatureGroup, SignatureTask, ExpiredSignature } from '@/app/(staff)/versotech/staff/versosign/page'
// IntroducerAgreementSigningSection removed - introducer agreements now use standard task flow
import { PlacementAgreementSigningSection } from './placement-agreement-signing-section'
import { checkStaffAccess } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type PlacementAgreementForSigning = {
  id: string
  status: string
  default_commission_bps: number | null
  commercial_partner: {
    id: string
    legal_name: string
    display_name: string | null
    email: string | null
  }
  ceo_signature_request_id: string | null
  cp_signature_request_id: string | null
  arranger_signature_request_id: string | null
  arranger_id: string | null
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

  // Check user personas for access level
  const isStaff = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()

  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })
  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false
  const isIntroducer = personas?.some((p: any) => p.persona_type === 'introducer') || false
  const isArranger = personas?.some((p: any) => p.persona_type === 'arranger') || false
  const isPartner = personas?.some((p: any) => p.persona_type === 'partner') || false

  // Get ACTIVE persona from cookie - filter tasks by active persona only
  const cookieStore = await cookies()
  const activePersonaType = cookieStore.get('verso_active_persona_type')?.value

  // Determine which persona queries should run based on ACTIVE persona
  const shouldShowStaffTasks = isStaff && (activePersonaType === 'ceo' || activePersonaType === 'staff' || !activePersonaType)
  const shouldShowArrangerTasks = isArranger && activePersonaType === 'arranger'
  const shouldShowInvestorTasks = activePersonaType === 'investor'
  const shouldShowLawyerTasks = isLawyer && activePersonaType === 'lawyer'

  // Get partner IDs if user has partner persona
  let partnerIds: string[] = []
  if (isPartner) {
    const { data: partnerLinks } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
    partnerIds = partnerLinks?.map(link => link.partner_id) || []
  }

  // Get arranger IDs if user has arranger persona
  let arrangerIds: string[] = []
  if (isArranger) {
    const { data: arrangerLinks } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
    arrangerIds = arrangerLinks?.map(link => link.arranger_id) || []
  }

  // Get introducer IDs if user has introducer persona
  let introducerIds: string[] = []
  if (isIntroducer) {
    const { data: introducerLinks } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id')
      .eq('user_id', user.id)
    introducerIds = introducerLinks?.map(link => link.introducer_id) || []
  }

  // Get CEO entity ID if user is a CEO member
  // This allows CEO members to see tasks owned by the CEO entity
  let ceoEntityId: string | null = null
  const { data: ceoMembership } = await serviceSupabase
    .from('ceo_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (ceoMembership) {
    const { data: ceoEntity } = await serviceSupabase
      .from('ceo_entity')
      .select('id')
      .limit(1)
      .single()
    ceoEntityId = ceoEntity?.id || null
  }

  // Introducer agreements now use standard task flow - no separate section needed

  // Fetch placement agreements pending signature
  let placementAgreementsForSigning: PlacementAgreementForSigning[] = []
  const fetchedPlacementAgreementIds = new Set<string>()

  if (isStaff) {
    // CEO/Staff: See agreements approved and waiting for CEO signature (non-arranger agreements)
    const { data: placementData } = await serviceSupabase
      .from('placement_agreements')
      .select(`
        id, status, default_commission_bps, pdf_url, created_at,
        ceo_signature_request_id, cp_signature_request_id,
        arranger_signature_request_id, arranger_id,
        commercial_partner:commercial_partner_id (id, legal_name, display_name, email)
      `)
      .eq('status', 'approved')
      .is('arranger_id', null)  // Only non-arranger agreements for CEO
      .order('created_at', { ascending: false })

    for (const agreement of (placementData || [])) {
      if (!fetchedPlacementAgreementIds.has(agreement.id)) {
        placementAgreementsForSigning.push(agreement as unknown as PlacementAgreementForSigning)
        fetchedPlacementAgreementIds.add(agreement.id)
      }
    }
  }

  if (isArranger && arrangerIds.length > 0) {
    // Arranger: See their placement agreements pending signature
    const { data: arrangerPlacementData } = await serviceSupabase
      .from('placement_agreements')
      .select(`
        id, status, default_commission_bps, pdf_url, created_at,
        ceo_signature_request_id, cp_signature_request_id,
        arranger_signature_request_id, arranger_id,
        commercial_partner:commercial_partner_id (id, legal_name, display_name, email)
      `)
      .in('arranger_id', arrangerIds)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    for (const agreement of (arrangerPlacementData || [])) {
      if (!fetchedPlacementAgreementIds.has(agreement.id)) {
        placementAgreementsForSigning.push(agreement as unknown as PlacementAgreementForSigning)
        fetchedPlacementAgreementIds.add(agreement.id)
      }
    }
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

  // Get lawyer IDs if user has lawyer persona
  let lawyerIds: string[] = []
  if (isLawyer) {
    const { data: lawyerLinks } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
    lawyerIds = lawyerLinks?.map(link => link.lawyer_id) || []
  }

  // Fetch signature tasks for this user using ADDITIVE model
  // Users with multiple personas see tasks from ALL their personas (no more else-if priority bug)
  let tasks: any[] = []
  const fetchedTaskIds = new Set<string>()

  // Helper to add tasks without duplicates
  const addTasksWithDedup = (newTasks: any[]) => {
    for (const task of newTasks) {
      if (!fetchedTaskIds.has(task.id)) {
        tasks.push(task)
        fetchedTaskIds.add(task.id)
      }
    }
  }

  // 1. Staff/CEO: See their OWN signature tasks AND tasks owned by CEO entity (if CEO member)
  // ONLY runs if active persona is ceo/staff
  if (shouldShowStaffTasks) {
    // Build query for staff tasks: user-owned OR CEO-entity-owned (if user is CEO member)
    let staffTasksQuery = serviceSupabase
      .from('tasks')
      .select('*')
      .in('kind', ['countersignature', 'subscription_pack_signature', 'other'])
      .order('due_at', { ascending: true, nullsFirst: false })

    if (ceoEntityId) {
      // CEO member: see both user-owned AND CEO-entity-owned tasks
      staffTasksQuery = staffTasksQuery.or(`owner_user_id.eq.${user.id},owner_ceo_entity_id.eq.${ceoEntityId}`)
    } else {
      // Non-CEO staff: only see their own tasks
      staffTasksQuery = staffTasksQuery.eq('owner_user_id', user.id)
    }

    const { data: staffTasks } = await staffTasksQuery
    addTasksWithDedup(staffTasks || [])
  }

  // 2. Lawyer: See subscription_pack_signature tasks for assigned deals
  // ONLY runs if active persona is lawyer
  if (shouldShowLawyerTasks && lawyerIds.length > 0) {
    const { data: lawyerAssignments } = await serviceSupabase
      .from('deal_lawyer_assignments')
      .select('deal_id')
      .in('lawyer_id', lawyerIds)

    const assignedDealIds = lawyerAssignments?.map(a => a.deal_id) || []

    if (assignedDealIds.length > 0) {
      const { data: lawyerTasks } = await serviceSupabase
        .from('tasks')
        .select('*')
        .eq('kind', 'subscription_pack_signature')
        .in('related_deal_id', assignedDealIds)
        .order('due_at', { ascending: true, nullsFirst: false })
      addTasksWithDedup(lawyerTasks || [])
    }
  }

  // 3. Investor: Tasks owned by user OR by their investor entities
  // ONLY runs if active persona is investor
  if (shouldShowInvestorTasks && investorIds.length > 0) {
    const { data: investorTasks } = await serviceSupabase
      .from('tasks')
      .select('*')
      .in('kind', ['countersignature', 'subscription_pack_signature', 'other'])
      .or(`owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`)
      .order('due_at', { ascending: true, nullsFirst: false })
    addTasksWithDedup(investorTasks || [])
  }

  // 4. Arranger: Tasks for their mandates (deals they arrange)
  // ONLY runs if active persona is arranger
  // IMPORTANT: Exclude CEO-owned tasks (owner_ceo_entity_id IS NOT NULL) to prevent
  // arranger seeing CEO countersign tasks when both are on the same deal
  if (shouldShowArrangerTasks && arrangerIds.length > 0) {
    const { data: arrangerDeals } = await serviceSupabase
      .from('deals')
      .select('id')
      .in('arranger_entity_id', arrangerIds)

    const arrangerDealIds = arrangerDeals?.map(d => d.id) || []

    if (arrangerDealIds.length > 0) {
      const { data: arrangerTasks } = await serviceSupabase
        .from('tasks')
        .select('*')
        .in('kind', ['countersignature', 'subscription_pack_signature'])
        .in('related_deal_id', arrangerDealIds)
        .is('owner_ceo_entity_id', null)  // Exclude CEO tasks
        .order('due_at', { ascending: true, nullsFirst: false })
      addTasksWithDedup(arrangerTasks || [])
    }
  }

  // 5. Fallback: If no tasks found and no personas matched above, get user's direct tasks
  if (tasks.length === 0 && !isStaff && !isLawyer && investorIds.length === 0 && !isArranger) {
    const { data: userTasks } = await serviceSupabase
      .from('tasks')
      .select('*')
      .in('kind', ['countersignature', 'subscription_pack_signature', 'other'])
      .eq('owner_user_id', user.id)
      .order('due_at', { ascending: true, nullsFirst: false })
    addTasksWithDedup(userTasks || [])
  }

  // Filter out pending/in_progress tasks where the linked signature request has expired
  // This prevents showing "Sign Document" for expired signature requests
  if (tasks.length > 0) {
    const pendingTasksWithSignatureRef = tasks.filter(
      t => (t.status === 'pending' || t.status === 'in_progress') &&
           t.related_entity_type === 'signature_request' &&
           t.related_entity_id
    )

    if (pendingTasksWithSignatureRef.length > 0) {
      const signatureRequestIds = pendingTasksWithSignatureRef.map(t => t.related_entity_id)

      // Check which signature requests are expired
      const { data: expiredSigRequests } = await serviceSupabase
        .from('signature_requests')
        .select('id')
        .in('id', signatureRequestIds)
        .eq('status', 'expired')

      const expiredIds = new Set((expiredSigRequests || []).map(s => s.id))

      // Mark tasks with expired signature requests
      tasks = tasks.map(t => {
        if (expiredIds.has(t.related_entity_id) &&
            (t.status === 'pending' || t.status === 'in_progress')) {
          return { ...t, _expired: true }
        }
        return t
      })
    }
  }

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

  // If user has no signature tasks and no agreements to sign and is not staff/lawyer/introducer/arranger/partner, show appropriate message
  const hasTasks = tasks && tasks.length > 0
  const hasAgreementsToSign = placementAgreementsForSigning.length > 0
  const hasRelevantPersona = isStaff || isLawyer || isIntroducer || isArranger || isPartner

  if (!hasTasks && !hasAgreementsToSign && !hasRelevantPersona) {
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
  const sortedTasks = ((tasks as SignatureTask[]) || []).sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 99
    const pB = priorityOrder[b.priority] ?? 99
    if (pA !== pB) return pA - pB
    if (!a.due_at && !b.due_at) return 0
    if (!a.due_at) return 1
    if (!b.due_at) return -1
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
  })

  // Separate expired tasks from actionable tasks
  const actionableTasks = sortedTasks.filter(t => !(t as any)._expired)
  const expiredTasks = sortedTasks.filter(t => (t as any)._expired)

  // Group tasks by type
  const signatureGroups: SignatureGroup[] = [
    {
      category: 'countersignatures',
      title: 'Pending Countersignatures',
      description: 'Subscription agreements awaiting your countersignature',
      // Only show non-expired tasks in actionable view
      tasks: actionableTasks.filter(t =>
        t.kind === 'countersignature' &&
        (t.status === 'pending' || t.status === 'in_progress')
      )
    },
    {
      category: 'follow_ups',
      title: 'Manual Follow-ups Required',
      description: 'Investors without platform accounts - manual intervention needed',
      tasks: actionableTasks.filter(t =>
        t.metadata?.issue === 'investor_no_user_account' &&
        t.status === 'pending'
      )
    },
    {
      category: 'other',
      title: 'Completed Signatures',
      description: 'Recently completed signature tasks',
      tasks: sortedTasks.filter(t =>
        (t.kind === 'countersignature' || t.kind === 'subscription_pack_signature') &&
        t.status === 'completed'
      ).slice(0, 10) // Show last 10 completed
    },
    {
      category: 'expired',
      title: 'Expired Signatures',
      description: 'Signature requests that have expired - may need to be resent',
      // Include both expired signature requests AND tasks with expired signatures
      tasks: expiredTasks,
      expiredSignatures: expiredSignatures
    }
  ]

  // Get stats for dashboard (only count actionable tasks)
  const stats = {
    pending: actionableTasks.filter(t => t.status === 'pending').length,
    in_progress: actionableTasks.filter(t => t.status === 'in_progress').length,
    completed_today: sortedTasks.filter(t =>
      t.status === 'completed' &&
      t.completed_at &&
      new Date(t.completed_at).toDateString() === new Date().toDateString()
    ).length,
    overdue: actionableTasks.filter(t =>
      t.status === 'pending' &&
      t.due_at &&
      new Date(t.due_at) < new Date()
    ).length,
    expired: expiredSignatures.length + expiredTasks.length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Placement Agreement Signing Section - Staff and Arrangers */}
      {(isStaff || isArranger) && placementAgreementsForSigning.length > 0 && (
        <PlacementAgreementSigningSection
          agreements={placementAgreementsForSigning}
          isStaff={isStaff}
          isArranger={isArranger}
        />
      )}

      {/* Partner Empty State - when Partner has no tasks or agreements */}
      {isPartner && !hasTasks && !hasAgreementsToSign && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
            All Caught Up!
          </h3>
          <p className="text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
            You don&apos;t have any pending signature tasks as a Partner. When your referred investors have documents requiring your signature, they&apos;ll appear here.
          </p>
        </div>
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
