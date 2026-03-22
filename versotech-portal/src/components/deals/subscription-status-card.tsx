'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Download,
  Eye,
  ExternalLink,
  FileSignature,
  FileText,
  Rocket,
  Banknote,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SubscriptionStatusEntry {
  id: string
  amount: number | null
  funded_amount?: number | null
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
    nda?: SubscriptionDocument | null
    subscription_pack?: SubscriptionDocument | null
    certificate?: {
      status: string
      url: string | null
    } | null
    signed_pack_available: boolean
    signed_pack_path: string | null
  }
}

interface DocumentSignatory {
  name: string
  email: string
  status: string
  signed_at: string | null
}

interface SubscriptionDocument {
  status: string
  signatories: DocumentSignatory[]
  unsigned_url: string | null
  signed_url: string | null
}

interface SubscriptionStatusCardProps {
  subscription?: {
    id: string
    status: string
    commitment: number | null
    currency: string
    funded_amount: number | null
    pack_generated_at: string | null
    pack_sent_at: string | null
    signed_at: string | null
    funded_at: string | null
    activated_at: string | null
    created_at: string | null
    is_signed: boolean
    is_funded: boolean
    is_active: boolean
    documents: {
      nda: SubscriptionDocument
      subscription_pack: SubscriptionDocument
      certificate: {
        status: string
        url: string | null
      } | null
    } | null
  }
  entry?: SubscriptionStatusEntry | null
  heading?: string | null
  dealCurrency?: string
  onViewNdas?: () => void
  onViewSignedPack?: (path: string) => void
}

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: Rocket }
    case 'committed':
      return { label: 'Committed', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: CheckCircle2 }
    case 'funded':
      return { label: 'Funded', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: DollarSign }
    case 'pending':
    default:
      return { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock }
  }
}

function formatDateShort(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

function DocumentRow({
  icon: Icon,
  iconColor,
  label,
  doc,
  onPreview,
}: {
  icon: typeof FileText
  iconColor: string
  label: string
  doc: SubscriptionDocument
  onPreview?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const signedCount = doc.signatories.filter(s => s.status === 'signed').length
  const totalCount = doc.signatories.length
  const isComplete = doc.status === 'complete'
  const hasUrl = doc.signed_url || doc.unsigned_url
  const isToggleable = totalCount > 0
  const toggleExpanded = () => {
    if (isToggleable) setExpanded(current => !current)
  }

  return (
    <div>
      <div
        role={isToggleable ? 'button' : undefined}
        tabIndex={isToggleable ? 0 : undefined}
        aria-expanded={isToggleable ? expanded : undefined}
        className={cn(
          'w-full flex items-center gap-2.5 py-2 px-2.5 rounded-md text-left transition-colors',
          isToggleable && 'hover:bg-muted/50 cursor-pointer',
          expanded && 'bg-muted/30'
        )}
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (!isToggleable) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleExpanded()
          }
        }}
      >
        <Icon className={cn('w-4 h-4 shrink-0', iconColor)} />
        <span className="text-sm font-medium flex-1">{label}</span>
        <div className="flex items-center gap-1.5">
          {onPreview && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onPreview()
              }}
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          )}
          {isToggleable && (
            <span className={cn('text-xs tabular-nums', isComplete ? 'text-emerald-600' : 'text-muted-foreground')}>
              {signedCount}/{totalCount}
            </span>
          )}
          {isComplete ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          )}
          {isToggleable && (
            <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
          )}
        </div>
      </div>

      {expanded && (
        <div className="ml-6 mr-2 mt-1 mb-1.5 space-y-1">
          {doc.signatories.map((sig, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-0.5 px-2 rounded bg-muted/40">
              <span className="text-muted-foreground truncate max-w-[120px]">{sig.name}</span>
              {sig.status === 'signed' ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {sig.signed_at ? formatDateShort(sig.signed_at) : 'Done'}
                </span>
              ) : (
                <span className="text-amber-500 text-[10px]">Pending</span>
              )}
            </div>
          ))}
          {hasUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 text-[10px] px-2 mt-0.5"
              onClick={(e) => {
                e.stopPropagation()
                window.open(doc.signed_url || doc.unsigned_url!, '_blank')
              }}
            >
              {doc.signed_url ? <Download className="w-2.5 h-2.5 mr-1" /> : <ExternalLink className="w-2.5 h-2.5 mr-1" />}
              {doc.signed_url ? 'Download' : 'View'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function SubscriptionStatusCard({
  subscription,
  entry,
  heading,
  dealCurrency,
  onViewNdas,
  onViewSignedPack,
}: SubscriptionStatusCardProps) {
  if (!subscription && !entry) return null

  const statusConfig = getStatusConfig(entry?.status || subscription?.status || 'pending')
  const StatusIcon = statusConfig.icon
  const statusLabel = entry?.status_label || statusConfig.label
  const currency = entry?.currency || subscription?.currency || dealCurrency || 'USD'
  const docs = subscription?.documents || (entry ? {
    nda: entry.documents.nda || {
      status: 'not_started',
      signatories: [],
      unsigned_url: null,
      signed_url: null,
    },
    subscription_pack: entry.documents.subscription_pack || {
      status: 'not_started',
      signatories: [],
      unsigned_url: null,
      signed_url: null,
    },
    certificate: entry.documents.certificate || null,
  } : null)
  const fundedAmount = entry?.funded_amount ?? subscription?.funded_amount ?? null
  const signedPackPath = entry?.documents.signed_pack_available
    ? entry.documents.signed_pack_path
    : docs?.subscription_pack?.status === 'complete'
      ? docs.subscription_pack.signed_url
      : null
  const effectiveHeading = heading === undefined ? 'Your Subscription' : heading

  const isActive = entry ? entry.milestones.active : !!subscription?.activated_at
  const isFunded = entry ? entry.milestones.funded : (isActive || !!subscription?.funded_at)
  const isSigned = entry ? entry.milestones.signed : (isFunded || !!subscription?.signed_at)
  const isSent = entry ? entry.milestones.confirmed : (isSigned || !!subscription?.pack_sent_at)
  const isGenerated = entry ? entry.milestones.confirmed : (isSent || !!subscription?.pack_generated_at)
  const steps = entry
    ? [
        { key: 'confirmed', done: entry.milestones.confirmed },
        { key: 'signed', done: entry.milestones.signed },
        { key: 'funded', done: entry.milestones.funded },
        { key: 'active', done: entry.milestones.active }
      ]
    : [
        { key: 'generated', done: isGenerated },
        { key: 'sent', done: isSent },
        { key: 'signed', done: isSigned },
        { key: 'funded', done: isFunded },
        { key: 'active', done: isActive }
      ]
  const completedSteps = steps.filter(s => s.done).length
  const progressPercent = (completedSteps / steps.length) * 100

  return (
    <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {effectiveHeading ? (
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-500" />
              {effectiveHeading}
            </CardTitle>
          ) : <div />}
          <Badge className={cn(statusConfig.bg, statusConfig.color, 'border-0')}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-xl', statusConfig.bg)}>
            <DollarSign className={cn('w-5 h-5', statusConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold tracking-tight">
              {formatCurrency(entry?.amount ?? subscription?.commitment ?? null, currency)}
            </div>
            {entry?.is_reinvestment && (
              <div className="text-xs text-muted-foreground">
                Additional investment
              </div>
            )}
            {!entry && fundedAmount !== null && fundedAmount > 0 && (
              <div className="text-xs text-muted-foreground">
                Funded: {formatCurrency(fundedAmount, currency)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completedSteps}/{steps.length}</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {docs && (
          <div className="rounded-lg border divide-y bg-card/50">
            <DocumentRow
              icon={FileSignature}
              iconColor="text-blue-500"
              label="NDA"
              doc={docs.nda}
              onPreview={onViewNdas}
            />
            <DocumentRow
              icon={FileText}
              iconColor="text-purple-500"
              label="Subscription Pack"
              doc={docs.subscription_pack}
              onPreview={signedPackPath && onViewSignedPack ? () => onViewSignedPack(signedPackPath) : undefined}
            />
            {(docs.certificate || isActive) && (
              <div className="flex items-center gap-2.5 py-2 px-2.5">
                <Award className={cn('w-4 h-4', docs.certificate?.status === 'available' ? 'text-amber-500' : 'text-muted-foreground')} />
                <span className="text-sm font-medium flex-1">Certificate</span>
                {docs.certificate?.status === 'available' ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {docs.certificate.url && (
                      <Button size="sm" variant="ghost" className="h-5 px-1.5" onClick={() => window.open(docs.certificate!.url!, '_blank')}>
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
              </div>
            )}
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <Rocket className="w-4 h-4 text-emerald-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Investment Active</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Track in Portfolio</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
