'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  FileSignature,
  FileText,
  FolderOpen,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  Send,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface Deal {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  description: string | null
  investment_thesis: string | null
  minimum_investment: number | null
  maximum_investment: number | null
  target_amount: number | null
  raised_amount: number | null
  offer_unit_price: number | null
  company_name: string | null
  company_logo_url: string | null
  sector: string | null
  stage: string | null
  location: string | null
  open_at: string | null
  close_at: string | null
  created_at: string
  vehicles: {
    id: string
    name: string
    type: string
    status: string
  } | null
  arranger_entities: {
    id: string
    name: string
    type: string
  } | null
}

interface Membership {
  deal_id: string
  user_id: string
  investor_id: string | null
  role: string
  invited_by: string | null
  invited_at: string | null
  accepted_at: string | null
  dispatched_at: string | null
  viewed_at: string | null
  interest_confirmed_at: string | null
  nda_signed_at: string | null
  data_room_granted_at: string | null
  referred_by_entity_id: string | null
  referred_by_entity_type: string | null
  profiles: {
    id: string
    display_name: string
    email: string
  } | null
  investors: {
    id: string
    legal_name: string
    type: string
    kyc_status: string
  } | null
  subscription: {
    id: string
    investor_id: string
    commitment: number
    funded_amount: number
    status: string
    pack_generated_at: string | null
    pack_sent_at: string | null
    signed_at: string | null
    funded_at: string | null
  } | null
}

interface DispatchableUser {
  id: string
  display_name: string
  email: string
  role: string
}

interface Props {
  deal: Deal
  memberships: Membership[]
  dispatchableUsers: DispatchableUser[]
  currentUserId: string
}

// Journey stages configuration
const JOURNEY_STAGES = [
  { key: 'dispatched', label: 'Dispatched', icon: Send, field: 'dispatched_at' },
  { key: 'viewed', label: 'Viewed', icon: Eye, field: 'viewed_at' },
  { key: 'interest', label: 'Interest', icon: TrendingUp, field: 'interest_confirmed_at' },
  { key: 'nda', label: 'NDA', icon: FileSignature, field: 'nda_signed_at' },
  { key: 'data_room', label: 'Data Room', icon: FolderOpen, field: 'data_room_granted_at' },
  { key: 'pack_gen', label: 'Pack Gen', icon: FileText, field: 'pack_generated_at', fromSubscription: true },
  { key: 'pack_sent', label: 'Pack Sent', icon: Mail, field: 'pack_sent_at', fromSubscription: true },
  { key: 'signed', label: 'Signed', icon: CheckCircle2, field: 'signed_at', fromSubscription: true },
  { key: 'funded', label: 'Funded', icon: Wallet, field: 'funded_at', fromSubscription: true },
] as const

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
    draft: { variant: 'secondary', className: 'bg-gray-500/20 text-gray-400' },
    open: { variant: 'default', className: 'bg-green-500/20 text-green-400' },
    allocation_pending: { variant: 'secondary', className: 'bg-yellow-500/20 text-yellow-400' },
    closed: { variant: 'outline', className: 'bg-blue-500/20 text-blue-400' },
    cancelled: { variant: 'destructive', className: 'bg-red-500/20 text-red-400' },
  }
  const config = variants[status] || { variant: 'outline', className: '' }
  return <Badge variant={config.variant} className={config.className}>{status}</Badge>
}

function getRoleBadge(role: string) {
  const colors: Record<string, string> = {
    investor: 'bg-blue-500/20 text-blue-400',
    partner: 'bg-emerald-500/20 text-emerald-400',
    partner_investor: 'bg-purple-500/20 text-purple-400',
    introducer_investor: 'bg-orange-500/20 text-orange-400',
    commercial_partner_investor: 'bg-teal-500/20 text-teal-400',
    commercial_partner_proxy: 'bg-cyan-500/20 text-cyan-400',
    lawyer: 'bg-indigo-500/20 text-indigo-400',
    arranger: 'bg-pink-500/20 text-pink-400',
  }
  return (
    <Badge variant="outline" className={colors[role] || ''}>
      {role.replace(/_/g, ' ')}
    </Badge>
  )
}

function getCurrentStage(membership: Membership): { stage: string; index: number } {
  // Check stages in reverse order to find the latest completed
  for (let i = JOURNEY_STAGES.length - 1; i >= 0; i--) {
    const stage = JOURNEY_STAGES[i]
    let value: string | null = null

    const isFromSubscription = 'fromSubscription' in stage && stage.fromSubscription
    if (isFromSubscription && membership.subscription) {
      value = (membership.subscription as any)[stage.field]
    } else if (!isFromSubscription) {
      value = (membership as any)[stage.field]
    }

    if (value) {
      return { stage: stage.label, index: i }
    }
  }
  return { stage: 'Not Started', index: -1 }
}

function JourneyProgressBar({ membership }: { membership: Membership }) {
  const { index: currentIndex } = getCurrentStage(membership)

  return (
    <div className="flex items-center gap-1">
      {JOURNEY_STAGES.map((stage, idx) => {
        let value: string | null = null
        const isFromSubscription = 'fromSubscription' in stage && stage.fromSubscription
        if (isFromSubscription && membership.subscription) {
          value = (membership.subscription as any)[stage.field]
        } else if (!isFromSubscription) {
          value = (membership as any)[stage.field]
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

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function DealDetailClient({ deal, memberships, dispatchableUsers, currentUserId }: Props) {
  const router = useRouter()
  const [isDispatchOpen, setIsDispatchOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [dispatchRole, setDispatchRole] = useState<string>('investor')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDispatching, setIsDispatching] = useState(false)

  const filteredUsers = dispatchableUsers.filter(u =>
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDispatch = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    setIsDispatching(true)
    try {
      const response = await fetch(`/api/deals/${deal.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: selectedUsers,
          role: dispatchRole
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to dispatch users')
      }

      toast.success(`Successfully dispatched ${selectedUsers.length} user(s) to deal`)
      setIsDispatchOpen(false)
      setSelectedUsers([])
      router.refresh()
    } catch (error) {
      console.error('Dispatch error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to dispatch users')
    } finally {
      setIsDispatching(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Calculate stats
  const stats = {
    totalMembers: memberships.length,
    dispatched: memberships.filter(m => m.dispatched_at).length,
    viewed: memberships.filter(m => m.viewed_at).length,
    interested: memberships.filter(m => m.interest_confirmed_at).length,
    ndaSigned: memberships.filter(m => m.nda_signed_at).length,
    subscribed: memberships.filter(m => m.subscription).length,
    signed: memberships.filter(m => m.subscription?.signed_at).length,
    funded: memberships.filter(m => m.subscription?.funded_at).length,
    totalCommitment: memberships.reduce((sum, m) => sum + (m.subscription?.commitment || 0), 0),
    totalFunded: memberships.reduce((sum, m) => sum + (m.subscription?.funded_amount || 0), 0)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/versotech_main/deals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{deal.name}</h1>
              {getStatusBadge(deal.status)}
            </div>
            {deal.company_name && (
              <p className="text-muted-foreground mt-1">{deal.company_name}</p>
            )}
          </div>
        </div>
        <Dialog open={isDispatchOpen} onOpenChange={setIsDispatchOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Dispatch to Users
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Dispatch Deal to Users</DialogTitle>
              <DialogDescription>
                Select users to dispatch this deal to. They will be notified and can view the deal in their opportunities.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Search Users</Label>
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label>Role</Label>
                  <Select value={dispatchRole} onValueChange={setDispatchRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="partner">Partner (Tracking Only)</SelectItem>
                      <SelectItem value="partner_investor">Partner Investor</SelectItem>
                      <SelectItem value="introducer_investor">Introducer Investor</SelectItem>
                      <SelectItem value="commercial_partner_investor">Commercial Partner</SelectItem>
                      <SelectItem value="lawyer">Lawyer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border rounded-lg overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No users available to dispatch
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer"
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.display_name || 'Unknown'}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role?.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {selectedUsers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.length} user(s) selected
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDispatchOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDispatch} disabled={isDispatching || selectedUsers.length === 0}>
                {isDispatching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Dispatch ({selectedUsers.length})
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deal Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(deal.target_amount, deal.currency)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Raised: {formatCurrency(deal.raised_amount, deal.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {stats.subscribed} subscribed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCommitment, deal.currency)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Funded: {formatCurrency(stats.totalFunded, deal.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {deal.open_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Opened:</span>
                  <span>{format(new Date(deal.open_at), 'MMM d, yyyy')}</span>
                </div>
              )}
              {deal.close_at && (
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Closes:</span>
                  <span>{format(new Date(deal.close_at), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investor Journey Funnel
          </CardTitle>
          <CardDescription>Track member progression through the 10-stage journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: 'Dispatched', count: stats.dispatched },
              { label: 'Viewed', count: stats.viewed },
              { label: 'Interested', count: stats.interested },
              { label: 'NDA Signed', count: stats.ndaSigned },
              { label: 'Data Room', count: memberships.filter(m => m.data_room_granted_at).length },
              { label: 'Pack Gen', count: memberships.filter(m => m.subscription?.pack_generated_at).length },
              { label: 'Pack Sent', count: memberships.filter(m => m.subscription?.pack_sent_at).length },
              { label: 'Signed', count: stats.signed },
              { label: 'Funded', count: stats.funded },
            ].map((stage, idx) => (
              <div key={stage.label} className="flex items-center">
                <div className="text-center min-w-[80px]">
                  <div className="text-2xl font-bold">{stage.count}</div>
                  <div className="text-xs text-muted-foreground">{stage.label}</div>
                </div>
                {idx < 8 && (
                  <div className="mx-2 text-muted-foreground">→</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{deal.description}</p>
              </div>
            )}
            {deal.investment_thesis && (
              <div>
                <Label className="text-muted-foreground">Investment Thesis</Label>
                <p className="mt-1">{deal.investment_thesis}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Deal Type</Label>
                <p className="mt-1 capitalize">{deal.deal_type?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Sector</Label>
                <p className="mt-1">{deal.sector || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Stage</Label>
                <p className="mt-1">{deal.stage || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="mt-1">{deal.location || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Min Investment</Label>
                <p className="mt-1">{formatCurrency(deal.minimum_investment, deal.currency)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Max Investment</Label>
                <p className="mt-1">{formatCurrency(deal.maximum_investment, deal.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle & Arranger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.vehicles && (
              <div>
                <Label className="text-muted-foreground">Vehicle</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{deal.vehicles.name}</span>
                  <Badge variant="outline" className="text-xs">{deal.vehicles.type}</Badge>
                </div>
              </div>
            )}
            {deal.arranger_entities && (
              <div>
                <Label className="text-muted-foreground">Arranger</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{deal.arranger_entities.name}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Deal Members ({memberships.length})
              </CardTitle>
              <CardDescription>Members dispatched to this deal with their journey progress</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Journey Progress</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Commitment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No members dispatched yet. Click "Dispatch to Users" to add members.
                  </TableCell>
                </TableRow>
              ) : (
                memberships.map(member => {
                  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
                  const investor = Array.isArray(member.investors) ? member.investors[0] : member.investors
                  const { stage } = getCurrentStage(member)

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
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>
                        <JourneyProgressBar membership={member} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stage}</Badge>
                      </TableCell>
                      <TableCell>
                        {member.subscription ? (
                          <div>
                            <div className="font-medium">
                              {formatCurrency(member.subscription.commitment, deal.currency)}
                            </div>
                            {member.subscription.funded_amount > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Funded: {formatCurrency(member.subscription.funded_amount, deal.currency)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
                                <Link href={`/versotech_main/users?type=investors&id=${investor.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Investor
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {profile?.email && (
                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${profile.email}`}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
