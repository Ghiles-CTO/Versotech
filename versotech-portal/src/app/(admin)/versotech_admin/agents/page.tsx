import { redirect } from 'next/navigation'
import {
  Bot,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  UserCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

type AgentRow = {
  id: string
  name: string
  role: string
  avatar_url: string | null
  email_identity: string | null
  is_active: boolean
  created_at: string
}

type TaskRow = {
  agent_id: string
  task_code: string
  task_name: string
  is_active: boolean
}

type BlacklistEntry = {
  id: string
  severity: 'warning' | 'blocked' | 'banned'
  reason: string | null
  full_name: string | null
  entity_name: string | null
  email: string | null
  phone: string | null
  tax_id: string | null
  status: 'active' | 'resolved' | 'false_positive'
  reported_at: string | null
  reported_by: string | null
  notes?: string | null
}

type BlacklistMatchEntry = {
  id: string
  severity: 'warning' | 'blocked' | 'banned'
  reason: string | null
  full_name: string | null
  entity_name: string | null
  email: string | null
  phone: string | null
  tax_id: string | null
}

type BlacklistMatch = {
  id: string
  blacklist_entry_id?: string | null
  match_type: string
  match_confidence: number | string
  matched_at: string
  compliance_blacklist?: BlacklistMatchEntry | BlacklistMatchEntry[] | null
}

type KycSubjectType =
  | 'investor'
  | 'investor_member'
  | 'counterparty_entity'
  | 'counterparty_member'
  | 'partner'
  | 'partner_member'
  | 'introducer'
  | 'introducer_member'
  | 'lawyer'
  | 'lawyer_member'
  | 'commercial_partner'
  | 'commercial_partner_member'
  | 'arranger_entity'
  | 'arranger_member'

type KycSubmissionRow = {
  id: string
  status: string | null
  document_type: string | null
  custom_label: string | null
  expiry_date: string | null
  submitted_at: string | null
  reviewed_at: string | null
  investor_id: string | null
  investor_member_id: string | null
  counterparty_entity_id: string | null
  counterparty_member_id: string | null
  partner_id: string | null
  partner_member_id: string | null
  introducer_id: string | null
  introducer_member_id: string | null
  lawyer_id: string | null
  lawyer_member_id: string | null
  commercial_partner_id: string | null
  commercial_partner_member_id: string | null
  arranger_entity_id: string | null
  arranger_member_id: string | null
}

type KycSubjectRecord = {
  id: string
  type: KycSubjectType
  name: string
  kyc_status: string | null
  kyc_expiry: string | null
  user_id: string | null
}

type KycRow = {
  submission_id: string
  subject_type: KycSubjectType
  subject_id: string
  subject_name: string
  document_label: string
  status: string | null
  derived_status: string
  expiry_date: string | null
  submitted_at: string | null
  last_reminder_at: string | null
  user_id: string | null
}

const severityStyles: Record<BlacklistEntry['severity'], string> = {
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  blocked: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  banned: 'bg-red-500/10 text-red-700 dark:text-red-300',
}

const matchTypeLabels: Record<string, string> = {
  email_exact: 'Email match',
  phone_exact: 'Phone match',
  tax_id_exact: 'Tax ID match',
  name_exact: 'Name match',
  entity_name_exact: 'Entity match',
  name_fuzzy: 'Name similar',
  entity_name_fuzzy: 'Entity similar',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatConfidence(value: number | string) {
  const numeric = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numeric)) return null
  if (numeric >= 0.999) return 'Exact'
  return `~${numeric.toFixed(2)}`
}

function formatPersonName(record: {
  full_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  name_suffix?: string | null
}) {
  if (record.full_name) return record.full_name
  const parts = [
    record.first_name,
    record.middle_name,
    record.last_name,
    record.name_suffix,
  ].filter(Boolean)
  return parts.length ? parts.join(' ') : null
}

function pickFirst(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (value && value.trim().length) return value
  }
  return null
}

function daysUntil(dateValue?: string | null) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  const diff = date.getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function unwrapEntry(entry?: BlacklistMatchEntry | BlacklistMatchEntry[] | null) {
  if (!entry) return null
  return Array.isArray(entry) ? entry[0] : entry
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function matchQuery(entry: BlacklistEntry, query: string) {
  if (!query) return true
  const haystack = [
    entry.full_name,
    entry.entity_name,
    entry.email,
    entry.phone,
    entry.tax_id,
    entry.reason,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {}

  const getParam = (key: string) => {
    const value = resolvedSearchParams[key]
    return typeof value === 'string' ? value : ''
  }

  const mode = getParam('mode')
  const editId = getParam('edit')
  const selectedEntryId = getParam('entry')
  const errorMessage = getParam('error')
  const successMessage = getParam('success')

  const user = await getCurrentUser()
  if (!user) {
    redirect('/versotech_main/login')
  }

  const isAdmin = user.role === 'ceo' || user.permissions?.includes('super_admin')
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This page is available to the CEO compliance team only.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const supabase = createServiceClient()

  const [
    { data: agentsData, error: agentsError },
    { data: assignmentsData },
    { data: blacklistEntriesData },
    { data: blacklistMatchesData },
    { data: blacklistAllMatchesData },
    { data: selectedEntryMatchesData },
  ] = await Promise.all([
    supabase
      .from('ai_agents')
      .select('id, name, role, avatar_url, email_identity, is_active, created_at')
      .order('created_at', { ascending: true }),
    supabase
      .from('agent_task_assignments')
      .select('agent_id, task_code, task_name, is_active')
      .order('task_code', { ascending: true }),
    supabase
      .from('compliance_blacklist')
      .select('id, severity, status, reason, full_name, entity_name, email, phone, tax_id, reported_at, reported_by, notes')
      .order('reported_at', { ascending: false }),
    supabase
      .from('blacklist_matches')
      .select(
        'id, match_type, match_confidence, matched_at, compliance_blacklist:compliance_blacklist(id, severity, reason, full_name, entity_name, email, phone, tax_id)'
      )
      .order('matched_at', { ascending: false })
      .limit(20),
    supabase
      .from('blacklist_matches')
      .select('id, blacklist_entry_id, matched_at')
      .order('matched_at', { ascending: false })
      .limit(500),
    selectedEntryId
      ? supabase
          .from('blacklist_matches')
          .select('id, match_type, match_confidence, matched_at')
          .eq('blacklist_entry_id', selectedEntryId)
          .order('matched_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
  ])

  const agents: AgentRow[] = agentsData ?? []
  const assignments: TaskRow[] = assignmentsData ?? []
  const blacklistEntries: BlacklistEntry[] = blacklistEntriesData ?? []
  const blacklistMatches: BlacklistMatch[] = blacklistMatchesData ?? []
  const allBlacklistMatches = blacklistAllMatchesData ?? []
  const selectedEntryMatches = selectedEntryMatchesData ?? []

  const { data: kycSubmissionsData } = await supabase
    .from('kyc_submissions')
    .select(
      'id, status, document_type, custom_label, expiry_date, submitted_at, reviewed_at, investor_id, investor_member_id, counterparty_entity_id, counterparty_member_id, partner_id, partner_member_id, introducer_id, introducer_member_id, lawyer_id, lawyer_member_id, commercial_partner_id, commercial_partner_member_id, arranger_entity_id, arranger_member_id'
    )
    .order('submitted_at', { ascending: false })
    .limit(200)

  const kycSubmissions: KycSubmissionRow[] = kycSubmissionsData ?? []
  const investorIds = new Set<string>()
  const investorMemberIds = new Set<string>()
  const counterpartyEntityIds = new Set<string>()
  const counterpartyMemberIds = new Set<string>()
  const partnerIds = new Set<string>()
  const partnerMemberIds = new Set<string>()
  const introducerIds = new Set<string>()
  const introducerMemberIds = new Set<string>()
  const lawyerIds = new Set<string>()
  const lawyerMemberIds = new Set<string>()
  const commercialPartnerIds = new Set<string>()
  const commercialPartnerMemberIds = new Set<string>()
  const arrangerEntityIds = new Set<string>()
  const arrangerMemberIds = new Set<string>()

  const addId = (set: Set<string>, value: string | null) => {
    if (value) set.add(value)
  }

  kycSubmissions.forEach((submission) => {
    addId(investorIds, submission.investor_id)
    addId(investorMemberIds, submission.investor_member_id)
    addId(counterpartyEntityIds, submission.counterparty_entity_id)
    addId(counterpartyMemberIds, submission.counterparty_member_id)
    addId(partnerIds, submission.partner_id)
    addId(partnerMemberIds, submission.partner_member_id)
    addId(introducerIds, submission.introducer_id)
    addId(introducerMemberIds, submission.introducer_member_id)
    addId(lawyerIds, submission.lawyer_id)
    addId(lawyerMemberIds, submission.lawyer_member_id)
    addId(commercialPartnerIds, submission.commercial_partner_id)
    addId(commercialPartnerMemberIds, submission.commercial_partner_member_id)
    addId(arrangerEntityIds, submission.arranger_entity_id)
    addId(arrangerMemberIds, submission.arranger_member_id)
  })

  const fetchByIds = (table: string, columns: string, ids: Set<string>): Promise<{ data: any[] }> => {
    if (!ids.size) {
      return Promise.resolve({ data: [] })
    }
    return supabase
      .from(table)
      .select(columns)
      .in('id', Array.from(ids)) as unknown as Promise<{ data: any[] }>
  }

  const fetchByForeignIds = (
    table: string,
    columns: string,
    foreignKey: string,
    ids: Set<string>
  ): Promise<{ data: any[] }> => {
    if (!ids.size) {
      return Promise.resolve({ data: [] })
    }
    return supabase
      .from(table)
      .select(columns)
      .in(foreignKey, Array.from(ids)) as unknown as Promise<{ data: any[] }>
  }

  const [
    { data: investorsData },
    { data: investorMembersData },
    { data: counterpartyEntitiesData },
    { data: counterpartyMembersData },
    { data: partnersData },
    { data: partnerMembersData },
    { data: introducersData },
    { data: introducerMembersData },
    { data: lawyersData },
    { data: lawyerMembersData },
    { data: commercialPartnersData },
    { data: commercialPartnerMembersData },
    { data: arrangerEntitiesData },
    { data: arrangerMembersData },
    { data: investorUsersData },
    { data: partnerUsersData },
    { data: introducerUsersData },
    { data: lawyerUsersData },
    { data: commercialPartnerUsersData },
    { data: arrangerUsersData },
    { data: kycRemindersData },
  ] = await Promise.all([
    fetchByIds(
      'investors',
      'id, legal_name, display_name, representative_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date',
      investorIds
    ),
    fetchByIds(
      'investor_members',
      'id, full_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date, linked_user_id',
      investorMemberIds
    ),
    fetchByIds(
      'investor_counterparty',
      'id, legal_name, representative_name, kyc_status, kyc_expiry_date',
      counterpartyEntityIds
    ),
    fetchByIds(
      'counterparty_entity_members',
      'id, full_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date',
      counterpartyMemberIds
    ),
    fetchByIds(
      'partners',
      'id, legal_name, name, contact_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expires_at',
      partnerIds
    ),
    fetchByIds(
      'partner_members',
      'id, full_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date, linked_user_id',
      partnerMemberIds
    ),
    fetchByIds(
      'introducers',
      'id, legal_name, display_name, contact_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expires_at',
      introducerIds
    ),
    fetchByIds(
      'introducer_members',
      'id, full_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date, linked_user_id',
      introducerMemberIds
    ),
    fetchByIds(
      'lawyers',
      'id, firm_name, display_name, primary_contact_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expires_at',
      lawyerIds
    ),
    fetchByIds(
      'lawyer_members',
      'id, full_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date, linked_user_id',
      lawyerMemberIds
    ),
    fetchByIds(
      'commercial_partners',
      'id, legal_name, name, contact_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expires_at',
      commercialPartnerIds
    ),
    fetchByIds(
      'commercial_partner_members',
      'id, full_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date, linked_user_id',
      commercialPartnerMemberIds
    ),
    fetchByIds(
      'arranger_entities',
      'id, legal_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expires_at',
      arrangerEntityIds
    ),
    fetchByIds(
      'arranger_members',
      'id, full_name, first_name, middle_name, last_name, name_suffix, kyc_status, kyc_expiry_date, linked_user_id',
      arrangerMemberIds
    ),
    fetchByForeignIds('investor_users', 'investor_id, user_id, is_primary', 'investor_id', investorIds),
    fetchByForeignIds('partner_users', 'partner_id, user_id, is_primary', 'partner_id', partnerIds),
    fetchByForeignIds('introducer_users', 'introducer_id, user_id, is_primary', 'introducer_id', introducerIds),
    fetchByForeignIds('lawyer_users', 'lawyer_id, user_id, is_primary', 'lawyer_id', lawyerIds),
    fetchByForeignIds('commercial_partner_users', 'commercial_partner_id, user_id, is_primary', 'commercial_partner_id', commercialPartnerIds),
    fetchByForeignIds('arranger_users', 'arranger_id, user_id, is_primary', 'arranger_id', arrangerEntityIds),
    supabase
      .from('notifications')
      .select('id, user_id, created_at, data')
      .eq('type', 'kyc_reminder')
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  const tasksByAgent = assignments.reduce<Record<string, TaskRow[]>>((acc, task) => {
    if (!acc[task.agent_id]) acc[task.agent_id] = []
    acc[task.agent_id].push(task)
    return acc
  }, {})

  const pickPrimaryUser = (rows: Array<Record<string, any>>, idKey: string) => {
    const map = new Map<string, string>()
    rows.forEach((row) => {
      const id = row[idKey] as string | undefined
      const userId = row.user_id as string | undefined
      if (!id || !userId) return
      if (!map.has(id) || row.is_primary) {
        map.set(id, userId)
      }
    })
    return map
  }

  const investorUserMap = pickPrimaryUser(investorUsersData ?? [], 'investor_id')
  const partnerUserMap = pickPrimaryUser(partnerUsersData ?? [], 'partner_id')
  const introducerUserMap = pickPrimaryUser(introducerUsersData ?? [], 'introducer_id')
  const lawyerUserMap = pickPrimaryUser(lawyerUsersData ?? [], 'lawyer_id')
  const commercialPartnerUserMap = pickPrimaryUser(commercialPartnerUsersData ?? [], 'commercial_partner_id')
  const arrangerUserMap = pickPrimaryUser(arrangerUsersData ?? [], 'arranger_id')

  const subjectDirectory = new Map<string, KycSubjectRecord>()
  const addSubject = (record: KycSubjectRecord) => {
    if (!record.id || !record.name) return
    subjectDirectory.set(`${record.type}:${record.id}`, record)
  }

  ;(investorsData ?? []).forEach((record) => {
    const name = pickFirst(
      record.legal_name as string | null,
      record.display_name as string | null,
      record.representative_name as string | null,
      formatPersonName(record as any)
    )
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'investor',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: investorUserMap.get(record.id as string) ?? null,
    })
  })

  ;(investorMembersData ?? []).forEach((record) => {
    const name = formatPersonName(record as any)
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'investor_member',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: (record.linked_user_id as string | null) ?? null,
    })
  })

  ;(counterpartyEntitiesData ?? []).forEach((record) => {
    const name = pickFirst(
      record.legal_name as string | null,
      record.representative_name as string | null
    )
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'counterparty_entity',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: null,
    })
  })

  ;(counterpartyMembersData ?? []).forEach((record) => {
    const name = formatPersonName(record as any)
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'counterparty_member',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: null,
    })
  })

  ;(partnersData ?? []).forEach((record) => {
    const name = pickFirst(
      record.legal_name as string | null,
      record.name as string | null,
      record.contact_name as string | null,
      formatPersonName(record as any)
    )
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'partner',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expires_at as string | null) ?? null,
      user_id: partnerUserMap.get(record.id as string) ?? null,
    })
  })

  ;(partnerMembersData ?? []).forEach((record) => {
    const name = formatPersonName(record as any)
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'partner_member',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: (record.linked_user_id as string | null) ?? null,
    })
  })

  ;(introducersData ?? []).forEach((record) => {
    const name = pickFirst(
      record.display_name as string | null,
      record.legal_name as string | null,
      record.contact_name as string | null,
      formatPersonName(record as any)
    )
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'introducer',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expires_at as string | null) ?? null,
      user_id: introducerUserMap.get(record.id as string) ?? null,
    })
  })

  ;(introducerMembersData ?? []).forEach((record) => {
    const name = formatPersonName(record as any)
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'introducer_member',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: (record.linked_user_id as string | null) ?? null,
    })
  })

  ;(lawyersData ?? []).forEach((record) => {
    const name = pickFirst(
      record.firm_name as string | null,
      record.display_name as string | null,
      record.primary_contact_name as string | null,
      formatPersonName(record as any)
    )
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'lawyer',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expires_at as string | null) ?? null,
      user_id: lawyerUserMap.get(record.id as string) ?? null,
    })
  })

  ;(lawyerMembersData ?? []).forEach((record) => {
    const name = formatPersonName(record as any)
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'lawyer_member',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: (record.linked_user_id as string | null) ?? null,
    })
  })

  ;(commercialPartnersData ?? []).forEach((record) => {
    const name = pickFirst(
      record.legal_name as string | null,
      record.name as string | null,
      record.contact_name as string | null,
      formatPersonName(record as any)
    )
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'commercial_partner',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expires_at as string | null) ?? null,
      user_id: commercialPartnerUserMap.get(record.id as string) ?? null,
    })
  })

  ;(commercialPartnerMembersData ?? []).forEach((record) => {
    const name = formatPersonName(record as any)
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'commercial_partner_member',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: (record.linked_user_id as string | null) ?? null,
    })
  })

  ;(arrangerEntitiesData ?? []).forEach((record) => {
    const name = pickFirst(
      record.legal_name as string | null,
      formatPersonName(record as any)
    )
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'arranger_entity',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expires_at as string | null) ?? null,
      user_id: arrangerUserMap.get(record.id as string) ?? null,
    })
  })

  ;(arrangerMembersData ?? []).forEach((record) => {
    const name = formatPersonName(record as any)
    if (!name) return
    addSubject({
      id: record.id as string,
      type: 'arranger_member',
      name,
      kyc_status: (record.kyc_status as string | null) ?? null,
      kyc_expiry: (record.kyc_expiry_date as string | null) ?? null,
      user_id: (record.linked_user_id as string | null) ?? null,
    })
  })

  const kycReminders = (kycRemindersData ?? []) as Array<{
    created_at: string | null
    data: Record<string, any> | null
  }>
  const kycReminderMap = new Map<string, string>()
  kycReminders.forEach((reminder) => {
    const data = reminder.data ?? {}
    const key =
      (data.kyc_subject_key as string | undefined) ||
      (data.kyc_subject_type && data.kyc_subject_id
        ? `${data.kyc_subject_type}:${data.kyc_subject_id}`
        : null)
    if (!key || kycReminderMap.has(key)) return
    if (reminder.created_at) {
      kycReminderMap.set(key, reminder.created_at)
    }
  })

  const resolveSubject = (submission: KycSubmissionRow) => {
    if (submission.investor_member_id) {
      return { type: 'investor_member' as const, id: submission.investor_member_id }
    }
    if (submission.investor_id) {
      return { type: 'investor' as const, id: submission.investor_id }
    }
    if (submission.counterparty_member_id) {
      return { type: 'counterparty_member' as const, id: submission.counterparty_member_id }
    }
    if (submission.counterparty_entity_id) {
      return { type: 'counterparty_entity' as const, id: submission.counterparty_entity_id }
    }
    if (submission.partner_member_id) {
      return { type: 'partner_member' as const, id: submission.partner_member_id }
    }
    if (submission.partner_id) {
      return { type: 'partner' as const, id: submission.partner_id }
    }
    if (submission.introducer_member_id) {
      return { type: 'introducer_member' as const, id: submission.introducer_member_id }
    }
    if (submission.introducer_id) {
      return { type: 'introducer' as const, id: submission.introducer_id }
    }
    if (submission.lawyer_member_id) {
      return { type: 'lawyer_member' as const, id: submission.lawyer_member_id }
    }
    if (submission.lawyer_id) {
      return { type: 'lawyer' as const, id: submission.lawyer_id }
    }
    if (submission.commercial_partner_member_id) {
      return { type: 'commercial_partner_member' as const, id: submission.commercial_partner_member_id }
    }
    if (submission.commercial_partner_id) {
      return { type: 'commercial_partner' as const, id: submission.commercial_partner_id }
    }
    if (submission.arranger_member_id) {
      return { type: 'arranger_member' as const, id: submission.arranger_member_id }
    }
    if (submission.arranger_entity_id) {
      return { type: 'arranger_entity' as const, id: submission.arranger_entity_id }
    }
    return null
  }

  const kycRows: KycRow[] = kycSubmissions
    .map((submission) => {
      const subjectInfo = resolveSubject(submission)
      if (!subjectInfo) return null
      const key = `${subjectInfo.type}:${subjectInfo.id}`
      const subject = subjectDirectory.get(key)
      const expiryDate = submission.expiry_date ?? subject?.kyc_expiry ?? null
      const status = submission.status ?? subject?.kyc_status ?? null
      const daysToExpiry = daysUntil(expiryDate)
      let derivedStatus = status || 'missing'
      if (daysToExpiry !== null && daysToExpiry < 0) {
        derivedStatus = 'expired'
      } else if (daysToExpiry !== null && daysToExpiry <= 30) {
        derivedStatus = 'expiring_soon'
      } else if (!status || status === 'draft') {
        derivedStatus = status ?? 'missing'
      }
      const documentLabel = pickFirst(
        submission.custom_label,
        submission.document_type,
        'KYC document'
      ) as string
      return {
        submission_id: submission.id,
        subject_type: subjectInfo.type,
        subject_id: subjectInfo.id,
        subject_name: subject?.name ?? 'Unknown',
        document_label: documentLabel,
        status,
        derived_status: derivedStatus,
        expiry_date: expiryDate,
        submitted_at: submission.submitted_at,
        last_reminder_at: kycReminderMap.get(key) ?? null,
        user_id: subject?.user_id ?? null,
      }
    })
    .filter(Boolean) as KycRow[]

  const kycCounts = kycRows.reduce(
    (acc, row) => {
      acc.total += 1
      if (row.derived_status === 'expired') acc.expired += 1
      if (row.derived_status === 'expiring_soon') acc.expiring += 1
      if (row.derived_status === 'missing') acc.missing += 1
      return acc
    },
    { total: 0, expired: 0, expiring: 0, missing: 0 }
  )

  const kycStatusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    under_review: 'Under review',
    draft: 'Draft',
    expired: 'Expired',
    expiring_soon: 'Expiring soon',
    missing: 'Missing',
  }

  const kycStatusStyles: Record<string, string> = {
    approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    under_review: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    draft: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    expired: 'bg-red-500/10 text-red-700 dark:text-red-300',
    expiring_soon: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    missing: 'bg-slate-200/70 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  }

  const kycPersonaLabels: Record<KycSubjectType, string> = {
    investor: 'Investor',
    investor_member: 'Investor Member',
    counterparty_entity: 'Counterparty Entity',
    counterparty_member: 'Counterparty Member',
    partner: 'Partner',
    partner_member: 'Partner Member',
    introducer: 'Introducer',
    introducer_member: 'Introducer Member',
    lawyer: 'Lawyer',
    lawyer_member: 'Lawyer Member',
    commercial_partner: 'Commercial Partner',
    commercial_partner_member: 'Commercial Partner Member',
    arranger_entity: 'Arranger',
    arranger_member: 'Arranger Member',
  }

  type SeverityKey = 'warning' | 'blocked' | 'banned'
  type BlacklistCounts = { total: number } & Record<SeverityKey, number>

  const blacklistCounts = blacklistEntries.reduce<BlacklistCounts>(
    (acc, entry) => {
      acc.total += 1
      const severity = entry.severity as SeverityKey | undefined
      if (severity && severity in acc) {
        acc[severity] += 1
      }
      return acc
    },
    { total: 0, warning: 0, blocked: 0, banned: 0 }
  )

  const matchCounts = allBlacklistMatches.reduce<Record<string, { count: number; lastMatched?: string }>>(
    (acc, match) => {
      if (!match.blacklist_entry_id) return acc
      if (!acc[match.blacklist_entry_id]) {
        acc[match.blacklist_entry_id] = { count: 0 }
      }
      acc[match.blacklist_entry_id].count += 1
      if (!acc[match.blacklist_entry_id].lastMatched) {
        acc[match.blacklist_entry_id].lastMatched = match.matched_at
      }
      return acc
    },
    {}
  )

  const query = typeof resolvedSearchParams.query === 'string' ? normalizeQuery(resolvedSearchParams.query) : ''
  const severityFilter = typeof resolvedSearchParams.severity === 'string' ? resolvedSearchParams.severity : 'all'
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'all'
  const kycQuery =
    typeof resolvedSearchParams.kyc_query === 'string' ? normalizeQuery(resolvedSearchParams.kyc_query) : ''
  const kycStatusFilter =
    typeof resolvedSearchParams.kyc_status === 'string' ? resolvedSearchParams.kyc_status : 'all'
  const kycPersonaFilter =
    typeof resolvedSearchParams.kyc_persona === 'string' ? resolvedSearchParams.kyc_persona : 'all'
  const baseParams = new URLSearchParams()
  if (query) baseParams.set('query', query)
  if (severityFilter !== 'all') baseParams.set('severity', severityFilter)
  if (statusFilter !== 'all') baseParams.set('status', statusFilter)
  if (kycQuery) baseParams.set('kyc_query', kycQuery)
  if (kycStatusFilter !== 'all') baseParams.set('kyc_status', kycStatusFilter)
  if (kycPersonaFilter !== 'all') baseParams.set('kyc_persona', kycPersonaFilter)
  const baseQueryString = baseParams.toString()
  const baseHref = baseQueryString ? `/versotech_admin/agents?${baseQueryString}` : '/versotech_admin/agents'
  const modalHref = `${baseHref}${baseQueryString ? '&' : '?'}mode=new`

  const filteredEntries = blacklistEntries.filter((entry) => {
    if (severityFilter !== 'all' && entry.severity !== severityFilter) return false
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false
    if (!matchQuery(entry, query)) return false
    return true
  })

  const filteredKycRows = kycRows.filter((row) => {
    if (kycPersonaFilter !== 'all' && row.subject_type !== kycPersonaFilter) return false
    if (kycStatusFilter !== 'all' && row.derived_status !== kycStatusFilter) return false
    if (kycQuery) {
      const haystack = `${row.subject_name} ${row.document_label}`.toLowerCase()
      if (!haystack.includes(kycQuery)) return false
    }
    return true
  })

  const editEntry = editId ? blacklistEntries.find((entry) => entry.id === editId) : null
  const entryToShowMatches = selectedEntryId
    ? blacklistEntries.find((entry) => entry.id === selectedEntryId)
    : null
  const showModal = mode === 'new' || Boolean(editEntry)

  const createBlacklistEntry = async (formData: FormData) => {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/versotech_main/login')
    }
    const isAllowed = currentUser.role === 'ceo' || currentUser.permissions?.includes('super_admin')
    if (!isAllowed) {
      redirect('/versotech_admin/agents?error=Not%20authorized')
    }

    const readText = (key: string) => {
      const value = formData.get(key)
      if (typeof value !== 'string') return null
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }

    const severity = (readText('severity') || 'warning') as BlacklistEntry['severity']
    const status = (readText('status') || 'active') as BlacklistEntry['status']

    const { error } = await createServiceClient()
      .from('compliance_blacklist')
      .insert({
        full_name: readText('full_name'),
        entity_name: readText('entity_name'),
        email: readText('email'),
        phone: readText('phone'),
        tax_id: readText('tax_id'),
        reason: readText('reason'),
        notes: readText('notes'),
        severity,
        status,
        reported_by: currentUser.id,
      })

    if (error) {
      redirect(`/versotech_admin/agents?error=${encodeURIComponent('Failed to create blacklist entry')}`)
    }

    redirect('/versotech_admin/agents?success=Blacklist%20entry%20created')
  }

  const updateBlacklistEntry = async (formData: FormData) => {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/versotech_main/login')
    }
    const isAllowed = currentUser.role === 'ceo' || currentUser.permissions?.includes('super_admin')
    if (!isAllowed) {
      redirect('/versotech_admin/agents?error=Not%20authorized')
    }

    const entryId = formData.get('entry_id')
    if (typeof entryId !== 'string' || !entryId) {
      redirect('/versotech_admin/agents?error=Invalid%20entry')
    }

    const readText = (key: string) => {
      const value = formData.get(key)
      if (typeof value !== 'string') return null
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }

    const severity = (readText('severity') || 'warning') as BlacklistEntry['severity']
    const status = (readText('status') || 'active') as BlacklistEntry['status']

    const { error } = await createServiceClient()
      .from('compliance_blacklist')
      .update({
        full_name: readText('full_name'),
        entity_name: readText('entity_name'),
        email: readText('email'),
        phone: readText('phone'),
        tax_id: readText('tax_id'),
        reason: readText('reason'),
        notes: readText('notes'),
        severity,
        status,
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', entryId)

    if (error) {
      redirect(`/versotech_admin/agents?error=${encodeURIComponent('Failed to update blacklist entry')}`)
    }

    redirect('/versotech_admin/agents?success=Blacklist%20entry%20updated')
  }

  const sendKycReminders = async (formData: FormData) => {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/versotech_main/login')
    }
    const isAllowed = currentUser.role === 'ceo' || currentUser.permissions?.includes('super_admin')
    if (!isAllowed) {
      redirect('/versotech_admin/agents?error=Not%20authorized')
    }

    const singleTarget = formData.get('single_target')
    const rawTargets = singleTarget
      ? [singleTarget]
      : formData.getAll('targets')

    const parsedTargets = rawTargets
      .map((value) => (typeof value === 'string' ? value : ''))
      .filter(Boolean)
      .map((value) => {
        const [userId, subjectType, subjectId, submissionId] = value.split('|')
        if (!userId || !subjectType || !subjectId) return null
        return {
          userId,
          subjectType,
          subjectId,
          submissionId: submissionId || null,
        }
      })
      .filter(Boolean) as Array<{
        userId: string
        subjectType: string
        subjectId: string
        submissionId: string | null
      }>

    if (!parsedTargets.length) {
      redirect('/versotech_admin/agents?error=No%20valid%20reminder%20targets')
    }

    const payload = parsedTargets.map((target) => ({
      user_id: target.userId,
      type: 'kyc_reminder',
      title: 'KYC reminder',
      message: 'Please upload or renew your KYC documents.',
      link: '/versotech_main/kyc-compliance',
      read: false,
      data: {
        kyc_subject_type: target.subjectType,
        kyc_subject_id: target.subjectId,
        kyc_submission_id: target.submissionId,
        kyc_subject_key: `${target.subjectType}:${target.subjectId}`,
      },
    }))

    const { error } = await createServiceClient()
      .from('notifications')
      .insert(payload)

    if (error) {
      redirect('/versotech_admin/agents?error=Failed%20to%20send%20reminders')
    }

    redirect('/versotech_admin/agents?success=KYC%20reminders%20sent')
  }

  return (
    <div className="p-6 space-y-8">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blacklist-modal-title"
            className="w-full max-w-3xl rounded-xl bg-background shadow-xl"
          >
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div>
                <p id="blacklist-modal-title" className="text-base font-semibold">
                  {editEntry ? 'Edit Blacklist Entry' : 'Add to Blacklist'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {editEntry
                    ? 'Update severity, status, or details.'
                    : 'Create a new blacklist entry for compliance review.'}
                </p>
              </div>
              <a
                href={baseHref}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </a>
            </div>
            <div className="px-6 py-5">
              <form action={editEntry ? updateBlacklistEntry : createBlacklistEntry} className="grid gap-3 md:grid-cols-2">
                {editEntry && <input type="hidden" name="entry_id" value={editEntry.id} />}
                <div>
                  <label className="text-xs text-muted-foreground">Full name</label>
                  <input
                    name="full_name"
                    defaultValue={editEntry?.full_name || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Entity name</label>
                  <input
                    name="entity_name"
                    defaultValue={editEntry?.entity_name || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <input
                    name="email"
                    defaultValue={editEntry?.email || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <input
                    name="phone"
                    defaultValue={editEntry?.phone || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tax ID</label>
                  <input
                    name="tax_id"
                    defaultValue={editEntry?.tax_id || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Severity</label>
                  <select
                    name="severity"
                    defaultValue={editEntry?.severity || 'warning'}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="warning">Warning</option>
                    <option value="blocked">Blocked</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <select
                    name="status"
                    defaultValue={editEntry?.status || 'active'}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="false_positive">False Positive</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reason</label>
                  <input
                    name="reason"
                    defaultValue={editEntry?.reason || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={editEntry?.notes || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    {editEntry ? 'Save changes' : 'Create entry'}
                  </button>
                  <a
                    href={baseHref}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Compliance Agents</h1>
        <p className="text-muted-foreground">
          Operational view of compliance agents, task coverage, and blacklist alerts.
        </p>
      </div>

      {agentsError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle>Unable to load agents</CardTitle>
            <CardDescription>{agentsError.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>Compliance Team</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {agents.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No agents found</CardTitle>
                <CardDescription>
                  Add entries to the agent registry to populate this section.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            agents.map((agent) => {
              const tasks = tasksByAgent[agent.id] ?? []
              const initials = getInitials(agent.name || 'Agent')
              return (
                <Card key={agent.id} className="border-muted/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {agent.avatar_url ? (
                            <img
                              src={agent.avatar_url}
                              alt={agent.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {initials || <UserCircle2 className="h-6 w-6" />}
                            </span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription>{agent.role}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email identity</span>
                        <span className="font-medium text-foreground">
                          {agent.email_identity || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tasks assigned</span>
                        <span className="font-medium text-foreground">{tasks.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-foreground">
                          {formatDate(agent.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {tasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No tasks assigned yet.</p>
                      ) : (
                        tasks.map((task) => (
                          <div key={task.task_code} className="flex items-center gap-2 text-xs">
                            <Badge variant={task.is_active ? 'secondary' : 'outline'}>
                              {task.task_code}
                            </Badge>
                            <span className="text-muted-foreground">{task.task_name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="h-4 w-4" />
          <span>Blacklist Alerts</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Blacklist Overview</CardTitle>
              <CardDescription>
                Automatic screening is on. Matches are logged here (no auto-blocking).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active entries</span>
                <span className="font-semibold">{blacklistCounts.total}</span>
              </div>
              <div className="space-y-2 text-sm">
                {(['warning', 'blocked', 'banned'] as const).map((severity) => (
                  <div key={severity} className="flex items-center justify-between">
                    <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', severityStyles[severity])}>
                      {severity}
                    </span>
                    <span className="font-medium">{blacklistCounts[severity]}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Blocking is disabled. Alerts are for review.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Last 20 blacklist matches recorded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blacklistMatches.length === 0 ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  No matches logged yet.
                </div>
              ) : (
                blacklistMatches.map((match) => {
                  const entry = unwrapEntry(match.compliance_blacklist)
                  const severity = entry?.severity || 'warning'
                  const displayName =
                    entry?.full_name ||
                    entry?.entity_name ||
                    entry?.email ||
                    entry?.phone ||
                    entry?.tax_id ||
                    'Unknown'
                  const confidenceLabel = formatConfidence(match.match_confidence)
                  return (
                    <div key={match.id} className="rounded-lg border border-muted/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', severityStyles[severity as BlacklistEntry['severity']])}>
                              {severity}
                            </span>
                            <span className="text-sm font-medium">{displayName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {matchTypeLabels[match.match_type] || match.match_type}
                            {confidenceLabel ? ` • ${confidenceLabel}` : ''}
                          </p>
                          {entry?.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {entry.reason}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(match.matched_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blacklist Entries</CardTitle>
            <CardDescription>
              Review active and resolved blacklist entries. Filters work across severity, status, and search.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(errorMessage || successMessage) && (
              <div
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm',
                  errorMessage ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
                )}
              >
                {errorMessage || successMessage}
              </div>
            )}

            <form className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
              <div>
                <label className="text-xs text-muted-foreground">Search</label>
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="Name, email, phone, tax id..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Severity</label>
                <select
                  name="severity"
                  defaultValue={severityFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="warning">Warning</option>
                  <option value="blocked">Blocked</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select
                  name="status"
                  defaultValue={statusFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="flex w-full gap-2">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Apply Filters
                  </button>
                  <a
                    href={modalHref}
                    className="w-full rounded-md border border-input px-4 py-2 text-center text-sm font-medium"
                  >
                    Add to Blacklist
                  </a>
                </div>
              </div>
            </form>

            {filteredEntries.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No blacklist entries match your filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => {
                  const displayName =
                    entry.full_name ||
                    entry.entity_name ||
                    entry.email ||
                    entry.phone ||
                    entry.tax_id ||
                    'Unknown'
                  const matchInfo = matchCounts[entry.id]
                  return (
                    <div key={entry.id} className="rounded-lg border border-muted/60 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', severityStyles[entry.severity])}>
                              {entry.severity}
                            </span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {entry.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm font-semibold">{displayName}</span>
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {entry.reason}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <div>Email: {entry.email || '—'}</div>
                            <div>Phone: {entry.phone || '—'}</div>
                            <div>Tax ID: {entry.tax_id || '—'}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            Matches logged: <span className="font-medium text-foreground">{matchInfo?.count ?? 0}</span>
                          </div>
                          <div>Last match: {matchInfo?.lastMatched ? formatDate(matchInfo.lastMatched) : '—'}</div>
                          <div>Reported: {entry.reported_at ? formatDate(entry.reported_at) : '—'}</div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <a
                              href={`${baseHref}${baseQueryString ? '&' : '?'}edit=${entry.id}`}
                              className="rounded-md border border-input px-2 py-1 text-xs font-medium"
                            >
                              Edit
                            </a>
                            <a
                              href={`${baseHref}${baseQueryString ? '&' : '?'}entry=${entry.id}`}
                              className="rounded-md border border-input px-2 py-1 text-xs font-medium"
                            >
                              View matches
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {entryToShowMatches && (
              <div className="rounded-lg border border-muted/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Match history</p>
                      <p className="text-xs text-muted-foreground">
                      {entryToShowMatches.full_name ||
                        entryToShowMatches.entity_name ||
                        entryToShowMatches.email ||
                        entryToShowMatches.phone ||
                        entryToShowMatches.tax_id ||
                        'Unknown'}
                    </p>
                  </div>
                  <a
                    href={baseHref}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </a>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedEntryMatches.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No matches logged for this entry.</div>
                  ) : (
                    selectedEntryMatches.map((match) => (
                      <div key={match.id} className="rounded-md border border-muted/60 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span>{matchTypeLabels[match.match_type] || match.match_type}</span>
                          <span className="text-muted-foreground">{formatDate(match.matched_at)}</span>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          Confidence: {formatConfidence(match.match_confidence) || '—'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserCircle2 className="h-4 w-4" />
          <span>KYC Monitor</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KYC Monitor</CardTitle>
            <CardDescription>
              Track submitted KYC documents across every persona. Reminders send in-app notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Total submissions</div>
                <div className="text-lg font-semibold">{kycCounts.total}</div>
              </div>
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Expiring soon</div>
                <div className="text-lg font-semibold">{kycCounts.expiring}</div>
              </div>
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Expired</div>
                <div className="text-lg font-semibold">{kycCounts.expired}</div>
              </div>
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Missing</div>
                <div className="text-lg font-semibold">{kycCounts.missing}</div>
              </div>
            </div>

            <form className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
              <input type="hidden" name="query" value={query} />
              <input type="hidden" name="severity" value={severityFilter} />
              <input type="hidden" name="status" value={statusFilter} />
              <div>
                <label className="text-xs text-muted-foreground">Search</label>
                <input
                  type="text"
                  name="kyc_query"
                  defaultValue={kycQuery}
                  placeholder="Name or document type..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Persona</label>
                <select
                  name="kyc_persona"
                  defaultValue={kycPersonaFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  {Object.entries(kycPersonaLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select
                  name="kyc_status"
                  defaultValue={kycStatusFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under review</option>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                  <option value="expiring_soon">Expiring soon</option>
                  <option value="expired">Expired</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Apply Filters
                </button>
              </div>
            </form>

            <form action={sendKycReminders} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Select rows to send reminders.</span>
                <button
                  type="submit"
                  className="rounded-md border border-input px-3 py-1 text-xs font-medium text-foreground"
                >
                  Send reminders
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-muted/60">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Select</th>
                      <th className="px-3 py-2 text-left">Subject</th>
                      <th className="px-3 py-2 text-left">Document</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Expiry</th>
                      <th className="px-3 py-2 text-left">Days</th>
                      <th className="px-3 py-2 text-left">Last reminder</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKycRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No KYC submissions match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredKycRows.map((row) => {
                        const statusLabel =
                          kycStatusLabels[row.derived_status] ||
                          row.derived_status.replace('_', ' ')
                        const statusClass = kycStatusStyles[row.derived_status] || 'bg-muted text-muted-foreground'
                        const targetValue = row.user_id
                          ? `${row.user_id}|${row.subject_type}|${row.subject_id}|${row.submission_id}`
                          : ''
                        const expiryDays = daysUntil(row.expiry_date)
                        return (
                          <tr key={row.submission_id} className="border-t">
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                name="targets"
                                value={targetValue}
                                disabled={!row.user_id}
                                className="h-4 w-4 rounded border-muted"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <div className="font-medium text-foreground">{row.subject_name}</div>
                              <div className="text-xs text-muted-foreground">{kycPersonaLabels[row.subject_type]}</div>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{row.document_label}</td>
                            <td className="px-3 py-3">
                              <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', statusClass)}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{formatDate(row.expiry_date)}</td>
                            <td className="px-3 py-3 text-muted-foreground">
                              {expiryDays === null ? '—' : `${expiryDays}d`}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{formatDate(row.last_reminder_at)}</td>
                            <td className="px-3 py-3">
                              <button
                                type="submit"
                                name="single_target"
                                value={targetValue}
                                disabled={!row.user_id}
                                className={cn(
                                  'rounded-md border border-input px-2 py-1 text-xs font-medium',
                                  !row.user_id && 'cursor-not-allowed opacity-50'
                                )}
                              >
                                Send reminder
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
