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
  ExternalLink,
  HandshakeIcon,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  UserPlus,
  Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AddPartnerModal } from '@/components/users/add-partner-modal'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'

type PartnerUser = {
  id: string
  name: string
  email: string
  role: string
  isPrimary: boolean
}

type Partner = {
  id: string
  name: string
  legalName: string | null
  type: string
  partnerType: string
  status: string
  accreditationStatus: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  website: string | null
  country: string | null
  typicalInvestmentMin: number | null
  typicalInvestmentMax: number | null
  preferredSectors: string[] | null
  preferredGeographies: string[] | null
  kycStatus: string | null
  createdAt: string
  users: PartnerUser[]
}

type PartnerStats = {
  total: number
  active: number
  kycApproved: number
  coInvestors: number
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
    case 'inactive':
      return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
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

function formatCurrency(min: number | null, max: number | null): string {
  if (!min && !max) return 'Not specified'
  const format = (n: number) => `$${(n / 1000000).toFixed(1)}M`
  if (min && max) return `${format(min)} - ${format(max)}`
  if (min) return `${format(min)}+`
  if (max) return `Up to ${format(max)}`
  return 'Not specified'
}

export default function PartnersContent() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([])
  const [stats, setStats] = useState<PartnerStats>({ total: 0, active: 0, kycApproved: 0, coInvestors: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  const handleInviteClick = (partner: Partner) => {
    setSelectedPartner(partner)
    setShowInviteDialog(true)
  }

  const refreshData = () => {
    // Trigger re-fetch by re-running useEffect
    setLoading(true)
    fetchPartners()
  }

  async function fetchPartners() {
    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('partners')
        .select(`
          id,
          name,
          legal_name,
          type,
          partner_type,
          status,
          accreditation_status,
          contact_name,
          contact_email,
          contact_phone,
          website,
          country,
          typical_investment_min,
          typical_investment_max,
          preferred_sectors,
          preferred_geographies,
          kyc_status,
          created_at,
          partner_users (
            user_id,
            role,
            is_primary,
            profiles (
              id,
              display_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const processed: Partner[] = (data || []).map((p: any) => {
        const users: PartnerUser[] = (p.partner_users || []).map((pu: any) => {
          const profile = Array.isArray(pu.profiles) ? pu.profiles[0] : pu.profiles
          return {
            id: profile?.id || pu.user_id,
            name: profile?.display_name || 'Unknown User',
            email: profile?.email || '',
            role: pu.role || 'member',
            isPrimary: pu.is_primary || false
          }
        })

        return {
          id: p.id,
          name: p.name || 'Unnamed Partner',
          legalName: p.legal_name,
          type: p.type || 'entity',
          partnerType: p.partner_type || 'co-investor',
          status: p.status || 'pending',
          accreditationStatus: p.accreditation_status,
          contactName: p.contact_name,
          contactEmail: p.contact_email,
          contactPhone: p.contact_phone,
          website: p.website,
          country: p.country,
          typicalInvestmentMin: p.typical_investment_min ? Number(p.typical_investment_min) : null,
          typicalInvestmentMax: p.typical_investment_max ? Number(p.typical_investment_max) : null,
          preferredSectors: p.preferred_sectors,
          preferredGeographies: p.preferred_geographies,
          kycStatus: p.kyc_status,
          createdAt: p.created_at,
          users
        }
      })

      setPartners(processed)
      setFilteredPartners(processed)
      setStats({
        total: processed.length,
        active: processed.filter(p => p.status === 'active').length,
        kycApproved: processed.filter(p => p.kycStatus === 'approved').length,
        coInvestors: processed.filter(p => p.partnerType === 'co-investor').length
      })
      setError(null)
    } catch (err) {
      console.error('[PartnersContent] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPartners(partners)
      return
    }
    const query = searchQuery.toLowerCase()
    setFilteredPartners(partners.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.legalName?.toLowerCase().includes(query) ||
      p.contactEmail?.toLowerCase().includes(query) ||
      p.contactName?.toLowerCase().includes(query) ||
      p.country?.toLowerCase().includes(query)
    ))
  }, [searchQuery, partners])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading partners...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Partners</h3>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Registered partnerships</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-muted-foreground mt-1">Fully onboarded</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Co-Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.coInvestors}</div>
            <div className="text-sm text-muted-foreground mt-1">Investment partners</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners by name, email, or country..."
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
              <HandshakeIcon className="h-5 w-5" />
              All Partners ({filteredPartners.length})
            </CardTitle>
            <CardDescription className="mt-1">
              Co-investment partners and strategic relationships
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Investment Range</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No partners found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{partner.name}</div>
                        {partner.legalName && partner.legalName !== partner.name && (
                          <div className="text-sm text-muted-foreground">{partner.legalName}</div>
                        )}
                        {partner.country && (
                          <div className="text-xs text-muted-foreground mt-1">{partner.country}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {partner.partnerType.replace(/-/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{partner.users.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.contactName ? (
                        <div>
                          <div className="text-sm text-foreground">{partner.contactName}</div>
                          {partner.contactEmail && (
                            <div className="text-xs text-muted-foreground">{partner.contactEmail}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No contact</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(partner.typicalInvestmentMin, partner.typicalInvestmentMax)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getKycStatusIcon(partner.kycStatus)}
                        <span className="text-sm capitalize">{partner.kycStatus || 'pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(partner.status)}
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
                          <DropdownMenuItem onClick={() => handleInviteClick(partner)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/versotech_main/partners/${partner.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {partner.contactEmail && (
                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${partner.contactEmail}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                          {partner.website && (
                            <DropdownMenuItem onClick={() => window.open(partner.website!, '_blank')}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Website
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

      {/* Add Partner Modal */}
      <AddPartnerModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={refreshData}
      />

      {/* Invite User Dialog */}
      {selectedPartner && (
        <InviteUserDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          entityType="partner"
          entityId={selectedPartner.id}
          entityName={selectedPartner.name}
          onSuccess={refreshData}
        />
      )}
    </div>
  )
}
