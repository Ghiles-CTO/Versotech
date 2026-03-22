'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Banknote,
  CheckCircle2,
  Clock,
  FileSignature,
  Lock,
  Rocket,
} from 'lucide-react'

export interface SubscriptionStatusEntry {
  id: string
  amount: number | null
  currency: string
  status: 'pending_review' | 'awaiting_signature' | 'awaiting_funding' | 'funded' | 'active'
  status_label: string
  is_reinvestment: boolean
  milestones: {
    confirmed: boolean
    signed: boolean
    funded: boolean
    active: boolean
  }
  documents: {
    signed_pack_available: boolean
    signed_pack_path: string | null
  }
}

interface SubscriptionStatusCardProps {
  entry: SubscriptionStatusEntry
  heading?: string | null
  onViewNdas?: () => void
  onViewSignedPack?: (path: string) => void
}

function formatCurrency(amount: number | null, currency = 'USD'): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getStatusTone(status: SubscriptionStatusEntry['status']) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'funded':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'awaiting_funding':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    case 'awaiting_signature':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
    case 'pending_review':
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

const CARD_STAGES = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'signed', label: 'Pack Signed' },
  { key: 'funded', label: 'Funded' },
  { key: 'active', label: 'Active' },
] as const

export function SubscriptionStatusCard({
  entry,
  heading,
  onViewNdas,
  onViewSignedPack,
}: SubscriptionStatusCardProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      {heading ? (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-500" />
            {heading}
          </CardTitle>
        </CardHeader>
      ) : null}

      <CardContent className={cn('space-y-4', heading ? 'pt-0' : 'pt-6')}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {formatCurrency(entry.amount, entry.currency)}
            </p>
            {entry.is_reinvestment ? (
              <p className="text-sm text-muted-foreground">Additional investment</p>
            ) : null}
          </div>
          <Badge className={cn('border-0', getStatusTone(entry.status))}>
            {entry.status === 'active' ? <Rocket className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
            {entry.status_label}
          </Badge>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          {CARD_STAGES.map((stage) => {
            const completed = entry.milestones[stage.key]
            return (
              <div
                key={stage.key}
                className={cn(
                  'rounded-lg border px-3 py-2 text-center',
                  completed
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20'
                    : 'border-border bg-muted/30'
                )}
              >
                <div className="mb-1 flex justify-center">
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs font-medium',
                    completed ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {onViewNdas ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={onViewNdas}>
              <Lock className="h-4 w-4" />
              View NDAs
            </Button>
          ) : null}

          {entry.documents.signed_pack_available && entry.documents.signed_pack_path && onViewSignedPack ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onViewSignedPack(entry.documents.signed_pack_path!)}
            >
              <FileSignature className="h-4 w-4" />
              Preview signed subscription pack
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
