'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  Banknote,
  Activity,
  DollarSign,
  TrendingUp,
  Building2,
  Edit,
  UserPlus,
  Clock,
  Percent,
  FileSignature,
  MoreHorizontal,
  Eye,
  Send,
  PenLine,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Users,
  Briefcase,
  ExternalLink,
  Download,
  FileDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useEffect, useCallback } from 'react'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { ActivityTimelineTab } from '@/components/shared/activity-timeline-tab'
import { EditIntroducerDialog } from '@/components/staff/introducers/edit-introducer-dialog'
import { CreateAgreementDialog } from '@/components/staff/introducers/create-agreement-dialog'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatCurrency, formatBps, formatDate } from '@/lib/format'
import { statusStyles, kycStyles, getStatusStyle } from '@/lib/status-styles'

type IntroducerDetail = {
  id: string
  legal_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  default_commission_bps: number | null
  commission_cap_amount: number | null
  payment_terms: string | null
  status: string
  kyc_status: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

type Introduction = {
  id: string
  prospect_email: string | null
  status: string
  introduced_at: string | null
  deal: {
    id: string
    name: string
  } | null
}

type Commission = {
  id: string
  accrual_amount: number
  status: string
  paid_at: string | null
  created_at: string
  deal_id: string | null
  investor_id: string | null
  investor?: {
    legal_name: string
  } | null
  deal?: {
    name: string
  } | null
}

type Agreement = {
  id: string
  status: string
  reference_number: string | null
  default_commission_bps: number | null
  agreement_date: string | null
  effective_date: string | null
  expiry_date: string | null
  special_terms: string | null
  signed_date: string | null
  pdf_url: string | null
  deal_id: string | null
  fee_plan_id: string | null
  created_at: string
  updated_at: string
  deal?: {
    id: string
    name: string
  } | null
}

type IntroducerMetrics = {
  totalIntroductions: number
  successfulAllocations: number
  conversionRate: number
  totalCommissionPaid: number
  pendingCommission: number
}

type FeeComponent = {
  id: string
  kind: string
  calc_method: string | null
  rate_bps: number | null
  flat_amount: number | null
  frequency: string | null
}

type IntroducerFeePlan = {
  id: string
  name: string
  description: string | null
  status: 'draft' | 'sent' | 'pending_signature' | 'accepted' | 'rejected'
  is_active: boolean
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
  updated_at: string
  generated_agreement_id: string | null
  deal: {
    id: string
    name: string
    status: string
  } | null
  term_sheet: {
    id: string
    version: number
    status: string
    term_sheet_date: string | null
    subscription_fee_percent: number | null
    management_fee_percent: number | null
    carried_interest_percent: number | null
  } | null
  fee_components: FeeComponent[]
  introducer_agreement: {
    id: string
    reference_number: string | null
    status: string
    pdf_url: string | null
    signed_date: string | null
  } | null
  investor_count: number
}

type ReferredInvestor = {
  id: string
  investor_id: string | null
  user_id: string | null
  role: string
  invited_at: string | null
  accepted_at: string | null
  profile: {
    id: string
    display_name: string | null
    email: string | null
  } | null
  investor: {
    id: string
    legal_name: string
    type: string | null
  } | null
  deal: {
    id: string
    name: string
    status: string
  } | null
  fee_plan: {
    id: string
    name: string
    status: string
  } | null
  subscription: {
    status: string
    amount: number | null
    funded_at: string | null
  } | null
}

interface IntroducerDetailClientProps {
  introducer: IntroducerDetail
  metrics: IntroducerMetrics
  introductions: Introduction[]
  commissions: Commission[]
  agreements: Agreement[]
}

export function IntroducerDetailClient({
  introducer,
  metrics,
  introductions,
  commissions,
  agreements
}: IntroducerDetailClientProps) {
  const router = useRouter()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [createAgreementOpen, setCreateAgreementOpen] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  // Handle PDF download from Supabase storage
  const handleDownloadPdf = async (pdfUrl: string, referenceNumber: string | null) => {
    setDownloadingPdf(pdfUrl)
    try {
      // Fetch the file directly from our API
      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      // Convert response to blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${referenceNumber || 'agreement'}.pdf`
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

  // Fee Plans and Referred Investors state
  const [feePlans, setFeePlans] = useState<IntroducerFeePlan[]>([])
  const [feePlansLoading, setFeePlansLoading] = useState(false)
  const [expandedFeePlan, setExpandedFeePlan] = useState<string | null>(null)
  const [referredInvestors, setReferredInvestors] = useState<ReferredInvestor[]>([])
  const [referredInvestorsLoading, setReferredInvestorsLoading] = useState(false)

  // Fee component kind labels
  const feeKindLabels: Record<string, string> = {
    subscription: 'Subscription Fee',
    management: 'Management Fee',
    performance: 'Performance Fee',
    spread_markup: 'Spread Markup',
    flat: 'Flat Fee',
    other: 'Other'
  }

  // Fetch fee plans for this introducer
  const fetchFeePlans = useCallback(async () => {
    setFeePlansLoading(true)
    try {
      const response = await fetch(`/api/introducers/${introducer.id}/fee-plans`)
      if (response.ok) {
        const data = await response.json()
        setFeePlans(data.fee_plans || [])
      }
    } catch (error) {
      console.error('Error fetching fee plans:', error)
    } finally {
      setFeePlansLoading(false)
    }
  }, [introducer.id])

  // Fetch referred investors for this introducer
  const fetchReferredInvestors = useCallback(async () => {
    setReferredInvestorsLoading(true)
    try {
      const response = await fetch(`/api/introducers/${introducer.id}/referred-investors`)
      if (response.ok) {
        const data = await response.json()
        setReferredInvestors(data.referred_investors || [])
      }
    } catch (error) {
      console.error('Error fetching referred investors:', error)
    } finally {
      setReferredInvestorsLoading(false)
    }
  }, [introducer.id])

  // Load fee plans and referred investors on mount
  useEffect(() => {
    fetchFeePlans()
    fetchReferredInvestors()
  }, [fetchFeePlans, fetchReferredInvestors])

  const feePlanStatusStyles: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-blue-500/20 text-blue-400',
    pending_signature: 'bg-purple-500/20 text-purple-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  const introStatusStyles: Record<string, string> = {
    allocated: 'bg-green-500/20 text-green-400',
    converted: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    expired: 'bg-gray-500/20 text-gray-400',
  }

  const commissionStatusStyles: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-400',
    accrued: 'bg-yellow-500/20 text-yellow-400',
    invoiced: 'bg-blue-500/20 text-blue-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  const agreementStatusStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    draft: {
      bg: 'bg-slate-500/20',
      text: 'text-slate-400',
      icon: <FileText className="h-3 w-3" />
    },
    sent: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      icon: <Send className="h-3 w-3" />
    },
    pending_approval: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      icon: <AlertCircle className="h-3 w-3" />
    },
    approved: {
      bg: 'bg-indigo-500/20',
      text: 'text-indigo-400',
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    pending_ceo_signature: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
      icon: <PenLine className="h-3 w-3" />
    },
    pending_introducer_signature: {
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-400',
      icon: <PenLine className="h-3 w-3" />
    },
    active: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    expired: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      icon: <Clock className="h-3 w-3" />
    },
    rejected: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      icon: <XCircle className="h-3 w-3" />
    },
  }

  const formatAgreementStatus = (status: string) => {
    const mapping: Record<string, string> = {
      draft: 'Draft',
      sent: 'Sent',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      pending_ceo_signature: 'Awaiting CEO Signature',
      pending_introducer_signature: 'Awaiting Introducer Signature',
      active: 'Active',
      expired: 'Expired',
      rejected: 'Rejected',
    }
    return mapping[status] || status
  }

  const handleSendAgreement = async (agreementId: string) => {
    setSendingAgreement(agreementId)
    try {
      const response = await fetch(`/api/introducer-agreements/${agreementId}/send`, {
        method: 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send agreement')
      }
      toast.success('Agreement sent to introducer for approval')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send agreement')
    } finally {
      setSendingAgreement(null)
    }
  }

  const formatPaymentTerms = (terms: string | null) => {
    if (!terms) return 'Not set'
    const mapping: Record<string, string> = {
      'net_15': 'Net 15',
      'net_30': 'Net 30',
      'net_45': 'Net 45',
      'net_60': 'Net 60',
    }
    return mapping[terms] || terms
  }

  // Format introducer data for edit dialog
  const introducerForDialog = {
    id: introducer.id,
    legalName: introducer.legal_name,
    contactName: introducer.contact_name,
    email: introducer.email,
    defaultCommissionBps: introducer.default_commission_bps || 0,
    commissionCapAmount: introducer.commission_cap_amount,
    paymentTerms: introducer.payment_terms,
    status: introducer.status,
    notes: introducer.notes,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech_main/users">
            <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {introducer.legal_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Introducer ID: {introducer.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge className={getStatusStyle(introducer.status, statusStyles)}>
          {introducer.status}
        </Badge>
        {introducer.kyc_status && (
          <Badge className={getStatusStyle(introducer.kyc_status, kycStyles)}>
            KYC: {introducer.kyc_status}
          </Badge>
        )}
        {introducer.default_commission_bps && (
          <Badge variant="outline">
            {formatBps(introducer.default_commission_bps)} Commission
          </Badge>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Introductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalIntroductions}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.successfulAllocations} converted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Success rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Paid Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.totalCommissionPaid)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {formatCurrency(metrics.pendingCommission)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Owed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Default Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatBps(introducer.default_commission_bps || 0)}
            </div>
            {introducer.commission_cap_amount && (
              <div className="text-sm text-muted-foreground mt-1">
                Cap: {formatCurrency(introducer.commission_cap_amount)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6" id={`introducer-tabs-${introducer.id}`}>
        <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="fee-plans" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Fee Plans</span>
          </TabsTrigger>
          <TabsTrigger value="referred-investors" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Investors</span>
          </TabsTrigger>
          <TabsTrigger value="agreements" className="gap-2">
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">Agreements</span>
          </TabsTrigger>
          <TabsTrigger value="introductions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Introductions</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Commissions</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">KYC</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Bank</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {introducer.contact_name && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Primary Contact</div>
                      <div className="text-sm font-medium">{introducer.contact_name}</div>
                    </div>
                  </div>
                )}
                {introducer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <a href={`mailto:${introducer.email}`} className="text-sm font-medium text-blue-400 hover:underline">
                        {introducer.email}
                      </a>
                    </div>
                  </div>
                )}
                {introducer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">{introducer.phone}</div>
                    </div>
                  </div>
                )}
                {introducer.created_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Member Since</div>
                      <div className="text-sm font-medium">{formatDate(introducer.created_at)}</div>
                    </div>
                  </div>
                )}
                {!introducer.contact_name && !introducer.email && !introducer.phone && (
                  <p className="text-sm text-muted-foreground">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Commission Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Default Commission Rate</div>
                    <div className="text-sm font-medium">{formatBps(introducer.default_commission_bps || 0)}</div>
                  </div>
                </div>
                {introducer.commission_cap_amount && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Commission Cap</div>
                      <div className="text-sm font-medium">{formatCurrency(introducer.commission_cap_amount)}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Terms</div>
                    <div className="text-sm font-medium">{formatPaymentTerms(introducer.payment_terms)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Card */}
          {introducer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-white/5 rounded-lg p-4 whitespace-pre-wrap">
                  {introducer.notes}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fee Plans Tab */}
        <TabsContent value="fee-plans">
          <Card>
            <CardHeader>
              <CardTitle>Fee Plans</CardTitle>
              <CardDescription>
                All fee plans linked to {introducer.legal_name} across deals. Click to expand details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feePlansLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : feePlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 mb-4">
                    <FileCheck className="h-10 w-10 text-blue-400/60" />
                  </div>
                  <p className="text-muted-foreground mb-1">No fee plans yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Fee plans will appear here when created from deals
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feePlans.map((feePlan) => {
                    const isExpanded = expandedFeePlan === feePlan.id
                    const hasAgreement = feePlan.introducer_agreement?.pdf_url

                    return (
                      <div
                        key={feePlan.id}
                        className={`rounded-xl border transition-all ${
                          isExpanded
                            ? 'border-blue-500/30 bg-blue-500/5'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Header - Clickable */}
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer"
                          onClick={() => setExpandedFeePlan(isExpanded ? null : feePlan.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg ${feePlan.status === 'accepted' ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
                              <FileCheck className={`h-5 w-5 ${feePlan.status === 'accepted' ? 'text-green-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{feePlan.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                <Briefcase className="h-3 w-3" />
                                {feePlan.deal?.name || 'Unknown Deal'}
                                {feePlan.term_sheet && (
                                  <span className="text-xs text-muted-foreground/70">
                                    • Term Sheet v{feePlan.term_sheet.version}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {feePlan.investor_count > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {feePlan.investor_count}
                              </div>
                            )}
                            {hasAgreement && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                PDF
                              </Badge>
                            )}
                            <Badge className={feePlanStatusStyles[feePlan.status] || 'bg-gray-500/20 text-gray-400'}>
                              {feePlan.status}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 border-t border-white/10 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                              {/* Left Column - Fee Components */}
                              <div>
                                <h4 className="text-sm font-medium text-foreground mb-3">Fee Components</h4>
                                {feePlan.fee_components && feePlan.fee_components.length > 0 ? (
                                  <div className="space-y-2">
                                    {feePlan.fee_components.map((component) => (
                                      <div
                                        key={component.id}
                                        className="flex items-center justify-between py-2 px-3 rounded bg-white/5"
                                      >
                                        <span className="text-sm text-foreground">
                                          {feeKindLabels[component.kind] || component.kind}
                                        </span>
                                        <Badge variant="outline" className="border-white/20 text-muted-foreground">
                                          {component.rate_bps ? `${component.rate_bps / 100}%` :
                                           component.flat_amount ? `$${component.flat_amount.toLocaleString()}` : '—'}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                ) : feePlan.term_sheet ? (
                                  <div className="space-y-2">
                                    {feePlan.term_sheet.subscription_fee_percent && (
                                      <div className="flex items-center justify-between py-2 px-3 rounded bg-white/5">
                                        <span className="text-sm text-foreground">Subscription Fee</span>
                                        <Badge variant="outline" className="border-white/20 text-muted-foreground">
                                          {feePlan.term_sheet.subscription_fee_percent}%
                                        </Badge>
                                      </div>
                                    )}
                                    {feePlan.term_sheet.management_fee_percent && (
                                      <div className="flex items-center justify-between py-2 px-3 rounded bg-white/5">
                                        <span className="text-sm text-foreground">Management Fee</span>
                                        <Badge variant="outline" className="border-white/20 text-muted-foreground">
                                          {feePlan.term_sheet.management_fee_percent}%
                                        </Badge>
                                      </div>
                                    )}
                                    {feePlan.term_sheet.carried_interest_percent && (
                                      <div className="flex items-center justify-between py-2 px-3 rounded bg-white/5">
                                        <span className="text-sm text-foreground">Carried Interest</span>
                                        <Badge variant="outline" className="border-white/20 text-muted-foreground">
                                          {feePlan.term_sheet.carried_interest_percent}%
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No fee components defined</p>
                                )}
                              </div>

                              {/* Right Column - Agreement & Actions */}
                              <div>
                                <h4 className="text-sm font-medium text-foreground mb-3">Agreement</h4>
                                {feePlan.introducer_agreement ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                      <div className="p-2 rounded-lg bg-green-500/10">
                                        <FileSignature className="h-5 w-5 text-green-400" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                          {feePlan.introducer_agreement.reference_number || 'Agreement'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Status: {feePlan.introducer_agreement.status}
                                        </p>
                                      </div>
                                    </div>
                                    {feePlan.introducer_agreement.pdf_url && (
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            // Preview in new tab
                                            fetch(`/api/storage/download?path=${encodeURIComponent(feePlan.introducer_agreement!.pdf_url!)}&bucket=deal-documents`)
                                              .then(res => res.blob())
                                              .then(blob => {
                                                const url = window.URL.createObjectURL(blob)
                                                window.open(url, '_blank')
                                              })
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          Preview
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 text-green-400 border-green-400/30 hover:bg-green-400/10"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDownloadPdf(
                                              feePlan.introducer_agreement!.pdf_url!,
                                              feePlan.introducer_agreement!.reference_number
                                            )
                                          }}
                                          disabled={downloadingPdf === feePlan.introducer_agreement.pdf_url}
                                        >
                                          {downloadingPdf === feePlan.introducer_agreement.pdf_url ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                          ) : (
                                            <Download className="h-4 w-4 mr-1" />
                                          )}
                                          Download
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <AlertCircle className="h-4 w-4 text-amber-400" />
                                    <p className="text-sm text-amber-400">No agreement generated yet</p>
                                  </div>
                                )}

                                {/* Additional info */}
                                <div className="mt-4 space-y-2">
                                  {feePlan.accepted_at && (
                                    <div className="flex items-center gap-2 text-sm text-green-400">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Accepted {formatDate(feePlan.accepted_at)}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Created {formatDate(feePlan.created_at)}
                                  </div>
                                </div>

                                {/* Link to deal */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-4 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/versotech_main/deals/${feePlan.deal?.id}?tab=fee-plans`)
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View in Deal
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referred Investors Tab */}
        <TabsContent value="referred-investors">
          <Card>
            <CardHeader>
              <CardTitle>Referred Investors</CardTitle>
              <CardDescription>
                Investors dispatched through {introducer.legal_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referredInvestorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : referredInvestors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
                    <Users className="h-10 w-10 text-purple-400/60" />
                  </div>
                  <p className="text-muted-foreground mb-1">No referred investors yet</p>
                  <p className="text-sm text-muted-foreground/70 mb-4">
                    Investors dispatched through this introducer will appear here
                  </p>
                  <div className="max-w-md p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-left">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-400 mb-1">How to link investors</p>
                        <p className="text-xs text-muted-foreground">
                          When dispatching investors from a Deal's Members tab, select this introducer as the
                          referrer and assign a fee plan. The investor will then appear here with commission tracking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {referredInvestors.map((refInvestor) => (
                    <div
                      key={refInvestor.id}
                      className="group flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => router.push(`/versotech_main/deals/${refInvestor.deal?.id}?tab=members`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-purple-500/20">
                          <User className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {refInvestor.investor?.legal_name || refInvestor.profile?.display_name || refInvestor.profile?.email || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                            <Briefcase className="h-3 w-3" />
                            {refInvestor.deal?.name || 'Unknown Deal'}
                            {refInvestor.fee_plan && (
                              <span className="text-xs text-muted-foreground/70">
                                • {refInvestor.fee_plan.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {refInvestor.subscription?.amount && (
                          <div className="text-sm font-medium text-foreground">
                            {formatCurrency(refInvestor.subscription.amount)}
                          </div>
                        )}
                        <Badge className={
                          refInvestor.subscription?.status === 'funded'
                            ? 'bg-green-500/20 text-green-400'
                            : refInvestor.subscription?.status
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                        }>
                          {refInvestor.subscription?.status || 'Invited'}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agreements Tab */}
        <TabsContent value="agreements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Fee Agreements</CardTitle>
                <CardDescription>
                  Manage commission agreements with {introducer.legal_name}
                </CardDescription>
              </div>
              <Button
                onClick={() => setCreateAgreementOpen(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Agreement
              </Button>
            </CardHeader>
            <CardContent>
              {agreements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4">
                    <FileSignature className="h-10 w-10 text-amber-400/60" />
                  </div>
                  <p className="text-muted-foreground mb-1">No agreements yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Create a fee agreement to enable introductions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agreements.map((agreement) => {
                    const statusStyle = agreementStatusStyles[agreement.status] || {
                      bg: 'bg-gray-500/20',
                      text: 'text-gray-400',
                      icon: <FileText className="h-3 w-3" />
                    }
                    const isActive = agreement.status === 'active'
                    const isDraft = agreement.status === 'draft'
                    const canSign = agreement.status === 'pending_ceo_signature'

                    return (
                      <div
                        key={agreement.id}
                        className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer
                          ${isActive
                            ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent hover:from-emerald-500/10'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                          }`}
                        onClick={() => router.push(`/versotech_main/introducer-agreements/${agreement.id}`)}
                      >
                        {/* Left side - Agreement info */}
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-lg ${statusStyle.bg}`}>
                            <FileSignature className={`h-5 w-5 ${statusStyle.text}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {agreement.reference_number || `Agreement ${agreement.id.slice(0, 8)}`}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                • {formatBps(agreement.default_commission_bps || 0)}
                              </span>
                              {isActive && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                              {agreement.deal && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {agreement.deal.name}
                                </span>
                              )}
                              {agreement.effective_date && (
                                <span>• {formatDate(agreement.effective_date)}</span>
                              )}
                              {agreement.expiry_date && (
                                <span className="text-muted-foreground/70">→ {formatDate(agreement.expiry_date)}</span>
                              )}
                              {!agreement.deal && !agreement.effective_date && (
                                <>Created {formatDate(agreement.created_at)}</>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side - Status and actions */}
                        <div className="flex items-center gap-3">
                          {/* PDF Download Button */}
                          {agreement.pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadPdf(agreement.pdf_url!, agreement.reference_number)
                              }}
                              disabled={downloadingPdf === agreement.pdf_url}
                            >
                              {downloadingPdf === agreement.pdf_url ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-400" />
                              ) : (
                                <FileDown className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">PDF</span>
                            </Button>
                          )}

                          <Badge className={`${statusStyle.bg} ${statusStyle.text} gap-1.5 font-medium`}>
                            {statusStyle.icon}
                            {formatAgreementStatus(agreement.status)}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/versotech_main/introducer-agreements/${agreement.id}`)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {agreement.pdf_url && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadPdf(agreement.pdf_url!, agreement.reference_number)
                                  }}
                                  disabled={downloadingPdf === agreement.pdf_url}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  {downloadingPdf === agreement.pdf_url ? 'Downloading...' : 'Download PDF'}
                                </DropdownMenuItem>
                              )}
                              {isDraft && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/versotech_main/introducer-agreements/${agreement.id}?edit=true`)
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Agreement
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSendAgreement(agreement.id)
                                    }}
                                    disabled={sendingAgreement === agreement.id}
                                    className="text-amber-400 focus:text-amber-400"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    {sendingAgreement === agreement.id ? 'Sending...' : 'Send for Approval'}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {canSign && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/versotech_main/versosign?agreement=${agreement.id}`)
                                    }}
                                    className="text-purple-400 focus:text-purple-400"
                                  >
                                    <PenLine className="h-4 w-4 mr-2" />
                                    Sign Agreement
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Introductions Tab */}
        <TabsContent value="introductions">
          <Card>
            <CardHeader>
              <CardTitle>Introductions</CardTitle>
              <CardDescription>
                All prospects introduced by {introducer.legal_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {introductions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No introductions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {introductions.map((intro) => (
                    <div
                      key={intro.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">{intro.prospect_email || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {intro.deal?.name || 'Unknown deal'}
                          {intro.introduced_at && ` • ${formatDate(intro.introduced_at)}`}
                        </div>
                      </div>
                      <Badge className={introStatusStyles[intro.status] ?? 'bg-gray-500/20 text-gray-400'}>
                        {intro.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>
                All commissions earned by {introducer.legal_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No commissions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {formatCurrency(comm.accrual_amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {comm.investor?.legal_name || 'Unknown investor'}
                          {comm.deal && (
                            <> • {comm.deal.name}</>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created {formatDate(comm.created_at)}
                          {comm.paid_at && ` • Paid ${formatDate(comm.paid_at)}`}
                        </div>
                      </div>
                      <Badge className={commissionStatusStyles[comm.status] ?? 'bg-gray-500/20 text-gray-400'}>
                        {comm.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc">
          <KYCDocumentsTab
            entityType="introducer"
            entityId={introducer.id}
            entityName={introducer.legal_name}
          />
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank">
          <BankDetailsTab
            entityType="introducer"
            entityId={introducer.id}
            entityName={introducer.legal_name}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityTimelineTab
            entityType="introducer"
            entityId={introducer.id}
            entityName={introducer.legal_name}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditIntroducerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        introducer={introducerForDialog}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        entityType="introducer"
        entityId={introducer.id}
        entityName={introducer.legal_name}
      />

      <CreateAgreementDialog
        open={createAgreementOpen}
        onOpenChange={setCreateAgreementOpen}
        introducerId={introducer.id}
        introducerName={introducer.legal_name}
        defaultCommissionBps={introducer.default_commission_bps || 100}
      />
    </div>
  )
}
