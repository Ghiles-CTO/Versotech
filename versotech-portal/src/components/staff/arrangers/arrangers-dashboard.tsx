'use client'

import { useMemo, useState } from 'react'
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
  Briefcase,
  Building2,
  Activity,
  CheckCircle2,
  Plus,
  Search,
  Edit,
  FileText,
  Upload,
  Link as LinkIcon,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { useAddArranger } from '@/components/staff/arrangers/add-arranger-context'
import { EditArrangerDialog } from '@/components/staff/arrangers/edit-arranger-dialog'
import { ArrangerKYCDialog } from '@/components/staff/arrangers/arranger-kyc-dialog'
import { ArrangerDocumentsDialog } from '@/components/staff/arrangers/arranger-documents-dialog'

export type ArrangersDashboardProps = {
  summary: {
    totalEntities: number
    activeEntities: number
    kycApproved: number
    totalDeals: number
    totalVehicles: number
    totalAum: number
  }
  arrangers: Array<{
    id: string
    legalName: string
    registrationNumber: string | null
    taxId: string | null
    regulator: string | null
    licenseNumber: string | null
    licenseType: string | null
    licenseExpiryDate: string | null
    email: string | null
    phone: string | null
    address: string | null
    kycStatus: string
    kycApprovedAt: string | null
    kycApprovedBy: string | null
    kycExpiresAt: string | null
    kycNotes: string | null
    metadata: any
    status: string
    createdAt: string | null
    createdBy: string | null
    updatedAt: string | null
    updatedBy: string | null
    totalDeals: number
    activeDeals: number
    totalVehicles: number
    totalAum: number
    documentCount: number
  }>
  deals?: Array<{ id: string; name: string }>
  vehicles?: Array<{ id: string; name: string }>
}

const statusFilters = [
  { label: 'All status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
]

const kycFilters = [
  { label: 'All KYC', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'draft' },
  { label: 'Expired', value: 'expired' },
  { label: 'Rejected', value: 'rejected' },
]

export function ArrangersDashboard({ summary, arrangers, deals = [], vehicles = [] }: ArrangersDashboardProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [editingArranger, setEditingArranger] = useState<ArrangersDashboardProps['arrangers'][number] | null>(null)
  const [kycDialogArranger, setKycDialogArranger] = useState<ArrangersDashboardProps['arrangers'][number] | null>(null)
  const [documentsDialogArranger, setDocumentsDialogArranger] = useState<ArrangersDashboardProps['arrangers'][number] | null>(null)
  const { setOpen } = useAddArranger()

  const filteredArrangers = useMemo(() => {
    return arrangers.filter((arranger) => {
      const matchesStatus = statusFilter === 'all' || arranger.status === statusFilter
      const matchesKyc = kycFilter === 'all' || arranger.kycStatus === kycFilter
      const matchesSearch = !search || arranger.legalName.toLowerCase().includes(search.toLowerCase())
        || (arranger.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)
        || (arranger.licenseNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)
        || (arranger.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchesStatus && matchesKyc && matchesSearch
    })
  }, [arrangers, statusFilter, kycFilter, search])

  return (
    <div className="p-6 space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Arrangers & Advisors</h1>
          <p className="text-muted-foreground mt-1">
            Manage regulated entities arranging deals and managing vehicles
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Arranger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardStatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Active Entities"
          primary={summary.activeEntities}
          secondary={`${summary.totalEntities} total`}
        />
        <DashboardStatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="KYC Approved"
          primary={summary.kycApproved}
          secondary={`${summary.totalEntities - summary.kycApproved} pending`}
          primaryClassName="text-green-400"
        />
        <DashboardStatCard
          icon={<Activity className="h-4 w-4" />}
          label="Total Deals"
          primary={summary.totalDeals}
          secondary={`Arranged`}
        />
        <DashboardStatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total AUM"
          primary={formatCurrency(summary.totalAum)}
          secondary={`${summary.totalVehicles} vehicles`}
        />
      </div>

      <Card className="border border-white/10">
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Filter arrangers by status, KYC status, or keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search legal name, registration #, license #, email..."
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
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter KYC" />
              </SelectTrigger>
              <SelectContent>
                {kycFilters.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/10">
        <CardHeader>
          <CardTitle>Arranger Entities ({filteredArrangers.length})</CardTitle>
          <CardDescription>
            Regulated entities with deal and vehicle assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredArrangers.length === 0 ? (
            <EmptyState message={search ? 'No arrangers match your filters.' : 'No arrangers available yet.'} />
          ) : (
            filteredArrangers.map((arranger) => (
              <ArrangerRow
                key={arranger.id}
                arranger={arranger}
                onEdit={() => setEditingArranger(arranger)}
                onManageKYC={() => setKycDialogArranger(arranger)}
                onManageDocuments={() => setDocumentsDialogArranger(arranger)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <EditArrangerDialog
        open={!!editingArranger}
        onOpenChange={(open) => !open && setEditingArranger(null)}
        arranger={editingArranger}
      />

      <ArrangerKYCDialog
        open={!!kycDialogArranger}
        onOpenChange={(open) => !open && setKycDialogArranger(null)}
        arranger={kycDialogArranger}
      />

      <ArrangerDocumentsDialog
        open={!!documentsDialogArranger}
        onOpenChange={(open) => !open && setDocumentsDialogArranger(null)}
        arranger={documentsDialogArranger}
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
    <Card className="border border-white/10">
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

function ArrangerRow({
  arranger,
  onEdit,
  onManageKYC,
  onManageDocuments,
}: {
  arranger: ArrangersDashboardProps['arrangers'][number]
  onEdit: () => void
  onManageKYC: () => void
  onManageDocuments: () => void
}) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    suspended: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  const kycStyles: Record<string, string> = {
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="border border-white/10 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {arranger.legalName}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {arranger.regulator && arranger.licenseNumber && (
                <span className="font-medium">{arranger.regulator}: {arranger.licenseNumber}</span>
              )}
              {arranger.registrationNumber && (
                <span className="ml-2">• Reg: {arranger.registrationNumber}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {arranger.email || 'No email'} • {arranger.phone || 'No phone'}
            </div>
            {arranger.licenseType && (
              <div className="text-sm text-muted-foreground">
                Type: {arranger.licenseType}
                {arranger.licenseExpiryDate && (
                  <span className="ml-2">• Expires: {formatDate(arranger.licenseExpiryDate)}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Stat label="Deals" value={arranger.totalDeals} subtitle={`${arranger.activeDeals} active`} />
            <Stat label="Vehicles" value={arranger.totalVehicles} />
            <Stat label="AUM" value={formatCurrency(arranger.totalAum)} />
            <Stat label="Docs" value={arranger.documentCount} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn('capitalize', statusStyles[arranger.status] ?? 'bg-gray-500/20 text-gray-400')}>
              {arranger.status}
            </Badge>
            <Badge className={cn('capitalize', kycStyles[arranger.kycStatus] ?? 'bg-gray-500/20 text-gray-400')}>
              KYC: {arranger.kycStatus}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onManageKYC}
              className="h-7 text-xs"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              KYC
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onManageDocuments}
              className="h-7 text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Docs
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  subtitle,
  className
}: {
  label: string
  value: React.ReactNode
  subtitle?: string
  className?: string
}) {
  return (
    <div className="text-center">
      <div className={cn('font-semibold tabular-nums', className)}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
