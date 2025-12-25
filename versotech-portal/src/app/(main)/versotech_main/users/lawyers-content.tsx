'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertCircle,
  Loader2,
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Scale,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  MapPin,
  Plus,
  UserPlus,
  Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AddLawyerModal } from '@/components/users/add-lawyer-modal'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'

type LawyerUser = {
  id: string
  name: string
  email: string
  role: string
  isPrimary: boolean
  canSign: boolean
}

type Lawyer = {
  id: string
  firmName: string
  displayName: string
  legalEntityType: string | null
  registrationNumber: string | null
  taxId: string | null
  primaryContactName: string | null
  primaryContactEmail: string | null
  primaryContactPhone: string | null
  city: string | null
  stateProvince: string | null
  country: string | null
  specializations: string[] | null
  isActive: boolean
  kycStatus: string | null
  onboardedAt: string | null
  createdAt: string
  users: LawyerUser[]
}

type LawyerStats = {
  total: number
  active: number
  kycApproved: number
  onboarded: number
}

function getStatusBadge(isActive: boolean) {
  if (isActive) {
    return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
  }
  return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
}

function getKycStatusIcon(status: string | null) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    case 'pending':
    case 'review':
      return <Clock className="h-4 w-4 text-yellow-400" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function formatSpecializations(specializations: string[] | null): string {
  if (!specializations || specializations.length === 0) return 'General Practice'
  if (specializations.length <= 2) return specializations.join(', ')
  return `${specializations.slice(0, 2).join(', ')} +${specializations.length - 2}`
}

export default function LawyersContent() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([])
  const [stats, setStats] = useState<LawyerStats>({ total: 0, active: 0, kycApproved: 0, onboarded: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)

  const handleInviteClick = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer)
    setShowInviteDialog(true)
  }

  const refreshData = () => {
    setLoading(true)
    fetchLawyers()
  }

  async function fetchLawyers() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('lawyers')
        .select(`
          id,
          firm_name,
          display_name,
          legal_entity_type,
          registration_number,
          tax_id,
          primary_contact_name,
          primary_contact_email,
          primary_contact_phone,
          city,
          state_province,
          country,
          specializations,
          is_active,
          kyc_status,
          onboarded_at,
          created_at,
          lawyer_users (
            user_id,
            role,
            is_primary,
            can_sign,
            profiles (
              id,
              display_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const processed: Lawyer[] = (data || []).map((l: any) => {
        const users: LawyerUser[] = (l.lawyer_users || []).map((lu: any) => {
          const profile = Array.isArray(lu.profiles) ? lu.profiles[0] : lu.profiles
          return {
            id: profile?.id || lu.user_id,
            name: profile?.display_name || 'Unknown User',
            email: profile?.email || '',
            role: lu.role || 'member',
            isPrimary: lu.is_primary || false,
            canSign: lu.can_sign || false
          }
        })

        return {
          id: l.id,
          firmName: l.firm_name || 'Unnamed Firm',
          displayName: l.display_name || l.firm_name || 'Unnamed',
          legalEntityType: l.legal_entity_type,
          registrationNumber: l.registration_number,
          taxId: l.tax_id,
          primaryContactName: l.primary_contact_name,
          primaryContactEmail: l.primary_contact_email,
          primaryContactPhone: l.primary_contact_phone,
          city: l.city,
          stateProvince: l.state_province,
          country: l.country,
          specializations: l.specializations,
          isActive: l.is_active ?? true,
          kycStatus: l.kyc_status,
          onboardedAt: l.onboarded_at,
          createdAt: l.created_at,
          users
        }
      })

      setLawyers(processed)
      setFilteredLawyers(processed)
      setStats({
        total: processed.length,
        active: processed.filter(l => l.isActive).length,
        kycApproved: processed.filter(l => l.kycStatus === 'approved').length,
        onboarded: processed.filter(l => l.onboardedAt).length
      })
      setError(null)
    } catch (err) {
      console.error('[LawyersContent] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load lawyers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLawyers()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLawyers(lawyers)
      return
    }
    const query = searchQuery.toLowerCase()
    setFilteredLawyers(lawyers.filter(l =>
      l.firmName.toLowerCase().includes(query) ||
      l.displayName.toLowerCase().includes(query) ||
      l.primaryContactEmail?.toLowerCase().includes(query) ||
      l.primaryContactName?.toLowerCase().includes(query) ||
      l.city?.toLowerCase().includes(query) ||
      l.country?.toLowerCase().includes(query) ||
      l.specializations?.some(s => s.toLowerCase().includes(query))
    ))
  }, [searchQuery, lawyers])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading lawyers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Lawyers</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Lawyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Legal counsel firms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Firms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-muted-foreground mt-1">Currently active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">KYC Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.kycApproved}</div>
            <div className="text-sm text-muted-foreground mt-1">Compliance verified</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Onboarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.onboarded}</div>
            <div className="text-sm text-muted-foreground mt-1">Fully onboarded</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by firm name, contact, location, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              All Lawyers ({filteredLawyers.length})
            </CardTitle>
            <CardDescription className="mt-1">
              Legal counsel for deals, escrow management, and regulatory compliance
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Law Firm
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firm</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLawyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No lawyers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLawyers.map((lawyer) => (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{lawyer.firmName}</div>
                        {lawyer.displayName !== lawyer.firmName && (
                          <div className="text-sm text-muted-foreground">{lawyer.displayName}</div>
                        )}
                        {lawyer.registrationNumber && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Reg: {lawyer.registrationNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatSpecializations(lawyer.specializations)}</span>
                      </div>
                      {lawyer.specializations && lawyer.specializations.length > 2 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {lawyer.specializations.slice(2).join(', ')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {lawyer.city || lawyer.country ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {[lawyer.city, lawyer.stateProvince, lawyer.country]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{lawyer.users.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lawyer.primaryContactName ? (
                        <div>
                          <div className="text-sm text-foreground">{lawyer.primaryContactName}</div>
                          {lawyer.primaryContactEmail && (
                            <div className="text-xs text-muted-foreground">{lawyer.primaryContactEmail}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No contact</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getKycStatusIcon(lawyer.kycStatus)}
                        <span className="text-sm capitalize">{lawyer.kycStatus || 'pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lawyer.isActive)}
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
                          <DropdownMenuItem onClick={() => handleInviteClick(lawyer)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/versotech_main/lawyers/${lawyer.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {lawyer.primaryContactEmail && (
                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${lawyer.primaryContactEmail}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Law Firm Modal */}
      <AddLawyerModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={refreshData}
      />

      {/* Invite User Dialog */}
      {selectedLawyer && (
        <InviteUserDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          entityType="lawyer"
          entityId={selectedLawyer.id}
          entityName={selectedLawyer.firmName}
          onSuccess={refreshData}
        />
      )}
    </div>
  )
}
