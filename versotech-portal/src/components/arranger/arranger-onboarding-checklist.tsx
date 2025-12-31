'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  User,
  FileText,
  PenTool,
  Send,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

interface OnboardingStatus {
  arranger_id: string
  status: string
  kyc_status: string | null
  onboarding: {
    progress_percent: number
    completed_steps: number
    total_steps: number
    is_complete: boolean
    next_action: {
      step: string
      label: string
      href: string
    } | null
    steps: {
      profile: { complete: boolean; progress: string }
      documents: { complete: boolean; progress: string }
      signature: { complete: boolean }
      submitted: { complete: boolean; submitted_at?: string }
      approved: { complete: boolean; approved_at?: string }
    }
  }
}

interface ArrangerOnboardingChecklistProps {
  arrangerId: string
  compact?: boolean
}

export function ArrangerOnboardingChecklist({
  arrangerId,
  compact = false,
}: ArrangerOnboardingChecklistProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/arrangers/me/onboarding-status')
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding status')
        }
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        console.error('Error fetching onboarding status:', err)
        setError('Failed to load onboarding status')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [arrangerId])

  if (loading) {
    return (
      <Card className={cn(isDark ? 'bg-white/5 border-white/10' : '')}>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (error || !status) {
    return null
  }

  // Don't show if already approved
  if (status.onboarding.is_complete && compact) {
    return null
  }

  const { onboarding } = status
  const steps = [
    {
      id: 'profile',
      label: 'Complete Profile',
      description: 'Fill in your company details',
      icon: User,
      complete: onboarding.steps.profile.complete,
      href: '/versotech_main/arranger-profile?tab=entity',
      progress: onboarding.steps.profile.progress,
    },
    {
      id: 'documents',
      label: 'Upload Documents',
      description: 'Required KYC documents',
      icon: FileText,
      complete: onboarding.steps.documents.complete,
      href: '/versotech_main/arranger-profile?tab=documents',
      progress: onboarding.steps.documents.progress,
    },
    {
      id: 'signature',
      label: 'Signature Specimen',
      description: 'Add your signature',
      icon: PenTool,
      complete: onboarding.steps.signature.complete,
      href: '/versotech_main/arranger-profile?tab=signature',
    },
    {
      id: 'submitted',
      label: 'Submit for Review',
      description: 'Send for VERSO approval',
      icon: Send,
      complete: onboarding.steps.submitted.complete,
      href: '/versotech_main/arranger-profile?tab=documents',
    },
    {
      id: 'approved',
      label: 'KYC Approved',
      description: 'Ready to operate',
      icon: ShieldCheck,
      complete: onboarding.steps.approved.complete,
    },
  ]

  if (compact) {
    return (
      <Card className={cn(
        'border-indigo-500/30',
        isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'
      )}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 rounded-full bg-indigo-500/20">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>
                  Complete Your Onboarding
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <Progress
                    value={onboarding.progress_percent}
                    className="h-2 flex-1 max-w-[200px]"
                  />
                  <span className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {onboarding.progress_percent}%
                  </span>
                </div>
              </div>
            </div>
            {onboarding.next_action && (
              <Button asChild size="sm">
                <Link href={onboarding.next_action.href}>
                  {onboarding.next_action.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(isDark ? 'bg-white/5 border-white/10' : '')}>
      <CardHeader>
        <CardTitle className={cn(isDark ? 'text-white' : 'text-gray-900')}>
          Onboarding Checklist
        </CardTitle>
        <CardDescription className={cn(isDark ? 'text-gray-400' : 'text-gray-500')}>
          Complete these steps to activate your arranger account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>
              Progress
            </span>
            <span className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>
              {onboarding.completed_steps} of {onboarding.total_steps} steps
            </span>
          </div>
          <Progress value={onboarding.progress_percent} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3 pt-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isNext = onboarding.next_action?.step === step.id ||
              (onboarding.next_action?.step === 'submit' && step.id === 'submitted') ||
              (onboarding.next_action?.step === 'pending' && step.id === 'submitted')

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  step.complete
                    ? isDark ? 'bg-green-500/10' : 'bg-green-50'
                    : isNext
                    ? isDark ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200'
                    : isDark ? 'bg-white/5' : 'bg-gray-50'
                )}
              >
                {/* Status Icon */}
                <div className={cn(
                  'flex-shrink-0 p-2 rounded-full',
                  step.complete
                    ? 'bg-green-500/20 text-green-500'
                    : isNext
                    ? 'bg-indigo-500/20 text-indigo-500'
                    : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                )}>
                  {step.complete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : onboarding.next_action?.step === 'pending' && step.id === 'submitted' ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium text-sm',
                    step.complete
                      ? isDark ? 'text-green-400' : 'text-green-700'
                      : isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    {step.label}
                    {step.progress && !step.complete && (
                      <span className={cn(
                        'ml-2 text-xs font-normal',
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        ({step.progress})
                      </span>
                    )}
                  </p>
                  <p className={cn(
                    'text-xs',
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  )}>
                    {onboarding.next_action?.step === 'pending' && step.id === 'submitted'
                      ? 'Awaiting VERSO team review'
                      : step.description}
                  </p>
                </div>

                {/* Action */}
                {!step.complete && step.href && step.id !== 'approved' && (
                  <Button
                    asChild
                    variant={isNext ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Link href={step.href}>
                      {isNext ? 'Start' : 'View'}
                    </Link>
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
