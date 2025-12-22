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
  Scale,
  Users,
  Building2,
  Clock,
  Plus,
  Search,
  MapPin,
  Mail,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { AddLawyerDialog } from '@/components/staff/lawyers/add-lawyer-dialog'

export type LawyersDashboardProps = {
  summary: {
    totalLawyers: number
    activeLawyers: number
    kycApproved: number
    kycPending: number
  }
  lawyers: Array<{
    id: string
    firmName: string
    displayName: string
    primaryContactName: string | null
    primaryContactEmail: string | null
    country: string | null
    specializations: string[] | null
    isActive: boolean
    kycStatus: string | null
    assignedDealsCount: number
    createdAt: string | null
  }>
}

const statusFilters = [
  { label: 'All status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const kycFilters = [
  { label: 'All KYC', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Draft', value: 'draft' },
]

export function LawyersDashboard({ summary, lawyers }: LawyersDashboardProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && lawyer.isActive) ||
        (statusFilter === 'inactive' && !lawyer.isActive)
      const matchesKyc = kycFilter === 'all' || lawyer.kycStatus === kycFilter
      const matchesSearch = !search ||
        lawyer.firmName.toLowerCase().includes(search.toLowerCase()) ||
        lawyer.displayName.toLowerCase().includes(search.toLowerCase()) ||
        (lawyer.primaryContactName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (lawyer.primaryContactEmail?.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchesStatus && matchesKyc && matchesSearch
    })
  }, [lawyers, statusFilter, kycFilter, search])

  const kycStyles: Record<string, string> = {
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lawyer Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage law firms, legal counsel, and compliance documentation
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lawyer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Active Lawyers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.activeLawyers}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {summary.totalLawyers} total
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
              Verified firms
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
              Total Firms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.totalLawyers}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Registered
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Law Firms</CardTitle>
          <CardDescription>Browse and manage legal partners</CardDescription>
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

          {/* Lawyers List */}
          {filteredLawyers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Scale className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No lawyers found</p>
              <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Lawyer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLawyers.map((lawyer) => (
                <Link
                  key={lawyer.id}
                  href={`/versotech/staff/lawyers/${lawyer.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Scale className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{lawyer.firmName}</div>
                        <div className="text-sm text-muted-foreground">
                          {lawyer.displayName}
                          {lawyer.country && ` • ${lawyer.country}`}
                        </div>
                        {lawyer.primaryContactEmail && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {lawyer.primaryContactEmail}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {lawyer.specializations && lawyer.specializations.length > 0 && (
                        <div className="hidden md:flex gap-1">
                          {lawyer.specializations.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {lawyer.specializations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{lawyer.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="text-right">
                        <Badge className={lawyer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                          {lawyer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {lawyer.kycStatus && (
                          <Badge className={`ml-2 ${kycStyles[lawyer.kycStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                            KYC: {lawyer.kycStatus}
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
      <AddLawyerDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
