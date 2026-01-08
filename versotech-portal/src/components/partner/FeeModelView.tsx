'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, FileSignature, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'

type FeeComponent = {
  id: string
  kind: string
  rate_bps: number | string | null
  flat_amount: number | string | null
  calc_method: string | null
  frequency: string | null
}

type FeePlan = {
  id: string
  name: string
  description: string | null
  status: string | null
  is_active: boolean
  is_default: boolean
  effective_from: string | null
  effective_until: string | null
  deal: {
    id: string
    name: string
  } | null
  fee_components: FeeComponent[]
}

const FEE_KIND_LABELS: Record<string, string> = {
  subscription: 'Subscription Fee',
  management: 'Management Fee',
  performance: 'Performance Fee',
  flat: 'Flat Fee'
}

const SUMMARY_KINDS = ['subscription', 'management', 'performance'] as const

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Pending Approval',
  pending_signature: 'Pending Signature',
  accepted: 'Accepted',
  rejected: 'Rejected'
}

const STATUS_STYLES: Record<string, string> = {
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  sent: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  pending_signature: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

function formatComponentValue(component?: FeeComponent): string {
  if (!component) return '—'
  if (component.rate_bps !== null && component.rate_bps !== undefined) {
    const rateBps = Number(component.rate_bps)
    if (!Number.isNaN(rateBps)) {
      return `${rateBps / 100}%`
    }
  }
  if (component.flat_amount !== null && component.flat_amount !== undefined) {
    const flatAmount = Number(component.flat_amount)
    if (!Number.isNaN(flatAmount)) {
      return formatCurrency(flatAmount)
    }
  }
  return '—'
}

export function FeeModelView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feePlans, setFeePlans] = useState<FeePlan[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeeModels() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/partners/me/fee-models')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load fee models')
        }

        setFeePlans(data.fee_models || [])
      } catch (err) {
        console.error('Error fetching fee models:', err)
        setError(err instanceof Error ? err.message : 'Failed to load fee models')
      } finally {
        setLoading(false)
      }
    }

    fetchFeeModels()
  }, [])

  const updatePlanStatus = (planId: string, status: string) => {
    setFeePlans(prev =>
      prev.map(plan => (plan.id === planId ? { ...plan, status } : plan))
    )
  }

  const handleDecision = async (planId: string, action: 'accept' | 'reject') => {
    const reason = action === 'reject'
      ? prompt('Please provide a rejection reason:')
      : null

    if (action === 'reject' && !reason) return

    setActionLoadingId(planId)
    try {
      const response = await fetch(`/api/fee-plans/${planId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'reject' ? JSON.stringify({ reason }) : undefined
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} fee model`)
      }

      updatePlanStatus(planId, action === 'accept' ? 'accepted' : 'rejected')
      toast.success(action === 'accept' ? 'Fee model approved' : 'Fee model rejected')
    } catch (err) {
      console.error(`Error during ${action}:`, err)
      toast.error(err instanceof Error ? err.message : `Failed to ${action} fee model`)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Fee Models
        </CardTitle>
        <CardDescription>Read-only fee structures that apply to you</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading fee models...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : feePlans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No fee models assigned</p>
            <p className="text-sm mt-1">
              Contact your relationship manager for fee structure details
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feePlans.map((plan) => {
              const extraComponents = (plan.fee_components || []).filter(
                component => !SUMMARY_KINDS.includes(component.kind as typeof SUMMARY_KINDS[number])
              )
              const planStatus = plan.status || 'draft'
              const statusLabel = STATUS_LABELS[planStatus] || planStatus
              const statusStyle = STATUS_STYLES[planStatus] || STATUS_STYLES.draft
              const canRespond = planStatus === 'sent'

              return (
                <div key={plan.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.deal?.name ? `Deal: ${plan.deal.name}` : plan.description || 'General fee model'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className={statusStyle}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {SUMMARY_KINDS.map((kind) => (
                      <div key={kind} className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">{FEE_KIND_LABELS[kind]}</p>
                        <p className="text-sm font-medium">
                          {formatComponentValue(plan.fee_components.find(component => component.kind === kind))}
                        </p>
                      </div>
                    ))}
                  </div>

                  {extraComponents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {extraComponents.map(component => (
                        <Badge key={component.id} variant="outline">
                          {FEE_KIND_LABELS[component.kind] || component.kind}:{' '}
                          {formatComponentValue(component)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {canRespond && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDecision(plan.id, 'accept')}
                        disabled={actionLoadingId === plan.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {actionLoadingId === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDecision(plan.id, 'reject')}
                        disabled={actionLoadingId === plan.id}
                      >
                        {actionLoadingId === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
