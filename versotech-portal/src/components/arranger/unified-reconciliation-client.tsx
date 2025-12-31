'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Building2,
  Users,
  UserPlus,
  FileSpreadsheet,
  LayoutDashboard,
} from 'lucide-react'

// Import sub-components for each tab
import { OverviewTab } from './reconciliation-tabs/overview-tab'
import { CommissionTab } from './reconciliation-tabs/commission-tab'

// Types
type ArrangerInfo = {
  id: string
  name: string
  is_active: boolean
}

type Deal = {
  id: string
  name: string
  company_name: string | null
  target_amount: number | null
  currency: string
  status: string
}

type Introducer = {
  id: string
  legal_name: string
}

type Partner = {
  id: string
  name: string
  legal_name: string
}

type CommercialPartner = {
  id: string
  name: string
  legal_name: string
}

type TabCounts = {
  overview: number
  introducers: number
  partners: number
  commercialPartners: number
}

interface UnifiedReconciliationClientProps {
  arrangerInfo: ArrangerInfo | null
  deals: Deal[]
  introducers: Introducer[]
  partners: Partner[]
  commercialPartners: CommercialPartner[]
  tabCounts: TabCounts
  initialTab: string
}

export function UnifiedReconciliationClient({
  arrangerInfo,
  deals,
  introducers,
  partners,
  commercialPartners,
  tabCounts,
  initialTab,
}: UnifiedReconciliationClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(initialTab)

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Reconciliation
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage commissions across all your partner relationships
          </p>
        </div>
        {arrangerInfo && (
          <div className="flex items-center gap-2">
            <Badge variant={arrangerInfo.is_active ? 'default' : 'secondary'}>
              {arrangerInfo.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
            {tabCounts.overview > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tabCounts.overview}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="introducers" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Introducers</span>
            {tabCounts.introducers > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tabCounts.introducers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Partners</span>
            {tabCounts.partners > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tabCounts.partners}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="commercial-partners" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Commercial</span>
            {tabCounts.commercialPartners > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tabCounts.commercialPartners}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewTab deals={deals} />
        </TabsContent>

        {/* Introducers Tab */}
        <TabsContent value="introducers" className="space-y-6">
          <CommissionTab
            type="introducer"
            entities={introducers.map(i => ({ id: i.id, name: i.legal_name }))}
            deals={deals}
            apiEndpoint="/api/arrangers/me/reports/introducer-reconciliation"
            entityLabel="Introducer"
            entityPlural="Introducers"
          />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-6">
          <CommissionTab
            type="partner"
            entities={partners.map(p => ({ id: p.id, name: p.name || p.legal_name }))}
            deals={deals}
            apiEndpoint="/api/arrangers/me/reports/partner-reconciliation"
            entityLabel="Partner"
            entityPlural="Partners"
          />
        </TabsContent>

        {/* Commercial Partners Tab */}
        <TabsContent value="commercial-partners" className="space-y-6">
          <CommissionTab
            type="commercial_partner"
            entities={commercialPartners.map(cp => ({ id: cp.id, name: cp.name || cp.legal_name }))}
            deals={deals}
            apiEndpoint="/api/arrangers/me/reports/commercial-partner-reconciliation"
            entityLabel="Commercial Partner"
            entityPlural="Commercial Partners"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
