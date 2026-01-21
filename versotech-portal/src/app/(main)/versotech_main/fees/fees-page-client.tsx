'use client'

/**
 * Fees Management Page Client Component
 * Tabbed navigation for fee management
 */

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Calendar,
  Users,
} from 'lucide-react'

// Direct imports for instant tab switching
import OverviewTab from '@/components/fees/OverviewTab'
import FeePlansTab from '@/components/fees/FeePlansTab'
import InvoicesTab from '@/components/fees/InvoicesTab'
import ScheduleTab from '@/components/fees/ScheduleTab'
import CommissionsTab from '@/components/fees/CommissionsTab'

export function FeesPageClient() {
  const [activeTab, setActiveTab] = useState('overview')

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
            Fee Billing
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
          <FeePlansTab />
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
