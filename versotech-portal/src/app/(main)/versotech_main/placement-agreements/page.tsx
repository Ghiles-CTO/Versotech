'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Button } from '@/components/ui/button'
import {
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  FileSignature,
  Calendar,
  Globe,
  Percent,
  AlertTriangle,
  Building2,
  PenTool,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Agreement = {
  id: string
  agreement_type: string
  signed_date: string | null
  effective_date: string | null
  expiry_date: string | null
  default_commission_bps: number
  commission_cap_amount: number | null
  payment_terms: string | null
  territory: string | null
  deal_types: string[] | null
  exclusivity_level: string | null
  status: string
  created_at: string
  signature_token: string | null // For pending signature requests
  signature_status: string | null
}

type CommercialPartnerInfo = {
  id: string
  name: string
  legal_name: string | null
  type: string | null
  status: string
  logo_url: string | null
}

type Summary = {
  totalAgreements: number
  activeAgreements: number
  pendingAgreements: number
  expiringSoon: number
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  terminated: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Expired', value: 'expired' },
  { label: 'Draft', value: 'draft' },
]

const AGREEMENT_TYPE_LABELS: Record<string, string> = {
  placement: 'Placement Agreement',
  distribution: 'Distribution Agreement',
  advisory: 'Advisory Agreement',
  white_label: 'White Label Agreement',
}

export default function PlacementAgreementsPage() {
  const [partnerInfo, setPartnerInfo] = useState<CommercialPartnerInfo | null>(null)
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalAgreements: 0,
    activeAgreements: 0,
    pendingAgreements: 0,
    expiringSoon: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Not authenticated')
          return
        }

        // Check if user is a commercial partner
        const { data: cpUser, error: cpUserError } = await supabase
          .from('commercial_partner_users')
          .select('commercial_partner_id')
          .eq('user_id', user.id)
          .single()

        if (cpUserError || !cpUser) {
          // Maybe they're staff - show all agreements as placeholder
          await fetchAllAgreements(supabase)
          return
        }

        // Fetch commercial partner info
        const { data: partner, error: partnerError } = await supabase
          .from('commercial_partners')
          .select('id, name, legal_name, type, status, logo_url')
          .eq('id', cpUser.commercial_partner_id)
          .single()

        if (partnerError) throw partnerError
        setPartnerInfo(partner)

        // Fetch agreements for this commercial partner
        const { data: agreementsData, error: agreementsError } = await supabase
          .from('placement_agreements')
          .select('*')
          .eq('commercial_partner_id', cpUser.commercial_partner_id)
          .order('created_at', { ascending: false })

        if (agreementsError) throw agreementsError

        // Fetch pending signature requests for these agreements
        const agreementIds = (agreementsData || []).map((a: any) => a.id)
        let signatureMap: Record<string, { token: string; status: string }> = {}

        if (agreementIds.length > 0) {
          const { data: signatureRequests } = await supabase
            .from('signature_requests')
            .select('placement_agreement_id, signing_token, status')
            .in('placement_agreement_id', agreementIds)
            .eq('signer_role', 'commercial_partner')

          for (const sig of signatureRequests || []) {
            if (sig.placement_agreement_id) {
              signatureMap[sig.placement_agreement_id] = {
                token: sig.signing_token,
                status: sig.status
              }
            }
          }
        }

        processAgreements(agreementsData || [], signatureMap)
        setError(null)
      } catch (err) {
        console.error('[PlacementAgreementsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load agreements')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllAgreements(supabase: any) {
      // Staff view - show all agreements with partner info
      const { data: agreementsData, error: agreementsError } = await supabase
        .from('placement_agreements')
        .select(`
          *,
          commercial_partner:commercial_partner_id (
            id,
            name,
            legal_name,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (agreementsError) throw agreementsError
      processAgreements(agreementsData || [], {})
    }

    function processAgreements(data: any[], signatureMap: Record<string, { token: string; status: string }>) {
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const processed: Agreement[] = data.map((agreement) => {
        const sigInfo = signatureMap[agreement.id]

        // Compute effective status - if expiry_date has passed and status is "active", show as "expired"
        let effectiveStatus = agreement.status || 'draft'
        if (agreement.expiry_date && effectiveStatus === 'active') {
          const expiryDate = new Date(agreement.expiry_date)
          if (expiryDate < now) {
            effectiveStatus = 'expired'
          }
        }

        return {
          id: agreement.id,
          agreement_type: agreement.agreement_type || 'placement',
          signed_date: agreement.signed_date,
          effective_date: agreement.effective_date,
          expiry_date: agreement.expiry_date,
          default_commission_bps: agreement.default_commission_bps || 0,
          commission_cap_amount: agreement.commission_cap_amount,
          payment_terms: agreement.payment_terms,
          territory: agreement.territory,
          deal_types: agreement.deal_types,
          exclusivity_level: agreement.exclusivity_level,
          status: effectiveStatus,
          created_at: agreement.created_at,
          signature_token: sigInfo?.token || null,
          signature_status: sigInfo?.status || null,
        }
      })

      setAgreements(processed)

      const active = processed.filter(a => a.status === 'active').length
      const pending = processed.filter(a => a.status === 'pending').length
      const expiring = processed.filter(a => {
        if (!a.expiry_date) return false
        const expDate = new Date(a.expiry_date)
        return expDate > now && expDate <= thirtyDaysFromNow && a.status === 'active'
      }).length

      setSummary({
        totalAgreements: processed.length,
        activeAgreements: active,
        pendingAgreements: pending,
        expiringSoon: expiring,
      })
    }

    fetchData()
  }, [])

  // Check if agreement is expiring soon
  function isExpiringSoon(expiryDate: string | null): boolean {
    if (!expiryDate) return false
    const now = new Date()
    const expDate = new Date(expiryDate)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expDate > now && expDate <= thirtyDaysFromNow
  }

  // Format commission as percentage
  function formatCommission(bps: number): string {
    return `${(bps / 100).toFixed(2)}%`
  }

  // Filter agreements
  const filteredAgreements = agreements.filter(agreement => {
    const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter
    const matchesSearch = !search ||
      agreement.agreement_type?.toLowerCase().includes(search.toLowerCase()) ||
      agreement.territory?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading agreements...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Agreements</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Placement Agreements</h1>
          <p className="text-muted-foreground mt-1">
            {partnerInfo
              ? `Manage your placement agreements as ${partnerInfo.name}`
              : 'View and manage all placement agreements'}
          </p>
        </div>
        {partnerInfo && (
          <div className="flex items-center gap-2">
            {partnerInfo.logo_url ? (
              <img
                src={partnerInfo.logo_url}
                alt={partnerInfo.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Agreements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAgreements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All placement arrangements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.activeAgreements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in effect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingAgreements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting signature
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{summary.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by type or territory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agreements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agreements</CardTitle>
          <CardDescription>
            {filteredAgreements.length} agreement{filteredAgreements.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAgreements.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <FileSignature className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No agreements match your filters'
                  : partnerInfo
                    ? 'No placement agreements on file'
                    : 'No placement agreements found'}
              </p>
              {partnerInfo && agreements.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Contact your account manager to set up a placement agreement
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements.map((agreement) => (
                    <TableRow key={agreement.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {AGREEMENT_TYPE_LABELS[agreement.agreement_type] || agreement.agreement_type}
                            </div>
                            {agreement.exclusivity_level && (
                              <div className="text-xs text-muted-foreground capitalize">
                                {agreement.exclusivity_level}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {formatCommission(agreement.default_commission_bps)}
                          </span>
                        </div>
                        {agreement.commission_cap_amount && (
                          <div className="text-xs text-muted-foreground">
                            Cap: ${agreement.commission_cap_amount.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>{agreement.territory || 'Global'}</span>
                        </div>
                        {agreement.deal_types && agreement.deal_types.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {agreement.deal_types.slice(0, 2).join(', ')}
                            {agreement.deal_types.length > 2 && ` +${agreement.deal_types.length - 2}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {agreement.effective_date
                              ? formatDate(agreement.effective_date)
                              : 'Not set'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-1",
                          isExpiringSoon(agreement.expiry_date) && "text-orange-600"
                        )}>
                          {isExpiringSoon(agreement.expiry_date) && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          <span className="text-sm">
                            {agreement.expiry_date
                              ? formatDate(agreement.expiry_date)
                              : 'No expiry'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_STYLES[agreement.status] || STATUS_STYLES.draft)}
                        >
                          {agreement.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Sign button for pending agreements with signature requests */}
                          {agreement.signature_token && agreement.signature_status === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700"
                              asChild
                            >
                              <Link href={`/versotech_main/versosign/sign/${agreement.signature_token}`}>
                                <PenTool className="h-4 w-4 mr-1" />
                                Sign
                              </Link>
                            </Button>
                          )}
                          {/* Signed badge for completed signatures */}
                          {agreement.signature_status === 'signed' && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Signed
                            </Badge>
                          )}
                          {/* View VERSOSign for any status */}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href="/versotech_main/versosign">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
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
    </div>
  )
}
