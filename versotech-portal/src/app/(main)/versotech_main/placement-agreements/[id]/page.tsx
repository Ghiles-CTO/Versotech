'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  Calendar,
  Globe,
  Percent,
  Building2,
  ArrowLeft,
  Download,
  PenTool,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  pdf_url: string | null
  signed_pdf_url: string | null
  created_at: string
  commercial_partner: {
    id: string
    legal_name: string
    display_name: string
  } | null
  ceo_signature_request_id: string | null
  cp_signature_request_id: string | null
}

const STATUS_STYLES: Record<string, { bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: { bg: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  pending_signature: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pending_ceo_signature: { bg: 'bg-blue-100 text-blue-800', icon: PenTool },
  pending_arranger_signature: { bg: 'bg-purple-100 text-purple-800', icon: PenTool },
  pending_cp_signature: { bg: 'bg-orange-100 text-orange-800', icon: FileSignature },
  approved: { bg: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  draft: { bg: 'bg-gray-100 text-gray-800', icon: FileText },
  expired: { bg: 'bg-red-100 text-red-800', icon: AlertCircle },
  terminated: { bg: 'bg-red-100 text-red-800', icon: AlertCircle },
}

const AGREEMENT_TYPE_LABELS: Record<string, string> = {
  referral: 'Referral Agreement',
  revenue_share: 'Revenue Share Agreement',
  fixed_fee: 'Fixed Fee Agreement',
  hybrid: 'Hybrid Agreement',
  placement: 'Placement Agreement',
}

const PAYMENT_TERMS_LABELS: Record<string, string> = {
  net_15: 'Net 15 Days',
  net_30: 'Net 30 Days',
  net_45: 'Net 45 Days',
  net_60: 'Net 60 Days',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`
}

export default function PlacementAgreementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agreementId = params.id as string

  const [agreement, setAgreement] = useState<Agreement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    async function fetchAgreement() {
      try {
        setLoading(true)
        const response = await fetch(`/api/placement-agreements/${agreementId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Agreement not found')
          }
          throw new Error('Failed to fetch agreement')
        }
        const data = await response.json()
        setAgreement(data.agreement || data)
      } catch (err) {
        console.error('Error fetching agreement:', err)
        setError(err instanceof Error ? err.message : 'Failed to load agreement')
      } finally {
        setLoading(false)
      }
    }

    if (agreementId) {
      fetchAgreement()
    }
  }, [agreementId])

  const handleSign = async () => {
    try {
      setSigning(true)
      const response = await fetch(`/api/placement-agreements/${agreementId}/sign`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to initiate signing')
      }

      const data = await response.json()
      if (data.signing_url) {
        // Redirect to signing page
        router.push(data.signing_url)
      }
    } catch (err) {
      console.error('Error initiating signing:', err)
      setError(err instanceof Error ? err.message : 'Failed to start signing process')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !agreement) {
    return (
      <div className="p-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription>{error || 'Agreement not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusStyle = STATUS_STYLES[agreement.status] || STATUS_STYLES.draft
  const StatusIcon = statusStyle.icon

  const canSign = agreement.status === 'pending_cp_signature'
  const isActive = agreement.status === 'active'
  const showPdf = agreement.signed_pdf_url || agreement.pdf_url

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Placement Agreement</h1>
            <p className="text-muted-foreground">
              {AGREEMENT_TYPE_LABELS[agreement.agreement_type] || agreement.agreement_type}
            </p>
          </div>
        </div>
        <Badge className={cn('flex items-center gap-1', statusStyle.bg)}>
          <StatusIcon className="h-3 w-3" />
          {agreement.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Agreement Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Agreement Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commercial Partner */}
            {agreement.commercial_partner && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Commercial Partner</p>
                  <p className="font-medium">{agreement.commercial_partner.legal_name || agreement.commercial_partner.display_name}</p>
                </div>
              </div>
            )}

            {/* Key Terms Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  Commission Rate
                </p>
                <p className="font-medium text-lg">{formatBps(agreement.default_commission_bps)}</p>
              </div>

              {agreement.commission_cap_amount && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Commission Cap</p>
                  <p className="font-medium">${agreement.commission_cap_amount.toLocaleString()}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Territory
                </p>
                <p className="font-medium">{agreement.territory || 'Global'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Exclusivity</p>
                <p className="font-medium capitalize">{agreement.exclusivity_level?.replace(/_/g, ' ') || 'Non-exclusive'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Terms</p>
                <p className="font-medium">{PAYMENT_TERMS_LABELS[agreement.payment_terms || ''] || agreement.payment_terms || '-'}</p>
              </div>

              {agreement.deal_types && agreement.deal_types.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Deal Types</p>
                  <div className="flex flex-wrap gap-1">
                    {agreement.deal_types.map((type: string) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dates & Actions */}
        <div className="space-y-6">
          {/* Dates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(agreement.created_at)}</p>
              </div>

              {agreement.signed_date && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Signed</p>
                  <p className="font-medium">{formatDate(agreement.signed_date)}</p>
                </div>
              )}

              {agreement.effective_date && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Effective From</p>
                  <p className="font-medium">{formatDate(agreement.effective_date)}</p>
                </div>
              )}

              {agreement.expiry_date && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">{formatDate(agreement.expiry_date)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canSign && (
                <Button className="w-full" onClick={handleSign} disabled={signing}>
                  {signing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <FileSignature className="h-4 w-4 mr-2" />
                      Sign Agreement
                    </>
                  )}
                </Button>
              )}

              {showPdf && (
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={agreement.signed_pdf_url || agreement.pdf_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isActive ? 'Download Signed Agreement' : 'View Agreement PDF'}
                  </a>
                </Button>
              )}

              <Button variant="ghost" className="w-full" asChild>
                <Link href="/versotech_main/placement-agreements">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Agreements
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Status Message */}
          {agreement.status === 'pending_ceo_signature' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Awaiting CEO Signature</p>
                    <p className="text-sm text-blue-700 mt-1">
                      The CEO must sign this agreement before you can add your signature.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {agreement.status === 'pending_arranger_signature' && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Awaiting Arranger Signature</p>
                    <p className="text-sm text-purple-700 mt-1">
                      The Arranger must sign this agreement before you can add your signature.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {agreement.status === 'pending_cp_signature' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileSignature className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Your Signature Required</p>
                    <p className="text-sm text-orange-700 mt-1">
                      This agreement has been signed and is ready for your signature. Click &quot;Sign Agreement&quot; to complete the signing process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isActive && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Agreement Active</p>
                    <p className="text-sm text-green-700 mt-1">
                      This agreement is fully executed and active.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
