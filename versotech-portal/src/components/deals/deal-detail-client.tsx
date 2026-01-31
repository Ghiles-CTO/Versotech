'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Building2,
  Users,
  Package,
  DollarSign,
  FileText,
  Activity,
  HandCoins,
  ArrowLeft,
  Edit,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DealOverviewTab } from './deal-overview-tab'
import { DealInventoryTab } from './deal-inventory-tab'
import { DealMembersTab } from './deal-members-tab'
import { DealFeePlansTab } from './deal-fee-plans-tab'
import { DealDocumentsTab } from './deal-documents-tab'
import { DealActivityTab } from './deal-activity-tab'
import { DealTermSheetTab } from './deal-term-sheet-tab'
import { DealInterestTab } from './deal-interest-tab'
import { DealDataRoomAccessTab } from './deal-data-room-access-tab'
import { DealSubscriptionsTab } from './deal-subscriptions-tab'
import { DealFaqTab } from './deal-faq-tab'

const statusColors = {
  draft: 'bg-muted text-foreground border border-border',
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
  documents: any[]
  termSheets: any[]
  interests: any[]
  dataRoomAccess: any[]
  dataRoomDocuments: any[]
  subscriptions: any[]
  subscriptionsForJourney?: any[] // Subscriptions with journey tracking fields
  activitySummary: Record<string, number>
  userProfile: { role: string }
}

export function DealDetailClient({
  deal,
  inventorySummary,
  documents,
  termSheets,
  interests,
  dataRoomAccess,
  dataRoomDocuments,
  subscriptions,
  subscriptionsForJourney = [],
  activitySummary,
  userProfile
}: DealDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [shareLots, setShareLots] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: deal?.name || '',
    description: deal?.description || '',
    investment_thesis: deal?.investment_thesis || '',
    status: deal?.status || 'draft',
    deal_type: deal?.deal_type || 'equity_secondary',
    stock_type: deal?.stock_type || 'common',
    company_name: deal?.company_name || '',
    company_website: deal?.company_website || '',
    sector: deal?.sector || '',
    stage: deal?.stage || '',
    location: deal?.location || '',
    open_at: deal?.open_at ? deal.open_at.slice(0, 16) : '',
    close_at: deal?.close_at ? deal.close_at.slice(0, 16) : '',
    // Note: offer_unit_price, minimum_investment, maximum_investment are now ONLY in termsheet
    target_amount: deal?.target_amount || '',
    currency: deal?.currency || 'USD',
    arranger_entity_id: deal?.arranger_entity_id || ''
  })
  const router = useRouter()

  // Fetch share lots for inventory
  const fetchShareLots = async () => {
    try {
      const response = await fetch(`/api/deals/${deal.id}/inventory`)
      if (response.ok) {
        const data = await response.json()
        setShareLots(data.inventory || [])
      }
    } catch (error) {
      console.error('Failed to fetch share lots:', error)
    }
  }

  // Fetch share lots on mount
  useEffect(() => {
    if (deal?.id) {
      fetchShareLots()
    }
  }, [deal?.id])

  // Refresh handler for inventory tab
  const handleInventoryRefresh = () => {
    fetchShareLots()
  }

  useEffect(() => {
    // Log component mount for debugging
    console.log('[DealDetailClient] Component mounted', {
      dealId: deal?.id,
      dealName: deal?.name,
      dealStatus: deal?.status,
      hasInventory: !!inventorySummary,
      termSheetCount: termSheets?.length || 0,
      interestCount: interests?.length || 0,
      userRole: userProfile?.role
    })
  }, [deal, inventorySummary, termSheets, interests, userProfile])

  const handleSaveDeal = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          // Note: offer_unit_price, minimum_investment, maximum_investment are now ONLY in termsheet
          target_amount: editFormData.target_amount ? parseFloat(editFormData.target_amount as string) : null,
          arranger_entity_id: editFormData.arranger_entity_id === 'none' || !editFormData.arranger_entity_id ? null : editFormData.arranger_entity_id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update deal')
      }

      setEditDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating deal:', error)
      alert('Failed to update deal. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const publishedTermSheet = termSheets?.find((sheet: any) => sheet.status === 'published')
  const pendingInterests = interests?.filter((interest: any) => interest.status === 'pending_review') ?? []
  const approvedInterests = interests?.filter((interest: any) => interest.status === 'approved') ?? []
  const activeAccess = dataRoomAccess?.filter((record: any) => !record.revoked_at) ?? []
  const pendingSubscriptions = subscriptions?.filter((submission: any) => submission.status === 'pending_review') ?? []
  const ndaCompletedCount = activitySummary?.nda_completed ?? 0
  const subscriptionCompletedCount = activitySummary?.subscription_completed ?? 0

  // Safety check - if no deal, show error state (server should handle redirect)
  if (!deal || !deal.id) {
    return (
      <div className="p-6">
        <Card className="border border-destructive/50 bg-destructive/10">
          <CardContent className="p-6 text-center text-foreground">
            <p>Unable to load deal details</p>
            <Link href="/versotech_main/deals">
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
              className="gap-2 text-foreground hover:text-sky-400 hover:bg-muted"
              onClick={() => router.push('/versotech_main/deals')}
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
            <Badge variant="outline" className="border-border text-foreground">
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
            className="gap-2 border-border text-foreground hover:bg-muted"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
            Edit Deal
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interest Signals
            </CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {interests?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">{pendingInterests.length} awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active NDAs
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activeAccess.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedInterests.length} interests approved
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published Term Sheet
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {publishedTermSheet ? `V${publishedTermSheet.version}` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {publishedTermSheet
                ? `Published ${publishedTermSheet.published_at ? new Date(publishedTermSheet.published_at).toLocaleDateString() : ''}`
                : 'No published version'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subscriptions
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {subscriptions?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingSubscriptions.length} awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversions (90d)
            </CardTitle>
            <Badge variant="outline">Analytics</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>NDA completed</span>
                <span className="font-semibold text-foreground">{ndaCompletedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subscriptions funded</span>
                <span className="font-semibold text-foreground">{subscriptionCompletedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} id={`deal-tabs-${deal.id}`}>
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="term-sheet">Term Sheets</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="data-room">Data Room</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="fees">Fee Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DealOverviewTab
            deal={deal}
            memberships={deal.deal_memberships || []}
            subscriptionsForJourney={subscriptionsForJourney}
          />
        </TabsContent>

        <TabsContent value="term-sheet">
          <DealTermSheetTab dealId={deal.id} termSheets={termSheets} />
        </TabsContent>

        <TabsContent value="interests">
          <DealInterestTab
            dealId={deal.id}
            interests={interests}
            subscriptions={subscriptions}
          />
        </TabsContent>

        <TabsContent value="data-room">
          <DealDataRoomAccessTab
            dealId={deal.id}
            dealName={deal.name}
            memberships={deal.deal_memberships || []}
            accessRecords={dataRoomAccess}
            documents={dataRoomDocuments}
          />
        </TabsContent>

        <TabsContent value="inventory">
          <DealInventoryTab dealId={deal.id} shareLots={shareLots} inventorySummary={inventorySummary} onRefresh={handleInventoryRefresh} />
        </TabsContent>

        <TabsContent value="members">
          <DealMembersTab dealId={deal.id} members={deal.deal_memberships || []} subscriptions={subscriptionsForJourney} />
        </TabsContent>

        <TabsContent value="fees">
          <DealFeePlansTab dealId={deal.id} feePlans={deal.fee_plans || []} />
        </TabsContent>

        <TabsContent value="subscriptions">
          <DealSubscriptionsTab dealId={deal.id} />
        </TabsContent>

        <TabsContent value="documents">
          <DealDocumentsTab dealId={deal.id} documents={documents} />
        </TabsContent>

        <TabsContent value="faq">
          <DealFaqTab dealId={deal.id} />
        </TabsContent>

        <TabsContent value="activity">
          <DealActivityTab dealId={deal.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Deal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update deal information. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-name">Deal Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g., Revolut Secondary 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="allocation_pending">Allocation Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-deal-type">Deal Type</Label>
                <Select
                  value={editFormData.deal_type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, deal_type: value })}
                >
                  <SelectTrigger id="edit-deal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equity_secondary">Secondary</SelectItem>
                    <SelectItem value="equity_primary">Primary</SelectItem>
                    <SelectItem value="credit_trade_finance">Credit/Trade Finance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stock-type">Stock Type</Label>
                <Select
                  value={editFormData.stock_type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, stock_type: value })}
                >
                  <SelectTrigger id="edit-stock-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common and Ordinary Shares</SelectItem>
                    <SelectItem value="preferred">Preferred Shares</SelectItem>
                    <SelectItem value="convertible">Convertible Notes</SelectItem>
                    <SelectItem value="warrant">Warrants</SelectItem>
                    <SelectItem value="bond">Bonds</SelectItem>
                    <SelectItem value="note">Notes</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-company-name">Company Name</Label>
                <Input
                  id="edit-company-name"
                  value={editFormData.company_name}
                  onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                  placeholder="e.g., Revolut Ltd"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-company-website">Company Website</Label>
                <Input
                  id="edit-company-website"
                  type="url"
                  value={editFormData.company_website}
                  onChange={(e) => setEditFormData({ ...editFormData, company_website: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sector">Sector</Label>
                <Input
                  id="edit-sector"
                  value={editFormData.sector}
                  onChange={(e) => setEditFormData({ ...editFormData, sector: e.target.value })}
                  placeholder="e.g., Fintech"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stage">Stage</Label>
                <Input
                  id="edit-stage"
                  value={editFormData.stage}
                  onChange={(e) => setEditFormData({ ...editFormData, stage: e.target.value })}
                  placeholder="e.g., Series E"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="e.g., London, UK"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select
                  value={editFormData.currency}
                  onValueChange={(value) => setEditFormData({ ...editFormData, currency: value })}
                >
                  <SelectTrigger id="edit-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

{/* Arranger is inherited from vehicle - not editable at deal level */}

              <div className="space-y-2">
                <Label htmlFor="edit-open-at">Open Date</Label>
                <Input
                  id="edit-open-at"
                  type="datetime-local"
                  value={editFormData.open_at}
                  onChange={(e) => setEditFormData({ ...editFormData, open_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-close-at">Close Date</Label>
                <Input
                  id="edit-close-at"
                  type="datetime-local"
                  value={editFormData.close_at}
                  onChange={(e) => setEditFormData({ ...editFormData, close_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-target-amount">Target Amount</Label>
                <Input
                  id="edit-target-amount"
                  type="number"
                  step="1"
                  value={editFormData.target_amount}
                  onChange={(e) => setEditFormData({ ...editFormData, target_amount: e.target.value })}
                  placeholder="e.g., 5000000"
                />
                <p className="text-xs text-muted-foreground">
                  Investment terms (price, min/max) are set in the Term Sheet
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Brief description of the deal..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-investment-thesis">Investment Thesis</Label>
                <Textarea
                  id="edit-investment-thesis"
                  rows={3}
                  value={editFormData.investment_thesis}
                  onChange={(e) => setEditFormData({ ...editFormData, investment_thesis: e.target.value })}
                  placeholder="Why this is a good investment opportunity..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDeal}
                disabled={isSaving || !editFormData.name}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
