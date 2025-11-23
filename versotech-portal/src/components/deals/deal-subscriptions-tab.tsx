'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SubscriptionWithDocuments {
  id: string
  deal_id: string
  investor_id: string
  status: string
  submitted_at: string
  payload_json: {
    amount?: number
    subscription_amount?: number
    currency?: string
  }
  investors: {
    id: string
    legal_name: string
  }
  pack_status?: 'no_pack' | 'draft' | 'final' | 'pending_signature' | 'signed'
  pack_document_id?: string
  document_count?: number
  documents?: Array<{
    id: string
    name: string
    type: string
    status: string
    file_key: string
    mime_type: string
    file_size_bytes: number
    created_at: string
    created_by: string
  }>
}

interface DealSubscriptionsTabProps {
  dealId: string
}

export function DealSubscriptionsTab({ dealId }: DealSubscriptionsTabProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDocuments[]>([])
  const [loading, setLoading] = useState(true)

  const statusColors: Record<string, string> = {
    pending_review: 'bg-yellow-500/20 text-yellow-200',
    approved: 'bg-emerald-500/20 text-emerald-200',
    rejected: 'bg-red-500/20 text-red-200',
    pending_signature: 'bg-blue-500/20 text-blue-200',
    committed: 'bg-green-500/20 text-green-200'
  }

  const packStatusColors: Record<string, string> = {
    no_pack: 'bg-gray-500/20 text-gray-200',
    draft: 'bg-purple-500/20 text-purple-200',
    final: 'bg-cyan-500/20 text-cyan-200',
    pending_signature: 'bg-amber-500/20 text-amber-200',
    signed: 'bg-emerald-500/20 text-emerald-200'
  }

  const packStatusLabels: Record<string, string> = {
    no_pack: 'No Pack',
    draft: 'Draft Generated',
    final: 'Final Uploaded',
    pending_signature: 'Awaiting Signatures',
    signed: 'Fully Executed'
  }

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/subscriptions`)
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions')
      }

      const data = await response.json()

      // API now returns enriched data with pack_status, pack_document_id, and document_count
      // No need for additional fetching - all data is included in single query
      setSubscriptions(data.submissions || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchSubscriptions()
  }, [dealId, fetchSubscriptions])

  const formatAmount = (subscription: SubscriptionWithDocuments) => {
    const amount = subscription.payload_json?.amount || subscription.payload_json?.subscription_amount
    const currency = subscription.payload_json?.currency || 'USD'

    if (!amount) return 'Not specified'

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleViewDetails = (subscription: SubscriptionWithDocuments) => {
    // First try to open the formal subscription if it exists
    if ((subscription as any).subscription_id) {
      window.open(`/versotech/staff/subscriptions/${(subscription as any).subscription_id}`, '_blank')
    } else if (subscription.pack_document_id) {
      // Otherwise, if there's a subscription pack, download it
      window.open(`/api/documents/${subscription.pack_document_id}/download`, '_blank')
    } else {
      // No converted subscription and no pack yet
      toast.info('This subscription has not been converted to a formal commitment yet, and no subscription pack has been generated.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Subscription Submissions
              </CardTitle>
              <CardDescription>Investor subscriptions and pack generation status</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {subscriptions.length} {subscriptions.length === 1 ? 'submission' : 'submissions'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscription submissions yet for this deal.
            </div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between py-4 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {subscription.investors.legal_name}
                        </span>
                        <Badge className={statusColors[subscription.status] || statusColors.pending_review}>
                          {subscription.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Amount: {formatAmount(subscription)}</span>
                        <span>•</span>
                        <span>Submitted {new Date(subscription.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <div className="text-xs text-muted-foreground mb-1">Subscription Pack</div>
                      <Badge className={packStatusColors[subscription.pack_status || 'no_pack']}>
                        {packStatusLabels[subscription.pack_status || 'no_pack']}
                      </Badge>
                    </div>
                    {((subscription as any).subscription_id || subscription.pack_document_id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewDetails(subscription)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {(subscription as any).subscription_id ? 'View Subscription' : 'View Pack'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-sm text-foreground">Pack Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge className={packStatusColors.no_pack}>No Pack</Badge>
              <span className="text-muted-foreground">No document generated</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={packStatusColors.draft}>Draft</Badge>
              <span className="text-muted-foreground">System generated draft</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={packStatusColors.final}>Final</Badge>
              <span className="text-muted-foreground">Staff uploaded final</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={packStatusColors.pending_signature}>Awaiting</Badge>
              <span className="text-muted-foreground">Sent for signatures</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={packStatusColors.signed}>Executed</Badge>
              <span className="text-muted-foreground">All parties signed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
