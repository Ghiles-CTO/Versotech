'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, CheckCircle2, Clock, Loader2, XCircle, Archive, Building2, User, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'

type SubscriptionListItem = {
  id: string
  subscription_number: number
  commitment: number
  currency: string
  status: string
  effective_date: string | null
  funding_due_at: string | null
  investor?: {
    legal_name: string
    type: string
    country: string | null
  }
  vehicle?: {
    name: string
    entity_code: string | null
  }
}

interface SubscriptionListViewProps {
  subscriptions: SubscriptionListItem[]
}

export function SubscriptionListView({ subscriptions }: SubscriptionListViewProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-900/30 text-green-300 border-green-700',
      committed: 'bg-blue-900/30 text-blue-300 border-blue-700',
      pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      closed: 'bg-gray-800/50 text-gray-300 border-gray-700',
      cancelled: 'bg-red-900/30 text-red-300 border-red-700',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-800/50 text-gray-300 border-gray-700'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      active: CheckCircle2,
      committed: Loader2,
      pending: Clock,
      closed: Archive,
      cancelled: XCircle,
    }
    return icons[status as keyof typeof icons] || Clock
  }

  return (
    <div className="space-y-4">
      {subscriptions.length > 0 ? (
        subscriptions.map((sub) => {
          const StatusIcon = getStatusIcon(sub.status)
          return (
            <Card
              key={sub.id}
              className="bg-gray-900/70 border-gray-800 hover:border-gray-700 hover:shadow-xl transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-xl">
                        #{sub.subscription_number}
                      </span>
                      <Badge className={`${getStatusColor(sub.status)} flex items-center gap-1.5`} variant="outline">
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="capitalize">{sub.status}</span>
                      </Badge>
                    </div>

                  {/* Investor & Vehicle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <User className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">Investor</div>
                        <div className="text-sm font-semibold text-white">
                          {sub.investor?.legal_name || '-'}
                        </div>
                        {sub.investor && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                              {sub.investor.type}
                            </Badge>
                            {sub.investor.country && (
                              <span className="text-xs text-gray-500">{sub.investor.country}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-1">
                        <Building2 className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">Vehicle</div>
                        <div className="text-sm font-semibold text-white">
                          {sub.vehicle?.name || '-'}
                        </div>
                        {sub.vehicle?.entity_code && (
                          <div className="text-xs text-gray-500 mt-1">
                            {sub.vehicle.entity_code}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Commitment & Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <div>
                        <div className="text-xs text-gray-500">Commitment</div>
                        <div className="text-sm font-bold text-white">
                          {formatCurrency(sub.commitment, sub.currency)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="text-xs text-gray-500">Effective Date</div>
                        <div className="text-sm text-gray-300">{formatDate(sub.effective_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <div>
                        <div className="text-xs text-gray-500">Funding Due</div>
                        <div className="text-sm text-gray-300">{formatDate(sub.funding_due_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  <Link href={`/versotech_main/subscriptions/${sub.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-black border-white hover:bg-gray-100 shadow-md transition-all"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )})
      ) : (
        <Card className="bg-gray-900/70 border-gray-800">
          <CardContent className="py-16 text-center">
            <p className="text-gray-400 text-lg">No subscriptions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
