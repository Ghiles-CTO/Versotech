'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  TrendingUp,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Wallet,
  Upload,
  Eye,
  Building2,
  Handshake,
  Briefcase,
  MessageCircle,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { SubmitInvoiceDialog, type CommissionType } from '@/components/commissions/submit-invoice-dialog'
import { ViewInvoiceDialog } from '@/components/commissions/view-invoice-dialog'

// ============================================================================
// Types
// ============================================================================

type EntityType = 'partner' | 'introducer' | 'commercial_partner'

type Commission = {
  id: string
  status: string
  basis_type: string
  rate_bps: number
  base_amount: number | null
  accrual_amount: number
  currency: string
  payment_due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  invoice_id: string | null
  rejection_reason: string | null
  rejected_by: string | null
  rejected_at: string | null
  deal?: {
    id: string
    name: string
    company_name: string | null
  }
  arranger?: {
    id: string
    legal_name: string
  }
}

type Summary = {
  total_owed: number
  total_paid: number
  pending_invoice: number
  invoiced: number
  currency: string
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800',
  invoice_requested: 'bg-yellow-100 text-yellow-800',
  invoiced: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800 border border-red-300',
}

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  accrued: Clock,
  invoice_requested: FileText,
  invoiced: FileText,
  paid: CheckCircle,
  cancelled: XCircle,
  rejected: XCircle,
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Invoice Requested', value: 'invoice_requested' },
  { label: 'Invoiced', value: 'invoiced' },
  { label: 'Paid', value: 'paid' },
  { label: 'Accrued', value: 'accrued' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
]

const ENTITY_CONFIG: Record<EntityType, {
  table: string
  userTable: string
  entityIdField: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  commissionType: CommissionType
}> = {
  partner: {
    table: 'partner_commissions',
    userTable: 'partner_users',
    entityIdField: 'partner_id',
    label: 'Partner',
    icon: Briefcase,
    commissionType: 'partner',
  },
  introducer: {
    table: 'introducer_commissions',
    userTable: 'introducer_users',
    entityIdField: 'introducer_id',
    label: 'Introducer',
    icon: Handshake,
    commissionType: 'introducer',
  },
  commercial_partner: {
    table: 'commercial_partner_commissions',
    userTable: 'commercial_partner_users',
    entityIdField: 'commercial_partner_id',
    label: 'Commercial Partner',
    icon: Building2,
    commissionType: 'commercial-partner',
  },
}

// ============================================================================
// Main Component
// ============================================================================

export default function MyCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<Summary>({
    total_owed: 0,
    total_paid: 0,
    pending_invoice: 0,
    invoiced: 0,
    currency: 'USD',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // Entity type detection
  const [entityType, setEntityType] = useState<EntityType | null>(null)
  const [entityId, setEntityId] = useState<string | null>(null)

  // Dialog state
  const [submitInvoiceOpen, setSubmitInvoiceOpen] = useState(false)
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      // Detect entity type by checking all user tables in parallel
      const [partnerResult, introducerResult, cpResult] = await Promise.all([
        supabase.from('partner_users').select('partner_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('introducer_users').select('introducer_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('commercial_partner_users').select('commercial_partner_id').eq('user_id', user.id).maybeSingle(),
      ])

      // Determine entity type and ID
      let detectedType: EntityType | null = null
      let detectedId: string | null = null

      if (partnerResult.data?.partner_id) {
        detectedType = 'partner'
        detectedId = partnerResult.data.partner_id
      } else if (introducerResult.data?.introducer_id) {
        detectedType = 'introducer'
        detectedId = introducerResult.data.introducer_id
      } else if (cpResult.data?.commercial_partner_id) {
        detectedType = 'commercial_partner'
        detectedId = cpResult.data.commercial_partner_id
      }

      if (!detectedType || !detectedId) {
        setError('You are not registered as a partner, introducer, or commercial partner')
        return
      }

      setEntityType(detectedType)
      setEntityId(detectedId)

      const config = ENTITY_CONFIG[detectedType]

      // Fetch commissions for this entity
      const { data: commissionsData, error: commissionsError } = await supabase
        .from(config.table)
        .select(`
          id,
          status,
          basis_type,
          rate_bps,
          base_amount,
          accrual_amount,
          currency,
          payment_due_date,
          paid_at,
          notes,
          created_at,
          invoice_id,
          rejection_reason,
          rejected_by,
          rejected_at,
          deal:deals(id, name, company_name),
          arranger:arranger_entities(id, legal_name)
        `)
        .eq(config.entityIdField, detectedId)
        .order('created_at', { ascending: false })

      if (commissionsError) {
        console.error('[MyCommissionsPage] Error:', commissionsError)
        throw commissionsError
      }

      // Transform data (handle joined relations)
      const transformed = (commissionsData || []).map((c: any) => ({
        ...c,
        deal: Array.isArray(c.deal) ? c.deal[0] : c.deal,
        arranger: Array.isArray(c.arranger) ? c.arranger[0] : c.arranger,
      }))

      setCommissions(transformed)

      // Calculate summary
      const summaryData: Summary = {
        total_owed: 0,
        total_paid: 0,
        pending_invoice: 0,
        invoiced: 0,
        currency: 'USD',
      }

      transformed.forEach((c: Commission) => {
        const amount = Number(c.accrual_amount) || 0
        if (c.currency) summaryData.currency = c.currency

        if (c.status === 'paid') {
          summaryData.total_paid += amount
        } else if (c.status !== 'cancelled') {
          summaryData.total_owed += amount
        }

        if (c.status === 'invoice_requested') {
          summaryData.pending_invoice += amount
        }
        if (c.status === 'invoiced') {
          summaryData.invoiced += amount
        }
      })

      setSummary(summaryData)
      setError(null)
    } catch (err) {
      console.error('[MyCommissionsPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load commissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommissions()
  }, [])

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSubmitInvoice = (commission: Commission) => {
    setSelectedCommission(commission)
    setSubmitInvoiceOpen(true)
  }

  const handleViewInvoice = (commission: Commission) => {
    setSelectedCommission(commission)
    setViewInvoiceOpen(true)
  }

  const handleInvoiceSuccess = () => {
    fetchCommissions()
  }

  // ============================================================================
  // Filtered Data
  // ============================================================================

  const filteredCommissions = commissions.filter(c => {
    if (statusFilter === 'all') return true
    return c.status === statusFilter
  })

  // ============================================================================
  // Loading & Error States
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading commissions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Commissions</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const config = entityType ? ENTITY_CONFIG[entityType] : null
  const EntityIcon = config?.icon || Briefcase

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Commissions</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your commission payments
          </p>
        </div>
        {config && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <EntityIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />Total Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.total_owed, summary.currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_paid, summary.currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <FileText className="h-4 w-4" />Invoice Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {formatCurrency(summary.pending_invoice, summary.currency)}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Submit your invoice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.invoiced, summary.currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending invoices */}
      {summary.pending_invoice > 0 && (
        <Card className="border-yellow-400/50 bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Upload className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Action Required</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You have {formatCurrency(summary.pending_invoice, summary.currency)} in commissions awaiting your invoice.
                  Submit your invoices to receive payment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert for rejected invoices */}
      {commissions.some(c => c.status === 'rejected') && (
        <Card className="border-red-400/50 bg-red-50 dark:bg-red-950/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800 dark:text-red-200">Invoice Rejected - Action Required</h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  One or more of your invoices has been rejected. Please review the feedback below and resubmit.
                </p>
                <div className="mt-2 space-y-2">
                  {commissions.filter(c => c.status === 'rejected').map(c => (
                    <div key={c.id} className="text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded flex items-start gap-2">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <div>
                        <span className="font-medium">{c.deal?.name || 'Commission'}</span>
                        {c.rejection_reason && (
                          <p className="text-red-600 dark:text-red-400 mt-1">&ldquo;{c.rejection_reason}&rdquo;</p>
                        )}
                        {c.rejected_at && (
                          <p className="text-xs text-red-500 dark:text-red-500 mt-1">Rejected on {formatDate(c.rejected_at)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
          <CardDescription>
            {filteredCommissions.length} commission{filteredCommissions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCommissions.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {statusFilter !== 'all' ? 'No commissions match your filter' : 'No commissions yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Arranger</TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission) => {
                    const StatusIcon = STATUS_ICONS[commission.status] || Clock
                    return (
                      <TableRow key={commission.id}>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn('capitalize', STATUS_STYLES[commission.status])}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {commission.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {commission.deal ? (
                            <div>
                              <div className="font-medium text-sm">{commission.deal.name}</div>
                              {commission.deal.company_name && (
                                <div className="text-xs text-muted-foreground">
                                  {commission.deal.company_name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {commission.arranger?.legal_name || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          {commission.basis_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {formatCurrency(commission.accrual_amount, commission.currency)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(commission.rate_bps / 100).toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {commission.payment_due_date
                            ? formatDate(commission.payment_due_date)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(commission.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              {commission.status === 'invoice_requested' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitInvoice(commission)}
                                >
                                  <Upload className="h-4 w-4 mr-1" />
                                  Submit Invoice
                                </Button>
                              )}
                              {commission.status === 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleSubmitInvoice(commission)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Resubmit
                                </Button>
                              )}
                              {(commission.status === 'invoiced' || commission.status === 'paid') &&
                                commission.invoice_id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewInvoice(commission)}
                                  className="text-blue-600"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Invoice
                                </Button>
                              )}
                              {commission.status === 'paid' && commission.paid_at && (
                                <span className="text-xs text-green-600">
                                  Paid {formatDate(commission.paid_at)}
                                </span>
                              )}
                            </div>
                            {commission.status === 'rejected' && commission.rejection_reason && (
                              <div className="text-xs text-red-600 max-w-48 text-right mt-1" title={commission.rejection_reason}>
                                <span className="font-medium">Reason:</span> {commission.rejection_reason.length > 50
                                  ? `${commission.rejection_reason.slice(0, 50)}...`
                                  : commission.rejection_reason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Invoice Dialog */}
      {entityType && config && (
        <SubmitInvoiceDialog
          open={submitInvoiceOpen}
          onOpenChange={setSubmitInvoiceOpen}
          commission={selectedCommission}
          commissionType={config.commissionType}
          onSuccess={handleInvoiceSuccess}
        />
      )}

      {/* View Invoice Dialog */}
      {entityType && config && (
        <ViewInvoiceDialog
          open={viewInvoiceOpen}
          onOpenChange={setViewInvoiceOpen}
          commission={selectedCommission ? {
            id: selectedCommission.id,
            accrual_amount: selectedCommission.accrual_amount,
            currency: selectedCommission.currency,
            entity_name: config.label,
            invoice_id: selectedCommission.invoice_id,
            deal: selectedCommission.deal ? { name: selectedCommission.deal.name } : undefined,
          } : null}
          commissionType={config.commissionType}
        />
      )}
    </div>
  )
}
