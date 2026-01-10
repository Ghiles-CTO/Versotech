'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  HandHeart,
  Users,
  DollarSign,
  Clock,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Edit,
  UserPlus,
  FileText,
  Send,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import FeePlanEditModal from '@/components/fees/FeePlanEditModal'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate, formatBps } from '@/lib/format'
import { CheckCircle2 } from 'lucide-react'
import { useAddIntroducer } from '@/components/staff/introducers/add-introducer-context'
import { EditIntroducerDialog } from '@/components/staff/introducers/edit-introducer-dialog'
import { AddIntroductionDialog } from '@/components/staff/introducers/add-introduction-dialog'
import { EditIntroductionDialog } from '@/components/staff/introducers/edit-introduction-dialog'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'

export type IntroducersDashboardProps = {
  summary: {
    totalIntroducers: number
    activeIntroducers: number
    totalIntroductions: number
    totalAllocations: number
    totalCommissionPaid: number
    pendingCommission: number
  }
  introducers: Array<{
    id: string
    legalName: string
    contactName: string | null
    email: string | null
    defaultCommissionBps: number
    commissionCapAmount: number | null
    paymentTerms: string | null
    status: string
    createdAt: string | null
    totalIntroductions: number
    successfulAllocations: number
    totalCommissionPaid: number
    pendingCommission: number
    lastIntroductionAt: string | null
    feePlans?: {
      total: number
      accepted: number
      pending: number
    }
  }>
  recentIntroductions: Array<{
    id: string
    introducerId?: string
    introducerName: string
    prospectEmail: string
    dealId?: string
    dealName: string
    status: string
    introducedAt: string | null
    commissionAmount: number | null
    commissionStatus: string | null
    commissionRateOverrideBps?: number | null
    notes?: string | null
  }>
  deals?: Array<{ id: string; name: string }>
  isDemo?: boolean
  showAddButtons?: boolean
}

const statusFilters = [
  { label: 'All status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
]

export function IntroducersDashboard({ summary, introducers, recentIntroductions, deals = [], isDemo = false, showAddButtons = true }: IntroducersDashboardProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingIntroducer, setEditingIntroducer] = useState<IntroducersDashboardProps['introducers'][number] | null>(null)
  const [editingIntroduction, setEditingIntroduction] = useState<IntroducersDashboardProps['recentIntroductions'][number] | null>(null)
  const [addIntroductionOpen, setAddIntroductionOpen] = useState(false)
  const [inviteDialogIntroducer, setInviteDialogIntroducer] = useState<IntroducersDashboardProps['introducers'][number] | null>(null)
  const { setOpen } = useAddIntroducer()

  // Fee plan modal state
  const [feePlanModalOpen, setFeePlanModalOpen] = useState(false)
  const [selectedIntroducerForFeePlan, setSelectedIntroducerForFeePlan] = useState<IntroducersDashboardProps['introducers'][number] | null>(null)

  // Handler for creating a fee plan for an introducer
  const handleCreateFeePlan = (introducer: IntroducersDashboardProps['introducers'][number]) => {
    setSelectedIntroducerForFeePlan(introducer)
    setFeePlanModalOpen(true)
  }

  const handleFeePlanSuccess = () => {
    setFeePlanModalOpen(false)
    setSelectedIntroducerForFeePlan(null)
    toast.success('Fee plan created successfully')
    router.refresh()
  }

  // Handler for dispatching investor through an introducer
  const handleDispatchInvestor = (introducer: IntroducersDashboardProps['introducers'][number]) => {
    // Navigate to dispatch page with introducer pre-selected
    // For now, show toast with info - will implement full dispatch modal in next phase
    toast.info(`To dispatch an investor through ${introducer.legalName}, go to a deal's Members tab and use "Add Participant"`)
  }

  const filteredIntroducers = useMemo(() => {
    return introducers.filter((introducer) => {
      const matchesStatus = statusFilter === 'all' || introducer.status === statusFilter
      const matchesSearch = !search || introducer.legalName.toLowerCase().includes(search.toLowerCase())
        || (introducer.contactName?.toLowerCase().includes(search.toLowerCase()) ?? false)
        || (introducer.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchesStatus && matchesSearch
    })
  }, [introducers, statusFilter, search])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Introducer Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage introducer relationships, commissions, and performance tracking
          </p>
        </div>
{showAddButtons && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setAddIntroductionOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Record Introduction
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Introducer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardStatCard
          icon={<HandHeart className="h-4 w-4" />}
          label="Active Introducers"
          primary={summary.activeIntroducers}
          secondary={`${summary.totalIntroducers} total`}
        />
        <DashboardStatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Introductions"
          primary={summary.totalIntroductions}
          secondary={`${summary.totalAllocations} allocated`}
        />
        <DashboardStatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Commissions Paid"
          primary={formatCurrency(summary.totalCommissionPaid)}
          secondary="All-time"
        />
        <DashboardStatCard
          icon={<Clock className="h-4 w-4" />}
          label="Pending Commission"
          primary={formatCurrency(summary.pendingCommission)}
          secondary="Awaiting payment"
          primaryClassName="text-orange-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Narrow down introducers by status, performance, or keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search introducers, contacts, emails..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isDemo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Showing demo dataset. Re-run with a staff session to load live data.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Introducers</CardTitle>
          <CardDescription>
            Performance summary for each introducer partner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredIntroducers.length === 0 ? (
            <EmptyState message={search ? 'No introducers match your filters.' : 'No introducers available yet.'} />
          ) : (
            filteredIntroducers.map((introducer) => (
              <IntroducerRow
                key={introducer.id}
                introducer={introducer}
                onEdit={() => setEditingIntroducer(introducer)}
                onInvite={() => setInviteDialogIntroducer(introducer)}
                onCreateFeePlan={() => handleCreateFeePlan(introducer)}
                onDispatchInvestor={() => handleDispatchInvestor(introducer)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Introductions</CardTitle>
          <CardDescription>
            Latest introducer activity across deals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentIntroductions.length === 0 ? (
            <EmptyState message="No recent introductions " />
          ) : (
            recentIntroductions.map((introduction) => (
              <RecentIntroductionRow
                key={introduction.id}
                introduction={introduction}
                onEdit={() => setEditingIntroduction(introduction)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <EditIntroducerDialog
        open={!!editingIntroducer}
        onOpenChange={(open) => !open && setEditingIntroducer(null)}
        introducer={editingIntroducer}
      />

      <AddIntroductionDialog
        open={addIntroductionOpen}
        onOpenChange={setAddIntroductionOpen}
        introducers={introducers.map((i) => ({ id: i.id, legalName: i.legalName }))}
        deals={deals}
      />

      <EditIntroductionDialog
        open={!!editingIntroduction}
        onOpenChange={(open) => !open && setEditingIntroduction(null)}
        introduction={editingIntroduction}
        introducers={introducers.map((i) => ({ id: i.id, legalName: i.legalName }))}
        deals={deals}
      />

      {inviteDialogIntroducer && (
        <InviteUserDialog
          open={!!inviteDialogIntroducer}
          onOpenChange={(open) => !open && setInviteDialogIntroducer(null)}
          entityType="introducer"
          entityId={inviteDialogIntroducer.id}
          entityName={inviteDialogIntroducer.legalName}
        />
      )}

      {/* Fee Plan Modal for creating fee plans with pre-selected introducer */}
      <FeePlanEditModal
        open={feePlanModalOpen}
        onClose={() => {
          setFeePlanModalOpen(false)
          setSelectedIntroducerForFeePlan(null)
        }}
        onSuccess={handleFeePlanSuccess}
      />
    </div>
  )
}

function DashboardStatCard({
  icon,
  label,
  primary,
  secondary,
  primaryClassName,
}: {
  icon: React.ReactNode
  label: string
  primary: React.ReactNode
  secondary: React.ReactNode
  primaryClassName?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', primaryClassName)}>{primary}</div>
        <div className="text-sm text-muted-foreground mt-1">{secondary}</div>
      </CardContent>
    </Card>
  )
}

function IntroducerRow({
  introducer,
  onEdit,
  onInvite,
  onCreateFeePlan,
  onDispatchInvestor,
}: {
  introducer: IntroducersDashboardProps['introducers'][number]
  onEdit: () => void
  onInvite: () => void
  onCreateFeePlan: () => void
  onDispatchInvestor: () => void
}) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-background/60 hover:bg-background/80 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/versotech_main/introducers/${introducer.id}`}>
                <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  {introducer.legalName}
                </h3>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Introducer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onInvite}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite User
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onCreateFeePlan}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Fee Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDispatchInvestor}>
                    <Send className="mr-2 h-4 w-4" />
                    Dispatch Investor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="text-sm text-muted-foreground">
              {introducer.contactName || 'No contact'} • {introducer.email || 'No email provided'}
            </div>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
              <span>Default commission: {formatBps(introducer.defaultCommissionBps)}</span>
              {introducer.commissionCapAmount ? (
                <span>Cap: {formatCurrency(introducer.commissionCapAmount)}</span>
              ) : null}
              {introducer.paymentTerms ? <span>Terms: {introducer.paymentTerms}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Stat label="Introductions" value={introducer.totalIntroductions} />
          <Stat label="Allocated" value={introducer.successfulAllocations} />
          {/* Fee Plans count with status indicator */}
          {introducer.feePlans && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 font-semibold tabular-nums">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{introducer.feePlans.accepted}/{introducer.feePlans.total}</span>
                {introducer.feePlans.accepted === introducer.feePlans.total && introducer.feePlans.total > 0 && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                )}
                {introducer.feePlans.pending > 0 && (
                  <Clock className="h-3.5 w-3.5 text-yellow-400" />
                )}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Fee Plans</div>
            </div>
          )}
          <Stat label="Paid" value={formatCurrency(introducer.totalCommissionPaid)} />
          <Stat label="Pending" value={formatCurrency(introducer.pendingCommission)} className="text-orange-500" />
          <div className="flex flex-col items-start gap-2">
            <Badge className={cn('capitalize', statusStyles[introducer.status] ?? 'bg-gray-100 text-foreground')}>
              {introducer.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last intro: {introducer.lastIntroductionAt ? formatDate(introducer.lastIntroductionAt) : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="text-center">
      <div className={cn('font-semibold tabular-nums', className)}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  )
}

function RecentIntroductionRow({
  introduction,
  onEdit
}: {
  introduction: IntroducersDashboardProps['recentIntroductions'][number]
  onEdit: () => void
}) {
  const [status, setStatus] = useState(introduction.status)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const statusStyles: Record<string, string> = {
    allocated: 'border-green-200 text-green-700',
    joined: 'border-blue-200 text-blue-700',
    invited: 'border-yellow-200 text-yellow-700',
    lost: 'border-red-200 text-red-700',
    inactive: 'border-gray-200 text-gray-700',
  }

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/staff/introductions/${introduction.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          toast.error('Failed to update introduction status')
          return
        }

        setStatus(newStatus)
        toast.success('Introduction status updated')
        router.refresh()
      } catch (err) {
        toast.error('Failed to update introduction status')
      }
    })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-border rounded-lg p-4">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-foreground">{introduction.prospectEmail}</h4>
          <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
            <SelectTrigger className={cn('w-32 h-7 text-xs capitalize', statusStyles[status] ?? 'border-gray-200 text-foreground')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="joined">Joined</SelectItem>
              <SelectItem value="allocated">Allocated</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {introduction.introducerName} • {introduction.dealName}
        </div>
        <div className="text-xs text-muted-foreground">
          Introduced {introduction.introducedAt ? formatDate(introduction.introducedAt) : '—'}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium">
            {introduction.commissionAmount ? formatCurrency(introduction.commissionAmount) : 'Commission TBD'}
          </div>
          <div className="text-xs text-muted-foreground">
            {introduction.commissionStatus ? `Status: ${introduction.commissionStatus}` : 'Awaiting accrual'}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
      <TrendingUp className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

