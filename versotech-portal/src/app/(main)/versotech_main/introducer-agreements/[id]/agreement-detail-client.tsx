'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  FileSignature,
  Calendar,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  PenLine,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  Loader2,
  ExternalLink,
  FileDown,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AgreementStatusTimeline } from './agreement-status-timeline'

type Introducer = {
  id: string
  legal_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  status: string
  logo_url: string | null
}

type SignatureRequest = {
  id: string
  status: string
  signer_name: string
  signer_email: string
  signature_timestamp: string | null
  signed_pdf_path: string | null
} | null

type Agreement = {
  id: string
  introducer_id: string
  status: string
  agreement_type: string | null
  default_commission_bps: number | null
  commission_cap_amount: number | null
  effective_date: string | null
  expiry_date: string | null
  payment_terms: string | null
  territory: string | null
  exclusivity_level: string | null
  signed_date: string | null
  created_at: string
  updated_at: string
  introducer: Introducer
  ceo_signature_request: SignatureRequest
  introducer_signature_request: SignatureRequest
  // New fields for PDF visibility
  pdf_url: string | null
  reference_number: string | null
  performance_fee_bps: number | null
  hurdle_rate_bps: number | null
}

interface AgreementDetailClientProps {
  agreement: Agreement
  isStaff: boolean
  currentUserId: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: FileText },
  sent: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Send },
  pending_approval: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: Clock },
  approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  pending_ceo_signature: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: PenLine },
  pending_introducer_signature: { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: PenLine },
  active: { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle2 },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
  expired: { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: AlertCircle },
  terminated: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent to Introducer',
  pending_approval: 'Pending Approval',
  approved: 'Approved - Awaiting Signatures',
  pending_ceo_signature: 'Awaiting CEO Signature',
  pending_introducer_signature: 'Awaiting Introducer Signature',
  active: 'Active',
  rejected: 'Rejected',
  expired: 'Expired',
  terminated: 'Terminated',
}

export function AgreementDetailClient({
  agreement,
  isStaff,
  currentUserId,
}: AgreementDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!agreement.pdf_url) return

    setDownloadingPdf(true)
    try {
      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(agreement.pdf_url)}&bucket=deal-documents`)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${agreement.reference_number || 'Fee_Agreement'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const statusStyle = STATUS_STYLES[agreement.status] || STATUS_STYLES.draft
  const StatusIcon = statusStyle.icon

  const formatCommission = (bps: number | null) => {
    if (bps === null) return 'Not set'
    return `${(bps / 100).toFixed(2)}%`
  }

  const handleSend = async () => {
    setLoading('send')
    try {
      const response = await fetch(`/api/introducer-agreements/${agreement.id}/send`, {
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
      setLoading(null)
    }
  }

  const handleApprove = async () => {
    setLoading('approve')
    try {
      const response = await fetch(`/api/introducer-agreements/${agreement.id}/approve`, {
        method: 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve agreement')
      }
      toast.success('Agreement approved! CEO will be notified to sign.')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve agreement')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setLoading('reject')
    try {
      const response = await fetch(`/api/introducer-agreements/${agreement.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject agreement')
      }
      toast.success('Agreement rejected')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject agreement')
    } finally {
      setLoading(null)
      setRejectReason('')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full"
          >
            <Link href="/versotech_main/introducer-agreements">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Fee Agreement</h1>
              <Badge
                variant="outline"
                className={cn('capitalize', statusStyle.bg, statusStyle.text)}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {STATUS_LABELS[agreement.status] || agreement.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Agreement with {agreement.introducer?.legal_name}
              {agreement.reference_number && (
                <span className="ml-2 text-xs font-mono text-muted-foreground/70">
                  ({agreement.reference_number})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Staff: Send draft to introducer */}
          {isStaff && agreement.status === 'draft' && (
            <Button
              onClick={handleSend}
              disabled={loading === 'send'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
              {loading === 'send' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send to Introducer
            </Button>
          )}

          {/* Introducer: Approve or Reject */}
          {!isStaff && agreement.status === 'pending_approval' && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Agreement?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this fee agreement? You can provide a reason below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="reject-reason">Reason (optional)</Label>
                    <Textarea
                      id="reject-reason"
                      placeholder="Enter reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={loading === 'reject'}
                    >
                      {loading === 'reject' ? 'Rejecting...' : 'Reject Agreement'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={handleApprove}
                disabled={loading === 'approve'}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                {loading === 'approve' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Approve Agreement
              </Button>
            </>
          )}

          {/* Staff: Sign (if pending CEO signature) */}
          {isStaff && agreement.status === 'approved' && (
            <Button
              asChild
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
            >
              <Link href={`/versotech_main/versosign?agreement=${agreement.id}`}>
                <PenLine className="h-4 w-4 mr-2" />
                Sign Agreement
              </Link>
            </Button>
          )}

          {/* Introducer: Sign (if pending introducer signature) */}
          {!isStaff && agreement.status === 'pending_introducer_signature' && (
            <Button
              asChild
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
            >
              <Link href={`/versotech_main/versosign?agreement=${agreement.id}`}>
                <PenLine className="h-4 w-4 mr-2" />
                Sign Agreement
              </Link>
            </Button>
          )}

          {/* PDF Download - always visible when pdf_url exists */}
          {agreement.pdf_url && (
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
            >
              {downloadingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agreement Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-amber-500" />
                Agreement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground text-sm">Commission Rate</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-semibold">
                      {formatCommission(agreement.default_commission_bps)}
                    </span>
                    {agreement.default_commission_bps && (
                      <span className="text-sm text-muted-foreground">
                        ({agreement.default_commission_bps} bps)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Agreement Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">
                      {agreement.agreement_type?.replace(/_/g, ' ') || 'Not set'}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Effective Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {agreement.effective_date
                        ? formatDate(agreement.effective_date)
                        : 'Not set'}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Expiry Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {agreement.expiry_date
                        ? formatDate(agreement.expiry_date)
                        : 'No expiry'}
                    </span>
                  </div>
                </div>

                {agreement.territory && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Territory</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">{agreement.territory}</span>
                    </div>
                  </div>
                )}

                {agreement.payment_terms && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Payment Terms</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium capitalize">
                        {agreement.payment_terms.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Signed Status */}
              {agreement.status === 'active' && agreement.signed_date && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <FileText className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Agreement Active</p>
                        <p className="text-sm text-muted-foreground">
                          Fully signed on {formatDate(agreement.signed_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <AgreementStatusTimeline
            status={agreement.status}
            createdAt={agreement.created_at}
            signedDate={agreement.signed_date}
            ceoSignature={agreement.ceo_signature_request}
            introducerSignature={agreement.introducer_signature_request}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Introducer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Introducer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agreement.introducer?.logo_url && (
                <div className="flex justify-center">
                  <img
                    src={agreement.introducer.logo_url}
                    alt={agreement.introducer.legal_name}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}

              <div>
                <p className="font-semibold text-lg">{agreement.introducer?.legal_name}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-1 capitalize',
                    agreement.introducer?.status === 'active'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-gray-500/10 text-gray-500'
                  )}
                >
                  {agreement.introducer?.status}
                </Badge>
              </div>

              <Separator />

              {agreement.introducer?.contact_name && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{agreement.introducer.contact_name}</span>
                </div>
              )}

              {agreement.introducer?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${agreement.introducer.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {agreement.introducer.email}
                  </a>
                </div>
              )}

              {agreement.introducer?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{agreement.introducer.phone}</span>
                </div>
              )}

              {isStaff && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  asChild
                >
                  <Link href={`/versotech_main/introducers/${agreement.introducer_id}`}>
                    View Introducer Profile
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
