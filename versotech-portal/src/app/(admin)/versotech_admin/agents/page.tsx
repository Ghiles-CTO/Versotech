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
import { resolveAgentIdForTask } from '@/lib/agents'

type AgentRow = {
  id: string
  name: string
  role: string
  avatar_url: string | null
  email_identity: string | null
  description?: string | null
  system_prompt?: string | null
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
  reporter?: {
    id: string
    display_name: string | null
    email: string | null
  } | { id: string; display_name: string | null; email: string | null }[] | null
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

type RiskGradeRow = {
  code: string
  label: string | null
  points: number | null
  color: string | null
  sort_order: number | null
}

type InvestorRiskProfileRow = {
  investor_id: string
  country_risk_grade: string | null
  country_points: number | null
  pep_risk_points: number | null
  sanctions_risk_points: number | null
  total_risk_points: number | null
  composite_risk_grade: string | null
  calculated_at: string | null
  calculation_inputs: Record<string, any> | null
}

type DealRiskProfileRow = {
  deal_id: string
  country_risk_grade: string | null
  industry_risk_grade: string | null
  investment_type_risk_grade: string | null
  total_risk_points: number | null
  composite_risk_grade: string | null
  calculated_at: string | null
}

type RiskRow = {
  id: string
  risk_type: 'investor' | 'deal'
  name: string
  country: string | null
  sector: string | null
  investment_type: string | null
  grade_code: string | null
  grade_label: string | null
  points: number | null
  calculated_at: string | null
}

type ComplianceActivityRow = {
  id: string
  event_type: string | null
  description: string | null
  related_investor_id: string | null
  related_deal_id: string | null
  agent_id: string | null
  created_by: string | null
  created_at: string | null
  metadata: Record<string, any> | null
}

type OfacScreeningRow = {
  id: string
  screened_entity_type: string
  screened_entity_id: string | null
  screened_name: string
  screening_date: string | null
  result: 'clear' | 'potential_match' | 'match'
  match_details: string | null
  report_url: string | null
  created_by: string | null
  created_at: string | null
}

type ComplianceConversationRow = {
  id: string
  subject: string | null
  preview: string | null
  last_message_at: string | null
  created_at: string
  metadata: Record<string, any> | null
  conversation_participants?: Array<{
    user_id: string
    profiles?: {
      id?: string
      display_name?: string | null
      email?: string | null
    } | Array<{
      id?: string
      display_name?: string | null
      email?: string | null
    }> | null
  }>
}

const severityStyles: Record<BlacklistEntry['severity'], string> = {
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  blocked: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  banned: 'bg-red-500/10 text-red-700 dark:text-red-300',
}

const ofacResultStyles: Record<OfacScreeningRow['result'], string> = {
  clear: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  potential_match: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  match: 'bg-red-500/10 text-red-700 dark:text-red-300',
}

const riskGradeStyles: Record<string, string> = {
  A1: 'bg-emerald-700/15 text-emerald-800 dark:text-emerald-300',
  A2: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  A3: 'bg-green-500/10 text-green-700 dark:text-green-300',
  A4: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  B: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  C: 'bg-red-500/10 text-red-700 dark:text-red-300',
  D: 'bg-rose-700/15 text-rose-800 dark:text-rose-300',
  E: 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900',
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

const complianceEventOptions = [
  { value: 'risk_calculated', label: 'Risk calculated' },
  { value: 'blacklist_added', label: 'Blacklist entry added' },
  { value: 'blacklist_match', label: 'Blacklist match' },
  { value: 'document_expired', label: 'Document expired' },
  { value: 'reminder_sent', label: 'Reminder sent' },
  { value: 'nda_sent', label: 'NDA sent' },
  { value: 'nda_signed', label: 'NDA signed' },
  { value: 'ofac_screening', label: 'OFAC screening' },
  { value: 'agent_assignment_change', label: 'Agent assignment change' },
  { value: 'compliance_question', label: 'Compliance question' },
  { value: 'survey_sent', label: 'Survey sent' },
  { value: 'tax_update', label: 'Tax update' },
  { value: 'voting_event', label: 'Voting event' },
  { value: 'litigation_event', label: 'Litigation event' },
  { value: 'compliance_enquiry', label: 'Compliance enquiry' },
]

const complianceEventLabels = complianceEventOptions.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.value] = option.label
    return acc
  },
  {}
)

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

function resolveInvestorCountry(record: Record<string, any> | null | undefined) {
  if (!record) return null
  const type = typeof record.type === 'string' ? record.type.toLowerCase() : ''
  if (type === 'individual') {
    return pickFirst(record.residential_country, record.tax_residency, record.country)
  }
  return pickFirst(record.country_of_incorporation, record.registered_country, record.country)
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

  const activityTypeFilter =
    typeof resolvedSearchParams.activity_type === 'string' ? resolvedSearchParams.activity_type : 'all'
  const activityFromFilter =
    typeof resolvedSearchParams.activity_from === 'string' ? resolvedSearchParams.activity_from : ''
  const activityToFilter =
    typeof resolvedSearchParams.activity_to === 'string' ? resolvedSearchParams.activity_to : ''

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

  let activityQuery = supabase
    .from('compliance_activity_log')
    .select(
      'id, event_type, description, related_investor_id, related_deal_id, agent_id, created_by, created_at, metadata'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (activityTypeFilter !== 'all') {
    activityQuery = activityQuery.eq('event_type', activityTypeFilter)
  }

  if (activityFromFilter) {
    const fromDate = new Date(`${activityFromFilter}T00:00:00Z`)
    if (!Number.isNaN(fromDate.getTime())) {
      activityQuery = activityQuery.gte('created_at', fromDate.toISOString())
    }
  }

  if (activityToFilter) {
    const toDate = new Date(`${activityToFilter}T23:59:59Z`)
    if (!Number.isNaN(toDate.getTime())) {
      activityQuery = activityQuery.lte('created_at', toDate.toISOString())
    }
  }

  const [
    { data: agentsData, error: agentsError },
    { data: assignmentsData },
    { data: blacklistEntriesData },
    { data: blacklistMatchesData },
    { data: blacklistAllMatchesData },
    { data: selectedEntryMatchesData },
    { data: riskGradesData },
    { data: investorRiskProfilesData },
    { data: dealRiskProfilesData },
    { data: activityLogsData },
    { data: ofacScreeningsData },
    { data: complianceConversationsData },
  ] = await Promise.all([
    supabase
      .from('ai_agents')
      .select('id, name, role, avatar_url, email_identity, description, system_prompt, is_active, created_at')
      .order('created_at', { ascending: true }),
    supabase
      .from('agent_task_assignments')
      .select('agent_id, task_code, task_name, is_active')
      .order('task_code', { ascending: true }),
    supabase
      .from('compliance_blacklist')
      .select('id, severity, status, reason, full_name, entity_name, email, phone, tax_id, reported_at, reported_by, notes, reporter:reported_by (id, display_name, email)')
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
    supabase
      .from('risk_grades')
      .select('code, label, points, color, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('investor_risk_profiles_current')
      .select(
        'investor_id, country_risk_grade, country_points, pep_risk_points, sanctions_risk_points, total_risk_points, composite_risk_grade, calculated_at, calculation_inputs'
      )
      .order('calculated_at', { ascending: false })
      .limit(500),
    supabase
      .from('deal_risk_profiles')
      .select(
        'deal_id, country_risk_grade, industry_risk_grade, investment_type_risk_grade, total_risk_points, composite_risk_grade, calculated_at'
      )
      .order('calculated_at', { ascending: false })
      .limit(500),
    activityQuery,
    supabase
      .from('ofac_screenings')
      .select(
        'id, screened_entity_type, screened_entity_id, screened_name, screening_date, result, match_details, report_url, created_by, created_at'
      )
      .order('screening_date', { ascending: false })
      .limit(50),
    supabase
      .from('conversations')
      .select(
        'id, subject, preview, last_message_at, created_at, metadata, conversation_participants (user_id, profiles:user_id (id, display_name, email))'
      )
      .contains('metadata', { compliance: { flagged: true } })
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50),
  ])

  const agents: AgentRow[] = agentsData ?? []
  const assignments: TaskRow[] = assignmentsData ?? []
  const blacklistEntries: BlacklistEntry[] = blacklistEntriesData ?? []
  const blacklistMatches: BlacklistMatch[] = blacklistMatchesData ?? []
  const allBlacklistMatches = blacklistAllMatchesData ?? []
  const selectedEntryMatches = selectedEntryMatchesData ?? []
  const riskGrades: RiskGradeRow[] = riskGradesData ?? []
  const investorRiskProfiles: InvestorRiskProfileRow[] = investorRiskProfilesData ?? []
  const dealRiskProfilesRaw: DealRiskProfileRow[] = dealRiskProfilesData ?? []
  const activityLogs: ComplianceActivityRow[] = activityLogsData ?? []
  const ofacScreenings: OfacScreeningRow[] = ofacScreeningsData ?? []
  const complianceConversations: ComplianceConversationRow[] = complianceConversationsData ?? []

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
      .from('investor_notifications')
      .select('id, user_id, created_at, data')
      .eq('type', 'kyc')
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  const riskGradeMap = new Map<string, RiskGradeRow>()
  riskGrades.forEach((grade) => {
    if (grade.code) {
      riskGradeMap.set(grade.code, grade)
    }
  })

  const latestDealRiskMap = new Map<string, DealRiskProfileRow>()
  dealRiskProfilesRaw.forEach((profile) => {
    if (!profile.deal_id) return
    if (!latestDealRiskMap.has(profile.deal_id)) {
      latestDealRiskMap.set(profile.deal_id, profile)
    }
  })

  const dealRiskProfiles = Array.from(latestDealRiskMap.values())

  const riskInvestorIds = new Set<string>()
  investorRiskProfiles.forEach((profile) => {
    if (profile.investor_id) riskInvestorIds.add(profile.investor_id)
  })

  const riskDealIds = new Set<string>()
  dealRiskProfiles.forEach((profile) => {
    if (profile.deal_id) riskDealIds.add(profile.deal_id)
  })

  const [
    { data: riskInvestorsData },
    { data: riskDealsData },
  ] = await Promise.all([
    fetchByIds(
      'investors',
      'id, legal_name, display_name, representative_name, first_name, middle_name, last_name, name_suffix, type, residential_country, tax_residency, country, country_of_incorporation, registered_country',
      riskInvestorIds
    ),
    fetchByIds(
      'deals',
      'id, name, location, sector, stock_type, deal_type, vehicle_id',
      riskDealIds
    ),
  ])

  const riskVehicleIds = new Set<string>()
  ;(riskDealsData ?? []).forEach((deal) => {
    if (deal.vehicle_id) riskVehicleIds.add(deal.vehicle_id as string)
  })

  const { data: riskVehiclesData } = await fetchByIds(
    'vehicles',
    'id, type',
    riskVehicleIds
  )

  const tasksByAgent = assignments.reduce<Record<string, TaskRow[]>>((acc, task) => {
    if (!acc[task.agent_id]) acc[task.agent_id] = []
    acc[task.agent_id].push(task)
    return acc
  }, {})

  const agentsById = agents.reduce<Record<string, AgentRow>>((acc, agent) => {
    acc[agent.id] = agent
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

  const riskInvestorMap = new Map<string, Record<string, any>>()
  ;(riskInvestorsData ?? []).forEach((record) => {
    if (record?.id) {
      riskInvestorMap.set(record.id as string, record as Record<string, any>)
    }
  })

  const riskDealMap = new Map<string, Record<string, any>>()
  ;(riskDealsData ?? []).forEach((record) => {
    if (record?.id) {
      riskDealMap.set(record.id as string, record as Record<string, any>)
    }
  })

  const vehicleTypeMap = new Map<string, string>()
  ;(riskVehiclesData ?? []).forEach((record) => {
    if (record?.id && record?.type) {
      vehicleTypeMap.set(record.id as string, record.type as string)
    }
  })

  const riskRows: RiskRow[] = []

  investorRiskProfiles.forEach((profile) => {
    if (!profile.investor_id) return
    const investor = riskInvestorMap.get(profile.investor_id)
    const name = pickFirst(
      investor?.legal_name,
      investor?.display_name,
      investor?.representative_name,
      formatPersonName(investor || {})
    )
    const gradeInfo = profile.composite_risk_grade
      ? riskGradeMap.get(profile.composite_risk_grade)
      : null
    riskRows.push({
      id: profile.investor_id,
      risk_type: 'investor',
      name: name || 'Unknown Investor',
      country: resolveInvestorCountry(investor),
      sector: null,
      investment_type: null,
      grade_code: profile.composite_risk_grade,
      grade_label: gradeInfo?.label ?? null,
      points: profile.total_risk_points ?? null,
      calculated_at: profile.calculated_at ?? null,
    })
  })

  dealRiskProfiles.forEach((profile) => {
    if (!profile.deal_id) return
    const deal = riskDealMap.get(profile.deal_id)
    const vehicleType = deal?.vehicle_id ? vehicleTypeMap.get(deal.vehicle_id as string) : null
    const investmentType = pickFirst(vehicleType, deal?.stock_type, deal?.deal_type)
    const gradeInfo = profile.composite_risk_grade
      ? riskGradeMap.get(profile.composite_risk_grade)
      : null
    riskRows.push({
      id: profile.deal_id,
      risk_type: 'deal',
      name: (deal?.name as string | undefined) || 'Unknown Deal',
      country: (deal?.location as string | undefined) || null,
      sector: (deal?.sector as string | undefined) || null,
      investment_type: investmentType,
      grade_code: profile.composite_risk_grade,
      grade_label: gradeInfo?.label ?? null,
      points: profile.total_risk_points ?? null,
      calculated_at: profile.calculated_at ?? null,
    })
  })

  const riskCounts = riskRows.reduce(
    (acc, row) => {
      acc.total += 1
      const grade = row.grade_code
      if (!grade) {
        acc.pending += 1
      } else if (['C', 'D', 'E'].includes(grade)) {
        acc.high += 1
      } else if (['B', 'A4'].includes(grade)) {
        acc.elevated += 1
      } else {
        acc.low += 1
      }
      return acc
    },
    { total: 0, high: 0, elevated: 0, low: 0, pending: 0 }
  )

  const highRiskInvestorCount = riskRows.filter(
    (row) => row.risk_type === 'investor' && ['C', 'D', 'E'].includes(row.grade_code ?? '')
  ).length

  const activeBlacklistCount = blacklistEntries.filter((entry) => entry.status === 'active').length
  const expiringDocsCount = kycCounts.expiring + kycCounts.expired
  const pendingKycCount = kycRows.filter((row) =>
    ['pending', 'under_review', 'draft', 'missing'].includes(row.derived_status)
  ).length
  const pendingReviewCount = pendingKycCount + activeBlacklistCount
  const todayKey = new Date().toDateString()
  const alertsRaisedToday = activityLogs.filter((log) => {
    const createdAt = log.created_at ? new Date(log.created_at) : null
    return createdAt && createdAt.toDateString() === todayKey
  }).length
  const automationEventTypes = new Set(['risk_calculated', 'reminder_sent', 'nda_signed', 'ofac_screening'])
  const automationsCompleted = activityLogs.filter((log) => {
    if (!log.event_type || !automationEventTypes.has(log.event_type)) return false
    const createdAt = log.created_at ? new Date(log.created_at) : null
    return createdAt && createdAt.toDateString() === todayKey
  }).length
  const pendingTasksCount = pendingReviewCount

  const investorNameMap = new Map<string, string>()
  const dealNameMap = new Map<string, string>()
  riskRows.forEach((row) => {
    if (row.risk_type === 'investor') {
      investorNameMap.set(row.id, row.name)
    } else {
      dealNameMap.set(row.id, row.name)
    }
  })

  const agentNameMap = new Map<string, string>()
  agents.forEach((agent) => {
    agentNameMap.set(agent.id, agent.name)
  })

  const investorOptions = Array.from(investorNameMap.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  )
  const dealOptions = Array.from(dealNameMap.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  )

  const activityRows = activityLogs.map((log) => {
    const metadata = log.metadata ?? {}
    const eventLabel = log.event_type ? complianceEventLabels[log.event_type] : null
    const actorLabel =
      metadata.actor_name ||
      metadata.actor_email ||
      (log.created_by ? `User ${log.created_by.slice(0, 6)}` : 'System')
    const agentLabel =
      (log.agent_id ? agentNameMap.get(log.agent_id) : null) ||
      metadata.agent_name ||
      '—'
    const entityLabel =
      (log.related_investor_id ? investorNameMap.get(log.related_investor_id) : null) ||
      (log.related_deal_id ? dealNameMap.get(log.related_deal_id) : null) ||
      metadata.entity_name ||
      '—'

    return {
      id: log.id,
      time: log.created_at,
      event: eventLabel || log.event_type || 'Activity',
      description: log.description || metadata.description || '—',
      actor: actorLabel,
      agent: agentLabel,
      entity: entityLabel,
    }
  })

  const investorRiskProfileMap = new Map<string, InvestorRiskProfileRow>()
  investorRiskProfiles.forEach((profile) => {
    if (profile.investor_id) {
      investorRiskProfileMap.set(profile.investor_id, profile)
    }
  })

  const dealRiskProfileMap = new Map<string, DealRiskProfileRow>()
  dealRiskProfiles.forEach((profile) => {
    if (profile.deal_id) {
      dealRiskProfileMap.set(profile.deal_id, profile)
    }
  })

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
  const ofacDefaultName =
    typeof resolvedSearchParams.ofac_name === 'string' ? resolvedSearchParams.ofac_name : ''
  const ofacDefaultEntityType =
    typeof resolvedSearchParams.ofac_entity_type === 'string' ? resolvedSearchParams.ofac_entity_type : ''
  const ofacDefaultEntityId =
    typeof resolvedSearchParams.ofac_entity_id === 'string' ? resolvedSearchParams.ofac_entity_id : ''
  const tabParam = getParam('tab')
  const activeTab = ['risk', 'blacklist', 'kyc', 'activity'].includes(tabParam)
    ? tabParam
    : 'risk'
  const riskQuery =
    typeof resolvedSearchParams.risk_query === 'string' ? normalizeQuery(resolvedSearchParams.risk_query) : ''
  const riskTypeFilter =
    typeof resolvedSearchParams.risk_type === 'string' ? resolvedSearchParams.risk_type : 'all'
  const riskGradeFilter =
    typeof resolvedSearchParams.risk_grade === 'string' ? resolvedSearchParams.risk_grade : 'all'
  const [riskDetailType, riskDetailId] =
    typeof resolvedSearchParams.risk === 'string' && resolvedSearchParams.risk.includes(':')
      ? resolvedSearchParams.risk.split(':')
      : ['', '']
  const selectedRiskRow = riskDetailType && riskDetailId
    ? riskRows.find(
        (row) => row.risk_type === riskDetailType && row.id === riskDetailId
      )
    : null
  const selectedInvestorProfile = selectedRiskRow?.risk_type === 'investor'
    ? investorRiskProfileMap.get(selectedRiskRow.id)
    : null
  const selectedDealProfile = selectedRiskRow?.risk_type === 'deal'
    ? dealRiskProfileMap.get(selectedRiskRow.id)
    : null
  const baseParams = new URLSearchParams()
  if (query) baseParams.set('query', query)
  if (severityFilter !== 'all') baseParams.set('severity', severityFilter)
  if (statusFilter !== 'all') baseParams.set('status', statusFilter)
  if (kycQuery) baseParams.set('kyc_query', kycQuery)
  if (kycStatusFilter !== 'all') baseParams.set('kyc_status', kycStatusFilter)
  if (kycPersonaFilter !== 'all') baseParams.set('kyc_persona', kycPersonaFilter)
  if (riskQuery) baseParams.set('risk_query', riskQuery)
  if (riskTypeFilter !== 'all') baseParams.set('risk_type', riskTypeFilter)
  if (riskGradeFilter !== 'all') baseParams.set('risk_grade', riskGradeFilter)
  if (activityTypeFilter !== 'all') baseParams.set('activity_type', activityTypeFilter)
  if (activityFromFilter) baseParams.set('activity_from', activityFromFilter)
  if (activityToFilter) baseParams.set('activity_to', activityToFilter)
  if (activeTab !== 'risk') baseParams.set('tab', activeTab)
  const baseQueryString = baseParams.toString()
  const baseHref = baseQueryString ? `/versotech_admin/agents?${baseQueryString}` : '/versotech_admin/agents'
  const activityParams = new URLSearchParams(baseParams)
  activityParams.set('tab', 'activity')
  const activityBaseHref = `/versotech_admin/agents?${activityParams.toString()}`
  const blacklistModalHref = `${baseHref}${baseQueryString ? '&' : '?'}mode=new`
  const ofacModalHref = `${baseHref}${baseQueryString ? '&' : '?'}mode=ofac`
  const tabHref = (tabKey: string) => {
    const params = new URLSearchParams(baseParams)
    if (tabKey === 'risk') {
      params.delete('tab')
    } else {
      params.set('tab', tabKey)
    }
    const queryString = params.toString()
    return queryString ? `/versotech_admin/agents?${queryString}` : '/versotech_admin/agents'
  }

  const filteredEntries = blacklistEntries.filter((entry) => {
    if (severityFilter !== 'all' && entry.severity !== severityFilter) return false
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false
    if (!matchQuery(entry, query)) return false
    return true
  })

  const riskGradeOptions = riskGrades.filter((grade) => Boolean(grade.code))
  const filteredRiskRows = riskRows.filter((row) => {
    if (riskTypeFilter !== 'all' && row.risk_type !== riskTypeFilter) return false
    if (riskGradeFilter !== 'all' && row.grade_code !== riskGradeFilter) return false
    if (riskQuery) {
      const haystack = [
        row.name,
        row.country,
        row.sector,
        row.investment_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(riskQuery)) return false
    }
    return true
  })

  const sortedRiskRows = [...filteredRiskRows].sort((a, b) => {
    const aPoints = typeof a.points === 'number' ? a.points : -1
    const bPoints = typeof b.points === 'number' ? b.points : -1
    if (aPoints !== bPoints) return bPoints - aPoints
    const aTime = a.calculated_at ? new Date(a.calculated_at).getTime() : 0
    const bTime = b.calculated_at ? new Date(b.calculated_at).getTime() : 0
    return bTime - aTime
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
  const showBlacklistModal = mode === 'new' || Boolean(editEntry)
  const showOfacModal = mode === 'ofac'

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

    const supabase = createServiceClient()
    const entryPayload = {
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
    }

    const { error } = await supabase
      .from('compliance_blacklist')
      .insert(entryPayload)

    const returnTo = formData.get('return_to')
    const redirectTarget =
      typeof returnTo === 'string' && returnTo.length ? returnTo : '/versotech_admin/agents'
    const separator = redirectTarget.includes('?') ? '&' : '?'

    if (error) {
      redirect(`${redirectTarget}${separator}error=${encodeURIComponent('Failed to create blacklist entry')}`)
    }

    try {
      const agentId = await resolveAgentIdForTask(supabase, 'U003')
      await supabase.from('compliance_activity_log').insert({
        event_type: 'blacklist_added',
        description: entryPayload.reason || 'Blacklist entry created',
        agent_id: agentId,
        created_by: currentUser.id,
        metadata: {
          severity,
          status,
          full_name: entryPayload.full_name,
          entity_name: entryPayload.entity_name,
          email: entryPayload.email,
          phone: entryPayload.phone,
          tax_id: entryPayload.tax_id,
        },
      })
    } catch (logError) {
      console.error('[compliance] Failed to log blacklist entry:', logError)
    }

    redirect(`${redirectTarget}${separator}success=Blacklist%20entry%20created`)
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

    const returnTo = formData.get('return_to')
    const redirectTarget =
      typeof returnTo === 'string' && returnTo.length ? returnTo : '/versotech_admin/agents'
    const separator = redirectTarget.includes('?') ? '&' : '?'

    if (error) {
      redirect(`${redirectTarget}${separator}error=${encodeURIComponent('Failed to update blacklist entry')}`)
    }

    redirect(`${redirectTarget}${separator}success=Blacklist%20entry%20updated`)
  }

  const recalculateRiskProfile = async (formData: FormData) => {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/versotech_main/login')
    }
    const isAllowed = currentUser.role === 'ceo' || currentUser.permissions?.includes('super_admin')
    if (!isAllowed) {
      redirect('/versotech_admin/agents?error=Not%20authorized')
    }

    const riskType = formData.get('risk_type')
    const targetId = formData.get('target_id')
    const returnTo = formData.get('return_to')

    if (typeof riskType !== 'string' || typeof targetId !== 'string' || !targetId) {
      redirect('/versotech_admin/agents?error=Invalid%20risk%20target')
    }

    const supabase = createServiceClient()
    const rpcName = riskType === 'deal' ? 'calculate_deal_risk' : 'calculate_investor_risk'
    const rpcArgs =
      riskType === 'deal' ? { p_deal_id: targetId } : { p_investor_id: targetId }

    const { error } = (await supabase.rpc(rpcName, rpcArgs)) as unknown as { error?: { message?: string } }
    const redirectTarget =
      typeof returnTo === 'string' && returnTo.length ? returnTo : '/versotech_admin/agents'
    const separator = redirectTarget.includes('?') ? '&' : '?'

    if (error) {
      redirect(
        `${redirectTarget}${separator}error=${encodeURIComponent(
          error.message || 'Failed to recalculate risk'
        )}`
      )
    }

    try {
      const agentId = await resolveAgentIdForTask(supabase, 'U002')
      await supabase.from('compliance_activity_log').insert({
        event_type: 'risk_calculated',
        description: `Risk recalculated (${riskType})`,
        related_investor_id: riskType === 'deal' ? null : targetId,
        related_deal_id: riskType === 'deal' ? targetId : null,
        agent_id: agentId,
        created_by: currentUser.id,
        metadata: {
          risk_type: riskType,
          target_id: targetId,
          action: 'manual_recalculate',
        },
      })

      let riskGrade: string | null = null
      if (riskType === 'deal') {
        const { data: dealRisk } = await supabase
          .from('deal_risk_profiles')
          .select('composite_risk_grade')
          .eq('deal_id', targetId)
          .order('calculated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        riskGrade = dealRisk?.composite_risk_grade ?? null
      } else {
        const { data: investorRisk } = await supabase
          .from('investor_risk_profiles_current')
          .select('composite_risk_grade')
          .eq('investor_id', targetId)
          .maybeSingle()
        riskGrade = investorRisk?.composite_risk_grade ?? null
      }

      if (riskGrade && ['C', 'D', 'E'].includes(riskGrade)) {
        const { data: ceoUsers } = await supabase.from('ceo_users').select('user_id')
        const notifications = (ceoUsers ?? []).map((ceo) => ({
          user_id: ceo.user_id,
          title: `High risk ${riskType} detected`,
          message: `A ${riskType} was recalculated at grade ${riskGrade}. Review the risk profile for next steps.`,
          link: `/versotech_admin/agents?tab=risk&risk=${riskType}:${targetId}`,
          agent_id: agentId,
          type: 'risk_alert',
          metadata: {
            risk_type: riskType,
            target_id: targetId,
            grade: riskGrade,
          },
        }))

        if (notifications.length) {
          await supabase.from('investor_notifications').insert(notifications)
        }
      }
    } catch (logError) {
      console.error('[compliance] Failed to log risk recalculation:', logError)
    }

    redirect(`${redirectTarget}${separator}success=Risk%20recalculated`)
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
      investor_id: null,
      type: 'kyc',
      title: 'KYC reminder',
      message: 'Please upload or renew your KYC documents.',
      link: '/versotech_main/kyc-compliance',
      created_by: currentUser.id,
      data: {
        kyc_subject_type: target.subjectType,
        kyc_subject_id: target.subjectId,
        kyc_submission_id: target.submissionId,
        kyc_subject_key: `${target.subjectType}:${target.subjectId}`,
      },
    }))

    const supabase = createServiceClient()
    const agentId = await resolveAgentIdForTask(supabase, 'V002')
    const { error } = await supabase
      .from('investor_notifications')
      .insert(
        payload.map((entry) => ({
          ...entry,
          agent_id: agentId,
        }))
      )

    const returnTo = formData.get('return_to')
    const redirectTarget =
      typeof returnTo === 'string' && returnTo.length ? returnTo : '/versotech_admin/agents'
    const separator = redirectTarget.includes('?') ? '&' : '?'

    if (error) {
      redirect(`${redirectTarget}${separator}error=Failed%20to%20send%20reminders`)
    }

    try {
      const subjectTypes = Array.from(new Set(parsedTargets.map((target) => target.subjectType)))
      await supabase.from('compliance_activity_log').insert({
        event_type: 'reminder_sent',
        description: `KYC reminders sent (${parsedTargets.length})`,
        agent_id: agentId,
        created_by: currentUser.id,
        metadata: {
          reminder_count: parsedTargets.length,
          subject_types: subjectTypes,
        },
      })
    } catch (logError) {
      console.error('[compliance] Failed to log KYC reminders:', logError)
    }

    redirect(`${redirectTarget}${separator}success=KYC%20reminders%20sent`)
  }

  const createComplianceEvent = async (formData: FormData) => {
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

    const eventType = readText('event_type')
    if (!eventType) {
      redirect('/versotech_admin/agents?tab=activity&error=Missing%20event%20type')
    }

    const description = readText('description')
    const relatedInvestorId = readText('related_investor_id')
    const relatedDealId = readText('related_deal_id')
    const agentOverride = readText('agent_id')
    const requestedChange = readText('requested_change')
    const urgency = readText('urgency')
    const requesterPersona = readText('requester_persona')

    const taskMap: Record<string, string> = {
      risk_calculated: 'U002',
      blacklist_added: 'U003',
      blacklist_match: 'U003',
      document_expired: 'V002',
      reminder_sent: 'V002',
      nda_sent: 'V001',
      nda_signed: 'V001',
      ofac_screening: 'U001',
      compliance_question: 'W001',
      compliance_enquiry: 'W003',
      survey_sent: 'V003',
      tax_update: 'W002',
      voting_event: 'W002',
      litigation_event: 'W002',
    }

    const supabase = createServiceClient()
    let agentId = agentOverride
    if (!agentId) {
      agentId = await resolveAgentIdForTask(supabase, taskMap[eventType])
    }

    const metadata = {
      actor_name: currentUser.displayName || currentUser.email,
      actor_email: currentUser.email,
      actor_role: currentUser.role,
      requested_change: requestedChange,
      urgency,
      requester_persona: requesterPersona,
    }

    const { data: newEvent, error } = await supabase
      .from('compliance_activity_log')
      .insert({
        event_type: eventType,
        description: description || complianceEventLabels[eventType] || 'Compliance event',
        related_investor_id: relatedInvestorId,
        related_deal_id: relatedDealId,
        agent_id: agentId,
        created_by: currentUser.id,
        metadata,
      })
      .select('id')
      .single()

    const returnTo = formData.get('return_to')
    const redirectTarget =
      typeof returnTo === 'string' && returnTo.length ? returnTo : '/versotech_admin/agents?tab=activity'
    const separator = redirectTarget.includes('?') ? '&' : '?'

    if (error) {
      redirect(`${redirectTarget}${separator}error=Failed%20to%20log%20event`)
    }

    if (eventType === 'compliance_enquiry') {
      const { data: ceoUsers } = await supabase.from('ceo_users').select('user_id')
      const notifications = (ceoUsers ?? []).map((ceo) => ({
        user_id: ceo.user_id,
        investor_id: null,
        title: 'Compliance enquiry logged',
        message: description || 'A new compliance enquiry was submitted.',
        link: '/versotech_admin/agents?tab=activity',
        type: 'general',
        agent_id: agentId,
        data: {
          compliance_event_id: newEvent?.id ?? null,
          event_type: eventType,
          urgency,
        },
      }))

      if (notifications.length) {
        await supabase.from('investor_notifications').insert(notifications)
      }
    }

    redirect(`${redirectTarget}${separator}success=Compliance%20event%20logged`)
  }

  const createOfacScreening = async (formData: FormData) => {
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

    const screenedName = readText('screened_name')
    if (!screenedName) {
      redirect('/versotech_admin/agents?tab=blacklist&error=Missing%20screened%20name')
    }

    const screenedEntityType = readText('screened_entity_type') || 'investor'
    const screenedEntityId = readText('screened_entity_id')
    const result = (readText('result') || 'clear') as OfacScreeningRow['result']
    const matchDetails = readText('match_details')
    const reportUrl = readText('report_url')

    const supabase = createServiceClient()

    const { data: newScreening, error } = await supabase
      .from('ofac_screenings')
      .insert({
        screened_entity_type: screenedEntityType,
        screened_entity_id: screenedEntityId,
        screened_name: screenedName,
        result,
        match_details: matchDetails,
        report_url: reportUrl,
        created_by: currentUser.id,
      })
      .select('id')
      .single()

    const returnTo = formData.get('return_to')
    const redirectTarget =
      typeof returnTo === 'string' && returnTo.length ? returnTo : '/versotech_admin/agents?tab=blacklist'
    const separator = redirectTarget.includes('?') ? '&' : '?'

    if (error) {
      redirect(`${redirectTarget}${separator}error=Failed%20to%20log%20OFAC%20screening`)
    }

    try {
      const agentId = await resolveAgentIdForTask(supabase, 'U001')
      await supabase.from('compliance_activity_log').insert({
        event_type: 'ofac_screening',
        description: `OFAC screening (${result}) - ${screenedName}`,
        agent_id: agentId,
        created_by: currentUser.id,
        metadata: {
          ofac_screening_id: newScreening?.id ?? null,
          screened_entity_type: screenedEntityType,
          screened_entity_id: screenedEntityId,
          result,
        },
      })

      if (result === 'match') {
        const isEntity = screenedEntityType.includes('entity')
        const { data: blacklistEntry } = await supabase
          .from('compliance_blacklist')
          .insert({
            full_name: isEntity ? null : screenedName,
            entity_name: isEntity ? screenedName : null,
            reason: 'OFAC screening match',
            severity: 'blocked',
            source: 'ofac',
            status: 'active',
            reported_by: currentUser.id,
          })
          .select('id')
          .single()

        await supabase.from('compliance_activity_log').insert({
          event_type: 'blacklist_added',
          description: `Auto-blocked from OFAC match: ${screenedName}`,
          agent_id: agentId,
          created_by: currentUser.id,
          metadata: {
            ofac_screening_id: newScreening?.id ?? null,
            blacklist_entry_id: blacklistEntry?.id ?? null,
          },
        })

        const { data: ceoUsers } = await supabase.from('ceo_users').select('user_id')
        const notifications = (ceoUsers ?? []).map((ceo) => ({
          user_id: ceo.user_id,
          investor_id: null,
          title: 'OFAC match detected',
          message: `${screenedName} matched the OFAC list and was added to the blacklist.`,
          link: '/versotech_admin/agents?tab=blacklist',
          type: 'general',
          agent_id: agentId,
          data: {
            ofac_screening_id: newScreening?.id ?? null,
            blacklist_entry_id: blacklistEntry?.id ?? null,
          },
        }))

        if (notifications.length) {
          await supabase.from('investor_notifications').insert(notifications)
        }
      }
    } catch (logError) {
      console.error('[compliance] Failed to log OFAC screening:', logError)
    }

    redirect(`${redirectTarget}${separator}success=OFAC%20screening%20logged`)
  }

  const updateTaskAssignment = async (formData: FormData) => {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/versotech_main/login')
    }
    const isAllowed = currentUser.role === 'ceo' || currentUser.permissions?.includes('super_admin')
    if (!isAllowed) {
      redirect('/versotech_admin/agents?error=Not%20authorized')
    }

    const taskCode = formData.get('task_code')
    const agentId = formData.get('agent_id')
    if (typeof taskCode !== 'string' || !taskCode) {
      redirect('/versotech_admin/agents?error=Invalid%20task')
    }
    if (typeof agentId !== 'string' || !agentId) {
      redirect('/versotech_admin/agents?error=Invalid%20agent')
    }

    const supabase = createServiceClient()
    const { data: existingAssignment } = await supabase
      .from('agent_task_assignments')
      .select('agent_id, task_name')
      .eq('task_code', taskCode)
      .maybeSingle()

    const { error } = await supabase
      .from('agent_task_assignments')
      .update({ agent_id: agentId })
      .eq('task_code', taskCode)

    if (error) {
      redirect('/versotech_admin/agents?error=Failed%20to%20update%20assignment')
    }

    if (existingAssignment?.agent_id !== agentId) {
      try {
        await supabase.from('compliance_activity_log').insert({
          event_type: 'agent_assignment_change',
          description: `Assignment updated for ${existingAssignment?.task_name || taskCode}`,
          agent_id: agentId,
          created_by: currentUser.id,
          metadata: {
            task_code: taskCode,
            task_name: existingAssignment?.task_name ?? null,
            from_agent_id: existingAssignment?.agent_id ?? null,
            to_agent_id: agentId,
          },
        })
      } catch (logError) {
        console.error('[compliance] Failed to log assignment change:', logError)
      }
    }

    const returnTo = formData.get('return_to')
    const redirectTarget =
      typeof returnTo === 'string' && returnTo.length ? returnTo : '/versotech_admin/agents'
    const separator = redirectTarget.includes('?') ? '&' : '?'

    redirect(`${redirectTarget}${separator}success=Assignment%20updated`)
  }

  return (
    <div className="p-6 space-y-8">
      {showBlacklistModal && (
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
                <input type="hidden" name="return_to" value={baseHref} />
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
      {showOfacModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ofac-modal-title"
            className="w-full max-w-3xl rounded-xl bg-background shadow-xl"
          >
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div>
                <p id="ofac-modal-title" className="text-base font-semibold">
                  Log OFAC Screening
                </p>
                <p className="text-xs text-muted-foreground">
                  Record a manual OFAC check and upload report details.
                </p>
              </div>
              <a
                href={tabHref('blacklist')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </a>
            </div>
            <div className="px-6 py-5">
              <form action={createOfacScreening} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="return_to" value={tabHref('blacklist')} />
                <div>
                  <label className="text-xs text-muted-foreground">Screened name</label>
                  <input
                    name="screened_name"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={ofacDefaultName}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Entity type</label>
                  <select
                    name="screened_entity_type"
                    defaultValue={ofacDefaultEntityType || 'investor'}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="investor">Investor</option>
                    <option value="investor_member">Investor member</option>
                    <option value="counterparty_entity">Counterparty entity</option>
                    <option value="counterparty_member">Counterparty member</option>
                    <option value="partner">Partner</option>
                    <option value="partner_member">Partner member</option>
                    <option value="introducer">Introducer</option>
                    <option value="introducer_member">Introducer member</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="lawyer_member">Lawyer member</option>
                    <option value="commercial_partner">Commercial partner</option>
                    <option value="commercial_partner_member">Commercial partner member</option>
                    <option value="arranger_entity">Arranger entity</option>
                    <option value="arranger_member">Arranger member</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Entity ID (optional)</label>
                  <input
                    name="screened_entity_id"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={ofacDefaultEntityId}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Result</label>
                  <select
                    name="result"
                    defaultValue="clear"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="clear">Clear</option>
                    <option value="potential_match">Potential match</option>
                    <option value="match">Match</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Report URL (optional)</label>
                  <input
                    name="report_url"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Match details</label>
                  <textarea
                    name="match_details"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Log screening
                  </button>
                  <a
                    href={tabHref('blacklist')}
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
                    {agent.description && (
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    )}
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
          <Bot className="h-4 w-4" />
          <span>Task Assignments</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Agent Task Routing</CardTitle>
            <CardDescription>
              Assign each compliance task to the agent responsible for it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No task assignments found.
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((task) => (
                  <form
                    key={task.task_code}
                    action={updateTaskAssignment}
                    className="grid gap-3 md:grid-cols-[1fr_240px_auto] items-center rounded-lg border border-muted/60 p-3"
                  >
                    <input type="hidden" name="return_to" value={baseHref} />
                    <input type="hidden" name="task_code" value={task.task_code} />
                    <div>
                      <div className="text-sm font-semibold text-foreground">{task.task_code}</div>
                      <div className="text-xs text-muted-foreground">{task.task_name}</div>
                    </div>
                    <select
                      name="agent_id"
                      defaultValue={task.agent_id}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} {agent.is_active ? '' : '(Inactive)'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-md border border-input px-3 py-2 text-sm font-medium"
                    >
                      Update
                    </button>
                  </form>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-muted/60 p-4 text-sm">
            <div className="text-muted-foreground">Pending tasks</div>
            <div className="text-2xl font-semibold">{pendingTasksCount}</div>
          </div>
          <div className="rounded-lg border border-muted/60 p-4 text-sm">
            <div className="text-muted-foreground">Alerts raised today</div>
            <div className="text-2xl font-semibold">{alertsRaisedToday}</div>
          </div>
          <div className="rounded-lg border border-muted/60 p-4 text-sm">
            <div className="text-muted-foreground">Automations completed</div>
            <div className="text-2xl font-semibold">{automationsCompleted}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-muted/60 p-4 text-sm">
            <div className="text-muted-foreground">High risk investors</div>
            <div className="text-2xl font-semibold">{highRiskInvestorCount}</div>
          </div>
          <div className="rounded-lg border border-muted/60 p-4 text-sm">
            <div className="text-muted-foreground">Expiring documents</div>
            <div className="text-2xl font-semibold">{expiringDocsCount}</div>
          </div>
          <div className="rounded-lg border border-muted/60 p-4 text-sm">
            <div className="text-muted-foreground">Blacklist alerts</div>
            <div className="text-2xl font-semibold">{activeBlacklistCount}</div>
          </div>
          <div className="rounded-lg border border-muted/60 p-4 text-sm">
            <div className="text-muted-foreground">Pending reviews</div>
            <div className="text-2xl font-semibold">{pendingReviewCount}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'risk', label: 'Risk Profiles' },
            { key: 'blacklist', label: 'Blacklist' },
            { key: 'kyc', label: 'KYC Monitor' },
            { key: 'activity', label: 'Activity Log' },
          ].map((tab) => (
            <a
              key={tab.key}
              href={tabHref(tab.key)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium border border-transparent',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'border-input text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </section>

      {activeTab === 'risk' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Risk Profiles</span>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Risk Profiles</CardTitle>
            <CardDescription>
              Investor and deal risk scores from the risk matrix. Scores do not block workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-5">
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Total profiles</div>
                <div className="text-lg font-semibold">{riskCounts.total}</div>
              </div>
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">High risk</div>
                <div className="text-lg font-semibold">{riskCounts.high}</div>
              </div>
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Elevated</div>
                <div className="text-lg font-semibold">{riskCounts.elevated}</div>
              </div>
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Low risk</div>
                <div className="text-lg font-semibold">{riskCounts.low}</div>
              </div>
              <div className="rounded-lg border border-muted/60 p-3 text-sm">
                <div className="text-muted-foreground">Pending</div>
                <div className="text-lg font-semibold">{riskCounts.pending}</div>
              </div>
            </div>

            <form className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
              <input type="hidden" name="query" value={query} />
              <input type="hidden" name="severity" value={severityFilter} />
              <input type="hidden" name="status" value={statusFilter} />
              <input type="hidden" name="kyc_query" value={kycQuery} />
              <input type="hidden" name="kyc_status" value={kycStatusFilter} />
              <input type="hidden" name="kyc_persona" value={kycPersonaFilter} />
              <input type="hidden" name="tab" value={activeTab} />
              <div>
                <label className="text-xs text-muted-foreground">Search</label>
                <input
                  type="text"
                  name="risk_query"
                  defaultValue={riskQuery}
                  placeholder="Name, country, sector..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Type</label>
                <select
                  name="risk_type"
                  defaultValue={riskTypeFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="investor">Investors</option>
                  <option value="deal">Deals</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Grade</label>
                <select
                  name="risk_grade"
                  defaultValue={riskGradeFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  {riskGradeOptions.map((grade) => (
                    <option key={grade.code} value={grade.code}>
                      {grade.code} {grade.label ? `- ${grade.label}` : ''}
                    </option>
                  ))}
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

            {selectedRiskRow && (
              <div className="rounded-lg border border-muted/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">Risk breakdown</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedRiskRow.name} • {selectedRiskRow.risk_type}
                    </div>
                  </div>
                  <a
                    href={baseHref}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </a>
                </div>

                {selectedRiskRow.risk_type === 'investor' && (
                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">Country input</div>
                      <div className="font-medium text-foreground">
                        {selectedInvestorProfile?.calculation_inputs?.country_input ||
                          selectedRiskRow.country ||
                          '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Country grade: {selectedInvestorProfile?.country_risk_grade || '—'} •{' '}
                        {selectedInvestorProfile?.country_points ?? '—'} pts
                      </div>
                    </div>
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">PEP & sanctions</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        PEP points: {selectedInvestorProfile?.pep_risk_points ?? '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sanctions points: {selectedInvestorProfile?.sanctions_risk_points ?? '—'}
                      </div>
                    </div>
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">Total points</div>
                      <div className="text-lg font-semibold">
                        {selectedInvestorProfile?.total_risk_points ?? '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Grade: {selectedInvestorProfile?.composite_risk_grade || '—'}
                      </div>
                    </div>
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">Last calculated</div>
                      <div className="text-sm font-medium">{formatDate(selectedInvestorProfile?.calculated_at)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Source: {selectedInvestorProfile?.calculation_inputs?.source || 'calculate_investor_risk'}
                      </div>
                    </div>
                  </div>
                )}

                {selectedRiskRow.risk_type === 'deal' && (
                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">Country / Location</div>
                      <div className="font-medium text-foreground">
                        {selectedRiskRow.country || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Country grade: {selectedDealProfile?.country_risk_grade || '—'} •{' '}
                        {selectedDealProfile?.country_risk_grade
                          ? riskGradeMap.get(selectedDealProfile.country_risk_grade)?.points ?? '—'
                          : '—'}{' '}
                        pts
                      </div>
                    </div>
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">Industry</div>
                      <div className="font-medium text-foreground">
                        {selectedRiskRow.sector || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Industry grade: {selectedDealProfile?.industry_risk_grade || '—'} •{' '}
                        {selectedDealProfile?.industry_risk_grade
                          ? riskGradeMap.get(selectedDealProfile.industry_risk_grade)?.points ?? '—'
                          : '—'}{' '}
                        pts
                      </div>
                    </div>
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">Investment type</div>
                      <div className="font-medium text-foreground">
                        {selectedRiskRow.investment_type || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Investment grade: {selectedDealProfile?.investment_type_risk_grade || '—'} •{' '}
                        {selectedDealProfile?.investment_type_risk_grade
                          ? riskGradeMap.get(selectedDealProfile.investment_type_risk_grade)?.points ?? '—'
                          : '—'}{' '}
                        pts
                      </div>
                    </div>
                    <div className="rounded-md border border-muted/60 p-3">
                      <div className="text-xs text-muted-foreground">Total points</div>
                      <div className="text-lg font-semibold">
                        {selectedDealProfile?.total_risk_points ?? selectedRiskRow.points ?? '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Grade: {selectedDealProfile?.composite_risk_grade || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last calculated: {formatDate(selectedDealProfile?.calculated_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-muted/60">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Country / Location</th>
                    <th className="px-3 py-2 text-left">Sector</th>
                    <th className="px-3 py-2 text-left">Investment Type</th>
                    <th className="px-3 py-2 text-left">Risk Grade</th>
                    <th className="px-3 py-2 text-left">Points</th>
                    <th className="px-3 py-2 text-left">Last Calculated</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRiskRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No risk profiles match your filters.
                      </td>
                    </tr>
                  ) : (
                    sortedRiskRows.map((row) => {
                      const detailHref =
                        row.risk_type === 'investor'
                          ? `/versotech_main/investors/${row.id}`
                          : `/versotech_main/deals/${row.id}`
                      const breakdownHref = `${baseHref}${baseQueryString ? '&' : '?'}risk=${row.risk_type}:${row.id}`
                      const gradeStyle = row.grade_code ? riskGradeStyles[row.grade_code] : ''
                      return (
                        <tr key={`${row.risk_type}-${row.id}`} className="border-t">
                          <td className="px-3 py-3">
                            <Badge variant="outline" className="text-xs capitalize">
                              {row.risk_type}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            <a href={breakdownHref} className="font-medium text-foreground hover:underline">
                              {row.name}
                            </a>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {row.country || '—'}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {row.sector || '—'}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {row.investment_type || '—'}
                          </td>
                          <td className="px-3 py-3">
                            {row.grade_code ? (
                              <span
                                className={cn(
                                  'rounded-md px-2 py-0.5 text-xs font-medium',
                                  gradeStyle || 'bg-muted text-muted-foreground'
                                )}
                              >
                                {row.grade_code}
                              </span>
                            ) : (
                              <span className="rounded-md border border-input px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                Pending
                              </span>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {row.grade_label || 'Not yet calculated'}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {row.points ?? '—'}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {formatDate(row.calculated_at)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={detailHref}
                                className="rounded-md border border-input px-2 py-1 text-xs font-medium"
                              >
                                View
                              </a>
                              <a
                                href={breakdownHref}
                                className="rounded-md border border-input px-2 py-1 text-xs font-medium"
                              >
                                Breakdown
                              </a>
                              <form action={recalculateRiskProfile}>
                                <input type="hidden" name="risk_type" value={row.risk_type} />
                                <input type="hidden" name="target_id" value={row.id} />
                                <input type="hidden" name="return_to" value={baseHref} />
                                <button
                                  type="submit"
                                  className="rounded-md border border-input px-2 py-1 text-xs font-medium"
                                >
                                  Recalculate
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OFAC Screenings</CardTitle>
            <CardDescription>
              Manual OFAC checks recorded by the compliance team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ofacScreenings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No OFAC screenings logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-muted/60">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Entity Type</th>
                      <th className="px-3 py-2 text-left">Result</th>
                      <th className="px-3 py-2 text-left">Screened</th>
                      <th className="px-3 py-2 text-left">Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ofacScreenings.map((screening) => (
                      <tr key={screening.id} className="border-t">
                        <td className="px-3 py-3">
                          <div className="font-medium text-foreground">
                            {screening.screened_name}
                          </div>
                          {screening.match_details && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {screening.match_details}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {screening.screened_entity_type.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              'rounded-md px-2 py-0.5 text-xs font-medium',
                              ofacResultStyles[screening.result]
                            )}
                          >
                            {screening.result.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {formatDate(screening.screening_date)}
                        </td>
                        <td className="px-3 py-3">
                          {screening.report_url ? (
                            <a
                              href={screening.report_url}
                              className="text-xs font-medium text-primary hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              View report
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      )}

      {activeTab === 'blacklist' && (
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
              <input type="hidden" name="kyc_query" value={kycQuery} />
              <input type="hidden" name="kyc_status" value={kycStatusFilter} />
              <input type="hidden" name="kyc_persona" value={kycPersonaFilter} />
              <input type="hidden" name="risk_query" value={riskQuery} />
              <input type="hidden" name="risk_type" value={riskTypeFilter} />
              <input type="hidden" name="risk_grade" value={riskGradeFilter} />
              <input type="hidden" name="tab" value={activeTab} />
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
                <div className="flex w-full flex-col gap-2 md:flex-row">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Apply Filters
                  </button>
                  <a
                    href={blacklistModalHref}
                    className="w-full rounded-md border border-input px-4 py-2 text-center text-sm font-medium"
                  >
                    Add to Blacklist
                  </a>
                  <a
                    href={ofacModalHref}
                    className="w-full rounded-md border border-input px-4 py-2 text-center text-sm font-medium"
                  >
                    Log OFAC Screening
                  </a>
                </div>
              </div>
            </form>

            {filteredEntries.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No blacklist entries match your filters.
              </div>
            ) : (
              <div className="rounded-lg border border-muted/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name / Email</th>
                      <th className="px-3 py-2 text-left font-medium">Severity</th>
                      <th className="px-3 py-2 text-left font-medium">Reason</th>
                      <th className="px-3 py-2 text-left font-medium">Reported By</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEntries.map((entry) => {
                      const displayName =
                        entry.full_name ||
                        entry.entity_name ||
                        entry.email ||
                        entry.phone ||
                        entry.tax_id ||
                        'Unknown'
                      const matchInfo = matchCounts[entry.id]
                      const reporterRecord = Array.isArray(entry.reporter)
                        ? entry.reporter[0]
                        : entry.reporter
                      const reporterLabel =
                        reporterRecord?.display_name ||
                        reporterRecord?.email ||
                        (entry.reported_by ? 'Unknown' : 'System')
                      return (
                        <tr key={entry.id} className="bg-background">
                          <td className="px-3 py-3">
                            <div className="font-medium text-foreground">{displayName}</div>
                            <div className="text-xs text-muted-foreground">
                              {entry.email || '—'}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1">
                              Matches: {matchInfo?.count ?? 0}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', severityStyles[entry.severity])}>
                              {entry.severity}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">
                            {entry.reason || '—'}
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">
                            {reporterLabel}
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">
                            {entry.reported_at ? formatDate(entry.reported_at) : '—'}
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" className="text-xs capitalize">
                              {entry.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <a
                                href={`${baseHref}${baseQueryString ? '&' : '?'}edit=${entry.id}`}
                                className="rounded-md border border-input px-2 py-1 font-medium"
                              >
                                Edit
                              </a>
                              <a
                                href={`${baseHref}${baseQueryString ? '&' : '?'}entry=${entry.id}`}
                                className="rounded-md border border-input px-2 py-1 font-medium"
                              >
                                Matches
                              </a>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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
      )}

      {activeTab === 'kyc' && (
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
              <input type="hidden" name="risk_query" value={riskQuery} />
              <input type="hidden" name="risk_type" value={riskTypeFilter} />
              <input type="hidden" name="risk_grade" value={riskGradeFilter} />
              <input type="hidden" name="tab" value={activeTab} />
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
              <input type="hidden" name="return_to" value={baseHref} />
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
      )}

      {activeTab === 'activity' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>Activity Log</span>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle>Compliance Q&A</CardTitle>
                  <CardDescription>
                    Conversations tagged for compliance review and follow-up.
                  </CardDescription>
                </div>
                <a
                  href="/versotech_main/messages?compliance=true"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Open chat
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {complianceConversations.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No compliance conversations flagged yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-muted/60">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Conversation</th>
                        <th className="px-3 py-2 text-left">Participants</th>
                        <th className="px-3 py-2 text-left">Urgency</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Assigned agent</th>
                        <th className="px-3 py-2 text-left">Flagged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceConversations.map((conversation) => {
                        const compliance = (conversation.metadata as Record<string, any>)?.compliance || {}
                        const status = compliance.status || (compliance.flagged ? 'open' : 'unknown')
                        const urgency = compliance.urgency || 'medium'
                        const assignedAgent = compliance.assigned_agent_id
                          ? agentsById[compliance.assigned_agent_id]
                          : null
                        const participants = (conversation.conversation_participants || [])
                          .map((participant) => {
                            const profile = Array.isArray(participant.profiles)
                              ? participant.profiles[0]
                              : participant.profiles
                            return profile?.display_name || profile?.email
                          })
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(', ')
                        return (
                          <tr key={conversation.id} className="border-t">
                            <td className="px-3 py-3">
                              <div className="font-medium text-foreground">
                                {conversation.subject || 'Untitled conversation'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {conversation.preview || '—'}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">
                              {participants || '—'}
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant="secondary" className="capitalize">
                                {urgency}
                              </Badge>
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant="outline" className="capitalize">
                                {status}
                              </Badge>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">
                              {assignedAgent?.name || 'Auto (Wayne)'}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">
                              {formatDate(compliance.flagged_at || conversation.last_message_at || conversation.created_at)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Compliance Event</CardTitle>
              <CardDescription>
                Capture compliance actions, enquiries, and updates that are not auto-recorded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createComplianceEvent} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="return_to" value={activityBaseHref} />
                <div>
                  <label className="text-xs text-muted-foreground">Event type</label>
                  <select
                    name="event_type"
                    defaultValue=""
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="" disabled>
                      Select event
                    </option>
                    {complianceEventOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Assigned agent</label>
                  <select
                    name="agent_id"
                    defaultValue=""
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Auto-assign (based on task)</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Add context for the compliance log..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Related investor</label>
                  <select
                    name="related_investor_id"
                    defaultValue=""
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {investorOptions.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Related deal</label>
                  <select
                    name="related_deal_id"
                    defaultValue=""
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {dealOptions.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Requester persona</label>
                  <input
                    name="requester_persona"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Investor, staff, introducer..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Urgency</label>
                  <select
                    name="urgency"
                    defaultValue=""
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Not set</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Requested change</label>
                  <input
                    name="requested_change"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Module, form, process..."
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    Log event
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Activity</CardTitle>
              <CardDescription>
                Latest compliance-related actions captured in the activity log.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                action="/versotech_admin/agents"
                method="get"
                className="flex flex-wrap items-end gap-3 rounded-lg border border-muted/60 bg-muted/20 p-3 text-sm"
              >
                <input type="hidden" name="tab" value="activity" />
                <div>
                  <label className="text-xs text-muted-foreground">Event type</label>
                  <select
                    name="activity_type"
                    defaultValue={activityTypeFilter}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                  >
                    <option value="all">All events</option>
                    {complianceEventOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <input
                    type="date"
                    name="activity_from"
                    defaultValue={activityFromFilter}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <input
                    type="date"
                    name="activity_to"
                    defaultValue={activityToFilter}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                </div>
                <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  Apply filters
                </button>
              </form>
              {activityRows.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No compliance activity logged yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-muted/60">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">When</th>
                        <th className="px-3 py-2 text-left">Event</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-left">Entity</th>
                        <th className="px-3 py-2 text-left">Agent</th>
                        <th className="px-3 py-2 text-left">Actor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityRows.map((row) => (
                        <tr key={row.id} className="border-t">
                          <td className="px-3 py-3 text-muted-foreground">
                            {formatDate(row.time)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-foreground">{row.event}</div>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{row.description}</td>
                          <td className="px-3 py-3 text-muted-foreground">{row.entity}</td>
                          <td className="px-3 py-3 text-muted-foreground">{row.agent}</td>
                          <td className="px-3 py-3 text-muted-foreground">{row.actor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
