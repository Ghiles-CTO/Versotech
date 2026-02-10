import { createServiceClient } from '@/lib/supabase/server'
import { resolveAgentIdForTask } from '@/lib/agents'

type SupabaseServiceClient = ReturnType<typeof createServiceClient>

export type BlacklistMatchResult = {
  blacklist_entry_id: string
  match_type: string | null
  match_confidence: number | null
  severity: string | null
  status: string | null
}

export type BlacklistScreeningInput = {
  email?: string | null
  fullName?: string | null
  taxId?: string | null
  phone?: string | null
  entityName?: string | null
}

const severityRank: Record<string, number> = {
  warning: 1,
  blocked: 2,
  banned: 3
}

function pickHighestSeverity(matches: BlacklistMatchResult[]): string {
  let best = 'warning'
  for (const match of matches) {
    const severity = match.severity || 'warning'
    if ((severityRank[severity] || 0) > (severityRank[best] || 0)) {
      best = severity
    }
  }
  return best
}

export async function screenAgainstBlacklist(
  supabase: SupabaseServiceClient,
  input: BlacklistScreeningInput
): Promise<BlacklistMatchResult[]> {
  try {
    const { data, error } = await supabase.rpc('screen_against_blacklist', {
      p_email: input.email ?? null,
      p_full_name: input.fullName ?? null,
      p_tax_id: input.taxId ?? null,
      p_phone: input.phone ?? null,
      p_entity_name: input.entityName ?? null
    })

    if (error) {
      console.error('[blacklist] screening failed:', error)
      return []
    }

    return (data || []) as BlacklistMatchResult[]
  } catch (error) {
    console.error('[blacklist] screening exception:', error)
    return []
  }
}

export async function logBlacklistMatches(params: {
  supabase: SupabaseServiceClient
  matches: BlacklistMatchResult[]
  context: string
  input: BlacklistScreeningInput
  subjectLabel?: string | null
  matchedUserId?: string | null
  matchedInvestorId?: string | null
  relatedInvestorId?: string | null
  relatedDealId?: string | null
  actorId?: string | null
  actionLabel?: string
}) {
  const {
    supabase,
    matches,
    context,
    input,
    subjectLabel,
    matchedUserId,
    matchedInvestorId,
    relatedInvestorId,
    relatedDealId,
    actorId,
    actionLabel
  } = params

  if (!matches.length) return

  const matchedAt = new Date().toISOString()
  const resolvedAction = actionLabel || `flagged_${context}`
  const matchRows = matches.map((match) => ({
    blacklist_entry_id: match.blacklist_entry_id,
    matched_user_id: matchedUserId ?? null,
    matched_investor_id: matchedInvestorId ?? null,
    match_type: match.match_type || 'unknown',
    match_confidence: match.match_confidence ?? null,
    matched_at: matchedAt,
    action_taken: resolvedAction
  }))

  try {
    await supabase.from('blacklist_matches').insert(matchRows)
  } catch (error) {
    console.error('[blacklist] failed to insert match rows:', error)
  }

  let agentId: string | null = null
  try {
    agentId = await resolveAgentIdForTask(supabase, 'U003')
  } catch (error) {
    console.warn('[blacklist] failed to resolve agent:', error)
  }

  const severity = pickHighestSeverity(matches)
  const description =
    subjectLabel
      ? `Blacklist match detected (${severity}) for ${subjectLabel}`
      : `Blacklist match detected (${severity})`

  try {
    await supabase.from('compliance_activity_log').insert({
      event_type: 'blacklist_match',
      description,
      related_investor_id: relatedInvestorId ?? matchedInvestorId ?? null,
      related_deal_id: relatedDealId ?? null,
      agent_id: agentId,
      created_by: actorId ?? null,
      metadata: {
        context,
        severity,
        match_count: matches.length,
        subject_label: subjectLabel ?? null,
        screened_email: input.email ?? null,
        screened_full_name: input.fullName ?? null,
        screened_entity_name: input.entityName ?? null,
        screened_tax_id: input.taxId ?? null,
        screened_phone: input.phone ?? null
      }
    })
  } catch (error) {
    console.error('[blacklist] failed to log compliance activity:', error)
  }

  try {
    const { data: ceoUsers } = await supabase.from('ceo_users').select('user_id')
    const notifications = (ceoUsers || []).map((ceo) => ({
      user_id: ceo.user_id,
      investor_id: relatedInvestorId ?? matchedInvestorId ?? null,
      title: 'Blacklist match detected',
      message: subjectLabel
        ? `${subjectLabel} matched the blacklist (${severity}).`
        : `A record matched the blacklist (${severity}).`,
      link: '/versotech_admin/agents?tab=blacklist',
      type: 'general',
      agent_id: agentId,
      data: {
        context,
        severity,
        match_count: matches.length
      }
    }))

    if (notifications.length) {
      await supabase.from('investor_notifications').insert(notifications)
    }
  } catch (error) {
    console.error('[blacklist] failed to notify CEO:', error)
  }
}
