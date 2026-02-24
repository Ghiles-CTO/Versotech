import type { SupabaseClient } from '@supabase/supabase-js'

type NullableString = string | null | undefined

export interface IntroducerFallbackInfo {
  legal_name?: NullableString
  display_name?: NullableString
  first_name?: NullableString
  last_name?: NullableString
  email?: NullableString
  user_id?: NullableString
}

export interface ResolvedIntroducerSignatory {
  user_id: string | null
  email: string
  name: string
  source: 'member' | 'legacy_user' | 'entity_fallback'
}

type ProfileShape = {
  email?: NullableString
  display_name?: NullableString
}

function asProfile(profile: unknown): ProfileShape | null {
  if (!profile) return null
  if (Array.isArray(profile)) {
    const first = profile[0]
    return first && typeof first === 'object' ? (first as ProfileShape) : null
  }
  if (typeof profile === 'object') {
    return profile as ProfileShape
  }
  return null
}

function clean(value: NullableString): string {
  return typeof value === 'string' ? value.trim() : ''
}

function buildName(options: {
  fullName?: NullableString
  firstName?: NullableString
  lastName?: NullableString
  profileDisplayName?: NullableString
  fallbackDisplayName?: NullableString
  fallbackLegalName?: NullableString
  fallbackFirstName?: NullableString
  fallbackLastName?: NullableString
  defaultLabel: string
}) {
  const structured = [clean(options.firstName), clean(options.lastName)].filter(Boolean).join(' ')
  const fallbackStructured = [clean(options.fallbackFirstName), clean(options.fallbackLastName)]
    .filter(Boolean)
    .join(' ')

  return (
    clean(options.fullName) ||
    structured ||
    clean(options.profileDisplayName) ||
    clean(options.fallbackDisplayName) ||
    clean(options.fallbackLegalName) ||
    fallbackStructured ||
    options.defaultLabel
  )
}

function dedupeSignatories(signatories: ResolvedIntroducerSignatory[]): ResolvedIntroducerSignatory[] {
  const seen = new Set<string>()
  const result: ResolvedIntroducerSignatory[] = []

  for (const signatory of signatories) {
    const key = signatory.email.toLowerCase()
    if (!key) continue
    if (seen.has(key)) continue
    seen.add(key)
    result.push(signatory)
  }

  return result
}

export async function resolveIntroducerSignatories(params: {
  supabase: SupabaseClient
  introducerId: string
  introducer?: IntroducerFallbackInfo | null
  maxSignatories?: number
}): Promise<ResolvedIntroducerSignatory[]> {
  const {
    supabase,
    introducerId,
    introducer = null,
    maxSignatories = 5,
  } = params

  const fallback = introducer || {}
  const raw: ResolvedIntroducerSignatory[] = []

  // Preferred source: introducer_members (authoritative for signatories).
  const { data: memberSignatories } = await supabase
    .from('introducer_members')
    .select(`
      id,
      full_name,
      first_name,
      last_name,
      email,
      linked_user_id,
      profiles:linked_user_id (
        email,
        display_name
      )
    `)
    .eq('introducer_id', introducerId)
    .eq('is_active', true)
    .eq('is_signatory', true)
    .order('created_at', { ascending: true })

  if (memberSignatories && memberSignatories.length > 0) {
    for (const member of memberSignatories as Array<Record<string, unknown>>) {
      const profile = asProfile(member.profiles)
      const email = clean((member.email as NullableString) || profile?.email || fallback.email)
      if (!email) continue

      raw.push({
        user_id: clean(member.linked_user_id as NullableString) || null,
        email,
        name: buildName({
          fullName: member.full_name as NullableString,
          firstName: member.first_name as NullableString,
          lastName: member.last_name as NullableString,
          profileDisplayName: profile?.display_name,
          fallbackDisplayName: fallback.display_name,
          fallbackLegalName: fallback.legal_name,
          fallbackFirstName: fallback.first_name,
          fallbackLastName: fallback.last_name,
          defaultLabel: 'Introducer Signatory',
        }),
        source: 'member',
      })
    }
  }

  // Legacy fallback: introducer_users.can_sign
  if (raw.length === 0) {
    const { data: legacyUsers } = await supabase
      .from('introducer_users')
      .select(`
        user_id,
        is_primary,
        can_sign,
        profiles:user_id (
          email,
          display_name
        )
      `)
      .eq('introducer_id', introducerId)
      .eq('can_sign', true)
      .order('is_primary', { ascending: false })

    for (const user of (legacyUsers || []) as Array<Record<string, unknown>>) {
      const profile = asProfile(user.profiles)
      const email = clean(profile?.email || fallback.email)
      if (!email) continue

      raw.push({
        user_id: clean(user.user_id as NullableString) || null,
        email,
        name: buildName({
          profileDisplayName: profile?.display_name,
          fallbackDisplayName: fallback.display_name,
          fallbackLegalName: fallback.legal_name,
          fallbackFirstName: fallback.first_name,
          fallbackLastName: fallback.last_name,
          defaultLabel: 'Introducer Signatory',
        }),
        source: 'legacy_user',
      })
    }
  }

  // Last resort: entity-level email (keeps flow operational).
  if (raw.length === 0) {
    const fallbackEmail = clean(fallback.email)
    if (fallbackEmail) {
      raw.push({
        user_id: clean(fallback.user_id) || null,
        email: fallbackEmail,
        name: buildName({
          fallbackDisplayName: fallback.display_name,
          fallbackLegalName: fallback.legal_name,
          fallbackFirstName: fallback.first_name,
          fallbackLastName: fallback.last_name,
          defaultLabel: 'Introducer',
        }),
        source: 'entity_fallback',
      })
    }
  }

  return dedupeSignatories(raw).slice(0, maxSignatories)
}
