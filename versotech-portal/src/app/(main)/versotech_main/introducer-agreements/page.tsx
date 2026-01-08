'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  FileDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  pdf_url: string | null
  reference_number: string | null
}

type IntroducerInfo = {
  id: string
  legal_name: string
  status: string
  default_commission_bps: number | null
  logo_url: string | null
}

type Summary = {
  totalAgreements: number
  activeAgreements: number
  pendingAgreements: number
  expiringSoon: number
}

const STATUS_STYLES: Record<string, { className: string; label: string }> = {
  // Workflow statuses with distinctive colors
  draft: {
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    label: 'Draft',
  },
  sent: {
    className: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800',
    label: 'Sent',
  },
  pending_approval: {
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
    label: 'Pending Approval',
  },
  approved: {
    className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800',
    label: 'Approved',
  },
  pending_ceo_signature: {
    className: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
    label: 'Awaiting CEO',
  },
  pending_introducer_signature: {
    className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800',
    label: 'Awaiting Introducer',
  },
  active: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800',
    label: 'Active',
  },
  rejected: {
    className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800',
    label: 'Rejected',
  },
  expired: {
    className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    label: 'Expired',
  },
  terminated: {
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
    label: 'Terminated',
  },
}

const STATUS_FILTERS = [
  { label: 'All Agreements', value: 'all', group: null },
  // In Progress
  { label: 'Draft', value: 'draft', group: 'In Progress' },
  { label: 'Sent', value: 'sent', group: 'In Progress' },
  { label: 'Pending Approval', value: 'pending_approval', group: 'In Progress' },
  { label: 'Approved', value: 'approved', group: 'In Progress' },
  // Awaiting Signatures
  { label: 'Awaiting CEO Signature', value: 'pending_ceo_signature', group: 'Signatures' },
  { label: 'Awaiting Introducer Signature', value: 'pending_introducer_signature', group: 'Signatures' },
  // Final States
  { label: 'Active', value: 'active', group: 'Final' },
  { label: 'Rejected', value: 'rejected', group: 'Final' },
  { label: 'Expired', value: 'expired', group: 'Final' },
  { label: 'Terminated', value: 'terminated', group: 'Final' },
]

const AGREEMENT_TYPE_LABELS: Record<string, string> = {
  referral: 'Referral Agreement',
  revenue_share: 'Revenue Share',
  fixed_fee: 'Fixed Fee',
  hybrid: 'Hybrid',
}

export default function IntroducerAgreementsPage() {
  const router = useRouter()
  const [introducerInfo, setIntroducerInfo] = useState<IntroducerInfo | null>(null)
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
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  // Handle PDF download
  const handleDownloadPdf = async (e: React.MouseEvent, pdfUrl: string, referenceNumber: string | null) => {
    e.stopPropagation() // Prevent row click navigation
    setDownloadingPdf(pdfUrl)
    try {
      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${referenceNumber || 'Fee_Agreement'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    } finally {
      setDownloadingPdf(null)
    }
  }

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

        // Check if user is an introducer
        const { data: introducerUser, error: introducerUserError } = await supabase
          .from('introducer_users')
          .select('introducer_id')
          .eq('user_id', user.id)
          .single()

        if (introducerUserError || !introducerUser) {
          // Maybe they're staff - show all agreements as placeholder
          await fetchAllAgreements(supabase)
          return
        }

        // Fetch introducer info
        const { data: introducer, error: introducerError } = await supabase
          .from('introducers')
          .select('id, legal_name, status, default_commission_bps, logo_url')
          .eq('id', introducerUser.introducer_id)
          .single()

        if (introducerError) throw introducerError
        setIntroducerInfo(introducer)

        // Fetch agreements for this introducer
        const { data: agreementsData, error: agreementsError } = await supabase
          .from('introducer_agreements')
          .select('*')
          .eq('introducer_id', introducerUser.introducer_id)
          .order('created_at', { ascending: false })

        if (agreementsError) throw agreementsError

        processAgreements(agreementsData || [])
        setError(null)
      } catch (err) {
        console.error('[IntroducerAgreementsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load agreements')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllAgreements(supabase: any) {
      // Staff view - show all agreements with introducer info
      const { data: agreementsData, error: agreementsError } = await supabase
        .from('introducer_agreements')
        .select(`
          *,
          introducer:introducer_id (
            id,
            legal_name,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (agreementsError) throw agreementsError
      processAgreements(agreementsData || [])
    }

    function processAgreements(data: any[]) {
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const processed: Agreement[] = data.map((agreement) => ({
        id: agreement.id,
        agreement_type: agreement.agreement_type || 'referral',
        signed_date: agreement.signed_date,
        effective_date: agreement.effective_date,
        expiry_date: agreement.expiry_date,
        default_commission_bps: agreement.default_commission_bps || 0,
        commission_cap_amount: agreement.commission_cap_amount,
        payment_terms: agreement.payment_terms,
        territory: agreement.territory,
        deal_types: agreement.deal_types,
        exclusivity_level: agreement.exclusivity_level,
        status: agreement.status || 'draft',
        created_at: agreement.created_at,
        pdf_url: agreement.pdf_url || null,
        reference_number: agreement.reference_number || null,
      }))

      setAgreements(processed)

      const active = processed.filter(a => a.status === 'active').length
      // Count all "in-progress" statuses as pending
      const pendingStatuses = ['draft', 'sent', 'pending_approval', 'approved', 'pending_ceo_signature', 'pending_introducer_signature']
      const pending = processed.filter(a => pendingStatuses.includes(a.status)).length
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
          <h1 className="text-2xl font-bold text-foreground">Fee Agreements</h1>
          <p className="text-muted-foreground mt-1">
            {introducerInfo
              ? `Manage your commission agreements as ${introducerInfo.legal_name}`
              : 'View and manage all introducer agreements'}
          </p>
        </div>
        {introducerInfo && introducerInfo.default_commission_bps && (
          <Badge variant="outline" className="text-sm">
            Default: {formatCommission(introducerInfo.default_commission_bps)}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              Total Agreements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{summary.totalAgreements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All fee arrangements
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{summary.activeAgreements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in effect
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{summary.pendingAgreements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400">{summary.expiringSoon}</div>
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
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {/* All option */}
                <SelectItem value="all">All Agreements</SelectItem>

                {/* In Progress group */}
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground font-semibold px-2 py-1.5">
                    In Progress
                  </SelectLabel>
                  {STATUS_FILTERS.filter(f => f.group === 'In Progress').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          option.value === 'draft' && 'bg-slate-500',
                          option.value === 'sent' && 'bg-sky-500',
                          option.value === 'pending_approval' && 'bg-amber-500',
                          option.value === 'approved' && 'bg-teal-500'
                        )} />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>

                {/* Signatures group */}
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground font-semibold px-2 py-1.5">
                    Awaiting Signatures
                  </SelectLabel>
                  {STATUS_FILTERS.filter(f => f.group === 'Signatures').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          option.value === 'pending_ceo_signature' && 'bg-indigo-500',
                          option.value === 'pending_introducer_signature' && 'bg-violet-500'
                        )} />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>

                {/* Final States group */}
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground font-semibold px-2 py-1.5">
                    Final States
                  </SelectLabel>
                  {STATUS_FILTERS.filter(f => f.group === 'Final').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          option.value === 'active' && 'bg-emerald-500',
                          option.value === 'rejected' && 'bg-rose-500',
                          option.value === 'expired' && 'bg-orange-500',
                          option.value === 'terminated' && 'bg-red-500'
                        )} />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
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
            <div className="border-2 border-dashed border-muted/50 rounded-xl py-16 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-br from-muted/20 to-muted/5">
              <div className="p-4 rounded-2xl bg-muted/30">
                <FileSignature className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-muted-foreground">
                  {search || statusFilter !== 'all'
                    ? 'No agreements match your filters'
                    : introducerInfo
                      ? 'No fee agreements on file'
                      : 'No introducer agreements found'}
                </p>
                {introducerInfo && agreements.length === 0 && (
                  <p className="text-sm text-muted-foreground/70 max-w-sm">
                    Contact your relationship manager to set up a fee agreement and start making introductions.
                  </p>
                )}
                {(search || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('all')
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
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
                    <TableHead className="w-12">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements.map((agreement) => (
                    <TableRow
                      key={agreement.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors duration-150 group"
                      onClick={() => router.push(`/versotech_main/introducer-agreements/${agreement.id}`)}
                    >
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
                          className={cn(
                            'font-medium',
                            (STATUS_STYLES[agreement.status] || STATUS_STYLES.draft).className
                          )}
                        >
                          {(STATUS_STYLES[agreement.status] || STATUS_STYLES.draft).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {agreement.pdf_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownloadPdf(e, agreement.pdf_url!, agreement.reference_number)}
                            disabled={downloadingPdf === agreement.pdf_url}
                            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                            title="Download PDF"
                          >
                            {downloadingPdf === agreement.pdf_url ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
