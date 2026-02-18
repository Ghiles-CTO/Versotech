import { SupabaseClient } from '@supabase/supabase-js'

type FetchMemberWithAutoLinkParams = {
  supabase: SupabaseClient<any>
  memberTable: string
  entityIdColumn: string
  entityId: string
  userId: string
  userEmail?: string | null
  select: string
  context: string
}

type FetchMemberWithAutoLinkResult = {
  member: any | null
  error: any | null
  autoLinked: boolean
}

/**
 * Resolve a member linked to the current user, with a safe email-based fallback.
 * Fallback only links when exactly one active, unlinked member matches the user's email.
 */
export async function fetchMemberWithAutoLink({
  supabase,
  memberTable,
  entityIdColumn,
  entityId,
  userId,
  userEmail,
  select,
  context,
}: FetchMemberWithAutoLinkParams): Promise<FetchMemberWithAutoLinkResult> {
  const baseQuery = () =>
    supabase
      .from(memberTable)
      .select(select)
      .eq(entityIdColumn, entityId)
      .eq('is_active', true)

  const { data: linkedMember, error: linkedError } = await baseQuery()
    .eq('linked_user_id', userId)
    .maybeSingle()

  if (linkedError) {
    return { member: null, error: linkedError, autoLinked: false }
  }

  if (linkedMember) {
    return { member: linkedMember, error: null, autoLinked: false }
  }

  const normalizedEmail = userEmail?.trim()
  if (!normalizedEmail) {
    return { member: null, error: null, autoLinked: false }
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from(memberTable)
    .select(`id, email`)
    .eq(entityIdColumn, entityId)
    .eq('is_active', true)
    .is('linked_user_id', null)
    .ilike('email', normalizedEmail)
    .limit(2)

  if (candidatesError) {
    return { member: null, error: candidatesError, autoLinked: false }
  }

  const safeCandidates = candidates || []
  if (safeCandidates.length !== 1) {
    if (safeCandidates.length > 1) {
      console.warn(`[${context}] Skipped auto-link: multiple unlinked members matched email`, {
        memberTable,
        entityId,
        userId,
      })
    }
    return { member: null, error: null, autoLinked: false }
  }

  const candidate = safeCandidates[0]
  const { data: linkedRow, error: linkError } = await supabase
    .from(memberTable)
    .update({ linked_user_id: userId })
    .eq('id', candidate.id)
    .is('linked_user_id', null)
    .select('id')
    .maybeSingle()

  if (linkError) {
    return { member: null, error: linkError, autoLinked: false }
  }

  if (!linkedRow) {
    return { member: null, error: null, autoLinked: false }
  }

  const { data: fetchedLinked, error: fetchLinkedError } = await baseQuery()
    .eq('id', candidate.id)
    .maybeSingle()

  if (fetchLinkedError) {
    return { member: null, error: fetchLinkedError, autoLinked: false }
  }

  console.info(`[${context}] Auto-linked member by email`, {
    memberTable,
    entityId,
    memberId: candidate.id,
    userId,
  })

  return { member: fetchedLinked || null, error: null, autoLinked: true }
}
