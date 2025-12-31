'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Users,
  Loader2,
  AlertCircle,
  Building2,
  UserPlus,
  Briefcase,
  X,
  Send,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  LayoutList,
  FolderKanban,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'

type FeeComponent = {
  id?: string
  kind: string
  calc_method?: string
  frequency?: string
  rate_bps?: number
  flat_amount?: number
  description?: string
  payment_schedule?: string
}

type FeePlan = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  is_default: boolean
  partner_id: string | null
  introducer_id: string | null
  commercial_partner_id: string | null
  components?: FeeComponent[]
  subscription_count?: number
  created_at: string
  status?: 'draft' | 'sent' | 'acknowledged'
  sent_at?: string | null
  deal_id?: string | null
}

type Partner = {
  id: string
  name: string
  type: 'partner' | 'introducer' | 'commercial_partner'
}

const FEE_KINDS = [
  { value: 'subscription', label: 'Subscription Fee' },
  { value: 'management', label: 'Management Fee' },
  { value: 'performance', label: 'Performance Fee' },
  { value: 'bd_fee', label: 'Broker-Dealer Fee' },
  { value: 'flat', label: 'Flat Fee' },
  { value: 'other', label: 'Other' },
]

const PAYMENT_SCHEDULES = [
  { value: 'upfront', label: 'Upfront' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'on_demand', label: 'On Demand' },
]

export default function FeePlansPage() {
  const [plans, setPlans] = useState<FeePlan[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'by-opportunity'>('list')
  const [dealFeeData, setDealFeeData] = useState<Map<string, { deal: { id: string; name: string; status?: string }; plans: FeePlan[] }>>(new Map())
  const [expandedDeals, setExpandedDeals] = useState<Set<string>>(new Set())

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<FeePlan | null>(null)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formEntityType, setFormEntityType] = useState<string>('none')
  const [formEntityId, setFormEntityId] = useState<string>('none')
  const [formComponents, setFormComponents] = useState<FeeComponent[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch fee plans
      const plansRes = await fetch('/api/arrangers/me/fee-plans?include_components=true&is_active=all')
      if (!plansRes.ok) throw new Error('Failed to fetch fee plans')
      const plansData = await plansRes.json()
      setPlans(plansData.data || [])

      // Fetch partners for the dropdown
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get arranger's partners
      const { data: arrangerUser } = await supabase
        .from('arranger_users')
        .select('arranger_id')
        .eq('user_id', user.id)
        .single()

      if (arrangerUser) {
        // Get deals for this arranger
        const { data: deals } = await supabase
          .from('deals')
          .select('id')
          .eq('arranger_entity_id', arrangerUser.arranger_id)

        if (deals && deals.length > 0) {
          const dealIds = deals.map(d => d.id)

          // Get partner referrals on these deals
          const { data: referrals } = await supabase
            .from('deal_memberships')
            .select('referred_by_entity_id, referred_by_entity_type')
            .in('deal_id', dealIds)
            .not('referred_by_entity_id', 'is', null)

          const partnerIds = [...new Set(
            (referrals || [])
              .filter(r => r.referred_by_entity_type === 'partner')
              .map(r => r.referred_by_entity_id)
          )]
          const introducerIds = [...new Set(
            (referrals || [])
              .filter(r => r.referred_by_entity_type === 'introducer')
              .map(r => r.referred_by_entity_id)
          )]

          const allPartners: Partner[] = []

          if (partnerIds.length > 0) {
            const { data: partnersData } = await supabase
              .from('partners')
              .select('id, name')
              .in('id', partnerIds)

            ;(partnersData || []).forEach((p: any) => {
              allPartners.push({ id: p.id, name: p.name, type: 'partner' })
            })
          }

          if (introducerIds.length > 0) {
            const { data: introducersData } = await supabase
              .from('introducers')
              .select('id, legal_name')
              .in('id', introducerIds)

            ;(introducersData || []).forEach((i: any) => {
              allPartners.push({ id: i.id, name: i.legal_name, type: 'introducer' })
            })
          }

          // Get commercial partner referrals on these deals
          const commercialPartnerIdsFromReferrals = (referrals || [])
            .filter(r => r.referred_by_entity_type === 'commercial_partner')
            .map(r => r.referred_by_entity_id)

          // Also get CPs from placement agreements (they may not have referrals yet)
          const { data: placementAgreements } = await supabase
            .from('placement_agreements')
            .select('commercial_partner_id')
            .eq('arranger_id', arrangerUser.arranger_id)

          const commercialPartnerIdsFromAgreements = (placementAgreements || [])
            .map((pa: any) => pa.commercial_partner_id)
            .filter(Boolean)

          // Combine both sources (dedupe)
          const commercialPartnerIds = [...new Set([
            ...commercialPartnerIdsFromReferrals,
            ...commercialPartnerIdsFromAgreements
          ])]

          if (commercialPartnerIds.length > 0) {
            const { data: cpData } = await supabase
              .from('commercial_partners')
              .select('id, name, legal_name')
              .in('id', commercialPartnerIds)

            ;(cpData || []).forEach((cp: any) => {
              allPartners.push({
                id: cp.id,
                name: cp.name || cp.legal_name || 'Unknown CP',
                type: 'commercial_partner'
              })
            })
          }

          setPartners(allPartners)

          // Group fee plans by deal for per-opportunity view
          const groupedByDeal = new Map<string, { deal: { id: string; name: string; status?: string }; plans: FeePlan[] }>()

          // Get deal details for plans with deal_id
          const planDealIds = [...new Set(
            (plansData.data || [])
              .filter((p: FeePlan) => p.deal_id)
              .map((p: FeePlan) => p.deal_id)
          )]

          let dealsMap = new Map<string, { id: string; name: string; status?: string }>()
          if (planDealIds.length > 0) {
            const { data: dealsData } = await supabase
              .from('deals')
              .select('id, name, status')
              .in('id', planDealIds)

            dealsMap = new Map((dealsData || []).map((d: any) => [d.id, d]))
          }

          // Group plans by deal
          for (const plan of (plansData.data || []) as FeePlan[]) {
            const dealId = plan.deal_id || 'general'
            const deal = plan.deal_id
              ? dealsMap.get(plan.deal_id) || { id: plan.deal_id, name: 'Unknown Deal' }
              : { id: 'general', name: 'General (No Deal)', status: 'active' }

            if (!groupedByDeal.has(dealId)) {
              groupedByDeal.set(dealId, { deal, plans: [] })
            }
            groupedByDeal.get(dealId)!.plans.push(plan)
          }

          setDealFeeData(groupedByDeal)
        }
      }

      setError(null)
    } catch (err) {
      console.error('[FeePlansPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormEntityType('none')
    setFormEntityId('none')
    setFormComponents([])
  }

  const openCreateModal = () => {
    resetForm()
    setSelectedPlan(null)
    setEditModalOpen(true)
  }

  const openEditModal = (plan: FeePlan) => {
    setSelectedPlan(plan)
    setFormName(plan.name)
    setFormDescription(plan.description || '')

    if (plan.partner_id) {
      setFormEntityType('partner')
      setFormEntityId(plan.partner_id)
    } else if (plan.introducer_id) {
      setFormEntityType('introducer')
      setFormEntityId(plan.introducer_id)
    } else if (plan.commercial_partner_id) {
      setFormEntityType('commercial_partner')
      setFormEntityId(plan.commercial_partner_id)
    } else {
      setFormEntityType('none')
      setFormEntityId('none')
    }

    setFormComponents(plan.components || [])
    setEditModalOpen(true)
  }

  const openDeleteDialog = (plan: FeePlan) => {
    setSelectedPlan(plan)
    setDeleteDialogOpen(true)
  }

  const addComponent = () => {
    setFormComponents([
      ...formComponents,
      {
        kind: 'management',
        calc_method: 'percent_per_annum',
        frequency: 'quarterly',
        payment_schedule: 'recurring',
      },
    ])
  }

  const removeComponent = (index: number) => {
    setFormComponents(formComponents.filter((_, i) => i !== index))
  }

  const updateComponent = (index: number, updates: Partial<FeeComponent>) => {
    const updated = [...formComponents]
    updated[index] = { ...updated[index], ...updates }
    setFormComponents(updated)
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      setError('Plan name is required')
      return
    }
    if (formComponents.length === 0) {
      setError('At least one fee component is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload: any = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        components: formComponents.map(c => ({
          ...c,
          rate_bps: c.rate_bps ? Number(c.rate_bps) : undefined,
          flat_amount: c.flat_amount ? Number(c.flat_amount) : undefined,
        })),
      }

      // Set entity based on type
      if (formEntityType === 'partner' && formEntityId !== 'none') {
        payload.partner_id = formEntityId
      } else if (formEntityType === 'introducer' && formEntityId !== 'none') {
        payload.introducer_id = formEntityId
      } else if (formEntityType === 'commercial_partner' && formEntityId !== 'none') {
        payload.commercial_partner_id = formEntityId
      }

      const url = selectedPlan
        ? `/api/arrangers/me/fee-plans/${selectedPlan.id}`
        : '/api/arrangers/me/fee-plans'

      const res = await fetch(url, {
        method: selectedPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save fee plan')
      }

      await fetchData()
      setEditModalOpen(false)
      resetForm()
      toast.success(selectedPlan ? 'Fee plan updated' : 'Fee plan created', {
        description: `"${formName}" has been saved successfully.`,
      })
    } catch (err) {
      console.error('[FeePlansPage] Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save fee plan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPlan) return

    const planName = selectedPlan.name
    try {
      const res = await fetch(`/api/arrangers/me/fee-plans/${selectedPlan.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete fee plan')

      await fetchData()
      setDeleteDialogOpen(false)
      setSelectedPlan(null)
      toast.success('Fee plan deleted', {
        description: `"${planName}" has been removed.`,
      })
    } catch (err) {
      console.error('[FeePlansPage] Delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete fee plan')
    }
  }

  const handleSend = async (plan: FeePlan) => {
    if (!plan.partner_id && !plan.introducer_id && !plan.commercial_partner_id) {
      toast.error('Cannot send fee plan', {
        description: 'Please assign this fee plan to a partner, introducer, or commercial partner first.',
      })
      return
    }

    setSending(plan.id)
    setError(null)

    try {
      const res = await fetch(`/api/arrangers/me/fee-plans/${plan.id}/send`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to send fee plan')
      }

      const result = await res.json()
      await fetchData()

      // Show appropriate toast based on notification status
      if (result.notification_status === 'no_users') {
        toast.warning('Fee plan sent', {
          description: `"${plan.name}" was marked as sent, but there are no users to notify.`,
        })
      } else if (result.notification_status === 'failed') {
        toast.warning('Fee plan sent', {
          description: `"${plan.name}" was sent, but notifications could not be delivered.`,
        })
      } else {
        toast.success('Fee plan sent', {
          description: `"${plan.name}" has been sent to ${result.notified_users} user(s).`,
        })
      }
    } catch (err) {
      console.error('[FeePlansPage] Send error:', err)
      toast.error('Failed to send fee plan', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      })
    } finally {
      setSending(null)
    }
  }

  const toggleDeal = (dealId: string) => {
    const newExpanded = new Set(expandedDeals)
    if (newExpanded.has(dealId)) {
      newExpanded.delete(dealId)
    } else {
      newExpanded.add(dealId)
    }
    setExpandedDeals(newExpanded)
  }

  const formatBps = (bps: number) => `${(bps / 100).toFixed(2)}%`

  const getEntityName = (plan: FeePlan) => {
    if (plan.partner_id) {
      const partner = partners.find(p => p.id === plan.partner_id && p.type === 'partner')
      return partner?.name || 'Partner'
    }
    if (plan.introducer_id) {
      const introducer = partners.find(p => p.id === plan.introducer_id && p.type === 'introducer')
      return introducer?.name || 'Introducer'
    }
    if (plan.commercial_partner_id) {
      const cp = partners.find(p => p.id === plan.commercial_partner_id && p.type === 'commercial_partner')
      return cp?.name || 'Commercial Partner'
    }
    return 'General'
  }

  const getEntityIcon = (plan: FeePlan) => {
    if (plan.partner_id) return <Users className="h-4 w-4 text-blue-400" />
    if (plan.introducer_id) return <UserPlus className="h-4 w-4 text-green-400" />
    if (plan.commercial_partner_id) return <Briefcase className="h-4 w-4 text-purple-400" />
    return <Building2 className="h-4 w-4 text-gray-400" />
  }

  // By Opportunity View Component
  const ByOpportunityView = () => (
    <div className="space-y-4">
      {Array.from(dealFeeData.entries()).map(([dealId, { deal, plans: dealPlans }]) => (
        <Card key={dealId}>
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors py-4"
            onClick={() => toggleDeal(dealId)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDeal(dealId) } }}
            tabIndex={0}
            role="button"
            aria-expanded={expandedDeals.has(dealId)}
            aria-label={`${deal.name} - ${dealPlans.length} fee plan${dealPlans.length !== 1 ? 's' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {expandedDeals.has(dealId) ? (
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                )}
                <div>
                  <CardTitle className="text-lg">{deal.name}</CardTitle>
                  <CardDescription>
                    {dealPlans.length} fee plan{dealPlans.length !== 1 ? 's' : ''}
                    {deal.status && ` • ${deal.status}`}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">{dealPlans.length}</Badge>
            </div>
          </CardHeader>

          {expandedDeals.has(dealId) && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {dealPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{plan.name}</span>
                        {plan.status === 'sent' && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 text-xs">
                            Sent
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getEntityIcon(plan)}
                        <span className="text-sm text-muted-foreground">{getEntityName(plan)}</span>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    )}

                    {/* Fee Components Summary */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.components?.map((comp, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {comp.kind}: {comp.rate_bps ? formatBps(comp.rate_bps) :
                            comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      {(plan.partner_id || plan.introducer_id || plan.commercial_partner_id) &&
                       plan.status !== 'sent' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSend(plan)
                          }}
                          disabled={sending === plan.id}
                        >
                          {sending === plan.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Send
                        </Button>
                      )}
                      {/* Hide Edit for sent plans - consistent with list view */}
                      {plan.status !== 'sent' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(plan)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(plan)
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1 text-red-500" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {dealFeeData.size === 0 && (
        <div className="border border-dashed rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
          <FolderKanban className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No fee plans to display by opportunity</p>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading fee plans...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Plans</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage fee structures for your network partners
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Fee Plan
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-blue-400">How Fee Plans Work:</strong> Create fee structures for your
            partners, introducers, and commercial partners. These plans define the fee components that will
            apply to subscriptions they refer. You can assign different fee structures to different entities
            based on your agreements.
          </p>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'by-opportunity')}>
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-2">
            <LayoutList className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="by-opportunity" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            By Opportunity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* Fee Plans Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Fee Plans</CardTitle>
              <CardDescription>
                {plans.length} fee plan{plans.length !== 1 ? 's' : ''} created
              </CardDescription>
            </CardHeader>
            <CardContent>
          {plans.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No fee plans created yet</p>
              <Button onClick={openCreateModal} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Your First Fee Plan
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Fee Components</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            {plan.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {plan.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(plan)}
                          <span>{getEntityName(plan)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {plan.components?.slice(0, 3).map((comp, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {comp.kind}: {comp.rate_bps ? formatBps(comp.rate_bps) :
                                comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
                            </Badge>
                          ))}
                          {(plan.components?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(plan.components?.length || 0) - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {plan.is_active ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500">
                              Inactive
                            </Badge>
                          )}
                          {plan.status === 'sent' && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                              Sent
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {/* Send button - show if assigned to entity and not already sent */}
                          {(plan.partner_id || plan.introducer_id || plan.commercial_partner_id) &&
                           plan.status !== 'sent' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSend(plan)}
                              disabled={sending === plan.id}
                              title="Send to entity"
                              aria-label={`Send fee plan "${plan.name}" to entity`}
                            >
                              {sending === plan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              ) : (
                                <Send className="h-4 w-4 text-blue-500" aria-hidden="true" />
                              )}
                            </Button>
                          )}
                          {plan.status === 'sent' && (
                            <Button variant="ghost" size="sm" disabled title="Already sent" aria-label="Fee plan already sent">
                              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                            </Button>
                          )}
                          {/* Hide Edit for sent plans */}
                          {plan.status !== 'sent' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(plan)}
                              aria-label={`Edit fee plan "${plan.name}"`}
                            >
                              <Edit className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(plan)}
                            aria-label={`Delete fee plan "${plan.name}"`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-opportunity">
          <ByOpportunityView />
        </TabsContent>
      </Tabs>

      {/* Edit/Create Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Edit Fee Plan' : 'Create Fee Plan'}
            </DialogTitle>
            <DialogDescription>
              Define the fee structure for your network partners
            </DialogDescription>
          </DialogHeader>

          {/* Show error inside modal so it's visible even when scrolled */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Standard Partner Fee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select value={formEntityType} onValueChange={(val) => {
                    setFormEntityType(val)
                    setFormEntityId('none')
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General (No specific entity)</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="introducer">Introducer</SelectItem>
                      <SelectItem value="commercial_partner">Commercial Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formEntityType !== 'none' && (
                  <div className="space-y-2">
                    <Label>Select {formEntityType === 'partner' ? 'Partner' : formEntityType === 'introducer' ? 'Introducer' : 'Commercial Partner'}</Label>
                    <Select value={formEntityId} onValueChange={setFormEntityId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {partners
                          .filter(p => p.type === formEntityType)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Components */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Fee Components ({formComponents.length})</Label>
                <Button onClick={addComponent} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Component
                </Button>
              </div>

              {formComponents.length === 0 ? (
                <div className="border border-dashed rounded-lg py-8 text-center text-muted-foreground">
                  Click "Add Component" to define fee components
                </div>
              ) : (
                <div className="space-y-4">
                  {formComponents.map((comp, index) => (
                    <Card key={index}>
                      <CardHeader className="py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Component {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeComponent(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Fee Type</Label>
                            <Select
                              value={comp.kind}
                              onValueChange={(val) => updateComponent(index, { kind: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FEE_KINDS.map((k) => (
                                  <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Payment Schedule</Label>
                            <Select
                              value={comp.payment_schedule || 'recurring'}
                              onValueChange={(val) => updateComponent(index, { payment_schedule: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PAYMENT_SCHEDULES.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Rate (basis points)</Label>
                            <Input
                              type="number"
                              value={comp.rate_bps || ''}
                              onChange={(e) => updateComponent(index, {
                                rate_bps: e.target.value ? Number(e.target.value) : undefined
                              })}
                              placeholder="e.g., 200 = 2%"
                            />
                            {comp.rate_bps && (
                              <p className="text-xs text-muted-foreground">
                                = {(comp.rate_bps / 100).toFixed(2)}%
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Flat Amount ($)</Label>
                            <Input
                              type="number"
                              value={comp.flat_amount || ''}
                              onChange={(e) => updateComponent(index, {
                                flat_amount: e.target.value ? Number(e.target.value) : undefined
                              })}
                              placeholder="e.g., 5000"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                selectedPlan ? 'Update Plan' : 'Create Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedPlan?.name}&quot;? This will deactivate
              the fee plan and hide it from the list. Existing subscriptions using this plan
              will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
