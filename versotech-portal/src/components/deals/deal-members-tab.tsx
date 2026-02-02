'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Send,
  Eye,
  TrendingUp,
  FileSignature,
  FolderOpen,
  FileText,
  Mail,
  CheckCircle2,
  Wallet,
  Users,
  Trash2,
  MoreHorizontal,
  Building2,
  Briefcase,
  Loader2,
  UserPlus,
  UserCircle,
  FileCheck,
  ArrowRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AddParticipantModal } from './add-participant-modal'

// Partner assignment types
interface PartnerAssignment {
  fee_plan_id: string
  fee_plan_name: string
  fee_plan_status: string
  is_active: boolean
  created_at: string
  entity_type: 'partner' | 'introducer' | 'commercial_partner'
  entity_id: string
  entity_name: string
  entity_status: string
  entity_email: string | null
  fee_components: Array<{
    id: string
    kind: string
    rate_bps: number | null
    flat_amount: number | null
    currency: string
  }>
}

// Journey stages configuration - 9-stage investor journey
const JOURNEY_STAGES = [
  { key: 'dispatched', label: 'Dispatched', icon: Send, field: 'dispatched_at' },
  { key: 'viewed', label: 'Viewed', icon: Eye, field: 'viewed_at' },
  { key: 'interest', label: 'Access Request', icon: TrendingUp, field: 'interest_confirmed_at' },
  { key: 'nda', label: 'NDA', icon: FileSignature, field: 'nda_signed_at' },
  { key: 'data_room', label: 'Data Room', icon: FolderOpen, field: 'data_room_granted_at' },
  { key: 'pack_gen', label: 'Subscription Pack', icon: FileText, field: 'pack_generated_at', fromSubscription: true },
  { key: 'pack_sent', label: 'Pack Sent', icon: Mail, field: 'pack_sent_at', fromSubscription: true },
  { key: 'signed', label: 'Signed', icon: CheckCircle2, field: 'signed_at', fromSubscription: true },
  { key: 'funded', label: 'Funded', icon: Wallet, field: 'funded_at', fromSubscription: true },
] as const

interface DealMembersTabProps {
  dealId: string
  members: any[]
  subscriptions?: any[]
}

function getCurrentStage(member: any): { stage: string; index: number } {
  // Build a map of investor_id to subscription
  const subscription = member.subscription || null

  // Check stages in reverse order to find the latest completed
  for (let i = JOURNEY_STAGES.length - 1; i >= 0; i--) {
    const stage = JOURNEY_STAGES[i]
    let value: string | null = null

    const isFromSubscription = 'fromSubscription' in stage && stage.fromSubscription
    if (isFromSubscription && subscription) {
      value = subscription[stage.field]
    } else if (!isFromSubscription) {
      value = member[stage.field]
    }

    if (value) {
      return { stage: stage.label, index: i }
    }
  }
  return { stage: 'Invited', index: -1 }
}

function JourneyProgressBar({ member }: { member: any }) {
  const { index: currentIndex } = getCurrentStage(member)
  const subscription = member.subscription || null

  return (
    <div className="flex items-center gap-1">
      {JOURNEY_STAGES.map((stage, idx) => {
        let value: string | null = null
        const isFromSubscription = 'fromSubscription' in stage && stage.fromSubscription
        if (isFromSubscription && subscription) {
          value = subscription[stage.field]
        } else if (!isFromSubscription) {
          value = member[stage.field]
        }

        const isCompleted = !!value
        const isCurrent = idx === currentIndex

        return (
          <div
            key={stage.key}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
              isCompleted
                ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                : isCurrent
                  ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                  : 'bg-muted text-muted-foreground'
            }`}
            title={`${stage.label}${value ? ` - ${format(new Date(value), 'MMM d, yyyy')}` : ''}`}
          >
            <stage.icon className="h-3 w-3" />
          </div>
        )
      })}
    </div>
  )
}

export function DealMembersTab({ dealId, members: initialMembers, subscriptions = [] }: DealMembersTabProps) {
  const router = useRouter()
  const [members, setMembers] = useState(initialMembers)

  // Partner assignment state
  const [partnerAssignments, setPartnerAssignments] = useState<PartnerAssignment[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Fee plan filter state
  const [feePlanFilter, setFeePlanFilter] = useState<string>('all')

  // Create subscription map for quick lookup
  const subscriptionMap = new Map(
    subscriptions.map(s => [s.investor_id, s])
  )

  const visibleMembers = members.filter(member => !['lawyer', 'arranger'].includes(member.role))
  // Enhance members with subscription data
  const enhancedMembers = visibleMembers.map(m => ({
    ...m,
    subscription: m.investor_id ? subscriptionMap.get(m.investor_id) : null
  }))

  // Extract unique fee plans from members for the filter dropdown
  const uniqueFeePlans = enhancedMembers.reduce((acc, member) => {
    const feePlan = member.assigned_fee_plan
    if (feePlan && !acc.find((fp: { id: string; name: string }) => fp.id === feePlan.id)) {
      acc.push({ id: feePlan.id, name: feePlan.name })
    }
    return acc
  }, [] as { id: string; name: string }[])

  // Apply fee plan filter to members
  const filteredMembers = feePlanFilter === 'all'
    ? enhancedMembers
    : feePlanFilter === 'none'
      ? enhancedMembers.filter(m => !m.assigned_fee_plan)
      : enhancedMembers.filter(m => m.assigned_fee_plan?.id === feePlanFilter)

  // Update local state when server data changes
  useEffect(() => {
    setMembers(initialMembers)
  }, [initialMembers])

  // Fetch partner assignments
  const fetchAssignments = async () => {
    setLoadingAssignments(true)
    setAssignmentsError(null)
    try {
      const response = await fetch(`/api/deals/${dealId}/partners`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load partner assignments')
      }
      const data = await response.json()
      setPartnerAssignments(data.data || [])
    } catch (err) {
      console.error('Failed to fetch partner assignments:', err)
      setAssignmentsError(err instanceof Error ? err.message : 'Failed to load partner assignments')
    } finally {
      setLoadingAssignments(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [dealId])

  const handleRemoveAssignment = async (feePlanId: string) => {
    if (!confirm('Are you sure you want to remove this partner from this deal?')) {
      return
    }

    setRemovingId(feePlanId)
    try {
      const response = await fetch(`/api/deals/${dealId}/partners?fee_plan_id=${feePlanId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAssignments()
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to remove partner')
      }
    } catch (err) {
      console.error('Failed to remove partner:', err)
      alert('Failed to remove partner')
    } finally {
      setRemovingId(null)
    }
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'partner': return <Building2 className="h-4 w-4" />
      case 'introducer': return <Users className="h-4 w-4" />
      case 'commercial_partner': return <Briefcase className="h-4 w-4" />
      default: return <Building2 className="h-4 w-4" />
    }
  }

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'partner': return 'Partner'
      case 'introducer': return 'Introducer'
      case 'commercial_partner': return 'Commercial Partner'
      default: return type
    }
  }

  const feeKindLabels: Record<string, string> = {
    subscription: 'Subscription Fee',
    management: 'Management Fee',
    performance: 'Performance Fee',
    spread_markup: 'Spread Markup',
    flat: 'Flat Fee',
    other: 'Other'
  }

  // Fee plan status styling
  const feePlanStatusClasses: Record<string, string> = {
    draft: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
    sent: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    pending_signature: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    accepted: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    rejected: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
  }

  // Get referrer info from member's assigned_fee_plan
  const getReferrerInfo = (member: any) => {
    const feePlan = member.assigned_fee_plan
    if (!feePlan) return null

    // The referrer is the entity linked to the fee plan
    if (feePlan.introducer) {
      return {
        type: 'Introducer',
        name: feePlan.introducer.company_name || feePlan.introducer.name,
        icon: Users
      }
    }
    if (feePlan.partner) {
      return {
        type: 'Partner',
        name: feePlan.partner.company_name || feePlan.partner.name,
        icon: Building2
      }
    }
    if (feePlan.commercial_partner) {
      return {
        type: 'Commercial Partner',
        name: feePlan.commercial_partner.company_name || feePlan.commercial_partner.name,
        icon: Briefcase
      }
    }
    return null
  }

  const refreshMembers = async () => {
    try {
      const response = await fetch(`/api/deals/${dealId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (err) {
      console.error('Failed to refresh members:', err)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the deal?')) {
      return
    }

    try {
      const response = await fetch(`/api/deals/${dealId}/members/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await refreshMembers()
      } else {
        const data = await response.json()
        alert(`Failed to remove member: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Failed to remove member:', err)
      alert('Failed to remove member. Please try again.')
    }
  }

  const roleColors: Record<string, string> = {
    investor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200',
    co_investor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200',
    partner_investor: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200',
    introducer_investor: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-200',
    commercial_partner_investor: 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-200',
    advisor: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200',
    banker: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200',
    introducer: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-200',
    verso_staff: 'bg-muted text-muted-foreground',
    viewer: 'bg-muted text-muted-foreground'
  }

  // Calculate journey stats
  const stats = {
    total: enhancedMembers.length,
    dispatched: enhancedMembers.filter(m => m.dispatched_at).length,
    viewed: enhancedMembers.filter(m => m.viewed_at).length,
    interested: enhancedMembers.filter(m => m.interest_confirmed_at).length,
    ndaSigned: enhancedMembers.filter(m => m.nda_signed_at).length,
    dataRoom: enhancedMembers.filter(m => m.data_room_granted_at).length,
    packGen: enhancedMembers.filter(m => m.subscription?.pack_generated_at).length,
    packSent: enhancedMembers.filter(m => m.subscription?.pack_sent_at).length,
    signed: enhancedMembers.filter(m => m.subscription?.signed_at).length,
    funded: enhancedMembers.filter(m => m.subscription?.funded_at).length,
  }

  return (
    <div className="space-y-6">
      {/* Journey Funnel Summary */}
      <Card className="border border-border bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Investor Journey Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: 'Dispatched', count: stats.dispatched },
              { label: 'Viewed', count: stats.viewed },
              { label: 'Access Requested', count: stats.interested },
              { label: 'NDA Signed', count: stats.ndaSigned },
              { label: 'Data Room', count: stats.dataRoom },
              { label: 'Subscription Pack', count: stats.packGen },
              { label: 'Pack Sent', count: stats.packSent },
              { label: 'Signed', count: stats.signed },
              { label: 'Funded', count: stats.funded },
            ].map((stage, idx) => (
              <div key={stage.label} className="flex items-center">
                <div className="text-center min-w-[70px]">
                  <div className="text-xl font-bold">{stage.count}</div>
                  <div className="text-xs text-muted-foreground">{stage.label}</div>
                </div>
                {idx < 8 && (
                  <div className="mx-1 text-muted-foreground">→</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Participants Header */}
      <Card className="border border-border bg-muted/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                Deal Participants ({enhancedMembers.length + partnerAssignments.length})
              </CardTitle>
              <CardDescription>
                Investors, partners, introducers, and other participants in this deal
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AddParticipantModal
                dealId={dealId}
                onParticipantAdded={() => {
                  refreshMembers()
                  fetchAssignments()
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Investors Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Investors ({filteredMembers.length}{feePlanFilter !== 'all' ? ` of ${enhancedMembers.length}` : ''})
              </h3>
              {/* Fee Plan Filter Dropdown */}
              {uniqueFeePlans.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Filter by Fee Plan:</span>
                  <Select value={feePlanFilter} onValueChange={setFeePlanFilter}>
                    <SelectTrigger className="w-[200px] h-8 text-sm">
                      <SelectValue placeholder="All Fee Plans" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fee Plans</SelectItem>
                      <SelectItem value="none">No Fee Plan (Direct)</SelectItem>
                      {uniqueFeePlans.map((fp: { id: string; name: string }) => (
                        <SelectItem key={fp.id} value={fp.id}>
                          {fp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
              {feePlanFilter !== 'all'
                ? 'No investors match the selected fee plan filter.'
                : 'No investors added yet. Click "Add Participant" to invite investors.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Fee Plan</TableHead>
                  <TableHead>Journey Progress</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
                  const investor = Array.isArray(member.investors) ? member.investors[0] : member.investors
                  const { stage } = getCurrentStage(member)
                  const referrer = getReferrerInfo(member)
                  const feePlan = member.assigned_fee_plan

                  return (
                    <TableRow key={member.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {investor?.legal_name || profile?.display_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {profile?.email}
                          </div>
                          {investor?.kyc_status && (
                            <Badge
                              variant="outline"
                              className={`text-xs mt-1 ${
                                investor.kyc_status === 'approved'
                                  ? 'bg-green-500/20 text-green-400'
                                  : investor.kyc_status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : ''
                              }`}
                            >
                              KYC: {investor.kyc_status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[member.role] || 'bg-muted text-foreground'}>
                          {member.role?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {referrer ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <referrer.icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{referrer.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">Direct</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {feePlan ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{feePlan.name}</span>
                            <Badge className={`text-[10px] w-fit ${feePlanStatusClasses[feePlan.status] || 'bg-muted text-muted-foreground'}`}>
                              {feePlan.status}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <JourneyProgressBar member={member} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stage}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {investor && (
                              <DropdownMenuItem asChild>
                                <a href={`/versotech_main/investors/${investor.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Investor
                                </a>
                              </DropdownMenuItem>
                            )}
                            {profile?.email && (
                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${profile.email}`}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() => handleRemoveMember(member.user_id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          </div>

          {/* Partners & Intermediaries Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Partners & Intermediaries ({partnerAssignments.length})
            </h3>
            {loadingAssignments ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : assignmentsError ? (
              <div className="text-center py-6 text-red-400 border border-dashed border-red-500/20 rounded-lg bg-red-500/5">
                {assignmentsError}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchAssignments}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  Retry
                </Button>
              </div>
            ) : partnerAssignments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
                No partners assigned yet. Click "Add Participant" to add partners, introducers, or commercial partners.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {partnerAssignments.map((assignment) => (
                  <div
                    key={assignment.fee_plan_id}
                    className="p-3 rounded-lg border border-border bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getEntityIcon(assignment.entity_type)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{assignment.entity_name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getEntityTypeLabel(assignment.entity_type)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {assignment.fee_components.length > 0 ? (
                              assignment.fee_components.map((fc) => (
                                <span key={fc.id} className="mr-2">
                                  {feeKindLabels[fc.kind] || fc.kind}: {fc.rate_bps !== null && fc.rate_bps !== undefined ? `${fc.rate_bps / 100}%` : fc.flat_amount !== null && fc.flat_amount !== undefined ? `$${fc.flat_amount}` : '—'}
                                </span>
                              ))
                            ) : (
                              <span className="italic">No fees defined</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAssignment(assignment.fee_plan_id)}
                        disabled={removingId === assignment.fee_plan_id}
                        className="text-destructive hover:text-destructive h-7 w-7"
                      >
                        {removingId === assignment.fee_plan_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
