'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Send } from 'lucide-react'
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

const SESSION_KEY = 'verso_onboarding_action_dismissed'

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

/* ─── Resolved action with exact specificity ─── */

type OnboardingAction = {
  title: string
  description: string
  ctaLabel: string
  href: string | null // null = dismiss-only (under_review)
  isSubmitAction?: boolean
}

function resolveNextAction(state: DashboardOnboardingState): OnboardingAction {
  const stage = resolveInvestorDashboardOnboardingStage(state)
  const investorType = (state.investorType || 'entity').toLowerCase().trim()
  const isEntity = investorType !== 'individual'

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
      href: '/versotech_main/profile?tab=overview',
    }
  }

  if (stage === 'ready_to_submit') {
    return {
      title: 'Ready for submission',
      description: 'All your information and documents are complete. Submit your account for approval to unlock access to investment opportunities.',
      ctaLabel: 'Submit account for approval',
      href: '/versotech_main/profile?tab=overview&action=submit-approval',
      isSubmitAction: true,
    }
  }

  // stage === 'in_progress' — find the FIRST specific missing item
  if (isEntity) {
    return resolveEntityAction(state.missingItems)
  }
  return resolveIndividualAction(state.missingItems)
}

function resolveEntityAction(items: DashboardOnboardingMissingItem[]): OnboardingAction {
  const entityGroup = items.find((i) => i.scope === 'entity')
  const memberGroups = items.filter((i) => i.scope === 'member')

  if (entityGroup) {
    // Priority 1: Entity Information
    for (const raw of entityGroup.missingItems) {
      const parsed = parseItemSuffix(raw)
      if (parsed.label === 'Entity Information') {
        const verb = parsed.status === 'rejected' ? 'Resubmit' : 'Complete'
        return {
          title: `${verb} your company details`,
          description: parsed.status === 'rejected'
            ? 'Your company information was rejected during review. Please update and resubmit your entity details.'
            : 'Your company information is required before we can verify your account. This includes legal name, country of incorporation, and contact details.',
          ctaLabel: `${verb} company details`,
          href: '/versotech_main/profile?tab=overview&action=edit-entity-overview',
        }
      }
    }

    // Priority 2: Specific entity KYC document
    for (const raw of entityGroup.missingItems) {
      const parsed = parseItemSuffix(raw)
      if (parsed.label !== 'Entity Information' && !parsed.label.includes('active member')) {
        const verb = parsed.status === 'rejected' ? 'Reupload' : 'Upload'
        return {
          title: `${verb} ${parsed.label}`,
          description: parsed.status === 'rejected'
            ? `Your ${parsed.label} was rejected during review. Please upload an updated version.`
            : `We need your ${parsed.label} to verify your entity. This is a required corporate document.`,
          ctaLabel: `${verb} ${parsed.label}`,
          href: '/versotech_main/profile?tab=kyc&action=upload-doc',
        }
      }
    }

    // Active member required
    for (const raw of entityGroup.missingItems) {
      if (raw.toLowerCase().includes('active member')) {
        return {
          title: 'Add a director or beneficial owner',
          description: 'At least one active director or beneficial owner (UBO) must be registered on your account before you can proceed.',
          ctaLabel: 'Add a member',
          href: '/versotech_main/profile?tab=entity-members',
        }
      }
    }
  }

  // Priority 3: Specific member personal info
  for (const member of memberGroups) {
    for (const raw of member.missingItems) {
      const parsed = parseItemSuffix(raw)
      if (parsed.label === 'Personal Information') {
        const verb = parsed.status === 'rejected' ? 'Resubmit' : 'Complete'
        return {
          title: `${verb} personal details for ${member.name}`,
          description: parsed.status === 'rejected'
            ? `The personal information for ${member.name} was rejected. Please update their details and resubmit.`
            : `We need the personal information for ${member.name} including name, date of birth, nationality, and residential address.`,
          ctaLabel: `${verb} ${member.name}\u2019s details`,
          href: `/versotech_main/profile?tab=entity-members&action=edit-member&memberId=${member.memberId}`,
        }
      }
    }
  }

  // Priority 4: Specific member document
  for (const member of memberGroups) {
    for (const raw of member.missingItems) {
      const parsed = parseItemSuffix(raw)
      if (parsed.label !== 'Personal Information') {
        const verb = parsed.status === 'rejected' ? 'Reupload' : 'Upload'
        return {
          title: `${verb} ${parsed.label} for ${member.name}`,
          description: parsed.status === 'rejected'
            ? `The ${parsed.label} for ${member.name} was rejected during review. Please upload an updated version.`
            : `We need a ${parsed.label} for ${member.name}. This is required for each director and beneficial owner.`,
          ctaLabel: `${verb} ${member.name}\u2019s ${parsed.label}`,
          href: `/versotech_main/profile?tab=kyc&action=upload-doc&memberId=${member.memberId}`,
        }
      }
    }
  }

  return {
    title: 'Continue account setup',
    description: 'Complete your account setup to access investment opportunities.',
    ctaLabel: 'Go to profile',
    href: '/versotech_main/profile?tab=overview',
  }
}

function resolveIndividualAction(items: DashboardOnboardingMissingItem[]): OnboardingAction {
  const entityGroup = items.find((i) => i.scope === 'entity')
  if (!entityGroup) {
    return {
      title: 'Continue account setup',
      description: 'Complete your account setup to access investment opportunities.',
      ctaLabel: 'Go to profile',
      href: '/versotech_main/profile?tab=overview',
    }
  }

  for (const raw of entityGroup.missingItems) {
    const parsed = parseItemSuffix(raw)

    if (parsed.label === 'Personal Information') {
      const verb = parsed.status === 'rejected' ? 'Resubmit' : 'Complete'
      return {
        title: `${verb} your personal details`,
        description: parsed.status === 'rejected'
          ? 'Your personal information was rejected during review. Please update and resubmit your details.'
          : 'We need your personal information including full name, date of birth, nationality, and residential address.',
        ctaLabel: `${verb} personal details`,
        href: '/versotech_main/profile?tab=overview&action=edit-individual-kyc',
      }
    }

    if (parsed.label === 'Proof of Identification') {
      const verb = parsed.status === 'rejected' ? 'Reupload' : 'Upload'
      return {
        title: `${verb} your Proof of Identification`,
        description: parsed.status === 'rejected'
          ? 'Your ID document was rejected. Please upload a valid passport, national ID card, or driving licence.'
          : 'We need a copy of your passport, national ID card, or driving licence to verify your identity.',
        ctaLabel: `${verb} Proof of ID`,
        href: '/versotech_main/profile?tab=kyc&action=upload-doc',
      }
    }

    if (parsed.label === 'Proof of Address') {
      const verb = parsed.status === 'rejected' ? 'Reupload' : 'Upload'
      return {
        title: `${verb} your Proof of Address`,
        description: parsed.status === 'rejected'
          ? 'Your proof of address was rejected. Please upload a utility bill, bank statement, or government correspondence dated within the last 3 months.'
          : 'We need a recent document (within 3 months) that confirms your residential address, such as a utility bill or bank statement.',
        ctaLabel: `${verb} Proof of Address`,
        href: '/versotech_main/profile?tab=kyc&action=upload-doc',
      }
    }
  }

  return {
    title: 'Continue account setup',
    description: 'Complete your account setup to access investment opportunities.',
    ctaLabel: 'Go to profile',
    href: '/versotech_main/profile?tab=overview',
  }
}

/* ─── Component ─── */

export function OnboardingActionModal() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<DashboardOnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1') {
      setLoading(false)
      return
    }

    fetch('/api/investors/me/dashboard-onboarding', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) return null
        return (await res.json()) as DashboardOnboardingState
      })
      .then((data) => {
        if (!data) return
        const status = (data.accountApprovalStatus || '').toLowerCase().trim()
        if (status === 'approved') return
        setState(data)
        setOpen(true)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  function dismiss() {
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* ignore */ }
    setOpen(false)
  }

  async function handleSubmitForApproval() {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/investors/me/submit-account-approval', {
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

  const stage = resolveInvestorDashboardOnboardingStage(state)
  const action = resolveNextAction(state)
  const isUnderReview = stage === 'under_review'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss() }}>
      <DialogContent
        className={cn(
          'sm:max-w-[420px] p-0 gap-0 overflow-hidden border rounded-2xl shadow-2xl',
          isDark
            ? 'bg-[#0a0a0a] border-white/[0.08]'
            : 'bg-white border-slate-200'
        )}
      >
        {/* Top accent line */}
        <div className={cn(
          'h-[3px] w-full',
          isDark ? 'bg-white' : 'bg-blue-600'
        )} />

        <div className="px-6 pt-6 pb-2">
          <DialogHeader className="space-y-3">
            {/* Stage indicator */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full',
                isUnderReview
                  ? 'animate-pulse'
                  : '',
                isDark ? 'bg-white' : 'bg-blue-600'
              )} />
              <span className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.15em]',
                isDark ? 'text-white/50' : 'text-slate-400'
              )}>
                {isUnderReview ? 'Under review' : 'Action required'}
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
          </DialogHeader>
        </div>

        {/* CTA area */}
        <div className="px-6 pb-6 pt-4 space-y-2">
          {/* Primary CTA */}
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

          {/* Submit action */}
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
                onClick={() => handleCTAClick('/versotech_main/profile?tab=overview')}
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
                Only primary account holders can submit for approval.
              </p>
            </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
