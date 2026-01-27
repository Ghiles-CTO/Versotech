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
    { key: 'pending', title: 'Pending', color: 'border-yellow-500/50', bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-500' },
    { key: 'committed', title: 'Committed', color: 'border-blue-500/50', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { key: 'active', title: 'Active', color: 'border-green-500/50', bgColor: 'bg-green-500/10', iconColor: 'text-green-500' },
    { key: 'closed', title: 'Closed', color: 'border-border', bgColor: 'bg-muted', iconColor: 'text-muted-foreground' },
    { key: 'cancelled', title: 'Cancelled', color: 'border-red-500/50', bgColor: 'bg-red-500/10', iconColor: 'text-red-500' },
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
            <Card className={`bg-card border-2 ${column.color} ${column.bgColor} shadow-lg`}>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="outline" className={`ml-2 border-border ${column.iconColor} font-mono`}>
                    {columnSubscriptions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Cards */}
            <div className="space-y-3 min-h-[300px] pb-4">
              {columnSubscriptions.map((sub) => (
                <Card
                  key={sub.id}
                  draggable
                  onDragStart={() => handleDragStart(sub.id)}
                  className={`bg-card border-border cursor-move hover:border-muted-foreground hover:shadow-xl transition-all duration-200 ${
                    draggedItem === sub.id ? 'opacity-40 scale-95' : ''
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Subscription Number */}
                    <div className="font-mono font-bold text-foreground">
                      #{sub.subscription_number}
                    </div>

                    {/* Investor */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Investor</div>
                      <div className="text-sm font-semibold text-foreground truncate">
                        {sub.investor?.legal_name || '-'}
                      </div>
                      {sub.investor && (
                        <Badge variant="outline" className="text-xs mt-1 border-border text-muted-foreground">
                          {sub.investor.type}
                        </Badge>
                      )}
                    </div>

                    {/* Vehicle */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Vehicle</div>
                      <div className="text-sm text-foreground truncate">
                        {sub.vehicle?.name || '-'}
                      </div>
                      {sub.vehicle?.entity_code && (
                        <div className="text-xs text-muted-foreground">{sub.vehicle.entity_code}</div>
                      )}
                    </div>

                    {/* Commitment */}
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">Commitment</div>
                      <div className="text-sm font-bold text-foreground">
                        {formatCurrency(sub.commitment, sub.currency)}
                      </div>
                    </div>

                    {/* View Button */}
                    <Link href={`/versotech_main/subscriptions/${sub.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {columnSubscriptions.length === 0 && (
                <div className={`text-center py-12 rounded-lg border-2 border-dashed ${column.color} ${column.bgColor}`}>
                  <p className="text-muted-foreground text-sm">No {column.title.toLowerCase()}</p>
                  <p className="text-muted-foreground/70 text-xs mt-1">Drag subscriptions here</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
