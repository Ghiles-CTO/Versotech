import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Globe,
  MapPin,
  Download,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { InterestModal } from '@/components/deals/interest-modal'
import { AskQuestionButton } from '@/components/deals/ask-question-button'

export const dynamic = 'force-dynamic'

interface DealDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id: dealId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versoholdings/login')
  }

  const serviceSupabase = createServiceClient()

  // Get investor ID
  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  if (!investorLinks || investorLinks.length === 0) {
    redirect('/versoholdings/deals')
  }

  const investorId = investorLinks[0].investor_id

  // Fetch deal with all related data
  const { data: deal, error: dealError } = await serviceSupabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type
      ),
      deal_memberships!inner (
        role,
        accepted_at
      )
    `)
    .eq('id', dealId)
    .eq('deal_memberships.investor_id', investorId)
    .single()

  if (dealError || !deal) {
    return (
      <AppLayout brand="versoholdings">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal not found</h2>
            <p className="text-gray-600">The requested deal could not be found or you don&apos;t have access to it.</p>
            <Link href="/versoholdings/deals">
              <Button className="mt-4">Back to Deals</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Fetch fee structure
  const { data: feeStructures } = await serviceSupabase
    .from('deal_fee_structures')
    .select('*')
    .eq('deal_id', dealId)
    .eq('status', 'published')
    .order('effective_at', { ascending: false })
    .limit(1)

  const feeStructure = feeStructures?.[0] ?? null

  // Fetch investor's interest
  const { data: interests } = await serviceSupabase
    .from('investor_deal_interest')
    .select('*')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .order('submitted_at', { ascending: false })
    .limit(1)

  const interest = interests?.[0] ?? null

  // Fetch data room access
  const { data: dataRoomAccess } = await serviceSupabase
    .from('deal_data_room_access')
    .select('*')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })
    .limit(1)

  const hasDataRoomAccess = dataRoomAccess && dataRoomAccess.length > 0

  // Fetch subscription
  const { data: subscriptions } = await serviceSupabase
    .from('deal_subscription_submissions')
    .select('*')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .order('submitted_at', { ascending: false })
    .limit(1)

  const subscription = subscriptions?.[0] ?? null

  // Determine effective status
  const getEffectiveStatus = () => {
    if (deal.status === 'closed' || deal.status === 'cancelled') {
      return deal.status
    }
    if (deal.close_at && new Date(deal.close_at) < new Date()) {
      return 'closed'
    }
    return deal.status
  }

  const effectiveStatus = getEffectiveStatus()
  const isClosed = effectiveStatus === 'closed'

  const statusBadges: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    open: 'bg-emerald-100 text-emerald-700',
    allocation_pending: 'bg-amber-100 text-amber-700',
    closed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-rose-100 text-rose-700'
  }

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null || amount === undefined) return '—'
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: amount >= 1000 ? 0 : 2
      }).format(amount)
    } catch {
      return `${currency ?? ''} ${amount.toLocaleString()}`
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const interestStatusMeta: Record<string, { label: string; tone: string }> = {
    pending_review: { label: 'Pending review', tone: 'bg-amber-100 text-amber-700' },
    approved: { label: 'NDA active', tone: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Declined', tone: 'bg-rose-100 text-rose-700' },
    withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100 text-slate-700' }
  }

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Back button */}
        <Link href="/versoholdings/deals">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deals
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {deal.company_logo_url ? (
              <Image
                src={deal.company_logo_url}
                alt={`${deal.company_name ?? deal.name} logo`}
                width={80}
                height={80}
                className="rounded-lg object-contain bg-white border border-gray-200 p-3"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-semibold">
                {deal.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={statusBadges[effectiveStatus] ?? statusBadges.draft}>
                  {effectiveStatus.replace(/_/g, ' ').toUpperCase()}
                </Badge>
                {deal.company_name && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {deal.company_name}
                  </p>
                )}
              </div>
              {deal.company_website && (
                <a
                  href={deal.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mt-2"
                >
                  <Globe className="h-4 w-4" />
                  Visit website
                </a>
              )}
            </div>
          </div>

          <div className="text-right space-y-2">
            {deal.close_at && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {isClosed ? 'Closed' : 'Closes'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(deal.close_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Status */}
        {interest && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">Your Interest Status</p>
                    <p className="text-sm text-amber-700">
                      Submitted {formatDate(interest.submitted_at)}
                    </p>
                  </div>
                </div>
                <Badge className={interestStatusMeta[interest.status]?.tone ?? 'bg-gray-100'}>
                  {interestStatusMeta[interest.status]?.label ?? interest.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.description && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{deal.description}</p>
                  </div>
                )}
                {deal.investment_thesis && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Investment Thesis</h3>
                    <p className="text-gray-600">{deal.investment_thesis}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {deal.sector && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Sector</p>
                      <p className="font-medium text-gray-900">{deal.sector}</p>
                    </div>
                  )}
                  {deal.stage && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Stage</p>
                      <p className="font-medium text-gray-900">{deal.stage}</p>
                    </div>
                  )}
                  {deal.location && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {deal.location}
                      </p>
                    </div>
                  )}
                  {deal.vehicles && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
                      <p className="font-medium text-gray-900">{deal.vehicles.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Term Sheet */}
            {feeStructure && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Term Sheet
                  </CardTitle>
                  <CardDescription>
                    {feeStructure.term_sheet_date && `Published ${formatDate(feeStructure.term_sheet_date)}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Opportunity Summary - Show first */}
                  {feeStructure.opportunity_summary && (
                    <div className="pb-4">
                      <h4 className="font-semibold text-sm mb-2">Opportunity</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{feeStructure.opportunity_summary}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Transaction Details */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Transaction Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Transaction Type</p>
                        <p className="font-medium text-gray-900">{feeStructure.transaction_type ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Issuer</p>
                        <p className="font-medium text-gray-900">{feeStructure.issuer ?? deal.company_name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
                        <p className="font-medium text-gray-900">{feeStructure.vehicle ?? deal.vehicles?.name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Exclusive Arranger</p>
                        <p className="font-medium text-gray-900">{feeStructure.exclusive_arranger ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Purchaser</p>
                        <p className="font-medium text-gray-900">{feeStructure.purchaser ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Seller</p>
                        <p className="font-medium text-gray-900">{feeStructure.seller ?? '—'}</p>
                      </div>
                      {feeStructure.structure && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Structure</p>
                          <p className="font-medium text-gray-900">{feeStructure.structure}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Investment Terms */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Investment Terms</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Allocation Up To</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(feeStructure.allocation_up_to, deal.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Price Per Share</p>
                        <p className="font-medium text-gray-900">
                          {feeStructure.price_per_share_text ??
                            (deal.offer_unit_price ? formatCurrency(deal.offer_unit_price, deal.currency) : '—')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Minimum Ticket</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(feeStructure.minimum_ticket, deal.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Maximum Ticket</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(feeStructure.maximum_ticket, deal.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Fee Structure */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Fee Structure</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Subscription Fee</p>
                        <p className="font-medium text-gray-900">
                          {feeStructure.subscription_fee_percent !== null
                            ? `${(feeStructure.subscription_fee_percent * 100).toFixed(2)}%`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Management Fee</p>
                        <p className="font-medium text-gray-900">
                          {feeStructure.management_fee_percent !== null
                            ? `${(feeStructure.management_fee_percent * 100).toFixed(2)}% p.a.`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Carried Interest</p>
                        <p className="font-medium text-gray-900">
                          {feeStructure.carried_interest_percent !== null
                            ? `${(feeStructure.carried_interest_percent * 100).toFixed(2)}%`
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {feeStructure.legal_counsel && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Legal Counsel</p>
                          <p className="font-medium text-gray-900">{feeStructure.legal_counsel}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Timeline & Deadlines */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Timeline & Deadlines</h4>
                    <div className="space-y-3">
                      {feeStructure.interest_confirmation_deadline && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Interest Confirmation Deadline</p>
                          <p className="font-medium text-gray-900">
                            {new Date(feeStructure.interest_confirmation_deadline).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZoneName: 'short'
                            })}
                          </p>
                        </div>
                      )}
                      {feeStructure.capital_call_timeline && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Capital Call Timeline</p>
                          <p className="font-medium text-gray-900 text-sm">{feeStructure.capital_call_timeline}</p>
                        </div>
                      )}
                      {feeStructure.completion_date_text && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Completion Date</p>
                          <p className="font-medium text-gray-900">{feeStructure.completion_date_text}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Terms */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Additional Terms</h4>
                    <div className="space-y-3 text-sm">
                      {feeStructure.in_principle_approval_text && (
                        <div>
                          <p className="font-medium text-gray-700">In Principle Approval</p>
                          <p className="text-gray-600">{feeStructure.in_principle_approval_text}</p>
                        </div>
                      )}
                      {feeStructure.subscription_pack_note && (
                        <div>
                          <p className="font-medium text-gray-700">Subscription Pack</p>
                          <p className="text-gray-600">{feeStructure.subscription_pack_note}</p>
                        </div>
                      )}
                      {feeStructure.share_certificates_note && (
                        <div>
                          <p className="font-medium text-gray-700">Share Certificates</p>
                          <p className="text-gray-600">{feeStructure.share_certificates_note}</p>
                        </div>
                      )}
                      {feeStructure.subject_to_change_note && (
                        <div>
                          <p className="font-medium text-gray-700">Subject to Change</p>
                          <p className="text-gray-600">{feeStructure.subject_to_change_note}</p>
                        </div>
                      )}
                      {feeStructure.validity_date && (
                        <div>
                          <p className="font-medium text-gray-700">Validity</p>
                          <p className="text-gray-600">
                            This term sheet expires on {new Date(feeStructure.validity_date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZoneName: 'short'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {feeStructure.term_sheet_attachment_key && (
                    <Button variant="outline" className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Download Full Term Sheet
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InterestModal
                  dealId={deal.id}
                  dealName={deal.name}
                  currency={deal.currency}
                  investorId={investorId}
                  defaultAmount={interest?.indicative_amount}
                  isClosed={isClosed}
                >
                  <Button className="w-full gap-2" variant={isClosed ? 'secondary' : 'default'}>
                    <Sparkles className="h-4 w-4" />
                    {isClosed ? "Notify Me About Similar" : interest ? "Update Interest" : "I'm interested"}
                  </Button>
                </InterestModal>

                {hasDataRoomAccess && (
                  <Link href="/versoholdings/data-rooms">
                    <Button variant="outline" className="w-full gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Access Data Room
                    </Button>
                  </Link>
                )}

                <AskQuestionButton
                  dealId={deal.id}
                  dealName={deal.name}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {deal.open_at && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Deal Opened</p>
                        <p className="text-xs text-gray-500">{formatDate(deal.open_at)}</p>
                      </div>
                    </div>
                  )}
                  {feeStructure?.interest_confirmation_deadline && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Clock className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Interest Deadline</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(feeStructure.interest_confirmation_deadline)}
                        </p>
                      </div>
                    </div>
                  )}
                  {deal.close_at && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isClosed ? (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Calendar className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Deal Closes</p>
                        <p className="text-xs text-gray-500">{formatDate(deal.close_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deal Type</span>
                  <span className="font-medium">{deal.deal_type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency</span>
                  <span className="font-medium">{deal.currency}</span>
                </div>
                {feeStructure?.structure && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Structure</span>
                    <span className="font-medium">{feeStructure.structure}</span>
                  </div>
                )}
                {feeStructure?.legal_counsel && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Legal Counsel</span>
                    <span className="font-medium">{feeStructure.legal_counsel}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
