'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type SubscriptionKanbanItem = {
  id: string
  subscription_number: number
  commitment: number
  currency: string
  status: string
  investor?: {
    legal_name: string
    type: string
  }
  vehicle?: {
    name: string
    entity_code: string | null
  }
}

interface SubscriptionKanbanViewProps {
  subscriptions: SubscriptionKanbanItem[]
  onStatusChange?: (id: string, newStatus: string) => Promise<void>
}

export function SubscriptionKanbanView({
  subscriptions,
  onStatusChange,
}: SubscriptionKanbanViewProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const columns = [
    { key: 'pending', title: 'Pending', color: 'border-yellow-700' },
    { key: 'committed', title: 'Committed', color: 'border-blue-700' },
    { key: 'active', title: 'Active', color: 'border-green-700' },
    { key: 'closed', title: 'Closed', color: 'border-gray-700' },
    { key: 'cancelled', title: 'Cancelled', color: 'border-red-700' },
  ]

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (!draggedItem || !onStatusChange) return

    const subscription = subscriptions.find((s) => s.id === draggedItem)
    if (!subscription || subscription.status === newStatus) {
      setDraggedItem(null)
      return
    }

    try {
      await onStatusChange(draggedItem, newStatus)
      toast.success(`Subscription moved to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update subscription status')
    }

    setDraggedItem(null)
  }

  const getSubscriptionsByStatus = (status: string) => {
    return subscriptions.filter((sub) => sub.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnSubscriptions = getSubscriptionsByStatus(column.key)

        return (
          <div
            key={column.key}
            className="flex flex-col gap-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            {/* Column Header */}
            <Card className={`bg-gray-900 border-2 ${column.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="outline" className="ml-2 border-gray-700 text-gray-300">
                    {columnSubscriptions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Cards */}
            <div className="space-y-3 min-h-[200px]">
              {columnSubscriptions.map((sub) => (
                <Card
                  key={sub.id}
                  draggable
                  onDragStart={() => handleDragStart(sub.id)}
                  className={`bg-gray-900 border-gray-800 cursor-move hover:border-gray-700 transition-all ${
                    draggedItem === sub.id ? 'opacity-50' : ''
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Subscription Number */}
                    <div className="font-mono font-bold text-white">
                      #{String(sub.subscription_number).padStart(5, '0')}
                    </div>

                    {/* Investor */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Investor</div>
                      <div className="text-sm font-semibold text-white truncate">
                        {sub.investor?.legal_name || '-'}
                      </div>
                      {sub.investor && (
                        <Badge variant="outline" className="text-xs mt-1 border-gray-700 text-gray-400">
                          {sub.investor.type}
                        </Badge>
                      )}
                    </div>

                    {/* Vehicle */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Vehicle</div>
                      <div className="text-sm text-white truncate">
                        {sub.vehicle?.name || '-'}
                      </div>
                      {sub.vehicle?.entity_code && (
                        <div className="text-xs text-gray-500">{sub.vehicle.entity_code}</div>
                      )}
                    </div>

                    {/* Commitment */}
                    <div className="pt-2 border-t border-gray-800">
                      <div className="text-xs text-gray-400">Commitment</div>
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(sub.commitment, sub.currency)}
                      </div>
                    </div>

                    {/* View Button */}
                    <Link href={`/versotech/staff/subscriptions/${sub.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white text-black border-white hover:bg-gray-200"
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {columnSubscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No {column.title.toLowerCase()} subscriptions
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
