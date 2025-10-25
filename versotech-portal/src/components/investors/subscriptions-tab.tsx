'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, XCircle, Building2, DollarSign, Calendar, Hash } from 'lucide-react'
import { AddSubscriptionDialog } from './add-subscription-dialog'
import { EditSubscriptionDialog } from './edit-subscription-dialog'
import { toast } from 'sonner'

type Subscription = {
  id: string
  subscription_number: number
  vehicle_id: string
  commitment: number
  currency: string
  status: string
  effective_date: string | null
  funding_due_at: string | null
  acknowledgement_notes: string | null
  created_at: string
  vehicle?: {
    id: string
    name: string
    type: string | null
  }
}

type GroupedSubscriptions = {
  vehicle: {
    id: string
    name: string
  }
  subscriptions: Subscription[]
  total_commitment: number
  currency: string
}

type SubscriptionsData = {
  investor: {
    id: string
    legal_name: string
  }
  subscriptions: Subscription[]
  grouped_by_vehicle: GroupedSubscriptions[]
  summary: {
    total_vehicles: number
    total_subscriptions: number
    total_commitment_by_currency: Record<string, number>
  }
}

export function SubscriptionsTab({ investorId }: { investorId: string }) {
  const [data, setData] = useState<SubscriptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/investors/${investorId}/subscriptions`)

      if (!res.ok) {
        let message = `Failed to fetch subscriptions (status ${res.status})`

        try {
          const errorBody = await res.json()
          if (errorBody?.error) {
            message = errorBody.details
              ? `${errorBody.error}: ${errorBody.details}`
              : errorBody.error
          }
        } catch {
          // Ignore JSON parse errors and keep default message
        }

        throw new Error(message)
      }

      const result = await res.json()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [investorId])

  const handleCancelSubscription = async (subscriptionId: string, subscriptionNumber: number) => {
    if (!confirm(`Are you sure you want to cancel subscription #${subscriptionNumber}? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/investors/${investorId}/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      toast.success(`Cancelled subscription #${subscriptionNumber}`)
      fetchSubscriptions()
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription')
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setEditDialogOpen(true)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'committed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchSubscriptions} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Subscriptions ({data.summary.total_subscriptions})
          </h2>
          <p className="text-muted-foreground">
            {data.summary.total_vehicles} vehicles
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {data.grouped_by_vehicle.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              No subscriptions yet
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {data.grouped_by_vehicle.map((group) => (
            <Card key={group.vehicle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {group.vehicle.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {group.subscriptions.length} subscription
                      {group.subscriptions.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Commitment
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(group.total_commitment, group.currency)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-semibold">
                            {sub.subscription_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {formatCurrency(sub.commitment, sub.currency)}
                          </span>
                          <Badge className={getStatusColor(sub.status)}>
                            {sub.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(sub.effective_date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(sub)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {sub.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelSubscription(sub.id, sub.subscription_number)}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Grand Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.summary.total_commitment_by_currency).map(
                  ([currency, amount]) => (
                    <div key={currency} className="flex justify-between text-lg">
                      <span className="font-medium">{currency}:</span>
                      <span className="font-bold">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AddSubscriptionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        investorId={investorId}
        onSuccess={fetchSubscriptions}
      />

      {editingSubscription && (
        <EditSubscriptionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          investorId={investorId}
          subscription={editingSubscription}
          onSuccess={() => {
            fetchSubscriptions()
            setEditingSubscription(null)
          }}
        />
      )}
    </div>
  )
}
