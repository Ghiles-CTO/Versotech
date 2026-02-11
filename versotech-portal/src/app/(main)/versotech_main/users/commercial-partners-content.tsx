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
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  FileText,
  Plus,
  UserPlus,
  Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

function formatUTC(dateStr: string, fmt: string) {
  const d = new Date(dateStr)
  return format(new Date(d.getTime() + d.getTimezoneOffset() * 60000), fmt)
}
import { AddCommercialPartnerModal } from '@/components/users/add-commercial-partner-modal'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'

type CommercialPartnerUser = {
  id: string
  name: string
  email: string
  role: string
  isPrimary: boolean
  canExecuteForClients: boolean
}

type CommercialPartner = {
  id: string
  name: string
  legalName: string | null
  type: string
  cpType: string
  status: string
  regulatoryStatus: string | null
  regulatoryNumber: string | null
  jurisdiction: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  website: string | null
  country: string | null
  paymentTerms: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  kycStatus: string | null
  createdAt: string
  users: CommercialPartnerUser[]
}

type CommercialPartnerStats = {
  total: number
  active: number
  kycApproved: number
  regulated: number
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
    case 'inactive':
      return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
    case 'suspended':
      return <Badge variant="destructive" className="bg-orange-500/20 text-orange-400 border-orange-500/30">Suspended</Badge>
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

function formatCpType(cpType: string): string {
  const types: Record<string, string> = {
    'wealth_manager': 'Wealth Manager',
    'family_office': 'Family Office',
    'broker_dealer': 'Broker Dealer',
    'ria': 'RIA',
    'bank': 'Bank',
    'insurance': 'Insurance',
    'pension': 'Pension Fund',
    'other': 'Other'
  }
  return types[cpType] || cpType.replace(/_/g, ' ')
}

export default function CommercialPartnersContent() {
  const [partners, setPartners] = useState<CommercialPartner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<CommercialPartner[]>([])
  const [stats, setStats] = useState<CommercialPartnerStats>({ total: 0, active: 0, kycApproved: 0, regulated: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<CommercialPartner | null>(null)

  const handleInviteClick = (partner: CommercialPartner) => {
    setSelectedPartner(partner)
    setShowInviteDialog(true)
  }

  const refreshData = () => {
    setLoading(true)
    fetchPartners()
  }

  async function fetchPartners() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('commercial_partners')
        .select(`
          id,
          name,
          legal_name,
          type,
          cp_type,
          status,
          regulatory_status,
          regulatory_number,
          jurisdiction,
          contact_name,
          contact_email,
          contact_phone,
          website,
          country,
          payment_terms,
          contract_start_date,
          contract_end_date,
          kyc_status,
          created_at,
          commercial_partner_users (
            user_id,
            role,
            is_primary,
            can_execute_for_clients,
            profiles:profiles!commercial_partner_users_user_fk (
              id,
              display_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const processed: CommercialPartner[] = (data || []).map((cp: any) => {
        const users: CommercialPartnerUser[] = (cp.commercial_partner_users || []).map((cpu: any) => {
          const profile = Array.isArray(cpu.profiles) ? cpu.profiles[0] : cpu.profiles
          return {
            id: profile?.id || cpu.user_id,
            name: profile?.display_name || 'Unknown User',
            email: profile?.email || '',
            role: cpu.role || 'member',
            isPrimary: cpu.is_primary || false,
            canExecuteForClients: cpu.can_execute_for_clients || false
          }
        })

        return {
          id: cp.id,
          name: cp.name || 'Unnamed Partner',
          legalName: cp.legal_name,
          type: cp.type || 'entity',
          cpType: cp.cp_type || 'other',
          status: cp.status || 'pending',
          regulatoryStatus: cp.regulatory_status,
          regulatoryNumber: cp.regulatory_number,
          jurisdiction: cp.jurisdiction,
          contactName: cp.contact_name,
          contactEmail: cp.contact_email,
          contactPhone: cp.contact_phone,
          website: cp.website,
          country: cp.country,
          paymentTerms: cp.payment_terms,
          contractStartDate: cp.contract_start_date,
          contractEndDate: cp.contract_end_date,
          kycStatus: cp.kyc_status,
          createdAt: cp.created_at,
          users
        }
      })

      setPartners(processed)
      setFilteredPartners(processed)
      setStats({
        total: processed.length,
        active: processed.filter(p => p.status === 'active').length,
        kycApproved: processed.filter(p => p.kycStatus === 'approved').length,
        regulated: processed.filter(p => p.regulatoryStatus === 'regulated' || p.regulatoryNumber).length
      })
      setError(null)
    } catch (err) {
      console.error('[CommercialPartnersContent] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load commercial partners')
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
      p.jurisdiction?.toLowerCase().includes(query) ||
      p.country?.toLowerCase().includes(query)
    ))
  }, [searchQuery, partners])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading commercial partners...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Commercial Partners</h3>
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
            <div className="text-sm text-muted-foreground mt-1">Commercial relationships</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-muted-foreground mt-1">With valid contracts</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Regulated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.regulated}</div>
            <div className="text-sm text-muted-foreground mt-1">With regulatory status</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, jurisdiction, or country..."
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
              <Building2 className="h-5 w-5" />
              All Commercial Partners ({filteredPartners.length})
            </CardTitle>
            <CardDescription className="mt-1">
              Wealth managers, family offices, broker dealers, and institutional partners
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Commercial Partner
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No commercial partners found
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
                        {partner.regulatoryNumber && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Shield className="h-3 w-3" />
                            {partner.regulatoryNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {formatCpType(partner.cpType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{partner.users.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.jurisdiction ? (
                        <div>
                          <div className="text-sm text-foreground">{partner.jurisdiction}</div>
                          {partner.country && partner.country !== partner.jurisdiction && (
                            <div className="text-xs text-muted-foreground">{partner.country}</div>
                          )}
                        </div>
                      ) : partner.country ? (
                        <span className="text-sm text-muted-foreground">{partner.country}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
                      {partner.contractEndDate ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            Expires {formatUTC(partner.contractEndDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                      ) : partner.contractStartDate ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Active</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
                          <DropdownMenuItem onClick={() => router.push(`/versotech_main/commercial-partners/${partner.id}`)}>
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

      {/* Add Commercial Partner Modal */}
      <AddCommercialPartnerModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={refreshData}
      />

      {/* Invite User Dialog */}
      {selectedPartner && (
        <InviteUserDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          entityType="commercial_partner"
          entityId={selectedPartner.id}
          entityName={selectedPartner.name}
          onSuccess={refreshData}
        />
      )}
    </div>
  )
}
