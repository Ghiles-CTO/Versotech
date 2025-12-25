'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Loader2,
  Ban,
  ArrowRight,
  FileText,
  AlertTriangle,
  TrendingDown,
  type LucideIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface SaleRequest {
  id: string
  status: string
  amount_to_sell: number
  asking_price_per_unit?: number
  notes?: string
  status_notes?: string
  rejection_reason?: string
  created_at: string
  approved_at?: string
  matched_at?: string
  transfer_completed_at?: string
  subscription?: {
    id: string
    commitment: number
    funded_amount: number
    currency: string
    vehicle?: {
      id: string
      name: string
      type: string
    }
  }
  matched_buyer?: {
    id: string
    legal_name: string
  }
}

interface SaleStatusTrackerProps {
  requests: SaleRequest[]
  onRequestCancelled?: () => void
}

interface StatusConfig {
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  icon: LucideIcon
  step: number
}

const statusConfig: Record<string, StatusConfig> = {
  pending: {
    label: 'Under Review',
    description: 'Your request is being reviewed by our team',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    icon: Clock,
    step: 1
  },
  approved: {
    label: 'Approved',
    description: 'Request approved, searching for buyers',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
    icon: CheckCircle2,
    step: 2
  },
  matched: {
    label: 'Buyer Found',
    description: 'A buyer has been matched to your position',
    color: 'text-violet-700 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-800/50',
    icon: Users,
    step: 3
  },
  in_progress: {
    label: 'Transfer in Progress',
    description: 'Processing the transfer of ownership',
    color: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800/50',
    icon: ArrowRight,
    step: 4
  },
  completed: {
    label: 'Completed',
    description: 'Sale completed successfully',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/50',
    icon: CheckCircle2,
    step: 5
  },
  rejected: {
    label: 'Declined',
    description: 'Request was not approved',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800/50',
    icon: XCircle,
    step: -1
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Request was cancelled',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-900/50',
    borderColor: 'border-slate-200 dark:border-slate-700/50',
    icon: Ban,
    step: -1
  }
}

// Timeline steps for progress visualization
const timelineSteps = [
  { step: 1, label: 'Review', status: 'pending' },
  { step: 2, label: 'Approved', status: 'approved' },
  { step: 3, label: 'Matched', status: 'matched' },
  { step: 4, label: 'Transfer', status: 'in_progress' },
  { step: 5, label: 'Complete', status: 'completed' }
]

export function SaleStatusTracker({ requests, onRequestCancelled }: SaleStatusTrackerProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  const handleCancel = async (requestId: string) => {
    setCancellingId(requestId)
    try {
      const response = await fetch(`/api/investor/sell-request/${requestId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel request')
      }

      toast.success('Sale request cancelled')
      onRequestCancelled?.()
    } catch (err) {
      console.error('Cancel error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to cancel request')
    } finally {
      setCancellingId(null)
    }
  }

  if (requests.length === 0) {
    return null
  }

  // Separate active and completed/cancelled requests
  const activeRequests = requests.filter(r => !['completed', 'rejected', 'cancelled'].includes(r.status))
  const pastRequests = requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status))

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50">
          <TrendingDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h3 className="font-semibold tracking-tight">Sale Requests</h3>
          <p className="text-xs text-muted-foreground">
            {activeRequests.length} active · {pastRequests.length} completed
          </p>
        </div>
      </div>

      {/* Active Requests */}
      {activeRequests.length > 0 && (
        <div className="space-y-4">
          {activeRequests.map((request) => {
            const config = statusConfig[request.status] || statusConfig.pending
            const StatusIcon = config.icon
            const currency = request.subscription?.currency || 'USD'
            const vehicleName = request.subscription?.vehicle?.name || 'Position'
            const currentStep = config.step

            return (
              <Card
                key={request.id}
                className={cn(
                  "overflow-hidden transition-all",
                  config.borderColor
                )}
              >
                {/* Progress Timeline */}
                {currentStep > 0 && (
                  <div className="px-6 pt-5 pb-3">
                    <div className="flex items-center justify-between relative">
                      {/* Progress line background */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700" />
                      {/* Progress line filled */}
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (timelineSteps.length - 1)) * 100}%` }}
                      />

                      {timelineSteps.map((step, index) => {
                        const isCompleted = currentStep > step.step
                        const isCurrent = currentStep === step.step
                        const isPending = currentStep < step.step

                        return (
                          <div
                            key={step.step}
                            className="relative flex flex-col items-center z-10"
                          >
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full border-2 transition-all",
                                isCompleted && "bg-primary border-primary",
                                isCurrent && "bg-white dark:bg-slate-900 border-primary ring-4 ring-primary/20",
                                isPending && "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                              )}
                            />
                            <span
                              className={cn(
                                "absolute top-5 text-[10px] font-medium whitespace-nowrap",
                                isCompleted && "text-primary",
                                isCurrent && "text-primary font-semibold",
                                isPending && "text-muted-foreground"
                              )}
                            >
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <CardContent className="pt-8 pb-5 px-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", config.bgColor)}>
                        <StatusIcon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div>
                        <h4 className="font-medium">{vehicleName}</h4>
                        <p className={cn("text-sm", config.color)}>{config.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(config.bgColor, config.color, config.borderColor, "font-medium")}
                    >
                      {config.label}
                    </Badge>
                  </div>

                  {/* Sale Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                      <p className="font-semibold tabular-nums">
                        {formatCurrency(Number(request.amount_to_sell), currency)}
                      </p>
                    </div>
                    {request.asking_price_per_unit && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Asking Price</p>
                        <p className="font-semibold tabular-nums">
                          {formatCurrency(Number(request.asking_price_per_unit), currency)}/unit
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timeline Events */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span>
                        Submitted {format(new Date(request.created_at), 'MMM d, yyyy')}
                        <span className="text-xs ml-1 opacity-70">
                          ({formatDistanceToNow(new Date(request.created_at), { addSuffix: true })})
                        </span>
                      </span>
                    </div>
                    {request.approved_at && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approved {formatDistanceToNow(new Date(request.approved_at), { addSuffix: true })}</span>
                      </div>
                    )}
                    {request.matched_at && (
                      <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                        <Users className="h-3.5 w-3.5" />
                        <span>Buyer matched {formatDistanceToNow(new Date(request.matched_at), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Notes */}
                  {request.status_notes && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Staff Note</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">{request.status_notes}</p>
                    </div>
                  )}

                  {/* Matched Buyer */}
                  {request.matched_buyer && (
                    <div className="mt-4 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/30">
                      <p className="text-xs font-medium text-violet-800 dark:text-violet-300 mb-1">Matched Buyer</p>
                      <p className="text-sm text-violet-700 dark:text-violet-400 font-medium">
                        {request.matched_buyer.legal_name}
                      </p>
                    </div>
                  )}

                  {/* Cancel Button */}
                  {request.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            disabled={cancellingId === request.id}
                          >
                            {cancellingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Ban className="h-4 w-4 mr-2" />
                            )}
                            Cancel Request
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Sale Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel your sale request for {vehicleName}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Request</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancel(request.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Past Requests (Collapsed) */}
      {pastRequests.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Past Requests
          </p>
          {pastRequests.map((request) => {
            const config = statusConfig[request.status] || statusConfig.cancelled
            const StatusIcon = config.icon
            const currency = request.subscription?.currency || 'USD'
            const vehicleName = request.subscription?.vehicle?.name || 'Position'

            return (
              <Card
                key={request.id}
                className={cn(
                  "transition-all opacity-75 hover:opacity-100",
                  config.borderColor
                )}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-md", config.bgColor)}>
                        <StatusIcon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{vehicleName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(Number(request.amount_to_sell), currency)} · {config.label}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Rejection Reason */}
                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-3 p-2.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-400">{request.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
