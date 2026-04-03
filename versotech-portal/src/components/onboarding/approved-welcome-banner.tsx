'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, X } from 'lucide-react'
import { usePersona } from '@/contexts/persona-context'
import { cn } from '@/lib/utils'

const APPROVED_COUNT_KEY_PREFIX = 'verso_onboarding_approved_count'
const APPROVED_SESSION_KEY_PREFIX = 'verso_onboarding_approved_dismissed'
const BANNER_SESSION_KEY_PREFIX = 'verso_onboarding_approved_banner'
const BANNER_MAX_COUNT = 3

function getStorageScope(personaType?: string | null, entityId?: string | null) {
  return `${personaType || 'unknown'}:${entityId || 'default'}`
}

function getScopedStorageScope(
  personaType?: string | null,
  entityId?: string | null,
  approvalEventKey?: string | null
) {
  return `${getStorageScope(personaType, entityId)}:${approvalEventKey || 'current'}`
}

function getBannerCta(personaType?: string) {
  return personaType === 'introducer'
    ? { label: 'Go to workspace', href: '/versotech_main/dashboard' }
    : { label: 'Explore opportunities', href: '/versotech_main/opportunities' }
}

function getBannerMessage(personaType?: string) {
  return personaType === 'introducer'
    ? 'Your account is active. Your introducer workspace is ready.'
    : 'Your account is active. Explore investment opportunities available to you.'
}

export function ApprovedWelcomeBanner() {
  const router = useRouter()
  const { activePersona, isLoading } = usePersona()
  const [visible, setVisible] = useState(false)
  const [personaType, setPersonaType] = useState<string | undefined>()

  const onboardingPersona =
    activePersona?.persona_type === 'investor' || activePersona?.persona_type === 'introducer'
      ? activePersona
      : null

  useEffect(() => {
    if (isLoading || !onboardingPersona) return

    try {
      const endpoint =
        onboardingPersona.persona_type === 'introducer'
          ? '/api/introducers/me/dashboard-onboarding'
          : '/api/investors/me/dashboard-onboarding'

      fetch(endpoint, { credentials: 'same-origin', cache: 'no-store' })
        .then(async (res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return
          const isApproved = (data.accountApprovalStatus || '').toLowerCase().trim() === 'approved'
          if (!isApproved) return

          const personaType = data.personaType || onboardingPersona.persona_type
          const entityId = data.entityId || onboardingPersona.entity_id || data.investorId
          const scope = getScopedStorageScope(personaType, entityId, data.approvalEventKey)
          const countKey = `${APPROVED_COUNT_KEY_PREFIX}:${scope}`
          const modalSessionKey = `${APPROVED_SESSION_KEY_PREFIX}:${scope}`
          const bannerSessionKey = `${BANNER_SESSION_KEY_PREFIX}:${scope}`
          const count = Number.parseInt(window.localStorage.getItem(countKey) || '0', 10)
          const modalShownThisSession = window.sessionStorage.getItem(modalSessionKey) === '1'
          const bannerShownThisSession = window.sessionStorage.getItem(bannerSessionKey) === '1'

          if (count === 0 || count >= BANNER_MAX_COUNT || modalShownThisSession || bannerShownThisSession) {
            return
          }

          setPersonaType(personaType)
          setVisible(true)

          window.sessionStorage.setItem(bannerSessionKey, '1')
          window.localStorage.setItem(countKey, String(count + 1))
        })
        .catch(() => null)
    } catch {
      /* ignore storage errors */
    }
  }, [onboardingPersona, isLoading])

  if (!visible) return null

  const cta = getBannerCta(personaType)
  const message = getBannerMessage(personaType)

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl border px-4 py-3 mb-5',
      'border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-500/10'
    )}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-400/20">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
      </div>
      <p className="flex-1 text-sm text-foreground">{message}</p>
      <button
        onClick={() => { setVisible(false); router.push(cta.href) }}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
      >
        {cta.label}
        <ArrowRight className="h-3 w-3" />
      </button>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
