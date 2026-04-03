'use client'

import React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  FileWarning,
  Loader2,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { formatViewerDate } from '@/lib/format'

export type DashboardOnboardingMissingItem = {
  scope: 'entity' | 'member'
  name: string
  email?: string | null
  missingItems: string[]
  memberId?: string | null
}

export type DashboardOnboardingRequestInfo = {
  details: string
  reason: string | null
  requestedAt: string | null
}

export type DashboardOnboardingState = {
  investorId: string
  personaType?: 'investor' | 'introducer'
  entityId?: string
  approvalEventKey?: string | null
  entityType?: string | null
  investorType?: string | null
  accountApprovalStatus: string | null
  onboardingStatus: string | null
  isReady: boolean
  hasPendingApproval: boolean
  canSubmitAccountApproval: boolean
  missingItems: DashboardOnboardingMissingItem[]
  latestRequestInfo: DashboardOnboardingRequestInfo | null
  profileHref?: string
  kycHref?: string
  membersHref?: string
  submitHref?: string
  submitEndpoint?: string
}

export type InvestorDashboardOnboardingStage =
  | 'in_progress'
  | 'ready_to_submit'
  | 'under_review'
  | 'action_required'

function normalizeStatus(value?: string | null) {
  return value ? value.toLowerCase().trim() : ''
}

export function resolveInvestorDashboardOnboardingStage(
  state: DashboardOnboardingState
): InvestorDashboardOnboardingStage {
  const accountStatus = normalizeStatus(state.accountApprovalStatus)

  if (accountStatus === 'pending_approval' || state.hasPendingApproval) {
    return 'under_review'
  }

  if (accountStatus === 'rejected' || state.latestRequestInfo) {
    return 'action_required'
  }

  if (state.isReady) {
    return 'ready_to_submit'
  }

  return 'in_progress'
}

/* ─── Parse item status suffix ─── */

type ItemStatus = 'missing' | 'rejected' | 'pending_review' | 'approved'

type ParsedItem = {
  label: string
  status: ItemStatus
}

function parseItemSuffix(raw: string): ParsedItem {
  const rejectedMatch = raw.match(/^(.+?)\s*\(rejected\)\s*$/i)
  if (rejectedMatch) {
    return { label: rejectedMatch[1].trim(), status: 'rejected' }
  }

  const pendingMatch = raw.match(/^(.+?)\s*\(not yet approved\)\s*$/i)
  if (pendingMatch) {
    return { label: pendingMatch[1].trim(), status: 'pending_review' }
  }

  const missingMatch = raw.match(/^(.+?)\s*\(missing\)\s*$/i)
  if (missingMatch) {
    return { label: missingMatch[1].trim(), status: 'missing' }
  }

  return { label: raw.trim(), status: 'missing' }
}

/* ─── Known requirement lists ─── */

const ENTITY_REQUIREMENTS = [
  'Entity Information',
  'Certificate of Incorporation',
  'Memorandum & Articles of Association',
  'Register of Members',
  'Register of Beneficial Owners',
  'Register of Directors',
  'Bank Confirmation Letter',
] as const

const MEMBER_REQUIREMENTS = [
  'Personal Information',
  'Proof of Identification',
  'Proof of Address',
] as const

const INDIVIDUAL_REQUIREMENTS = [
  'Personal Information',
  'Proof of Identification',
  'Proof of Address',
] as const

const MEMBER_REQ_SHORT: Record<string, string> = {
  'Personal Information': 'Personal info',
  'Proof of Identification': 'Proof of ID',
  'Proof of Address': 'Proof of address',
}

/**
 * Look up the status of a requirement label inside a group's missingItems.
 * If the label is NOT found in missingItems, it's approved.
 */
function resolveRequirementStatus(
  missingItems: string[],
  requirementLabel: string
): ParsedItem {
  for (const raw of missingItems) {
    const parsed = parseItemSuffix(raw)
    if (parsed.label === requirementLabel) {
      return parsed
    }
  }
  return { label: requirementLabel, status: 'approved' }
}

/* ─── CTA routing ─── */

function hasEntityInfoMissing(items: DashboardOnboardingMissingItem[]): boolean {
  return items
    .filter((i) => i.scope === 'entity')
    .some((i) =>
      i.missingItems.some((raw) => {
        const p = parseItemSuffix(raw)
        return p.label === 'Entity Information'
      })
    )
}

function hasMemberPersonalInfoMissing(items: DashboardOnboardingMissingItem[]): boolean {
  return items
    .filter((i) => i.scope === 'member')
    .some((i) =>
      i.missingItems.some((raw) => {
        const p = parseItemSuffix(raw)
        return p.label === 'Personal Information'
      })
    )
}

function hasIndividualPersonalInfoMissing(items: DashboardOnboardingMissingItem[]): boolean {
  return items
    .filter((i) => i.scope === 'entity')
    .some((i) =>
      i.missingItems.some((raw) => {
        const p = parseItemSuffix(raw)
        return p.label === 'Personal Information'
      })
    )
}

function resolveNextStep(
  investorType: string,
  items: DashboardOnboardingMissingItem[],
  hrefs?: {
    profileHref?: string
    kycHref?: string
    membersHref?: string
  },
  personaType?: DashboardOnboardingState['personaType'],
): { href: string; label: string } {
  const profileHref = hrefs?.profileHref || '/versotech_main/profile?tab=overview'
  const kycHref = hrefs?.kycHref || '/versotech_main/profile?tab=kyc'
  const membersHref = hrefs?.membersHref || '/versotech_main/profile?tab=entity-members'
  const profileLabel = personaType === 'introducer' ? 'Go to Profile' : 'Go to Overview'
  const membersLabel = personaType === 'introducer' ? 'Go to Team Members' : 'Go to Directors/UBOs'

  if (investorType === 'individual') {
    if (hasIndividualPersonalInfoMissing(items)) {
      return { href: profileHref, label: profileLabel }
    }
    return { href: kycHref, label: 'Go to KYC' }
  }

  // Entity investor
  if (hasEntityInfoMissing(items)) {
    return { href: profileHref, label: profileLabel }
  }
  if (hasMemberPersonalInfoMissing(items)) {
    return { href: membersHref, label: membersLabel }
  }
  return { href: kycHref, label: 'Go to KYC' }
}

/* ─── Stage descriptions ─── */

function getStageDescription(
  stage: InvestorDashboardOnboardingStage,
  investorType: string,
  personaType?: DashboardOnboardingState['personaType'],
) {
  const isEntity = investorType !== 'individual'
  const isIntroducer = personaType === 'introducer'

  switch (stage) {
    case 'in_progress': {
      if (isEntity) {
        if (isIntroducer) {
          return 'To activate this introducer account, complete your company information, upload the required corporate documents, and make sure each required member has personal details and KYC documents in place. Once complete, submit the account for approval.'
        }
        return 'To access and subscribe to investment opportunities, your account must be verified and approved. This requires completing your company information, uploading corporate documents, and ensuring each member\u2019s personal details and identity documents are submitted. Once complete, you can submit your account for approval.'
      }
      if (isIntroducer) {
        return 'To activate this introducer account, complete your personal information and upload your identity documents. Once complete, submit the account for approval.'
      }
      return 'To access and subscribe to investment opportunities, your account must be verified and approved. This requires completing your personal information and uploading your identity documents (proof of ID and proof of address). Once complete, you can submit your account for approval.'
    }
    case 'ready_to_submit':
      if (isIntroducer) {
        return 'All information and documents have been submitted. Submit your account for approval to activate introductions, agreements, and commissions.'
      }
      return 'All information and documents have been submitted. Submit your account for approval to unlock access to investment opportunities.'
    case 'under_review':
      if (isIntroducer) {
        return 'Your introducer account has been submitted for approval and is currently under review. You\u2019ll be notified once a decision is made.'
      }
      return 'Your account has been submitted for approval and is currently under review. You\u2019ll be notified once a decision is made.'
    case 'action_required':
      if (isIntroducer) {
        return 'Our review team has flagged items that require your attention. Please review and update the items listed below, then resubmit your introducer account for approval.'
      }
      return 'Our review team has flagged items that require your attention. Please review and update the items listed below, then resubmit your account for approval.'
  }
}

/* ─── Status cell (table rows) ─── */

function StatusCell({ status, isDark }: { status: ItemStatus; isDark: boolean }) {
  if (status === 'approved') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-medium', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
        <Check className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
      )}>
        <FileWarning className="h-3 w-3" />
        Rejected
      </span>
    )
  }
  if (status === 'pending_review') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600'
      )}>
        <Clock className="h-3 w-3" />
        Pending review
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', isDark ? 'text-gray-500' : 'text-slate-400')}>
      <X className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Not submitted</span>
    </span>
  )
}

/* ─── Main component ─── */

interface InvestorDashboardOnboardingCardProps {
  state: DashboardOnboardingState
}

export function InvestorDashboardOnboardingCard({
  state,
}: InvestorDashboardOnboardingCardProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accountStatus = normalizeStatus(state.accountApprovalStatus)
  if (accountStatus === 'approved') {
    return null
  }

  const stage = resolveInvestorDashboardOnboardingStage(state)
  const investorType = normalizeStatus(state.investorType) || 'entity'
  const isEntity = investorType !== 'individual'
  const hasOutstandingItems = state.missingItems.length > 0
  const profileHref = state.profileHref || '/versotech_main/profile?tab=overview'
  const kycHref = state.kycHref || '/versotech_main/profile?tab=kyc'
  const membersHref = state.membersHref || '/versotech_main/profile?tab=entity-members'
  const description = getStageDescription(stage, investorType, state.personaType)

  const entityGroup = state.missingItems.find((i) => i.scope === 'entity') || null
  const memberGroups = state.missingItems.filter((i) => i.scope === 'member')

  // Resolve CTA — routes to the exact profile tab based on what's missing
  const cta = resolveNextStep(investorType, state.missingItems, {
    profileHref,
    kycHref,
    membersHref,
  }, state.personaType)

  async function handleSubmitForApproval() {
    setIsSubmitting(true)
    try {
      const response = await fetch(state.submitEndpoint || '/api/investors/me/submit-account-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to submit account for approval')
      }
      toast.success('Account submitted for approval.')
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit account for approval'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const StageIcon =
    stage === 'under_review'
      ? Clock
      : stage === 'action_required'
        ? AlertCircle
        : ShieldCheck

  return (
    <section
      className={cn(
        'rounded-3xl border p-5 shadow-sm sm:p-6 md:p-8',
        isDark ? 'border-white/10 bg-card' : 'border-slate-200/80 bg-white'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            isDark ? 'bg-primary/15' : 'bg-primary/10'
          )}
        >
          <StageIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            className={cn(
              'text-lg font-semibold',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {stage === 'in_progress' && 'Complete your account setup'}
            {stage === 'ready_to_submit' && 'Your account is ready to submit'}
            {stage === 'under_review' && 'Your account is under review'}
            {stage === 'action_required' && 'Action required on your account'}
          </h2>
          <p
            className={cn(
              'text-sm leading-relaxed',
              isDark ? 'text-gray-400' : 'text-slate-600'
            )}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Request info callout */}
      {state.latestRequestInfo && stage !== 'under_review' && (
        <div
          className={cn(
            'mt-5 rounded-2xl border p-4',
            isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200/80 bg-slate-50/70'
          )}
        >
          <p
            className={cn(
              'text-sm font-medium',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            Reviewer note
          </p>
          <p
            className={cn(
              'mt-1 text-sm leading-relaxed',
              isDark ? 'text-gray-300' : 'text-slate-700'
            )}
          >
            {state.latestRequestInfo.details}
          </p>
          {state.latestRequestInfo.requestedAt && (
            <p
              className={cn(
                'mt-1.5 text-xs',
                isDark ? 'text-gray-500' : 'text-slate-500'
              )}
            >
              {formatViewerDate(state.latestRequestInfo.requestedAt)}
            </p>
          )}
        </div>
      )}

      {/* Outstanding items */}
      {hasOutstandingItems && stage !== 'under_review' && (
        <div className="mt-5 space-y-3">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-wider',
              isDark ? 'text-gray-500' : 'text-slate-500'
            )}
          >
            What&apos;s still missing
          </p>

          {/* Entity / Individual — paired table (2 items per row) */}
          {entityGroup && (() => {
            const reqs = [...(isEntity ? ENTITY_REQUIREMENTS : INDIVIDUAL_REQUIREMENTS)] as string[]
            if (isEntity && entityGroup.missingItems.some((mi) => mi.toLowerCase().includes('at least one active member'))) {
              reqs.push('__active_member__')
            }
            const pairs: [string, string | null][] = []
            for (let i = 0; i < reqs.length; i += 2) {
              pairs.push([reqs[i], reqs[i + 1] ?? null])
            }
            return (
              <div
                className={cn(
                  'overflow-hidden rounded-2xl border',
                  isDark ? 'border-white/10' : 'border-slate-200/80'
                )}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={cn(isDark ? 'bg-white/[0.03]' : 'bg-slate-50/70')}>
                        <th colSpan={4} className={cn(
                          'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider',
                          isDark ? 'text-gray-400' : 'text-slate-500'
                        )}>
                          {isEntity ? entityGroup.name : 'Your documents'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn('divide-y', isDark ? 'divide-white/5' : 'divide-slate-100')}>
                      {pairs.map(([left, right], idx) => {
                        const leftResolved = left === '__active_member__'
                          ? { label: 'Active member required', status: 'missing' as ItemStatus }
                          : resolveRequirementStatus(entityGroup.missingItems, left)
                        const rightResolved = right
                          ? right === '__active_member__'
                            ? { label: 'Active member required', status: 'missing' as ItemStatus }
                            : resolveRequirementStatus(entityGroup.missingItems, right)
                          : null
                        return (
                          <tr key={idx} className={isDark ? 'bg-card' : 'bg-white'}>
                            <td className={cn(
                              'px-3 py-1.5 text-xs',
                              leftResolved.status === 'approved'
                                ? isDark ? 'text-gray-600' : 'text-slate-400'
                                : isDark ? 'text-gray-200' : 'text-slate-700'
                            )}>
                              {left === '__active_member__' ? 'Active member required' : left}
                            </td>
                            <td className="py-1.5 pr-3 text-right">
                              <StatusCell status={leftResolved.status} isDark={isDark} />
                            </td>
                            {rightResolved ? (
                              <>
                                <td className={cn(
                                  'border-l px-3 py-1.5 text-xs',
                                  isDark ? 'border-white/5' : 'border-slate-100',
                                  rightResolved.status === 'approved'
                                    ? isDark ? 'text-gray-600' : 'text-slate-400'
                                    : isDark ? 'text-gray-200' : 'text-slate-700'
                                )}>
                                  {right === '__active_member__' ? 'Active member required' : right}
                                </td>
                                <td className="py-1.5 pr-3 text-right">
                                  <StatusCell status={rightResolved.status} isDark={isDark} />
                                </td>
                              </>
                            ) : (
                              <td colSpan={2} className={cn('border-l', isDark ? 'border-white/5' : 'border-slate-100')} />
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {/* Members — matrix table */}
          {memberGroups.length > 0 && (
            <div
              className={cn(
                'overflow-hidden rounded-2xl border',
                isDark ? 'border-white/10' : 'border-slate-200/80'
              )}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className={cn(isDark ? 'bg-white/[0.03]' : 'bg-slate-50/70')}>
                      <th className={cn(
                        'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider',
                        isDark ? 'text-gray-500' : 'text-slate-400'
                      )}>
                        Member
                      </th>
                      {MEMBER_REQUIREMENTS.map((req) => (
                        <th
                          key={req}
                          className={cn(
                            'px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap',
                            isDark ? 'text-gray-500' : 'text-slate-400'
                          )}
                        >
                          {MEMBER_REQ_SHORT[req] || req}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={cn('divide-y', isDark ? 'divide-white/5' : 'divide-slate-100')}>
                    {memberGroups.map((member, idx) => (
                      <tr key={member.memberId || idx} className={isDark ? 'bg-card' : 'bg-white'}>
                        <td className="px-3 py-2">
                          <p className={cn('text-xs font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                            {member.name}
                          </p>
                          {member.email && (
                            <p className={cn('text-[11px] truncate max-w-[160px]', isDark ? 'text-gray-500' : 'text-slate-500')}>
                              {member.email}
                            </p>
                          )}
                        </td>
                        {MEMBER_REQUIREMENTS.map((req) => {
                          const resolved = resolveRequirementStatus(member.missingItems, req)
                          return (
                            <td key={req} className="px-2 py-2 text-center">
                              <StatusCell status={resolved.status} isDark={isDark} />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Under review indicator */}
      {stage === 'under_review' && (
        <div
          className={cn(
            'mt-5 flex items-center gap-2.5 rounded-2xl border px-4 py-3',
            isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200/80 bg-slate-50/70'
          )}
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-gray-400' : 'text-slate-600'
            )}
          >
            Review in progress — you will be notified when a decision is made.
          </p>
        </div>
      )}

      {/* Single CTA */}
      <div className="mt-6">
        {stage === 'ready_to_submit' && state.canSubmitAccountApproval ? (
          <Button
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={handleSubmitForApproval}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for approval
              </>
            )}
          </Button>
        ) : stage === 'under_review' ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={kycHref}>
              View submitted documents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full sm:w-auto">
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}

        {stage === 'ready_to_submit' && !state.canSubmitAccountApproval && (
          <p
            className={cn(
              'mt-2 text-xs',
              isDark ? 'text-gray-500' : 'text-slate-500'
            )}
          >
            {state.personaType === 'introducer'
              ? 'Only primary contacts or introducer admins can submit for approval. '
              : 'Only primary account holders or admins can submit for approval. '}
            <Link href={profileHref} className="text-primary hover:underline">
              View account details
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
