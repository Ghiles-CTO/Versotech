import { SupabaseClient } from '@supabase/supabase-js'

type FetchMemberWithAutoLinkParams = {
  supabase: SupabaseClient<any>
  memberTable: string
  entityIdColumn: string
  entityId: string
  userId: string
  userEmail?: string | null
  defaultFullName?: string | null
  /**
   * If true, create a minimal member row when no linked or email-matching member exists.
   * Intended for individual personas where a signed-in user must always have a personal KYC record.
   */
  createIfMissing?: boolean
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
  defaultFullName,
  createIfMissing = false,
  select,
  context,
}: FetchMemberWithAutoLinkParams): Promise<FetchMemberWithAutoLinkResult> {
  const baseQuery = () =>
    supabase
      .from(memberTable)
      .select(select)
      .eq(entityIdColumn, entityId)
      .eq('is_active', true)

  const fetchExistingLinkedMember = async () => {
    const { data, error } = await baseQuery()
      .eq('linked_user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    return { data, error }
  }

  const { data: linkedMember, error: linkedError } = await baseQuery()
    .eq('linked_user_id', userId)
    .maybeSingle()

  if (linkedError) {
    return { member: null, error: linkedError, autoLinked: false }
  }

  if (linkedMember) {
    return { member: linkedMember, error: null, autoLinked: false }
  }

  const normalizedEmail = userEmail?.trim().toLowerCase()
  if (!normalizedEmail) {
    if (!createIfMissing) {
      return { member: null, error: null, autoLinked: false }
    }
  }

  if (normalizedEmail) {
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
    if (safeCandidates.length === 1) {
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

      if (linkedRow) {
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

      // Concurrent tab/request may have linked this user just before our update.
      const { data: racedLinked, error: racedLinkedError } = await fetchExistingLinkedMember()
      if (racedLinkedError) {
        return { member: null, error: racedLinkedError, autoLinked: false }
      }
      if (racedLinked) {
        return { member: racedLinked, error: null, autoLinked: false }
      }
    } else if (safeCandidates.length > 1) {
      console.warn(`[${context}] Skipped auto-link: multiple unlinked members matched email`, {
        memberTable,
        entityId,
        userId,
      })
    }
  }

  if (!createIfMissing) {
    return { member: null, error: null, autoLinked: false }
  }

  // Safe fallback: if exactly one active unlinked member exists, link that row.
  const { data: unlinkedMembers, error: unlinkedError } = await supabase
    .from(memberTable)
    .select('id')
    .eq(entityIdColumn, entityId)
    .eq('is_active', true)
    .is('linked_user_id', null)
    .limit(2)

  if (unlinkedError) {
    return { member: null, error: unlinkedError, autoLinked: false }
  }

  const safeUnlinkedMembers = unlinkedMembers || []
  if (safeUnlinkedMembers.length === 1) {
    const memberToLink = safeUnlinkedMembers[0]
    const { data: linkedRow, error: linkError } = await supabase
      .from(memberTable)
      .update({
        linked_user_id: userId,
        email: normalizedEmail || null,
      })
      .eq('id', memberToLink.id)
      .is('linked_user_id', null)
      .select('id')
      .maybeSingle()

    if (linkError) {
      return { member: null, error: linkError, autoLinked: false }
    }

    if (linkedRow) {
      const { data: fetchedLinked, error: fetchLinkedError } = await baseQuery()
        .eq('id', memberToLink.id)
        .maybeSingle()

      if (fetchLinkedError) {
        return { member: null, error: fetchLinkedError, autoLinked: false }
      }

      console.info(`[${context}] Auto-linked sole unlinked member`, {
        memberTable,
        entityId,
        userId,
      })

      return { member: fetchedLinked || null, error: null, autoLinked: true }
    }

    // Concurrent tab/request may have linked this user just before our update.
    const { data: racedLinked, error: racedLinkedError } = await fetchExistingLinkedMember()
    if (racedLinkedError) {
      return { member: null, error: racedLinkedError, autoLinked: false }
    }
    if (racedLinked) {
      return { member: racedLinked, error: null, autoLinked: false }
    }
  } else if (safeUnlinkedMembers.length > 1) {
    // Do not block login/onboarding when an entity already has multiple members.
    // In this case we create a dedicated member linked to the current portal user.
    console.info(`[${context}] Multiple unlinked active members found; creating a dedicated linked member`, {
      memberTable,
      entityId,
      userId,
    })
  }

  const inferredName =
    defaultFullName?.trim() ||
    (normalizedEmail ? normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ').trim() : '') ||
    'Entity Member'
  const nameParts = inferredName.split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] || 'Entity'
  const lastName = nameParts.slice(1).join(' ') || null

  const { data: insertedMember, error: insertError } = await supabase
    .from(memberTable)
    .insert({
      [entityIdColumn]: entityId,
      linked_user_id: userId,
      email: normalizedEmail || null,
      role: 'authorized_signatory',
      first_name: firstName,
      last_name: lastName,
      full_name: inferredName,
      is_active: true,
      kyc_status: 'pending',
      effective_from: new Date().toISOString().split('T')[0],
      created_by: userId,
    })
    .select('id')
    .maybeSingle()

  if (insertError) {
    return { member: null, error: insertError, autoLinked: false }
  }

  if (!insertedMember?.id) {
    return { member: null, error: null, autoLinked: false }
  }

  const { data: createdMember, error: createdMemberError } = await baseQuery()
    .eq('id', insertedMember.id)
    .maybeSingle()

  if (createdMemberError) {
    return { member: null, error: createdMemberError, autoLinked: false }
  }

  console.info(`[${context}] Auto-created member for linked user`, {
    memberTable,
    entityId,
    memberId: insertedMember.id,
    userId,
  })

  return { member: createdMember || null, error: null, autoLinked: true }
}
