'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, Star, Edit, Trash2 } from 'lucide-react'
import FeePlanEditModal from '@/components/fees/FeePlanEditModal'
import { useRouter } from 'next/navigation'

interface DealFeePlansTabProps {
  dealId: string
  feePlans: any[]
}

export function DealFeePlansTab({ dealId, feePlans }: DealFeePlansTabProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const feeKindLabels: Record<string, string> = {
    subscription: 'Subscription Fee',
    management: 'Management Fee',
    performance: 'Performance Fee',
    spread_markup: 'Spread Markup',
    flat: 'Flat Fee',
    other: 'Other'
  }

  const handleCreateNew = () => {
    setSelectedPlan(null)
    setModalOpen(true)
  }

  const handleEdit = (plan: any) => {
    // Transform fee_components to components for the modal
    const normalizedPlan = {
      ...plan,
      components: plan.fee_components || []
    }
    setSelectedPlan(normalizedPlan)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    setModalOpen(false)
    setSelectedPlan(null)
    router.refresh()
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedPlan(null)
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
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Fee Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!feePlans || feePlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fee plans created yet. Click "Create Fee Plan" to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feePlans.map((plan) => (
                <Card key={plan.id} className="border border-white/10 bg-white/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">No components added yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="text-xs"
                        >
                          Add Components
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Plan Edit Modal */}
      <FeePlanEditModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        feePlan={selectedPlan}
        dealId={dealId}
      />
    </div>
  )
}
