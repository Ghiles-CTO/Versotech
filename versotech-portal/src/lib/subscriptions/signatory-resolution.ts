import type { SupabaseClient } from '@supabase/supabase-js'

type RawInvestorMember = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  role_title: string | null
  is_signatory: boolean | null
  can_sign?: boolean | null
  linked_user_id: string | null
}

export type ResolvedSubscriptionSigner = {
  id: string
  full_name: string
  email: string
  role: string
  role_title?: string
  is_signatory: boolean
  is_primary: boolean
  member_id: string | null
  email_source: 'member' | 'linked_profile' | 'investor_primary'
}

export type SubscriptionSignerValidationIssue = {
  code: 'missing_signer_email' | 'missing_signer_name' | 'missing_signer_selection'
  signer_id: string | null
  signer_name: string
  message: string
}

export type ResolveSubscriptionSignersResult = {
  signers: ResolvedSubscriptionSigner[]
  issues: SubscriptionSignerValidationIssue[]
  has_designated_signatories: boolean
  requires_multi_signatory: boolean
}

type ResolveSubscriptionSignersParams = {
  supabase: SupabaseClient<any>
  investorId: string
  investorType?: string | null
  investorName?: string | null
  investorEmail?: string | null
  selectedMemberIds?: string[] | null
}

function readNonEmptyString(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function dedupeValues(values: string[] | null | undefined): string[] {
  if (!Array.isArray(values)) return []
  const seen = new Set<string>()
  const deduped: string[] = []

  for (const value of values) {
    const trimmed = readNonEmptyString(value)
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    deduped.push(trimmed)
  }

  return deduped
}

async function loadInvestorMembers(
  supabase: SupabaseClient<any>,
  investorId: string
): Promise<Array<RawInvestorMember>> {
  const { data, error } = await supabase
    .from('investor_members')
    .select('id, full_name, email, role, role_title, is_signatory, can_sign, linked_user_id')
    .eq('investor_id', investorId)
    .eq('is_active', true)
    .order('is_signatory', { ascending: false })
    .order('full_name', { ascending: true })

  if (error) {
    throw error
  }

  return (data || []) as Array<RawInvestorMember>
}

async function loadProfileEmails(
  supabase: SupabaseClient<any>,
  userIds: string[]
): Promise<Map<string, string>> {
  const linkedUserIds = dedupeValues(userIds)
  const emailMap = new Map<string, string>()

  if (linkedUserIds.length === 0) {
    return emailMap
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', linkedUserIds)

  if (error) {
    throw error
  }

  for (const profile of data || []) {
    const email = readNonEmptyString(profile.email)
    if (email) {
      emailMap.set(profile.id, email)
    }
  }

  return emailMap
}

function buildMissingSignerIssue(member: RawInvestorMember): SubscriptionSignerValidationIssue {
  return {
    code: 'missing_signer_email',
    signer_id: member.id,
    signer_name: readNonEmptyString(member.full_name) || 'Unknown signatory',
    message: `Signatory "${readNonEmptyString(member.full_name) || 'Unknown signatory'}" is missing an email on both the member record and linked user profile.`,
  }
}

export async function resolveSubscriptionSigners(
  params: ResolveSubscriptionSignersParams
): Promise<ResolveSubscriptionSignersResult> {
  const {
    supabase,
    investorId,
    investorName,
    investorEmail,
    selectedMemberIds,
  } = params

  const members = await loadInvestorMembers(supabase, investorId)
  const memberIds = dedupeValues(selectedMemberIds)
  const profileEmails = await loadProfileEmails(
    supabase,
    members.map((member) => member.linked_user_id || '')
  )

  const issues: SubscriptionSignerValidationIssue[] = []
  const signers: ResolvedSubscriptionSigner[] = []
  const selectedOrder = new Map(memberIds.map((id, index) => [id, index]))

  const designatedMembers = memberIds.length > 0
    ? members.filter((member) => selectedOrder.has(member.id))
    : members.filter((member) => Boolean(member.is_signatory || member.can_sign))

  if (memberIds.length > 0 && designatedMembers.length !== memberIds.length) {
    const resolvedIds = new Set(designatedMembers.map((member) => member.id))
    for (const memberId of memberIds) {
      if (resolvedIds.has(memberId)) continue
      issues.push({
        code: 'missing_signer_selection',
        signer_id: memberId,
        signer_name: 'Unknown signatory',
        message: `Selected signatory "${memberId}" could not be found on the investor.`,
      })
    }
  }

  if (designatedMembers.length > 0) {
    designatedMembers
      .sort((left, right) => {
        if (memberIds.length === 0) return 0
        return (selectedOrder.get(left.id) ?? 0) - (selectedOrder.get(right.id) ?? 0)
      })
      .forEach((member) => {
        const memberEmail = readNonEmptyString(member.email)
        const linkedProfileEmail = member.linked_user_id
          ? profileEmails.get(member.linked_user_id) || null
          : null
        const resolvedEmail = memberEmail || linkedProfileEmail

        if (!readNonEmptyString(member.full_name)) {
          issues.push({
            code: 'missing_signer_name',
            signer_id: member.id,
            signer_name: 'Unknown signatory',
            message: `Signatory "${member.id}" is missing a full name.`,
          })
          return
        }

        if (!resolvedEmail) {
          issues.push(buildMissingSignerIssue(member))
          return
        }

        signers.push({
          id: member.id,
          member_id: member.id,
          full_name: readNonEmptyString(member.full_name)!,
          email: resolvedEmail,
          role: readNonEmptyString(member.role) || 'authorized_signatory',
          role_title: readNonEmptyString(member.role_title) || undefined,
          is_signatory: Boolean(member.is_signatory || member.can_sign),
          is_primary: false,
          email_source: memberEmail ? 'member' : 'linked_profile',
        })
      })
  } else {
    const primaryName = readNonEmptyString(investorName)
    const primaryEmail = readNonEmptyString(investorEmail)

    if (!primaryName) {
      issues.push({
        code: 'missing_signer_name',
        signer_id: null,
        signer_name: 'Primary investor',
        message: 'Primary investor signer is missing a name.',
      })
    }

    if (!primaryEmail) {
      issues.push({
        code: 'missing_signer_email',
        signer_id: null,
        signer_name: primaryName || 'Primary investor',
        message: `Primary investor signer "${primaryName || 'Primary investor'}" is missing an email.`,
      })
    }

    if (primaryName && primaryEmail) {
      signers.push({
        id: 'investor_primary',
        member_id: null,
        full_name: primaryName,
        email: primaryEmail,
        role: 'primary',
        role_title: 'Primary Contact',
        is_signatory: true,
        is_primary: true,
        email_source: 'investor_primary',
      })
    }
  }

  return {
    signers,
    issues,
    has_designated_signatories: designatedMembers.length > 0,
    requires_multi_signatory: signers.length > 1,
  }
}
