'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  FileSignature,
  FolderOpen,
  Send,
  CheckCircle2,
  DollarSign,
  Rocket,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InterestStatusCardProps {
  currentStage: number
  membership: {
    interest_confirmed_at: string | null
    nda_signed_at: string | null
    data_room_granted_at: string | null
  } | null
  subscription: {
    status: string
    pack_sent_at: string | null
    signed_at: string | null
    funded_at: string | null
  } | null
  canExpressInterest: boolean
  canSignNda: boolean
  canSubscribe: boolean
  isTrackingOnly: boolean
  onExpressInterest: () => void
  onSignNda: () => void
  onSubscribe: () => void
}

interface StageInfo {
  label: string
  description: string
  icon: typeof Heart
  color: string
  bgColor: string
}

const stageMetadata: Record<number, StageInfo> = {
  0: {
    label: 'New',
    description: 'Choose to request a subscription or explore the data room first',
    icon: Sparkles,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800'
  },
  1: {
    label: 'Received',
    description: 'Deal dispatched to you',
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  2: {
    label: 'Viewed',
    description: 'You have viewed this deal',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  3: {
    label: 'Interest Confirmed',
    description: 'Next: Sign NDA to access documents',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30'
  },
  4: {
    label: 'NDA Signed',
    description: 'Access data room documents',
    icon: FileSignature,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  },
  5: {
    label: 'Data Room Access',
    description: 'Review documents before subscribing',
    icon: FolderOpen,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30'
  },
  6: {
    label: 'Pack Generated',
    description: 'Subscription documents prepared',
    icon: CheckCircle2,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30'
  },
  7: {
    label: 'Pack Sent',
    description: 'Awaiting your signature',
    icon: Send,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30'
  },
  8: {
    label: 'Signed',
    description: 'Awaiting funding',
    icon: FileSignature,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  9: {
    label: 'Funded',
    description: 'Awaiting activation',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  10: {
    label: 'Active',
    description: 'Investment is active',
    icon: Rocket,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getLastAction(
  membership: InterestStatusCardProps['membership'],
  subscription: InterestStatusCardProps['subscription']
): { action: string; timestamp: string } | null {
  const actions: { action: string; timestamp: string | null }[] = [
    { action: 'Investment activated', timestamp: subscription?.funded_at && subscription.status === 'active' ? subscription.funded_at : null },
    { action: 'Funded', timestamp: subscription?.funded_at ?? null },
    { action: 'Subscription signed', timestamp: subscription?.signed_at ?? null },
    { action: 'Pack sent', timestamp: subscription?.pack_sent_at ?? null },
    { action: 'Data room access granted', timestamp: membership?.data_room_granted_at ?? null },
    { action: 'NDA signed', timestamp: membership?.nda_signed_at ?? null },
    { action: 'Interest confirmed', timestamp: membership?.interest_confirmed_at ?? null }
  ]

  for (const item of actions) {
    if (item.timestamp) {
      return { action: item.action, timestamp: formatDate(item.timestamp) }
    }
  }
  return null
}

export function InterestStatusCard({
  currentStage,
  membership,
  subscription,
  canExpressInterest,
  canSignNda,
  canSubscribe,
  isTrackingOnly,
  onExpressInterest,
  onSignNda,
  onSubscribe
}: InterestStatusCardProps) {
  const stageInfo = stageMetadata[currentStage] || stageMetadata[0]
  const Icon = stageInfo.icon
  const lastAction = getLastAction(membership, subscription)
  const progressPercentage = (currentStage / 10) * 100

  // Determine if we're in early stages where both options should be shown
  const isEarlyStage = currentStage <= 2 && !subscription
  const showTrackingNotice = isTrackingOnly
  const showSubscribeOption = canSubscribe && !showTrackingNotice
  const showExpressOption = canExpressInterest && !showTrackingNotice
  const showEarlyStageActions = isEarlyStage && (showSubscribeOption || showExpressOption)

  // Determine primary action based on stage
  const primaryAction: { label: string; onClick: () => void; icon: typeof Heart } | null =
    !showTrackingNotice && canSignNda
      ? { label: 'Sign NDA', onClick: onSignNda, icon: FileSignature }
      : !showTrackingNotice && canSubscribe
        ? { label: 'Subscribe Now', onClick: onSubscribe, icon: Rocket }
        : null

  return (
    <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Your Interest Status
          </CardTitle>
          <Badge className={cn(stageInfo.bgColor, stageInfo.color, "border-0")}>
            Stage {currentStage}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", stageInfo.bgColor)}>
            <Icon className={cn("w-6 h-6", stageInfo.color)} />
          </div>
          <div className="flex-1">
            <h3 className={cn("font-semibold text-lg", stageInfo.color)}>
              {stageInfo.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {stageInfo.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Journey Progress</span>
            <span>{currentStage}/10 stages</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {showTrackingNotice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
            <p className="text-sm font-medium">Tracking Only Access</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              You can view this deal, but investment actions are disabled. Contact your relationship manager for investor access.
            </p>
          </div>
        )}

        {/* Last Action */}
        {lastAction && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{lastAction.action}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              {lastAction.timestamp}
            </p>
          </div>
        )}

        {/* Two-Path Actions for Early Stages */}
        {showEarlyStageActions && (
          <div className="space-y-4">
            {/* Primary Path: Subscribe Directly */}
            {showSubscribeOption && (
              <button
                onClick={onSubscribe}
                className="w-full p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      Subscribe to Investment
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Direct path • NDA + Subscription Pack
                    </div>
                  </div>
                </div>
              </button>
            )}

            {/* OR Divider */}
            {showSubscribeOption && showExpressOption && (
              <div className="relative flex items-center">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="px-3 text-xs text-muted-foreground font-medium bg-white dark:bg-gray-900">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}

            {/* Secondary Path: Data Room */}
            {showExpressOption && (
              <button
                onClick={onExpressInterest}
                className="w-full p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition-colors text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      Request Data Room Access
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Review documents before committing
                    </div>
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Single Action Button for Later Stages */}
        {!isEarlyStage && primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            className="w-full"
            size="lg"
          >
            <primaryAction.icon className="w-4 h-4 mr-2" />
            {primaryAction.label}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Completion Message for Active Investments */}
        {currentStage === 10 && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <p className="font-medium text-emerald-700 dark:text-emerald-300">
              Investment Active
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              View in your Portfolio for NAV tracking
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
