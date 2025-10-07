'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, Star } from 'lucide-react'
import { CreateFeePlanModal } from './create-fee-plan-modal'
import { AddFeeComponentModal } from './add-fee-component-modal'

interface DealFeePlansTabProps {
  dealId: string
  feePlans: any[]
}

export function DealFeePlansTab({ dealId, feePlans }: DealFeePlansTabProps) {
  const feeKindLabels: Record<string, string> = {
    subscription: 'Subscription Fee',
    management: 'Management Fee',
    performance: 'Performance Fee',
    spread_markup: 'Spread Markup',
    flat: 'Flat Fee',
    other: 'Other'
  }

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Plans
              </CardTitle>
              <CardDescription>Configure fee structures for investors</CardDescription>
            </div>
            <CreateFeePlanModal dealId={dealId} />
          </div>
        </CardHeader>
        <CardContent>
          {feePlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fee plans created yet. Click "Create Fee Plan" to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feePlans.map((plan) => (
                <Card key={plan.id} className="border border-white/10 bg-white/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-foreground flex items-center gap-2">
                          {plan.name}
                          {plan.is_default && (
                            <Star className="h-4 w-4 text-amber-200 fill-amber-200" />
                          )}
                        </CardTitle>
                        {plan.description && (
                          <CardDescription className="mt-1">{plan.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {plan.fee_components && plan.fee_components.length > 0 ? (
                      <div className="space-y-2">
                        {plan.fee_components.map((component: any) => (
                          <div
                            key={component.id}
                            className="flex items-center justify-between py-2 px-3 rounded bg-white/5"
                          >
                            <span className="text-sm text-foreground">
                              {feeKindLabels[component.kind]}
                            </span>
                            <Badge variant="outline" className="border-white/20 text-muted-foreground">
                              {component.rate_bps ? `${component.rate_bps / 100}%` : 
                               component.flat_amount ? `$${component.flat_amount}` : '—'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-3">No components added</p>
                    )}
                    <AddFeeComponentModal dealId={dealId} feePlanId={plan.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
