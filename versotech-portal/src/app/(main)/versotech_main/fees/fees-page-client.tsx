'use client'

/**
 * Fees Management Page Client Component
 * Tabbed navigation for fee management
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Calendar,
  Users,
  Building2,
  Loader2
} from 'lucide-react'

// Direct imports for instant tab switching
import OverviewTab from '@/components/fees/OverviewTab'
import FeePlansTab from '@/components/fees/FeePlansTab'
import InvoicesTab from '@/components/fees/InvoicesTab'
import ScheduleTab from '@/components/fees/ScheduleTab'
import CommissionsTab from '@/components/fees/CommissionsTab'

interface Deal {
  id: string
  name: string
  status: string
}

export function FeesPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [deals, setDeals] = useState<Deal[]>([])
  const [loadingDeals, setLoadingDeals] = useState(true)

  // Get deal_id from URL params
  const selectedDealId = searchParams.get('deal_id') || undefined

  // Fetch deals on mount
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals')
      const data = await res.json()
      setDeals(data.deals || [])
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoadingDeals(false)
    }
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  // Handle deal selection change
  const handleDealChange = (dealId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (dealId === 'none') {
      params.delete('deal_id')
    } else {
      params.set('deal_id', dealId)
    }

    router.push(`/versotech_main/fees?${params.toString()}`)
  }

  const selectedDeal = deals.find(d => d.id === selectedDealId)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fees Management</h1>
          <p className="text-muted-foreground">
            Manage fee structures, invoices, and revenue tracking
          </p>
        </div>
      </div>

      {/* Deal Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Deal:</span>
        </div>
        <Select
          value={selectedDealId || 'none'}
          onValueChange={handleDealChange}
          disabled={loadingDeals}
        >
          <SelectTrigger className="w-[350px]">
            {loadingDeals ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading deals...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select a deal to view fee plans" />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">Select a deal to view fee plans</span>
            </SelectItem>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                <div className="flex items-center gap-2">
                  <span>{deal.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    ({deal.status})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedDeal && (
          <span className="text-sm text-muted-foreground">
            Viewing fee plans for: <strong>{selectedDeal.name}</strong>
          </span>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Fee Plans
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <FeePlansTab dealId={selectedDealId} />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoicesTab />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTab />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <CommissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
