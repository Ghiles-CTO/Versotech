'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import type {
  DashboardOnboardingState,
  DashboardOnboardingMissingItem,
} from '@/components/dashboard/investor-dashboard-onboarding-card'
import {
  resolveInvestorDashboardOnboardingStage,
} from '@/components/dashboard/investor-dashboard-onboarding-card'
import { usePersona } from '@/contexts/persona-context'

const ACTION_SESSION_KEY = 'verso_onboarding_action_dismissed'
const APPROVED_SESSION_KEY_PREFIX = 'verso_onboarding_approved_dismissed'
const APPROVED_COUNT_KEY_PREFIX = 'verso_onboarding_approved_count'
const APPROVED_POPUP_MAX_SHOWS = 3

/* ─── Parse item suffix from readiness data ─── */

function parseItemSuffix(raw: string): { label: string; status: 'missing' | 'rejected' | 'pending_review' } {
  const rejectedMatch = raw.match(/^(.+?)\s*\(rejected\)\s*$/i)
  if (rejectedMatch) return { label: rejectedMatch[1].trim(), status: 'rejected' }

  const pendingMatch = raw.match(/^(.+?)\s*\(not yet approved\)\s*$/i)
  if (pendingMatch) return { label: pendingMatch[1].trim(), status: 'pending_review' }

  const missingMatch = raw.match(/^(.+?)\s*\(missing\)\s*$/i)
  if (missingMatch) return { label: missingMatch[1].trim(), status: 'missing' }

  return { label: raw.trim(), status: 'missing' }
}

function getContinueSetupDescription(personaType?: string) {
  return personaType === 'introducer'
    ? 'Complete your account setup to activate your introducer workspace.'
    : 'Complete your account setup to access investment opportunities.'
}

function getReadyToSubmitDescription(personaType?: string) {
  return personaType === 'introducer'
    ? 'All your information and documents are complete. Submit your account for approval to activate your introducer workspace.'
    : 'All your information and documents are complete. Submit your account for approval to unlock access to investment opportunities.'
}

function getSubmitPermissionCopy(personaType?: string) {
  return personaType === 'introducer'
    ? 'Only primary contacts or introducer admins can submit for approval.'
    : 'Only primary account holders or admins can submit for approval.'
}

function getStageChipLabel(stage: ReturnType<typeof resolveInvestorDashboardOnboardingStage>) {
  switch (stage) {
    case 'under_review':
      return 'Under review'
    case 'ready_to_submit':
      return 'Ready to submit'
    case 'action_required':
      return 'Action required'
    default:
      return 'Continue setup'
  }
}

function normalizeApprovalStatus(value?: string | null) {
  return (value || '').toLowerCase().trim()
}

function getApprovedStorageScope(personaType?: string | null, entityId?: string | null) {
  return `${personaType || 'unknown'}:${entityId || 'default'}`
}

function getApprovedSessionKey(personaType?: string | null, entityId?: string | null) {
  return `${APPROVED_SESSION_KEY_PREFIX}:${getApprovedStorageScope(personaType, entityId)}`
}

function getApprovedCountKey(personaType?: string | null, entityId?: string | null) {
  return `${APPROVED_COUNT_KEY_PREFIX}:${getApprovedStorageScope(personaType, entityId)}`
}

function getApprovedDescription(personaType?: string) {
  return personaType === 'introducer'
    ? 'Your account is approved. Your introducer workspace is ready.'
    : 'Your account is approved. Check out investment opportunities.'
}

function getApprovedCta(personaType?: string) {
  return personaType === 'introducer'
    ? { label: 'Open workspace', href: '/versotech_main/dashboard' }
    : { label: 'View opportunities', href: '/versotech_main/opportunities' }
}

/* ─── Resolved action with exact specificity ─── */

type OnboardingAction = {
  title: string
  description: string
  documentList?: string[]
  ctaLabel: string
  href: string | null // null = dismiss-only (under_review)
  isSubmitAction?: boolean
}

function resolveNextAction(state: DashboardOnboardingState): OnboardingAction {
  const stage = resolveInvestorDashboardOnboardingStage(state)
  const entityType = (state.entityType || state.investorType || 'entity').toLowerCase().trim()
  const profileHref = state.profileHref || '/versotech_main/profile?tab=overview'
  const kycHref = state.kycHref || '/versotech_main/profile?tab=kyc'
  const membersHref = state.membersHref || '/versotech_main/profile?tab=entity-members'
  const submitHref = state.submitHref || `${profileHref}${profileHref.includes('?') ? '&' : '?'}action=submit-approval`
  const isEntity = entityType !== 'individual'

  if (stage === 'under_review') {
    return {
      title: 'Your account is under review',
      description: 'Your account has been submitted and is currently under review. You\u2019ll be notified once a decision is made.',
      ctaLabel: '',
      href: null,
    }
  }

  if (stage === 'action_required') {
    return {
      title: 'Action required on your account',
      description: state.latestRequestInfo?.details || 'Our review team has flagged items that require your attention. Please review and update the flagged items.',
      ctaLabel: 'Review flagged items',
      href: profileHref,
    }
  }

  if (stage === 'ready_to_submit') {
    return {
      title: 'Ready for submission',
      description: getReadyToSubmitDescription(state.personaType),
      ctaLabel: 'Submit account for approval',
      href: submitHref,
      isSubmitAction: true,
    }
  }

  // stage === 'in_progress' — find the FIRST specific missing item
  if (isEntity) {
    return resolveEntityAction(state.missingItems, {
      profileHref,
      kycHref,
      membersHref,
    }, state.personaType)
  }
  return resolveIndividualAction(state.missingItems, {
    profileHref,
    kycHref,
  }, state.personaType)
}

function resolveEntityAction(
  items: DashboardOnboardingMissingItem[],
  hrefs: { profileHref: string; kycHref: string; membersHref: string },
  personaType?: string
): OnboardingAction {
  const entityGroup = items.find((i) => i.scope === 'entity')
  const memberGroups = items.filter((i) => i.scope === 'member')
  // The user's own member is the first member group (API builds it first)
  const userMember = memberGroups[0] || null
  const otherMembers = memberGroups.slice(1)

  // Priority 1: User's personal info missing/rejected
  if (userMember) {
    for (const raw of userMember.missingItems) {
      const parsed = parseItemSuffix(raw)
      if (parsed.label === 'Personal Information') {
        const verb = parsed.status === 'rejected' ? 'Resubmit' : 'Complete'
        return {
          title: `${verb} your personal details`,
          description: 'Fill in your personal information to continue setting up your account.',
          ctaLabel: `${verb} personal details`,
          href: `${hrefs.profileHref}${hrefs.profileHref.includes('?') ? '&' : '?'}action=edit-personal-kyc`,
        }
      }
    }
  }

  // Priority 2: Entity Information missing/rejected
  if (entityGroup) {
    for (const raw of entityGroup.missingItems) {
      const parsed = parseItemSuffix(raw)
      if (parsed.label === 'Entity Information') {
        const verb = parsed.status === 'rejected' ? 'Resubmit' : 'Complete'
        return {
          title: `${verb} your company details`,
          description: parsed.status === 'rejected'
            ? 'Your company information was rejected during review. Please update and resubmit your entity details.'
            : 'Fill in your company information to continue setting up your account.',
          ctaLabel: `${verb} company details`,
          href: hrefs.profileHref,
        }
      }
    }
  }

  // Priority 3: User's personal docs (combined — list each missing doc)
  if (userMember) {
    const missingDocs = userMember.missingItems
      .map((raw) => parseItemSuffix(raw))
      .filter((p) => p.label !== 'Personal Information')
      .map((p) => p.label)
    if (missingDocs.length > 0) {
      return {
        title: 'Personal KYC documents',
        description: 'The following documents are required:',
        documentList: missingDocs,
        ctaLabel: 'Upload personal KYC documents',
        href: hrefs.kycHref,
      }
    }
  }

  // Priority 4: Entity KYC documents (list all missing)
  if (entityGroup) {
    const missingEntityDocs = entityGroup.missingItems
      .map((raw) => parseItemSuffix(raw))
      .filter((p) => p.label !== 'Entity Information' && !p.label.toLowerCase().includes('active member'))
      .map((p) => p.label)
    if (missingEntityDocs.length > 0) {
      return {
        title: 'Company KYC documents',
        description: 'The following documents are required:',
        documentList: missingEntityDocs,
        ctaLabel: 'Upload company KYC documents',
        href: hrefs.kycHref,
      }
    }
  }

  // Priority 5: Members missing KYC — names only, no doc specifics
  const membersWithMissingKyc = otherMembers.filter((m) => m.missingItems.length > 0)
  if (membersWithMissingKyc.length > 0) {
    const names = membersWithMissingKyc.map((m) => m.name).join(', ')
    return {
      title: 'Members require KYC information',
      description: `We are missing KYC information for ${names}. Please review and complete their details.`,
      ctaLabel: 'Review members',
      href: hrefs.membersHref,
    }
  }

  return {
    title: 'Continue account setup',
    description: getContinueSetupDescription(personaType),
    ctaLabel: 'Go to profile',
    href: hrefs.profileHref,
  }
}

function resolveIndividualAction(
  items: DashboardOnboardingMissingItem[],
  hrefs: { profileHref: string; kycHref: string },
  personaType?: string
): OnboardingAction {
  const entityGroup = items.find((i) => i.scope === 'entity')
  const memberGroup = items.find((i) => i.scope === 'member')
  const sourceGroup = memberGroup || entityGroup

  if (!sourceGroup) {
    return {
      title: 'Continue account setup',
      description: getContinueSetupDescription(personaType),
      ctaLabel: 'Go to profile',
      href: hrefs.profileHref,
    }
  }

  // Priority 1: Personal Information
  for (const raw of sourceGroup.missingItems) {
    const parsed = parseItemSuffix(raw)
    if (parsed.label === 'Personal Information') {
      const verb = parsed.status === 'rejected' ? 'Resubmit' : 'Complete'
      return {
        title: `${verb} your personal details`,
        description: 'Fill in your personal information to continue setting up your account.',
        ctaLabel: `${verb} personal details`,
        href: `${hrefs.profileHref}${hrefs.profileHref.includes('?') ? '&' : '?'}action=edit-individual-kyc`,
      }
    }
  }

  // Priority 2: Personal documents (combined — list each missing doc)
  const missingDocs = sourceGroup.missingItems
    .map((raw) => parseItemSuffix(raw))
    .filter((p) => p.label !== 'Personal Information')
    .map((p) => p.label)
  if (missingDocs.length > 0) {
    return {
      title: 'Personal KYC documents',
      description: 'The following documents are required:',
      documentList: missingDocs,
      ctaLabel: 'Upload personal KYC documents',
      href: hrefs.kycHref,
    }
  }

  return {
    title: 'Continue account setup',
    description: getContinueSetupDescription(personaType),
    ctaLabel: 'Go to profile',
    href: hrefs.profileHref,
  }
}

/* ─── Component ─── */

export function OnboardingActionModal() {
  const router = useRouter()
  const { theme } = useTheme()
  const { activePersona, isLoading: personaLoading } = usePersona()
  const isDark = theme === 'staff-dark'
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<DashboardOnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onboardingPersona =
    activePersona?.persona_type === 'investor' || activePersona?.persona_type === 'introducer'
      ? activePersona
      : null

  useEffect(() => {
    if (personaLoading) {
      return
    }

    if (!onboardingPersona) {
      setLoading(false)
      return
    }

    const endpoint =
      onboardingPersona.persona_type === 'introducer'
        ? '/api/introducers/me/dashboard-onboarding'
        : '/api/investors/me/dashboard-onboarding'

    fetch(endpoint, { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) return null
        return (await res.json()) as DashboardOnboardingState
      })
      .then((data) => {
        if (!data) return
        const isApproved = normalizeApprovalStatus(data.accountApprovalStatus) === 'approved'

        if (isApproved) {
          try {
            if (typeof window === 'undefined') return
            const entityId = onboardingPersona.entity_id || data.investorId
            const sessionKey = getApprovedSessionKey(data.personaType, entityId)
            const countKey = getApprovedCountKey(data.personaType, entityId)
            const shownCount = Number.parseInt(window.localStorage.getItem(countKey) || '0', 10)

            if (window.sessionStorage.getItem(sessionKey) === '1' || shownCount >= APPROVED_POPUP_MAX_SHOWS) {
              return
            }

            window.sessionStorage.setItem(sessionKey, '1')
            window.localStorage.setItem(countKey, String(shownCount + 1))
          } catch {
            /* ignore */
          }
        } else if (typeof window !== 'undefined' && window.sessionStorage.getItem(ACTION_SESSION_KEY) === '1') {
          return
        }
        setState(data)
        setOpen(true)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [onboardingPersona, personaLoading])

  function dismiss() {
    try {
      if (typeof window === 'undefined') {
        setOpen(false)
        return
      }
      if (normalizeApprovalStatus(state?.accountApprovalStatus) === 'approved') {
        const entityId = onboardingPersona?.entity_id || state?.investorId
        window.sessionStorage.setItem(getApprovedSessionKey(state?.personaType, entityId), '1')
      } else {
        window.sessionStorage.setItem(ACTION_SESSION_KEY, '1')
      }
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  async function handleSubmitForApproval() {
    setIsSubmitting(true)
    try {
      const submitEndpoint =
        state?.submitEndpoint ||
        (state?.personaType === 'introducer'
          ? '/api/introducers/me/submit-account-approval'
          : '/api/investors/me/submit-account-approval')

      const response = await fetch(submitEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to submit account for approval')
      }
      toast.success('Account submitted for approval.')
      dismiss()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit account for approval')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCTAClick(href: string) {
    dismiss()
    router.push(href)
  }

  if (loading || !state) return null

  const isApproved = normalizeApprovalStatus(state.accountApprovalStatus) === 'approved'
  const stage = isApproved ? null : resolveInvestorDashboardOnboardingStage(state)
  const action = isApproved
    ? {
        title: 'Congratulations',
        description: getApprovedDescription(state.personaType),
        ctaLabel: getApprovedCta(state.personaType).label,
        href: getApprovedCta(state.personaType).href,
      }
    : resolveNextAction(state)
  const isUnderReview = stage === 'under_review'
  const fallbackProfileHref =
    state.personaType === 'introducer'
      ? (state.profileHref || '/versotech_main/introducer-profile?tab=overview')
      : (state.profileHref || '/versotech_main/profile?tab=overview')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss() }}>
      {isApproved ? (
        <DialogContent
          className="sm:max-w-[540px] p-0 gap-0 overflow-hidden rounded-2xl border border-border/70 shadow-2xl"
          showCloseButton={false}
        >
          <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 pt-8 pb-6 dark:from-zinc-900/50 dark:via-zinc-900/50 dark:to-zinc-900/50">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <DialogHeader className="relative text-center">
              <div className="mx-auto mb-5">
                <div className="flex items-center justify-center gap-3.5">
                  <div className="relative h-14 w-14 flex-shrink-0">
                    <Image
                      src="/versotech-icon.png"
                      alt=""
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span
                    style={{ fontFamily: 'var(--font-spartan), sans-serif', fontWeight: 700 }}
                    className="text-4xl tracking-wide text-gray-900 dark:text-white"
                  >
                    VERSOTECH
                  </span>
                </div>
              </div>

              <DialogTitle className="text-2xl font-bold text-foreground">
                {action.title}
              </DialogTitle>
              <DialogDescription className="mt-2 mx-auto max-w-md text-base text-muted-foreground">
                {action.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-400/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground">Account approved</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your review is complete and your account is now active.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCTAClick(action.href!)}
              className="group flex w-full items-center justify-between rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700"
            >
              <span>{action.ctaLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <Button type="button" variant="ghost" className="w-full rounded-xl" onClick={dismiss}>
              Close
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent
          className={cn(
            'sm:max-w-[420px] p-0 gap-0 overflow-hidden border rounded-2xl shadow-2xl',
            isDark
              ? 'bg-[#0a0a0a] border-white/[0.08]'
              : 'bg-white border-slate-200'
          )}
        >
          <div className={cn(
            'h-[3px] w-full',
            isDark ? 'bg-white' : 'bg-blue-600'
          )} />

          <div className="px-6 pt-6 pb-2">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  isUnderReview ? 'animate-pulse' : '',
                  isDark ? 'bg-white' : 'bg-blue-600'
                )} />
                <span className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.15em]',
                  isDark ? 'text-white/50' : 'text-slate-400'
                )}>
                  {getStageChipLabel(stage!)}
                </span>
              </div>

              <DialogTitle className={cn(
                'text-[20px] font-semibold leading-tight tracking-tight text-left',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                {action.title}
              </DialogTitle>

              <DialogDescription className={cn(
                'text-[13px] leading-relaxed text-left',
                isDark ? 'text-white/50' : 'text-slate-500'
              )}>
                {action.description}
              </DialogDescription>

              {action.documentList && action.documentList.length > 0 && (
                <ul className={cn(
                  'mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-left',
                  isDark ? 'text-white/70' : 'text-slate-600'
                )}>
                  {action.documentList.map((document) => (
                    <li key={document}>{document}</li>
                  ))}
                </ul>
              )}
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 pt-4 space-y-2">
            {action.href && !action.isSubmitAction && (
              <button
                onClick={() => handleCTAClick(action.href!)}
                className={cn(
                  'group w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200',
                  isDark
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                <span>{action.ctaLabel}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {action.isSubmitAction && state.canSubmitAccountApproval && (
              <button
                onClick={handleSubmitForApproval}
                disabled={isSubmitting}
                className={cn(
                  'group w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 disabled:opacity-50',
                  isDark
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit account for approval
                  </>
                )}
              </button>
            )}

            {action.isSubmitAction && !state.canSubmitAccountApproval && (
              <>
                <button
                  onClick={() => handleCTAClick(fallbackProfileHref)}
                  className={cn(
                    'group w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200',
                    isDark
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  <span>View account details</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <p className={cn(
                  'text-center text-[11px]',
                  isDark ? 'text-white/30' : 'text-slate-400'
                )}>
                  {getSubmitPermissionCopy(state.personaType)}
                </p>
              </>
            )}

            <button
              onClick={dismiss}
              className={cn(
                'w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isDark
                  ? 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              {isUnderReview ? 'Close' : 'Dismiss'}
            </button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
