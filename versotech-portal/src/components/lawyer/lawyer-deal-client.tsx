'use client'

import { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { DealLogo } from '@/components/deals/deal-logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Gavel,
  Globe,
  HelpCircle,
  Landmark,
  Layers,
  Loader2,
  MapPin,
  ScrollText,
  Shield,
  Tag,
  Target,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'

// ============================================================================
// TYPES - Matches new comprehensive API response
// ============================================================================

type Deal = {
  id: string
  name: string
  company_name: string | null
  company_logo_url: string | null
  company_website: string | null
  deal_type: string | null
  status: string
  currency: string
  target_amount: number | null
  raised_amount: number | null
  minimum_investment: number | null
  maximum_investment: number | null
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  description: string | null
  investment_thesis: string | null
  sector: string | null
  stage: string | null
  location: string | null
  stock_type: string | null
  deal_round: string | null
}

type Vehicle = {
  id: string
  name: string
  legal_name: string | null
  vehicle_type: string | null
} | null

type Assignment = {
  id: string
  role: string
  status: string
  assigned_at: string | null
  assigned_by: string | null
  notes: string | null
  completed_at: string | null
}

type EscrowStats = {
  total_committed: number
  total_funded: number
  pending_confirmations: number
  currency: string
}

type Subscription = {
  id: string
  investor_name: string
  investor_entity: string | null
  commitment_amount: number
  funded_amount: number
  currency: string
  status: string
  signed_at: string | null
  funding_status: 'funded' | 'partial' | 'awaiting_funding' | 'pending_signature'
}

type Document = {
  id: string
  name: string
  type: string | null
  description: string | null
  is_published: boolean
  has_file: boolean
  external_url: string | null
  file_size_bytes: number | null
  mime_type: string | null
  created_at: string
}

type FAQ = {
  id: string
  question: string
  answer: string
  display_order: number | null
  created_at: string
}

type FeeTotals = {
  pending: number
  paid: number
}

type FeeSummary = {
  partner_fees: FeeTotals
  introducer_fees: FeeTotals
  cp_fees: FeeTotals
}

type LawyerDealClientProps = {
  data: {
    deal: Deal
    vehicle: Vehicle
    assignment: Assignment
    escrow: EscrowStats
    subscriptions: Subscription[]
    documents: Document[]
    faqs: FAQ[]
    fee_summary: FeeSummary
  }
}

// ============================================================================
// STATUS STYLING MAPS
// ============================================================================

const DEAL_STATUS_STYLES: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  draft: 'bg-slate-100 text-foreground/80 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  closed: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  cancelled: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  allocation_pending: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  fully_subscribed: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
}

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  pending: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  completed: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  removed: 'bg-slate-100 text-foreground/80 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
}

const FUNDING_STATUS_STYLES: Record<string, string> = {
  funded: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  partial: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  awaiting_funding: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  pending_signature: 'bg-slate-100 text-foreground/80 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
}

const FUNDING_STATUS_LABELS: Record<string, string> = {
  funded: 'Funded',
  partial: 'Partially Funded',
  awaiting_funding: 'Awaiting Funding',
  pending_signature: 'Pending Signature',
}

// Document type configuration
const DOCUMENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  nda: { icon: <Shield className="h-4 w-4" />, label: 'NDA', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30' },
  term_sheet: { icon: <ScrollText className="h-4 w-4" />, label: 'Term Sheet', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' },
  subscription_pack: { icon: <FileText className="h-4 w-4" />, label: 'Subscription Pack', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' },
  subscription_draft: { icon: <FileText className="h-4 w-4" />, label: 'Subscription Draft', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30' },
  investment_memo: { icon: <Target className="h-4 w-4" />, label: 'Investment Memo', color: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/30' },
  financial_statements: { icon: <TrendingUp className="h-4 w-4" />, label: 'Financial Statements', color: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/30' },
  legal_document: { icon: <Gavel className="h-4 w-4" />, label: 'Legal Document', color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30' },
  pitch_deck: { icon: <Layers className="h-4 w-4" />, label: 'Pitch Deck', color: 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/30' },
  due_diligence: { icon: <HelpCircle className="h-4 w-4" />, label: 'Due Diligence', color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30' },
  other: { icon: <FileText className="h-4 w-4" />, label: 'Document', color: 'text-muted-foreground bg-muted dark:text-slate-400 dark:bg-slate-800' },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDealType(type: string | null): string {
  if (!type) return 'N/A'
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LawyerDealClient({ data }: LawyerDealClientProps) {
  const { deal, vehicle, assignment, escrow, subscriptions, documents, faqs, fee_summary } = data
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  // Fetch signed URL for a document
  const fetchSignedUrl = useCallback(async (docId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch document')
      }
      const data = await response.json()
      return data.url || data.signedUrl || null
    } catch (error) {
      console.error('Error fetching signed URL:', error)
      throw error
    }
  }, [])

  // Handle document preview
  const handlePreview = useCallback(async (doc: Document) => {
    if (!doc.has_file && !doc.external_url) {
      toast.error('This document has no file attached')
      return
    }

    setPreviewDoc(doc)
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewUrl(null)

    try {
      if (doc.external_url) {
        setPreviewUrl(doc.external_url)
      } else {
        const url = await fetchSignedUrl(doc.id)
        setPreviewUrl(url)
      }
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Failed to load document')
    } finally {
      setPreviewLoading(false)
    }
  }, [fetchSignedUrl])

  // Handle document download
  const handleDownload = useCallback(async (doc: Document) => {
    if (!doc.has_file && !doc.external_url) {
      toast.error('This document has no file attached')
      return
    }

    setDownloadingIds(prev => new Set(prev).add(doc.id))

    try {
      if (doc.external_url) {
        window.open(doc.external_url, '_blank')
      } else {
        const url = await fetchSignedUrl(doc.id)
        if (url) {
          window.open(url, '_blank')
          toast.success('Document download started')
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download document')
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev)
        next.delete(doc.id)
        return next
      })
    }
  }, [fetchSignedUrl])

  // Close preview
  const closePreview = useCallback(() => {
    setPreviewDoc(null)
    setPreviewUrl(null)
    setPreviewError(null)
  }, [])

  // Calculate totals
  const totalPendingFees = useMemo(() => {
    return fee_summary.partner_fees.pending +
           fee_summary.introducer_fees.pending +
           fee_summary.cp_fees.pending
  }, [fee_summary])

  const totalPaidFees = useMemo(() => {
    return fee_summary.partner_fees.paid +
           fee_summary.introducer_fees.paid +
           fee_summary.cp_fees.paid
  }, [fee_summary])

  const fundingPercentage = useMemo(() => {
    if (escrow.total_committed === 0) return 0
    return Math.round((escrow.total_funded / escrow.total_committed) * 100)
  }, [escrow])

  const targetPercentage = useMemo(() => {
    if (!deal.target_amount || deal.target_amount === 0) return 0
    return Math.round((escrow.total_committed / Number(deal.target_amount)) * 100)
  }, [deal.target_amount, escrow.total_committed])

  // Group documents by type
  const documentsByType = useMemo(() => {
    const grouped: Record<string, Document[]> = {}
    documents.forEach(doc => {
      const type = doc.type || 'other'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(doc)
    })
    return grouped
  }, [documents])

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ================================================================
            HEADER SECTION
        ================================================================ */}
        <header className="space-y-6">
          <Link
            href="/versotech_main/assigned-deals"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Assigned Deals
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Company Logo */}
            <DealLogo
              src={deal.company_logo_url}
              alt={deal.company_name || deal.name}
              size={96}
              rounded="xl"
              className="rounded-2xl bg-card shadow-lg border border-border"
              fallback={<Building2 className="h-12 w-12 text-muted-foreground/50" />}
            />

            {/* Deal Title & Meta */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {deal.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn('capitalize font-semibold text-sm px-3 py-1', DEAL_STATUS_STYLES[deal.status] || DEAL_STATUS_STYLES.draft)}
                >
                  {deal.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {deal.company_name && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {deal.company_name}
                  </span>
                )}
                {deal.sector && (
                  <Badge variant="secondary" className="font-medium">
                    {deal.sector}
                  </Badge>
                )}
                {deal.stage && (
                  <Badge variant="outline" className="font-medium">
                    {deal.stage}
                  </Badge>
                )}
                {deal.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {deal.location}
                  </span>
                )}
                {deal.company_website && (
                  <a
                    href={deal.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ================================================================
            ASSIGNMENT CARD (Purple accent - distinctive)
        ================================================================ */}
        <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50/60 to-background dark:from-indigo-950/30 dark:to-background shadow-sm">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shadow-sm">
                  <Gavel className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Your Assignment</p>
                  <p className="text-xl font-bold text-foreground capitalize">
                    {assignment.role.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center sm:text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <Badge
                    variant="outline"
                    className={cn('capitalize mt-1', ASSIGNMENT_STATUS_STYLES[assignment.status] || ASSIGNMENT_STATUS_STYLES.pending)}
                  >
                    {assignment.status}
                  </Badge>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{formatDate(assignment.assigned_at)}</p>
                </div>
                {assignment.assigned_by && (
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">By</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{assignment.assigned_by}</p>
                  </div>
                )}
              </div>
            </div>
            {assignment.notes && (
              <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground/80">Notes:</span> {assignment.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================
            COMPANY OVERVIEW & INVESTMENT TERMS (Two Column)
        ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Company Overview */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{deal.description}</p>
                </div>
              )}
              {deal.investment_thesis && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Investment Thesis</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{deal.investment_thesis}</p>
                </div>
              )}
              {!deal.description && !deal.investment_thesis && (
                <div className="py-8 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No company overview available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investment Terms */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                Investment Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Target</p>
                  <p className="text-lg font-bold text-foreground">
                    {deal.target_amount ? formatCurrency(Number(deal.target_amount), deal.currency) : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Raised</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {deal.raised_amount ? formatCurrency(Number(deal.raised_amount), deal.currency) : '$0'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Min Investment</p>
                  <p className="text-sm font-semibold text-foreground">
                    {deal.minimum_investment ? formatCurrency(Number(deal.minimum_investment), deal.currency) : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Max Investment</p>
                  <p className="text-sm font-semibold text-foreground">
                    {deal.maximum_investment ? formatCurrency(Number(deal.maximum_investment), deal.currency) : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Price/Unit</p>
                  <p className="text-sm font-semibold text-foreground">
                    {deal.offer_unit_price ? formatCurrency(Number(deal.offer_unit_price), deal.currency) : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Deal Type</p>
                  <p className="text-sm font-semibold text-foreground">{formatDealType(deal.deal_type)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Opens</p>
                  <p className="text-sm font-semibold text-foreground">
                    {deal.open_at ? formatDate(deal.open_at) : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Closes</p>
                  <p className="text-sm font-semibold text-foreground">
                    {deal.close_at ? formatDate(deal.close_at) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================================================================
            VEHICLE INFO (if exists)
        ================================================================ */}
        {vehicle && (
          <Card className="shadow-sm border-l-4 border-l-cyan-500">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Investment Vehicle</p>
                  <p className="text-lg font-bold text-foreground">{vehicle.name}</p>
                  {vehicle.legal_name && (
                    <p className="text-sm text-muted-foreground">{vehicle.legal_name}</p>
                  )}
                </div>
                {vehicle.vehicle_type && (
                  <Badge variant="outline" className="capitalize">
                    {vehicle.vehicle_type.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================================================================
            ESCROW OVERVIEW
        ================================================================ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              Escrow Overview
            </h2>
            <Link href="/versotech_main/escrow">
              <Button variant="outline" size="sm" className="gap-2">
                View Escrow
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Progress Bar */}
          <Card className="shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Target Progress</span>
                <span className="text-sm font-bold text-foreground">{targetPercentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(targetPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Committed: {formatCurrency(escrow.total_committed, escrow.currency)}</span>
                <span>Target: {deal.target_amount ? formatCurrency(Number(deal.target_amount), deal.currency) : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Committed</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {formatCurrency(escrow.total_committed, escrow.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Funded</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {formatCurrency(escrow.total_funded, escrow.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fundingPercentage}% of commitment
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-600" />
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Confirmations</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {escrow.pending_confirmations}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting funding
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ================================================================
            SUBSCRIPTIONS TABLE
        ================================================================ */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Subscriptions
                </CardTitle>
                <CardDescription>
                  Investor commitments and funding status
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm font-semibold">
                {subscriptions.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl py-12 flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">No subscriptions yet</p>
                <p className="text-sm text-muted-foreground/70">Subscriptions will appear here when investors commit</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="font-semibold">Investor</TableHead>
                      <TableHead className="text-right font-semibold">Commitment</TableHead>
                      <TableHead className="text-right font-semibold">Funded</TableHead>
                      <TableHead className="font-semibold">Signed</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{sub.investor_name}</p>
                              {sub.investor_entity && sub.investor_entity !== sub.investor_name && (
                                <p className="text-xs text-muted-foreground">{sub.investor_entity}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-foreground">
                            {formatCurrency(sub.commitment_amount, sub.currency)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-bold",
                            sub.funded_amount >= sub.commitment_amount
                              ? "text-emerald-600"
                              : sub.funded_amount > 0
                              ? "text-amber-600"
                              : "text-slate-400"
                          )}>
                            {formatCurrency(sub.funded_amount, sub.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {sub.signed_at ? formatDate(sub.signed_at) : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-medium',
                              FUNDING_STATUS_STYLES[sub.funding_status] || FUNDING_STATUS_STYLES.pending_signature
                            )}
                          >
                            {FUNDING_STATUS_LABELS[sub.funding_status] || sub.funding_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================
            DOCUMENTS SECTION (Grouped by Type)
        ================================================================ */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Data Room
                </CardTitle>
                <CardDescription>
                  All deal documents ({documents.length} total)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl py-12 flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">No documents available</p>
                <p className="text-sm text-muted-foreground/70">Documents will appear here when uploaded</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(documentsByType).map(([type, docs]) => {
                  const config = DOCUMENT_TYPE_CONFIG[type] || DOCUMENT_TYPE_CONFIG.other
                  return (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', config.color)}>
                          {config.icon}
                        </div>
                        <h4 className="font-semibold text-foreground/80">{config.label}</h4>
                        <Badge variant="secondary" className="text-xs">{docs.length}</Badge>
                      </div>
                      <div className="grid gap-2 pl-9">
                        {docs.map((doc) => {
                          const isDownloading = downloadingIds.has(doc.id)
                          const canDownload = doc.has_file || doc.external_url

                          return (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm text-foreground truncate">{doc.name}</p>
                                    {!doc.is_published && (
                                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                        Draft
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <span>{formatDate(doc.created_at)}</span>
                                    {doc.file_size_bytes && (
                                      <>
                                        <span>•</span>
                                        <span>{formatFileSize(doc.file_size_bytes)}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {canDownload && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handlePreview(doc)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDownload(doc)}
                                    disabled={isDownloading}
                                  >
                                    {isDownloading ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                    Download
                                  </Button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================
            FAQs SECTION
        ================================================================ */}
        {faqs.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                {faqs.length} question{faqs.length !== 1 ? 's' : ''} about this deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <Collapsible
                    key={faq.id}
                    open={openFaqId === faq.id}
                    onOpenChange={(open) => setOpenFaqId(open ? faq.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left group">
                        <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                        <ChevronDown className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          openFaqId === faq.id && "rotate-180"
                        )} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-2">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================================================================
            FEE SUMMARY
        ================================================================ */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  Fee Summary
                </CardTitle>
                <CardDescription>
                  Commission payments for this deal
                </CardDescription>
              </div>
              <Link href="/versotech_main/reconciliation">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Partner Fees */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="font-semibold text-foreground">Partner Fees</span>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    fee_summary.partner_fees.pending > 0 ? "text-amber-600" : "text-slate-400"
                  )}>
                    {formatCurrency(fee_summary.partner_fees.pending, escrow.currency)} pending
                  </p>
                  {fee_summary.partner_fees.paid > 0 && (
                    <p className="text-sm text-emerald-600">
                      {formatCurrency(fee_summary.partner_fees.paid, escrow.currency)} paid
                    </p>
                  )}
                </div>
              </div>

              {/* Introducer Fees */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-foreground">Introducer Fees</span>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    fee_summary.introducer_fees.pending > 0 ? "text-amber-600" : "text-slate-400"
                  )}>
                    {formatCurrency(fee_summary.introducer_fees.pending, escrow.currency)} pending
                  </p>
                  {fee_summary.introducer_fees.paid > 0 && (
                    <p className="text-sm text-emerald-600">
                      {formatCurrency(fee_summary.introducer_fees.paid, escrow.currency)} paid
                    </p>
                  )}
                </div>
              </div>

              {/* CP Fees */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-foreground">Commercial Partner Fees</span>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    fee_summary.cp_fees.pending > 0 ? "text-amber-600" : "text-slate-400"
                  )}>
                    {formatCurrency(fee_summary.cp_fees.pending, escrow.currency)} pending
                  </p>
                  {fee_summary.cp_fees.paid > 0 && (
                    <p className="text-sm text-emerald-600">
                      {formatCurrency(fee_summary.cp_fees.paid, escrow.currency)} paid
                    </p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-4 mt-4 border-t-2 border-border">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <div className="text-right">
                    <p className={cn(
                      "text-xl font-bold",
                      totalPendingFees > 0 ? "text-amber-600" : "text-slate-400"
                    )}>
                      {formatCurrency(totalPendingFees, escrow.currency)} pending
                    </p>
                    {totalPaidFees > 0 && (
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(totalPaidFees, escrow.currency)} paid
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Document Preview Modal */}
      <DocumentViewerFullscreen
        isOpen={!!previewDoc}
        document={previewDoc ? {
          id: previewDoc.id,
          name: previewDoc.name,
          file_name: previewDoc.name,
          type: previewDoc.type || 'other',
          file_size_bytes: previewDoc.file_size_bytes || undefined,
          mime_type: previewDoc.mime_type || undefined,
        } : null}
        previewUrl={previewUrl}
        isLoading={previewLoading}
        error={previewError}
        onClose={closePreview}
        onDownload={() => previewDoc && handleDownload(previewDoc)}
      />
    </div>
  )
}
