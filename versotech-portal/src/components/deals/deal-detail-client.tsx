'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  Package,
  DollarSign,
  FileText,
  Activity,
  HandCoins,
  ArrowLeft,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DealOverviewTab } from './deal-overview-tab'
import { DealInventoryTab } from './deal-inventory-tab'
import { DealMembersTab } from './deal-members-tab'
import { DealFeePlansTab } from './deal-fee-plans-tab'
import { DealCommitmentsTab } from './deal-commitments-tab'
import { DealDocumentsTab } from './deal-documents-tab'
import { DealActivityTab } from './deal-activity-tab'

const statusColors = {
  draft: 'bg-white/10 text-foreground border border-white/20',
  open: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  allocation_pending: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  closed: 'bg-blue-500/20 text-blue-200 border border-blue-400/30',
  cancelled: 'bg-red-500/20 text-red-200 border border-red-400/30'
}

const dealTypeLabels = {
  equity_secondary: 'Secondary',
  equity_primary: 'Primary',
  credit_trade_finance: 'Credit/Trade',
  other: 'Other'
}

interface DealDetailClientProps {
  deal: any
  inventorySummary: {
    total_units: number
    available_units: number
    reserved_units: number
    allocated_units: number
  }
  commitments: any[]
  reservations: any[]
  allocations: any[]
  documents: any[]
  userProfile: { role: string }
}

export function DealDetailClient({
  deal,
  inventorySummary,
  commitments,
  reservations,
  allocations,
  documents,
  userProfile
}: DealDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    // Log component mount for debugging
    console.log('[DealDetailClient] Component mounted', {
      dealId: deal?.id,
      dealName: deal?.name,
      dealStatus: deal?.status,
      hasInventory: !!inventorySummary,
      commitmentsCount: commitments?.length || 0,
      userRole: userProfile?.role
    })
  }, [deal, inventorySummary, commitments, userProfile])

  // Safety check - if no deal, show error state (server should handle redirect)
  if (!deal || !deal.id) {
    return (
      <div className="p-6">
        <Card className="border border-destructive/50 bg-destructive/10">
          <CardContent className="p-6 text-center text-foreground">
            <p>Unable to load deal details</p>
            <Link href="/versotech/staff/deals">
              <Button variant="outline" className="mt-4">
                Back to Deals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-foreground hover:text-sky-200 hover:bg-white/10"
              onClick={() => router.push('/versotech/staff/deals')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Deals
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{deal.name}</h1>
            <Badge className={statusColors[deal.status as keyof typeof statusColors]}>
              {deal.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-foreground">
              {dealTypeLabels[deal.deal_type as keyof typeof dealTypeLabels]}
            </Badge>
          </div>

          {deal.company_name && (
            <p className="text-muted-foreground text-lg">
              {deal.company_name}
              {deal.sector && ` • ${deal.sector}`}
              {deal.location && ` • ${deal.location}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2 border-white/20 text-foreground hover:bg-white/10"
            onClick={() => {
              // TODO: Open edit modal or navigate to edit page
              alert('Edit functionality will be implemented. For now, you can create a new deal with updated information.')
            }}
          >
            <Edit className="h-4 w-4" />
            Edit Deal
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {deal.deal_memberships?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Invited participants</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Units
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {inventorySummary.total_units.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {inventorySummary.available_units.toLocaleString()} available
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commitments
            </CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {commitments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {commitments.filter(c => c.status === 'submitted').length} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Target Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {deal.currency} {deal.target_amount?.toLocaleString() || '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {deal.raised_amount?.toLocaleString() || 0} raised
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="fee-plans" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Fee Plans
          </TabsTrigger>
          <TabsTrigger value="commitments" className="gap-2">
            <HandCoins className="h-4 w-4" />
            Commitments
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DealOverviewTab deal={deal} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          {deal.share_lots && inventorySummary ? (
            <DealInventoryTab
              dealId={deal.id}
              shareLots={deal.share_lots}
              inventorySummary={inventorySummary}
            />
          ) : (
            <Card className="border border-white/10 bg-white/5">
              <CardContent className="p-6 text-center text-muted-foreground">
                No inventory data available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <DealMembersTab
            dealId={deal.id}
            members={deal.deal_memberships || []}
          />
        </TabsContent>

        <TabsContent value="fee-plans" className="space-y-4">
          <DealFeePlansTab
            dealId={deal.id}
            feePlans={deal.fee_plans || []}
          />
        </TabsContent>

        <TabsContent value="commitments" className="space-y-4">
          {commitments && reservations && allocations ? (
            <DealCommitmentsTab
              dealId={deal.id}
              commitments={commitments}
              reservations={reservations}
              allocations={allocations}
              dealStatus={deal.status}
            />
          ) : (
            <Card className="border border-white/10 bg-white/5">
              <CardContent className="p-6 text-center text-muted-foreground">
                Loading commitment data...
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DealDocumentsTab
            dealId={deal.id}
            documents={documents || []}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <DealActivityTab dealId={deal.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
