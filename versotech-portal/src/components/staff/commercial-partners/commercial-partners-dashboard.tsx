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
  Building2,
  Clock,
  Plus,
  Search,
  Mail,
  Shield,
  ExternalLink,
  Landmark,
  FileCheck,
} from 'lucide-react'
import { AddCommercialPartnerDialog } from '@/components/staff/commercial-partners/add-commercial-partner-dialog'

export type CommercialPartnersDashboardProps = {
  summary: {
    totalPartners: number
    activePartners: number
    kycApproved: number
    kycPending: number
  }
  partners: Array<{
    id: string
    name: string
    legalName: string | null
    type: string
    cpType: string
    status: string
    kycStatus: string | null
    regulatoryStatus: string | null
    jurisdiction: string | null
    contactName: string | null
    contactEmail: string | null
    country: string | null
    createdAt: string | null
  }>
}

const statusFilters = [
  { label: 'All status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Inactive', value: 'inactive' },
]

const typeFilters = [
  { label: 'All types', value: 'all' },
  { label: 'Bank', value: 'bank' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Wealth Manager', value: 'wealth-manager' },
  { label: 'Broker', value: 'broker' },
  { label: 'Custodian', value: 'custodian' },
  { label: 'Other', value: 'other' },
]

const kycFilters = [
  { label: 'All KYC', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Not Started', value: 'not_started' },
]

export function CommercialPartnersDashboard({ summary, partners }: CommercialPartnersDashboardProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
      const matchesType = typeFilter === 'all' || partner.cpType === typeFilter
      const matchesKyc = kycFilter === 'all' || partner.kycStatus === kycFilter
      const matchesSearch = !search ||
        partner.name.toLowerCase().includes(search.toLowerCase()) ||
        (partner.legalName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (partner.contactName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (partner.contactEmail?.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchesStatus && matchesType && matchesKyc && matchesSearch
    })
  }, [partners, statusFilter, typeFilter, kycFilter, search])

  const statusStyles: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  const kycStyles: Record<string, string> = {
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    not_started: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const typeLabels: Record<string, string> = {
    'bank': 'Bank',
    'insurance': 'Insurance',
    'wealth-manager': 'Wealth Manager',
    'broker': 'Broker',
    'custodian': 'Custodian',
    'other': 'Other',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commercial Partners</h1>
          <p className="text-muted-foreground mt-1">
            Manage banks, insurance companies, wealth managers, and other commercial partners
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Commercial Partner
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Active Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.activePartners}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {summary.totalPartners} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              KYC Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{summary.kycApproved}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Verified partners
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              KYC Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{summary.kycPending}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Awaiting review
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.totalPartners}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Registered
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Commercial Partners</CardTitle>
          <CardDescription>Browse and manage commercial partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, contact, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Partner Type" />
              </SelectTrigger>
              <SelectContent>
                {typeFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent>
                {kycFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Partners List */}
          {filteredPartners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Landmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No commercial partners found</p>
              <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Commercial Partner
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPartners.map((partner) => (
                <Link
                  key={partner.id}
                  href={`/versotech_main/commercial-partners/${partner.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Landmark className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{partner.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {typeLabels[partner.cpType] || partner.cpType}
                          {partner.jurisdiction && ` • ${partner.jurisdiction}`}
                        </div>
                        {partner.contactEmail && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {partner.contactEmail}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {partner.regulatoryStatus && (
                        <div className="hidden md:flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{partner.regulatoryStatus}</span>
                        </div>
                      )}
                      <div className="text-right">
                        <Badge className={statusStyles[partner.status] || 'bg-gray-500/20 text-gray-400'}>
                          {partner.status}
                        </Badge>
                        {partner.kycStatus && (
                          <Badge className={`ml-2 ${kycStyles[partner.kycStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                            KYC: {partner.kycStatus.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <AddCommercialPartnerDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
