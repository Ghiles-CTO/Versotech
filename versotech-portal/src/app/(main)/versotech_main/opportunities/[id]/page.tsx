'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InvestorJourneyBar } from '@/components/deals/investor-journey-bar'
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  MapPin,
  Globe,
  FileText,
  Download,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  Users,
  ExternalLink,
  HelpCircle
} from 'lucide-react'
import { usePersona } from '@/contexts/persona-context'

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  category: string
  description: string | null
  uploaded_at: string
}

interface FeeStructure {
  id: string
  subscription_fee_percent: number | null
  management_fee_percent: number | null
  carried_interest_percent: number | null
  management_fee_clause: string | null
  performance_fee_clause: string | null
}

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
}

interface Signatory {
  id: string
  full_name: string
  email: string
  role: string
}

interface Opportunity {
  id: string
  name: string
  description: string | null
  investment_thesis: string | null
  status: string
  deal_type: string | null
  currency: string
  minimum_investment: number | null
  maximum_investment: number | null
  target_amount: number | null
  raised_amount: number | null
  open_at: string | null
  close_at: string | null
  company_name: string | null
  company_logo_url: string | null
  company_website: string | null
  sector: string | null
  stage: string | null
  location: string | null
  stock_type: string | null
  deal_round: string | null
  vehicle: {
    id: string
    name: string
    type: string
  } | null
  has_membership: boolean
  membership: {
    role: string
    dispatched_at: string | null
    viewed_at: string | null
    interest_confirmed_at: string | null
    nda_signed_at: string | null
    data_room_granted_at: string | null
  } | null
  journey: {
    current_stage: number
    stages: any[]
    summary: {
      received: string | null
      viewed: string | null
      interest_confirmed: string | null
      nda_signed: string | null
      data_room_access: string | null
      pack_generated: string | null
      pack_sent: string | null
      signed: string | null
      funded: string | null
      active: string | null
    }
  }
  data_room: {
    has_access: boolean
    access_details: {
      granted_at: string
      expires_at: string | null
      auto_granted: boolean
    } | null
    documents: Document[]
    requires_nda: boolean
  }
  subscription: {
    id: string
    status: string
    commitment: number | null
    funded_amount: number | null
    is_signed: boolean
    is_funded: boolean
    is_active: boolean
  } | null
  fee_structures: FeeStructure[]
  faqs: FAQ[]
  signatories: Signatory[]
  can_express_interest: boolean
  can_sign_nda: boolean
  can_access_data_room: boolean
  can_subscribe: boolean
  can_sign_subscription: boolean
}

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dealId = params.id as string
  const actionParam = searchParams.get('action')

  const { hasAnyPersona, isLoading: personaLoading } = usePersona()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [showInterestDialog, setShowInterestDialog] = useState(false)
  const [showNdaDialog, setShowNdaDialog] = useState(false)
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false)
  const [subscribeAmount, setSubscribeAmount] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchOpportunity() {
      try {
        setLoading(true)

        // Record view
        await fetch(`/api/investors/me/opportunities/${dealId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'view' })
        })

        const response = await fetch(`/api/investors/me/opportunities/${dealId}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch opportunity (${response.status})`)
        }
        setOpportunity(data.opportunity)

        // Handle action param
        if (actionParam === 'subscribe' && data.opportunity.can_subscribe) {
          setShowSubscribeDialog(true)
        }
      } catch (err) {
        console.error('Error fetching opportunity:', err)
        setError('Failed to load opportunity details')
      } finally {
        setLoading(false)
      }
    }

    if (hasAnyPersona && dealId) {
      fetchOpportunity()
    }
  }, [hasAnyPersona, dealId, actionParam])

  const handleExpressInterest = async () => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/investors/me/opportunities/${dealId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'express_interest' })
      })

      if (!response.ok) throw new Error('Failed to express interest')

      // Refresh data
      const refreshResponse = await fetch(`/api/investors/me/opportunities/${dealId}`)
      const data = await refreshResponse.json()
      setOpportunity(data.opportunity)
      setShowInterestDialog(false)
    } catch (err) {
      console.error('Error expressing interest:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSignNda = async () => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/investors/me/opportunities/${dealId}/nda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to initiate NDA signing')
      }

      const result = await response.json()

      // Refresh data to update status
      const refreshResponse = await fetch(`/api/investors/me/opportunities/${dealId}`)
      const data = await refreshResponse.json()
      setOpportunity(data.opportunity)
      setShowNdaDialog(false)

      // Show success message
      alert(`NDA signing initiated! ${result.signature_requests} signatory(ies) will receive signing requests.`)
    } catch (err: any) {
      console.error('Error initiating NDA:', err)
      alert(err.message || 'Failed to initiate NDA signing')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!subscribeAmount || !opportunity) return

    try {
      setActionLoading(true)

      // Create subscription via direct subscribe endpoint
      const response = await fetch(`/api/investors/me/opportunities/${dealId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitment_amount: parseFloat(subscribeAmount),
          vehicle_id: opportunity.vehicle?.id
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to subscribe')
      }

      // Refresh data
      const refreshResponse = await fetch(`/api/investors/me/opportunities/${dealId}`)
      const data = await refreshResponse.json()
      setOpportunity(data.opportunity)
      setShowSubscribeDialog(false)
      setSubscribeAmount('')
    } catch (err: any) {
      console.error('Error subscribing:', err)
      alert(err.message || 'Failed to subscribe')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}/download?mode=download`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to download')
      }

      const downloadUrl = result.download_url || result.url
      if (!downloadUrl) {
        throw new Error('Download link unavailable')
      }

      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Error downloading document:', err)
    }
  }

  // Show loading while persona context is initializing
  if (personaLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!hasAnyPersona) {
    return (
      <div className="p-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              You need to be associated with an entity to view this opportunity.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="p-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Opportunity not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/versotech_main/opportunities')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push('/versotech_main/opportunities')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Opportunities
      </Button>

      {/* Journey Progress Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Investment Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestorJourneyBar
            summary={opportunity.journey.summary}
            currentStage={opportunity.journey.current_stage}
          />
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-start gap-6">
        {opportunity.company_logo_url ? (
          <Image
            src={opportunity.company_logo_url}
            alt={opportunity.company_name || opportunity.name}
            width={80}
            height={80}
            className="rounded-xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{opportunity.name}</h1>
          {opportunity.company_name && (
            <p className="text-muted-foreground">{opportunity.company_name}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {opportunity.sector && (
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                {opportunity.sector}
              </Badge>
            )}
            {opportunity.stage && (
              <Badge variant="outline">{opportunity.stage}</Badge>
            )}
            {opportunity.location && (
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                {opportunity.location}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {opportunity.can_express_interest && (
            <Button onClick={() => setShowInterestDialog(true)}>
              Express Interest
            </Button>
          )}
          {opportunity.can_sign_nda && (
            <Button onClick={() => setShowNdaDialog(true)}>
              <FileSignature className="w-4 h-4 mr-2" />
              Sign NDA
            </Button>
          )}
          {opportunity.can_subscribe && (
            <Button onClick={() => setShowSubscribeDialog(true)}>
              Subscribe Now
            </Button>
          )}
          {opportunity.subscription && !opportunity.subscription.is_active && (
            <Badge className="justify-center py-2" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              {opportunity.subscription.is_funded ? 'Awaiting Activation' :
               opportunity.subscription.is_signed ? 'Awaiting Funding' :
               'Awaiting Signature'}
            </Badge>
          )}
          {opportunity.subscription?.is_active && (
            <Badge className="justify-center py-2 bg-emerald-500">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Active Investment
            </Badge>
          )}
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-room" className="relative">
            Data Room
            {!opportunity.data_room.has_access && (
              <Lock className="w-3 h-3 ml-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Investment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Target Raise</Label>
                    <p className="font-medium">{formatCurrency(opportunity.target_amount, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Raised</Label>
                    <p className="font-medium">{formatCurrency(opportunity.raised_amount, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Min Investment</Label>
                    <p className="font-medium">{formatCurrency(opportunity.minimum_investment, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Max Investment</Label>
                    <p className="font-medium">{formatCurrency(opportunity.maximum_investment, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Closing Date</Label>
                    <p className="font-medium">{formatDate(opportunity.close_at)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Deal Type</Label>
                    <p className="font-medium">{opportunity.deal_type || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunity.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1">{opportunity.description}</p>
                  </div>
                )}
                {opportunity.investment_thesis && (
                  <div>
                    <Label className="text-muted-foreground">Investment Thesis</Label>
                    <p className="mt-1">{opportunity.investment_thesis}</p>
                  </div>
                )}
                {opportunity.company_website && (
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <a
                      href={opportunity.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline mt-1"
                    >
                      <Globe className="w-4 h-4" />
                      {opportunity.company_website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fee Structures */}
          {opportunity.fee_structures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure</CardTitle>
              </CardHeader>
              <CardContent>
                {opportunity.fee_structures.map((fee) => (
                  <div key={fee.id} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {fee.subscription_fee_percent !== null && (
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="text-sm text-muted-foreground">Subscription Fee</div>
                          <div className="text-2xl font-bold">{fee.subscription_fee_percent}%</div>
                        </div>
                      )}
                      {fee.management_fee_percent !== null && (
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="text-sm text-muted-foreground">Management Fee</div>
                          <div className="text-2xl font-bold">{fee.management_fee_percent}%</div>
                          {fee.management_fee_clause && (
                            <div className="text-sm text-muted-foreground mt-1">{fee.management_fee_clause}</div>
                          )}
                        </div>
                      )}
                      {fee.carried_interest_percent !== null && (
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="text-sm text-muted-foreground">Carried Interest</div>
                          <div className="text-2xl font-bold">{fee.carried_interest_percent}%</div>
                          {fee.performance_fee_clause && (
                            <div className="text-sm text-muted-foreground mt-1">{fee.performance_fee_clause}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Signatories */}
          {opportunity.signatories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Authorized Signatories
                </CardTitle>
                <CardDescription>
                  These signatories will need to sign the NDA and subscription documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opportunity.signatories.map((signatory) => (
                    <div key={signatory.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{signatory.full_name}</div>
                        <div className="text-sm text-muted-foreground">{signatory.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Room Tab */}
        <TabsContent value="data-room" className="space-y-4">
          {!opportunity.data_room.has_access ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Data Room Access Required</h3>
                <p className="text-muted-foreground mb-4">
                  {opportunity.data_room.requires_nda
                    ? 'Please sign the NDA to access the data room documents.'
                    : 'Data room access will be granted shortly.'}
                </p>
                {opportunity.can_sign_nda && (
                  <Button onClick={() => setShowNdaDialog(true)}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Sign NDA
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {opportunity.data_room.access_details && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Access granted: {formatDate(opportunity.data_room.access_details.granted_at)}
                      </div>
                      {opportunity.data_room.access_details.expires_at && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Clock className="w-4 h-4" />
                          Expires: {formatDate(opportunity.data_room.access_details.expires_at)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {opportunity.data_room.documents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
                    <p className="text-muted-foreground">
                      Documents will be available once uploaded by the deal team.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>
                      {opportunity.data_room.documents.length} document(s) available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {opportunity.data_room.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <div className="font-medium">{doc.file_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {doc.category} • {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          {opportunity.faqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No FAQs Available</h3>
                <p className="text-muted-foreground">
                  Frequently asked questions will be added by the deal team.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {opportunity.faqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Express Interest Dialog */}
      <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
            <DialogDescription>
              Confirm your interest in {opportunity.name}. This will notify the deal team and you&apos;ll receive
              the NDA to sign.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExpressInterest} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm Interest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NDA Dialog */}
      <Dialog open={showNdaDialog} onOpenChange={setShowNdaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Non-Disclosure Agreement</DialogTitle>
            <DialogDescription>
              Review and sign the NDA to access the data room documents. All authorized signatories
              ({opportunity.signatories.length}) will need to sign.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Multi-Signatory Required</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Each authorized signatory will receive a separate NDA to sign. Data room access
                    will be granted once all signatories have completed signing.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNdaDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignNda}>
              <FileSignature className="w-4 h-4 mr-2" />
              Proceed to Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {opportunity.name}</DialogTitle>
            <DialogDescription>
              Enter your commitment amount to proceed with the subscription. The subscription
              documents will be sent to all authorized signatories.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Commitment Amount ({opportunity.currency})</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Min: ${formatCurrency(opportunity.minimum_investment, opportunity.currency)}`}
                value={subscribeAmount}
                onChange={(e) => setSubscribeAmount(e.target.value)}
              />
              {opportunity.minimum_investment && opportunity.maximum_investment && (
                <p className="text-sm text-muted-foreground">
                  Range: {formatCurrency(opportunity.minimum_investment, opportunity.currency)} - {formatCurrency(opportunity.maximum_investment, opportunity.currency)}
                </p>
              )}
            </div>

            {opportunity.signatories.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      {opportunity.signatories.length} Signatory(ies) Required
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Subscription documents will be sent to all authorized signatories for execution.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={actionLoading || !subscribeAmount || (opportunity.minimum_investment !== null && parseFloat(subscribeAmount) < opportunity.minimum_investment)}
            >
              {actionLoading ? 'Processing...' : 'Subscribe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
