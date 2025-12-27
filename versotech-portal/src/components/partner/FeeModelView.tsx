'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileSignature } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

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

              return (
                <div key={plan.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.deal?.name ? `Deal: ${plan.deal.name}` : plan.description || 'General fee model'}
                      </p>
                    </div>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
