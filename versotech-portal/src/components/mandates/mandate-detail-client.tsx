'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  Users,
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  Eye,
  FileSignature,
  FolderOpen,
  TrendingUp,
  CalendarDays,
  Download,
  Filter,
  History,
  AlertCircle,
  ScrollText,
  HandCoins,
  ExternalLink
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { DealLogo } from '@/components/deals/deal-logo'
import { formatDate } from '@/lib/format'

const statusColors: Record<string, string> = {
  draft: 'bg-white/10 text-foreground border border-white/20',
  open: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  allocation_pending: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  closed: 'bg-blue-500/20 text-blue-200 border border-blue-400/30',
  cancelled: 'bg-red-500/20 text-red-200 border border-red-400/30'
}

const dealTypeLabels: Record<string, string> = {
  equity_secondary: 'Secondary',
  equity_primary: 'Primary',
  credit_trade_finance: 'Credit/Trade',
  other: 'Other'
}

interface MandateDetailClientProps {
  deal: any
  termSheets: any[]
  dataRoomDocuments: any[]
  subscriptions: any[]
  pendingTasks: any[]
  interests: any[]
  signatureHistory: any[]
  /**
   * The type of viewer: 'introducer', 'partner', or 'arranger'
   * - Introducers: Can see fee models but NOT term sheets (per Fred's requirements)
   * - Partners: Can see BOTH term sheets AND fee models
   * - Arrangers/Staff: Can see everything
   */
  viewerType?: 'introducer' | 'partner' | 'arranger' | 'staff'
  /**
   * Fee model assigned to this viewer for this deal (for introducers/partners)
   */
  feeModel?: any
}

// Signature status colors
const signatureStatusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
  sent: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  signed: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  completed: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  expired: 'bg-red-500/20 text-red-200 border-red-400/30',
  cancelled: 'bg-gray-500/20 text-gray-200 border-gray-400/30',
}

export function MandateDetailClient({
  deal,
  termSheets,
  dataRoomDocuments,
  subscriptions,
  pendingTasks,
  interests,
  signatureHistory,
  viewerType = 'arranger',
  feeModel
}: MandateDetailClientProps) {
  // Per Fred's requirements:
  // - Introducers: Can see ONLY fee models, NOT term sheets
  // - Partners: Can see BOTH term sheets AND fee models
  const canViewTermSheets = viewerType !== 'introducer'
  const [activeTab, setActiveTab] = useState('overview')
  const [sigDateFrom, setSigDateFrom] = useState('')
  const [sigDateTo, setSigDateTo] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  // Create subscription map for journey tracking
  const subscriptionMap = new Map(
    subscriptions.map(s => [s.investor_id, s])
  )

  // Enhance memberships with subscription data
  const memberships = deal.deal_memberships || []
  const investorMemberships = memberships.filter((m: any) => m.investor_id)
  const enhancedMembers = investorMemberships.map((m: any) => ({
    ...m,
    subscription: m.investor_id ? subscriptionMap.get(m.investor_id) : null
  }))

  // Calculate journey stats
  const journeyStats = {
    total: enhancedMembers.length,
    dispatched: enhancedMembers.filter((m: any) => m.dispatched_at).length,
    viewed: enhancedMembers.filter((m: any) => m.viewed_at).length,
    interested: enhancedMembers.filter((m: any) => m.interest_confirmed_at).length,
    ndaSigned: enhancedMembers.filter((m: any) => m.nda_signed_at).length,
    dataRoom: enhancedMembers.filter((m: any) => m.data_room_granted_at).length,
    packGen: enhancedMembers.filter((m: any) => m.subscription?.pack_generated_at).length,
    packSent: enhancedMembers.filter((m: any) => m.subscription?.pack_sent_at).length,
    signed: enhancedMembers.filter((m: any) => m.subscription?.signed_at).length,
    funded: enhancedMembers.filter((m: any) => m.subscription?.funded_at).length,
  }

  const journeyStages = [
    { label: 'Dispatched', count: journeyStats.dispatched },
    { label: 'Viewed', count: journeyStats.viewed },
    { label: 'Access Requested', count: journeyStats.interested },
    { label: 'NDA Signed', count: journeyStats.ndaSigned },
    { label: 'Data Room', count: journeyStats.dataRoom },
    { label: 'Subscription Pack', count: journeyStats.packGen },
    { label: 'Pack Sent', count: journeyStats.packSent },
    { label: 'Signed', count: journeyStats.signed },
    { label: 'Funded', count: journeyStats.funded },
  ]

  const getConversion = (idx: number) => {
    if (idx === 0) return journeyStats.total > 0 ? Math.round((journeyStages[0].count / journeyStats.total) * 100) : 0
    const prev = journeyStages[idx - 1].count
    if (prev === 0) return 0
    return Math.round((journeyStages[idx].count / prev) * 100)
  }

  // Filter signature history by date range (User Story Row 69)
  const filteredSignatures = signatureHistory.filter((sig: any) => {
    const sigDate = sig.signature_timestamp || sig.created_at
    if (!sigDate) return true
    const date = new Date(sigDate)
    if (sigDateFrom && date < new Date(sigDateFrom)) return false
    if (sigDateTo && date > new Date(sigDateTo + 'T23:59:59')) return false
    return true
  })

  // Separate completed vs pending signatures
  const completedSignatures = filteredSignatures.filter((sig: any) =>
    sig.status === 'signed' || sig.status === 'completed'
  )
  const pendingSignatures = filteredSignatures.filter((sig: any) =>
    sig.status === 'pending' || sig.status === 'sent'
  )

  // Handle document download/preview via API
  const handleDocumentAction = async (fileKey: string, fileName: string, mode: 'download' | 'preview') => {
    if (!fileKey) {
      alert('Document file not available')
      return
    }

    setDownloading(fileKey)
    try {
      console.log(`[Document ${mode}] Fetching: ${fileKey}`)
      const response = await fetch(
        `/api/storage/download?bucket=deal-documents&path=${encodeURIComponent(fileKey)}`
      )

      if (!response.ok) {
        // Try to get error details
        const contentType = response.headers.get('content-type')
        let errorMsg = `Failed to ${mode} document (${response.status})`

        if (contentType?.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Document action error:', errorData)
          errorMsg = errorData.error || errorMsg
        }

        alert(errorMsg)
        return
      }

      // Get blob from response
      const blob = await response.blob()

      if (blob.size === 0) {
        alert('Document is empty or not found')
        return
      }

      const url = URL.createObjectURL(blob)

      if (mode === 'preview') {
        // Open in new tab for preview
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        // Download
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }

      // Clean up after a delay (allow time for download/preview)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (err) {
      console.error('Document action error:', err)
      alert('Failed to access document. Please check your connection and try again.')
    } finally {
      setDownloading(null)
    }
  }

  // Signature stats for overview
  const signatureStats = {
    total: signatureHistory.length,
    completed: signatureHistory.filter((s: any) => s.status === 'signed' || s.status === 'completed').length,
    pending: signatureHistory.filter((s: any) => s.status === 'pending' || s.status === 'sent').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/versotech_main/my-mandates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <DealLogo
              src={deal.company_logo_url}
              alt={deal.company_name || deal.name}
              size={48}
              rounded="lg"
              className="bg-white/10"
              fallback={<Building2 className="h-6 w-6 text-muted-foreground" />}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{deal.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusColors[deal.status] || statusColors.draft}>
                  {deal.status?.replace('_', ' ')}
                </Badge>
                <span className="text-muted-foreground">
                  {dealTypeLabels[deal.deal_type] || deal.deal_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">
            <Building2 className="h-3 w-3 mr-1" />
            Your Mandate
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="investors" className="data-[state=active]:bg-white/10">
            <Users className="h-4 w-4 mr-2" />
            Investors ({enhancedMembers.length})
          </TabsTrigger>
          {canViewTermSheets && (
            <TabsTrigger value="termsheets" className="data-[state=active]:bg-white/10">
              <ScrollText className="h-4 w-4 mr-2" />
              Term Sheets ({termSheets.length})
            </TabsTrigger>
          )}
          {/* Fee Model Tab - Always visible for introducers/partners */}
          {(viewerType === 'introducer' || viewerType === 'partner') && (
            <TabsTrigger value="feemodel" className="data-[state=active]:bg-white/10">
              <HandCoins className="h-4 w-4 mr-2" />
              Fee Model
            </TabsTrigger>
          )}
          <TabsTrigger value="dataroom" className="data-[state=active]:bg-white/10">
            <FolderOpen className="h-4 w-4 mr-2" />
            Data Room ({dataRoomDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="signatures" className="data-[state=active]:bg-white/10">
            <FileSignature className="h-4 w-4 mr-2" />
            Signatures ({signatureHistory.length + pendingTasks.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Investor Journey Pipeline */}
          {enhancedMembers.length > 0 && (
            <Card className="border border-white/10 bg-white/[0.02] overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                    Investor Pipeline
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {journeyStats.total} total
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="relative pt-2">
                  <div className="absolute top-[26px] left-5 right-5 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent" />
                  <div className="relative flex items-start justify-between">
                    {journeyStages.map((stage, idx) => {
                      const isActive = stage.count > 0
                      const isFinal = stage.label === 'Funded'
                      const conversion = getConversion(idx)

                      return (
                        <div
                          key={stage.label}
                          className="flex flex-col items-center group"
                          style={{ flex: '1 1 0' }}
                        >
                          <div
                            className={`
                              relative z-10 w-11 h-11 rounded-full flex items-center justify-center
                              text-sm font-semibold transition-all duration-300 cursor-default
                              ${isActive
                                ? isFinal
                                  ? 'bg-emerald-500/25 text-emerald-300 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                  : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
                                : 'bg-white/5 text-muted-foreground/60'
                              }
                              group-hover:scale-110 group-hover:ring-emerald-400/40
                            `}
                          >
                            {stage.count}
                          </div>
                          <span className={`
                            text-[10px] mt-2 text-center leading-tight transition-colors
                            ${isActive ? 'text-foreground/70' : 'text-muted-foreground/50'}
                            group-hover:text-foreground
                          `}>
                            {stage.label}
                          </span>
                          {idx > 0 && (
                            <span className={`
                              text-[9px] mt-0.5 transition-opacity
                              ${stage.count > 0 ? 'text-emerald-400/60' : 'text-muted-foreground/30'}
                            `}>
                              {conversion}%
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{journeyStats.funded}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Funded</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {journeyStats.total > 0 ? Math.round((journeyStats.funded / journeyStats.total) * 100) : 0}%
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversion</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{journeyStats.signed}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Signed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deal Information */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground">Deal Information</CardTitle>
              <CardDescription>Core details and structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deal Name</label>
                  <p className="text-lg text-foreground mt-1">{deal.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="text-lg text-foreground mt-1">{deal.company_name || '—'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                  <div className="flex items-center gap-2 mt-1">
                    {deal.vehicles ? (
                      <>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{deal.vehicles.name}</span>
                        <Badge variant="outline" className="border-white/20">
                          {deal.vehicles.type}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No vehicle assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sector / Stage</label>
                  <p className="text-foreground mt-1">
                    {deal.sector || '—'} {deal.stage && `• ${deal.stage}`}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-foreground mt-1">{deal.location || '—'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <p className="text-foreground mt-1">{deal.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Open Date</label>
                  <p className="text-foreground mt-1">
                    {deal.open_at ? formatDate(deal.open_at) : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Close Date</label>
                  <p className="text-foreground mt-1">
                    {deal.close_at ? formatDate(deal.close_at) : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {(deal.description || deal.investment_thesis) && (
            <Card className="border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Deal Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-foreground mt-2 whitespace-pre-wrap">{deal.description}</p>
                  </div>
                )}
                {deal.investment_thesis && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Investment Thesis</label>
                    <p className="text-foreground mt-2 whitespace-pre-wrap">{deal.investment_thesis}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Term Sheets Tab - Hidden from Introducers per Fred's requirements */}
        {canViewTermSheets && (
        <TabsContent value="termsheets" className="space-y-6">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Term Sheets
              </CardTitle>
              <CardDescription>
                Fee structures and deal terms for this mandate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {termSheets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No term sheets created yet
                </div>
              ) : (
                <div className="space-y-4">
                  {termSheets.map((sheet: any) => (
                    <Card key={sheet.id} className={`border ${sheet.status === 'published' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                Version {sheet.version || 1}
                              </span>
                              <Badge className={
                                sheet.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                                  : sheet.status === 'draft'
                                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                                    : 'bg-white/10 text-foreground border-white/20'
                              }>
                                {sheet.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {sheet.term_sheet_date ? formatDate(sheet.term_sheet_date) : 'No date set'}
                            </p>
                          </div>
                          {sheet.term_sheet_attachment_key && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDocumentAction(sheet.term_sheet_attachment_key, `term-sheet-v${sheet.version || 1}.pdf`, 'preview')}
                              className="border-white/20"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View PDF
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <label className="text-muted-foreground">Transaction Type</label>
                            <p className="text-foreground font-medium">{sheet.transaction_type || '—'}</p>
                          </div>
                          <div>
                            <label className="text-muted-foreground">Min Ticket</label>
                            <p className="text-foreground font-medium">
                              {sheet.minimum_ticket ? `${deal.currency} ${Number(sheet.minimum_ticket).toLocaleString()}` : '—'}
                            </p>
                          </div>
                          <div>
                            <label className="text-muted-foreground">Max Ticket</label>
                            <p className="text-foreground font-medium">
                              {sheet.maximum_ticket ? `${deal.currency} ${Number(sheet.maximum_ticket).toLocaleString()}` : '—'}
                            </p>
                          </div>
                          <div>
                            <label className="text-muted-foreground">Interest Deadline</label>
                            <p className="text-foreground font-medium">
                              {sheet.interest_confirmation_deadline ? formatDate(sheet.interest_confirmation_deadline) : '—'}
                            </p>
                          </div>
                        </div>

                        {/* Fee Structure */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <label className="text-sm text-muted-foreground mb-2 block">Fee Structure</label>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <p className="text-lg font-semibold text-foreground">
                                {sheet.subscription_fee_percent != null ? `${sheet.subscription_fee_percent}%` : '—'}
                              </p>
                              <p className="text-xs text-muted-foreground">Subscription Fee</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <p className="text-lg font-semibold text-foreground">
                                {sheet.management_fee_percent != null ? `${sheet.management_fee_percent}%` : '—'}
                              </p>
                              <p className="text-xs text-muted-foreground">Management Fee</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <p className="text-lg font-semibold text-foreground">
                                {sheet.carried_interest_percent != null ? `${sheet.carried_interest_percent}%` : '—'}
                              </p>
                              <p className="text-xs text-muted-foreground">Carried Interest</p>
                            </div>
                          </div>
                        </div>

                        {/* Summary if available */}
                        {sheet.opportunity_summary && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <label className="text-sm text-muted-foreground mb-1 block">Opportunity Summary</label>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{sheet.opportunity_summary}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Fee Model Tab - For introducers/partners to see their commission agreement */}
        {(viewerType === 'introducer' || viewerType === 'partner') && (
          <TabsContent value="feemodel" className="space-y-6">
            <Card className="border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <HandCoins className="h-5 w-5" />
                  Your Fee Model
                </CardTitle>
                <CardDescription>
                  Commission agreement for this investment opportunity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!feeModel ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-2">No fee model assigned yet</div>
                    <p className="text-sm text-muted-foreground/70">
                      A fee model will be created and assigned to you by the deal manager.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Fee Model Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{feeModel.name}</h3>
                        {feeModel.description && (
                          <p className="text-sm text-muted-foreground mt-1">{feeModel.description}</p>
                        )}
                      </div>
                      <Badge
                        className={
                          feeModel.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                            : feeModel.status === 'sent' || feeModel.status === 'pending_signature'
                              ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                              : 'bg-white/10 text-foreground border-white/20'
                        }
                      >
                        {feeModel.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {feeModel.status === 'pending_signature' && <Clock className="h-3 w-3 mr-1" />}
                        {feeModel.status || 'Draft'}
                      </Badge>
                    </div>

                    {/* Fee Components */}
                    {feeModel.fee_components && feeModel.fee_components.length > 0 ? (
                      <div className="space-y-3">
                        <label className="text-sm text-muted-foreground font-medium">Fee Structure</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {feeModel.fee_components.map((comp: any) => (
                            <div
                              key={comp.id}
                              className="bg-white/5 rounded-lg p-4 border border-white/10"
                            >
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {comp.kind?.replace('_', ' ')}
                              </p>
                              <p className="text-lg font-semibold text-foreground">
                                {comp.rate_bps ? `${(comp.rate_bps / 100).toFixed(2)}%` :
                                 comp.flat_amount ? `$${Number(comp.flat_amount).toLocaleString()}` : '—'}
                              </p>
                              {comp.payment_schedule && (
                                <p className="text-xs text-muted-foreground mt-1 capitalize">
                                  {comp.payment_schedule.replace('_', ' ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No fee components defined
                      </div>
                    )}

                    {/* Acceptance Status */}
                    {feeModel.status === 'accepted' && feeModel.accepted_at && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Fee Model Accepted</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Accepted on {formatDate(feeModel.accepted_at)}
                        </p>
                      </div>
                    )}

                    {/* Pending Acceptance Action */}
                    {(feeModel.status === 'sent' || feeModel.status === 'pending_signature') && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-amber-400">
                              <Clock className="h-5 w-5" />
                              <span className="font-medium">Pending Your Acceptance</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Please review and accept this fee model to proceed with investor dispatch.
                            </p>
                          </div>
                          <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                            Accept Fee Model
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Investors Tab - Names visible, amounts hidden */}
        <TabsContent value="investors" className="space-y-6">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground">Investor Journey</CardTitle>
              <CardDescription>
                Track investor progress through the subscription process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enhancedMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No investors invited yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Investor</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground text-center">Dispatched</TableHead>
                      <TableHead className="text-muted-foreground text-center">Viewed</TableHead>
                      <TableHead className="text-muted-foreground text-center">Interested</TableHead>
                      <TableHead className="text-muted-foreground text-center">NDA</TableHead>
                      <TableHead className="text-muted-foreground text-center">Data Room</TableHead>
                      <TableHead className="text-muted-foreground text-center">Signed</TableHead>
                      <TableHead className="text-muted-foreground text-center">Funded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enhancedMembers.map((member: any) => (
                      <TableRow key={`${member.deal_id}-${member.investor_id}`} className="border-white/10">
                        <TableCell className="font-medium text-foreground">
                          {member.investors?.legal_name || 'Unknown Investor'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/20">
                            {member.investors?.type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {member.dispatched_at ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.viewed_at ? (
                            <Eye className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.interest_confirmed_at ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.nda_signed_at ? (
                            <FileSignature className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.data_room_granted_at ? (
                            <FolderOpen className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.subscription?.signed_at ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.subscription?.funded_at ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Investor Interests Section */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <HandCoins className="h-5 w-5 text-blue-400" />
                Interest Submissions ({interests.length})
              </CardTitle>
              <CardDescription>
                Investors who have expressed interest in this deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No interest submissions yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Investor</TableHead>
                      <TableHead className="text-muted-foreground">Submitted</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interests.map((interest: any) => (
                      <TableRow key={interest.id} className="border-white/10">
                        <TableCell className="font-medium text-foreground">
                          {interest.investors?.legal_name || 'Unknown Investor'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {interest.submitted_at ? formatDate(interest.submitted_at) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            interest.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                              : interest.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                                : interest.status === 'rejected'
                                  ? 'bg-red-500/20 text-red-200 border-red-400/30'
                                  : 'bg-white/10 text-foreground border-white/20'
                          }>
                            {interest.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {interest.notes || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Room Tab */}
        <TabsContent value="dataroom" className="space-y-6">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground">Data Room Documents</CardTitle>
              <CardDescription>
                Documents available for investor due diligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataRoomDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents uploaded yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Document</TableHead>
                      <TableHead className="text-muted-foreground">Folder</TableHead>
                      <TableHead className="text-muted-foreground">Uploaded</TableHead>
                      <TableHead className="text-muted-foreground">By</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataRoomDocuments.map((doc: any) => {
                      const fileName = doc.file_key?.split('/').pop() || 'Unknown'
                      return (
                        <TableRow key={doc.id} className="border-white/10">
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {fileName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-white/20">
                              {doc.folder || 'General'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(doc.created_at)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {doc.created_by_profile?.display_name || 'System'}
                          </TableCell>
                          <TableCell className="text-right">
                            {doc.file_key ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDocumentAction(doc.file_key, fileName, 'preview')}
                                  disabled={downloading === doc.file_key}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  {downloading === doc.file_key ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                  <span className="ml-1 hidden sm:inline">Preview</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDocumentAction(doc.file_key, fileName, 'download')}
                                  disabled={downloading === doc.file_key}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="ml-1 hidden sm:inline">Download</span>
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-sm">No file</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signatures Tab - Enhanced with history and date filter (User Story Row 69) */}
        <TabsContent value="signatures" className="space-y-6">
          {/* Date Filter Card */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter by Date
                </CardTitle>
                {(sigDateFrom || sigDateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSigDateFrom(''); setSigDateTo(''); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">From:</label>
                  <Input
                    type="date"
                    value={sigDateFrom}
                    onChange={(e) => setSigDateFrom(e.target.value)}
                    className="w-40 bg-white/5 border-white/10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">To:</label>
                  <Input
                    type="date"
                    value={sigDateTo}
                    onChange={(e) => setSigDateTo(e.target.value)}
                    className="w-40 bg-white/5 border-white/10"
                  />
                </div>
                <div className="flex items-center gap-4 ml-auto text-sm">
                  <span className="text-muted-foreground">
                    Showing {filteredSignatures.length} of {signatureHistory.length} signatures
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Signatures */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Pending Signatures ({pendingSignatures.length})
              </CardTitle>
              <CardDescription>
                Signature requests awaiting action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSignatures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending signatures
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Investor</TableHead>
                      <TableHead className="text-muted-foreground">Signer</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Document</TableHead>
                      <TableHead className="text-muted-foreground">Sent</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSignatures.map((sig: any) => (
                      <TableRow key={sig.id} className="border-white/10">
                        <TableCell className="font-medium text-foreground">
                          {sig.investors?.legal_name || '—'}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {sig.signer_name || sig.signer_email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/20 capitalize">
                            {sig.signer_role?.replace('_', ' ') || 'Signer'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {sig.document_type?.replace('_', ' ') || 'Document'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {sig.email_sent_at ? formatDate(sig.email_sent_at) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={signatureStatusColors[sig.status] || 'bg-white/10'}>
                            {sig.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Completed Signatures History */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-400" />
                Signature History ({completedSignatures.length})
              </CardTitle>
              <CardDescription>
                Completed signatures for this mandate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedSignatures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed signatures{sigDateFrom || sigDateTo ? ' in selected date range' : ''}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Investor</TableHead>
                      <TableHead className="text-muted-foreground">Signer</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Document</TableHead>
                      <TableHead className="text-muted-foreground">Signed At</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedSignatures.map((sig: any) => (
                      <TableRow key={sig.id} className="border-white/10">
                        <TableCell className="font-medium text-foreground">
                          {sig.investors?.legal_name || '—'}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {sig.signer_name || sig.signer_email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/20 capitalize">
                            {sig.signer_role?.replace('_', ' ') || 'Signer'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {sig.document_type?.replace('_', ' ') || 'Document'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {sig.signature_timestamp ? formatDate(sig.signature_timestamp) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={signatureStatusColors[sig.status] || 'bg-emerald-500/20 text-emerald-200'}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {sig.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Action Banner for Pending Arranger Signatures (User Story Row 65) */}
          {pendingTasks.length > 0 && (
            <Card className="border border-amber-500/30 bg-amber-500/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/20">
                      <FileSignature className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        You have {pendingTasks.length} signature{pendingTasks.length !== 1 ? 's' : ''} pending
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click to sign subscription packs for this mandate
                      </p>
                    </div>
                  </div>
                  <Link href="/versotech_main/versosign">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                      <FileSignature className="h-4 w-4 mr-2" />
                      Sign Packs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Your Signature Tasks (from tasks table) */}
          {pendingTasks.length > 0 && (
            <Card className="border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  Your Signature Tasks ({pendingTasks.length})
                </CardTitle>
                <CardDescription>
                  Tasks assigned to you for this mandate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Task</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Priority</TableHead>
                      <TableHead className="text-muted-foreground">Due Date</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTasks.map((task: any) => (
                      <TableRow key={task.id} className="border-white/10">
                        <TableCell className="font-medium text-foreground">
                          {task.title || task.kind?.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/20">
                            {task.kind?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              task.priority === 'high'
                                ? 'bg-red-500/20 text-red-200 border-red-400/30'
                                : task.priority === 'medium'
                                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                                  : 'bg-white/10 text-foreground border-white/20'
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {task.due_at ? formatDate(task.due_at) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              task.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                                : 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                            }
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href="/versotech_main/versosign">
                            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                              <FileSignature className="h-3 w-3 mr-1" />
                              Sign
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
