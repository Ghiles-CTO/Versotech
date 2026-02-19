'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  FileSignature,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  DollarSign,
  Rocket,
  Award,
  ChevronDown,
  ExternalLink,
  Banknote,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  subscription: {
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
  dealCurrency?: string
  dealId?: string
  dealName?: string
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

function formatDateShort(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
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

// Compact document row with expand/collapse
function DocumentRow({
  icon: Icon,
  iconColor,
  label,
  doc
}: {
  icon: typeof FileText
  iconColor: string
  label: string
  doc: SubscriptionDocument
}) {
  const [expanded, setExpanded] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const path = doc.signed_url || doc.unsigned_url
    if (!path) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/storage/signed-url?bucket=signatures&path=${encodeURIComponent(path)}`)
      const data = await res.json()
      if (data.signedUrl) {
        window.open(data.signedUrl, '_blank')
      } else {
        toast.error('Could not generate download link')
      }
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }
  const signedCount = doc.signatories.filter(s => s.status === 'signed').length
  const totalCount = doc.signatories.length
  const isComplete = doc.status === 'complete'
  const hasUrl = doc.signed_url || doc.unsigned_url

  return (
    <div>
      <button
        type="button"
        className={cn(
          "w-full flex items-center gap-2.5 py-2 px-2.5 rounded-md text-left transition-colors",
          totalCount > 0 && "hover:bg-muted/50 cursor-pointer",
          expanded && "bg-muted/30"
        )}
        onClick={() => totalCount > 0 && setExpanded(!expanded)}
        disabled={totalCount === 0}
      >
        <Icon className={cn("w-4 h-4 shrink-0", iconColor)} />
        <span className="text-sm font-medium flex-1">{label}</span>
        <div className="flex items-center gap-1.5">
          {totalCount > 0 && (
            <span className={cn("text-xs tabular-nums", isComplete ? "text-emerald-600" : "text-muted-foreground")}>
              {signedCount}/{totalCount}
            </span>
          )}
          {isComplete ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          )}
          {totalCount > 0 && (
            <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          )}
        </div>
      </button>

      {/* Expanded content */}
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
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-2.5 h-2.5 mr-1" />
              {downloading ? 'Loading...' : 'Download'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function SubscriptionStatusCard({
  subscription,
  dealCurrency,
  dealId,
  dealName
}: SubscriptionStatusCardProps) {
  const statusConfig = getStatusConfig(subscription.status)
  const StatusIcon = statusConfig.icon
  const currency = subscription.currency || dealCurrency || 'USD'
  const docs = subscription.documents
  const [clarificationOpen, setClarificationOpen] = useState(false)
  const [clarificationSubject, setClarificationSubject] = useState(
    dealName ? `Subscription pack clarification - ${dealName}` : 'Subscription pack clarification'
  )
  const [clarificationDetails, setClarificationDetails] = useState('')
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false)

  // Progress calculation — if a later step is done, treat all earlier steps as done
  const isActive = !!subscription.activated_at
  const isFunded = isActive || !!subscription.funded_at
  const isSigned = isFunded || !!subscription.signed_at
  const isSent = isSigned || !!subscription.pack_sent_at
  const isGenerated = isSent || !!subscription.pack_generated_at
  const steps = [
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
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-500" />
            Your Subscription
          </CardTitle>
          <Badge className={cn(statusConfig.bg, statusConfig.color, "border-0")}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Commitment - Compact inline display */}
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", statusConfig.bg)}>
            <DollarSign className={cn("w-5 h-5", statusConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold tracking-tight">
              {formatCurrency(subscription.commitment, currency)}
            </div>
            {subscription.funded_amount !== null && subscription.funded_amount > 0 && (
              <div className="text-xs text-muted-foreground">
                Funded: {formatCurrency(subscription.funded_amount, currency)}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completedSteps}/{steps.length}</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Documents - Compact collapsible list */}
        {docs && (
          <div className="rounded-lg border divide-y bg-card/50">
            <DocumentRow icon={FileSignature} iconColor="text-blue-500" label="NDA" doc={docs.nda} />
            <DocumentRow icon={FileText} iconColor="text-purple-500" label="Subscription Pack" doc={docs.subscription_pack} />
            {(docs.certificate || subscription.is_active) && (
              <div className="flex items-center gap-2.5 py-2 px-2.5">
                <Award className={cn("w-4 h-4", docs.certificate?.status === 'available' ? "text-amber-500" : "text-muted-foreground")} />
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

        {/* Clarification request */}
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setClarificationOpen(true)}
            disabled={!dealId}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Request Clarification
          </Button>
        </div>

        {/* Active banner */}
        {subscription.is_active && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <Rocket className="w-4 h-4 text-emerald-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Investment Active</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Track in Portfolio</div>
            </div>
          </div>
        )}

        {/* No docs placeholder */}
        {!docs && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Documents being prepared...</span>
          </div>
        )}
      </CardContent>

      <Dialog open={clarificationOpen} onOpenChange={setClarificationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Clarification</DialogTitle>
            <DialogDescription>
              Submit questions or clarification requests about the subscription pack.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={clarificationSubject}
                onChange={(e) => setClarificationSubject(e.target.value)}
                placeholder="Subscription pack clarification"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Details</label>
              <Textarea
                value={clarificationDetails}
                onChange={(e) => setClarificationDetails(e.target.value)}
                placeholder="Share the exact sections or questions you need clarified..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClarificationOpen(false)}
              disabled={clarificationSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!dealId) return
                if (!clarificationSubject.trim()) {
                  toast.error('Please enter a subject for your clarification request.')
                  return
                }
                if (!clarificationDetails.trim()) {
                  toast.error('Please include details for your clarification request.')
                  return
                }

                try {
                  setClarificationSubmitting(true)
                  const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      category: 'communication',
                      subject: clarificationSubject.trim(),
                      details: clarificationDetails.trim(),
                      dealId
                    })
                  })

                  if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to submit clarification')
                  }

                  toast.success('Clarification request submitted.')
                  setClarificationDetails('')
                  setClarificationOpen(false)
                } catch (error) {
                  console.error('[SubscriptionStatusCard] Clarification error:', error)
                  toast.error(error instanceof Error ? error.message : 'Failed to submit clarification')
                } finally {
                  setClarificationSubmitting(false)
                }
              }}
              disabled={clarificationSubmitting}
            >
              {clarificationSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
