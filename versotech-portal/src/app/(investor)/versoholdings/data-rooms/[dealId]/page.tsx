import { AppLayout } from '@/components/layout/app-layout'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  Briefcase,
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Target,
  Info,
  Shield,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import { DataRoomDocumentsGrouped } from '@/components/deals/data-room-documents-grouped'
import { DataRoomDocument } from '@/components/deals/data-room-documents'
import { SubmitSubscriptionForm } from '@/components/deals/submit-subscription-form'
import { RequestExtensionButton } from '@/components/deals/request-extension-button'
import { DealFaqSection } from '@/components/deals/deal-faq-section'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ dealId: string }>
}

function formatDate(value: string | null) {
  if (!value) return 'Not specified'
  const date = new Date(value)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function daysUntil(date: string | null) {
  if (!date) return null
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatCurrency(amount: number | string | null, currency: string = 'USD'): string {
  if (!amount) return 'Not specified'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function formatProgress(raised: number | string | null, target: number | string | null): string {
  if (!raised || !target) return '0%'
  const r = typeof raised === 'string' ? parseFloat(raised) : raised
  const t = typeof target === 'string' ? parseFloat(target) : target
  if (t === 0) return '0%'
  const percentage = (r / t) * 100
  return `${percentage.toFixed(1)}%`
}

export default async function DataRoomDetailPage({ params }: PageProps) {
  const { dealId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Authentication required')
  }

  const serviceSupabase = createServiceClient()

  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  if (!investorLinks || investorLinks.length === 0) {
    notFound()
  }

  const investorIds = investorLinks.map(link => link.investor_id)
  const primaryInvestorId = investorIds[0]

  // Check access (must not be revoked AND must not be expired)
  const now = new Date().toISOString()
  const { data: accessData } = await serviceSupabase
    .from('deal_data_room_access')
    .select('*')
    .eq('deal_id', dealId)
    .in('investor_id', investorIds)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .single()

  if (!accessData) {
    notFound()
  }

  // Get comprehensive deal data
  const { data: deal } = await serviceSupabase
    .from('deals')
    .select(`
      id,
      name,
      company_name,
      company_logo_url,
      stage,
      sector,
      location,
      currency,
      description,
      investment_thesis,
      deal_type,
      minimum_investment,
      maximum_investment,
      target_amount,
      raised_amount,
      offer_unit_price,
      open_at,
      close_at,
      terms_schema
    `)
    .eq('id', dealId)
    .single()

  if (!deal) {
    notFound()
  }

  // Get fee structure
  const { data: feeStructure } = await serviceSupabase
    .from('deal_fee_structures')
    .select('*')
    .eq('deal_id', dealId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .single()

  // Get documents
  const { data: documents } = await serviceSupabase
    .from('deal_data_room_documents')
    .select('id, deal_id, folder, file_key, file_name, created_at, external_link, is_featured')
    .eq('deal_id', dealId)
    .eq('visible_to_investors', true)
    .order('folder', { ascending: true })
    .order('file_name', { ascending: true })

  const docs = (documents ?? []) as DataRoomDocument[]

  // Get submissions
  const { data: submissions } = await serviceSupabase
    .from('deal_subscription_submissions')
    .select('id, status, submitted_at, payload_json')
    .eq('deal_id', dealId)
    .eq('investor_id', primaryInvestorId)
    .order('submitted_at', { ascending: false })

  const latestSubmission = submissions?.[0] ?? null
  const daysRemaining = daysUntil(accessData.expires_at)

  return (
    <AppLayout brand="versoholdings">
      <div className="p-4 max-w-[1600px] mx-auto space-y-4">
        {/* Back button */}
        <Link
          href="/versotech_main/data-rooms"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Data Rooms
        </Link>

        {/* Deal header with timeline */}
        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              {deal.company_logo_url ? (
                <Image
                  src={deal.company_logo_url}
                  alt={`${deal.company_name ?? deal.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-lg object-contain bg-white border-2 border-gray-200 p-2"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600 text-2xl font-semibold">
                  {deal.name?.charAt(0) ?? 'D'}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black">{deal.name}</h1>
                <div className="flex items-center gap-2 text-lg text-black mt-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  {deal.company_name ?? 'Issuer pending'}
                </div>
                {(deal.stage || deal.sector || deal.location) && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {deal.stage && <Badge variant="outline" className="text-sm border-gray-300 text-black bg-white">{deal.stage}</Badge>}
                    {deal.sector && <Badge variant="outline" className="text-sm border-gray-300 text-black bg-white">{deal.sector}</Badge>}
                    {deal.location && <Badge variant="outline" className="text-sm border-gray-300 text-black bg-white">{deal.location}</Badge>}
                  </div>
                )}
              </div>
              {latestSubmission && (
                <Badge variant="outline" className="text-sm border-blue-300 bg-blue-50 text-blue-700">
                  {latestSubmission.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>

          {/* Timeline bar */}
          <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Access granted:</span>
                  <span className="font-medium text-black">{formatDate(accessData.granted_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium text-black">
                    {accessData.expires_at ? formatDate(accessData.expires_at) : 'No expiry'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {daysRemaining !== null && daysRemaining <= 7 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-700 font-medium">
                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                )}
                <RequestExtensionButton
                  dealId={dealId}
                  dealName={deal.name}
                  expiresAt={accessData.expires_at}
                  daysRemaining={daysRemaining}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column - Documents & Information */}
          <div className="space-y-4">
            {/* 1. Deal Documents - PRIMARY CONTENT AT TOP */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xl font-semibold text-black">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Deal Documents
                </div>
                <Badge variant="outline" className="text-sm">
                  {docs.length} file{docs.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <DataRoomDocumentsGrouped documents={docs} />
            </div>

            {/* 2. Notes section if present */}
            {accessData.notes && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">Important Notes from VERSO Team</p>
                    <p className="text-sm text-amber-800">{accessData.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Investment Overview */}
            {(deal.description || deal.investment_thesis) && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-black mb-4">
                  <Info className="h-5 w-5 text-blue-600" />
                  Investment Overview
                </div>
                {deal.description && (
                  <p className="text-sm text-black mb-3">{deal.description}</p>
                )}
                {deal.investment_thesis && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-black mb-1">Investment Thesis</p>
                    <p className="text-sm text-gray-700">{deal.investment_thesis}</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. Investment Terms */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-black mb-4">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Investment Terms
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Minimum Investment</p>
                  <p className="text-base font-semibold text-black">
                    {formatCurrency(deal.minimum_investment, deal.currency || 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Maximum Investment</p>
                  <p className="text-base font-semibold text-black">
                    {formatCurrency(deal.maximum_investment, deal.currency || 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Unit Price</p>
                  <p className="text-base font-semibold text-black">
                    {deal.offer_unit_price
                      ? formatCurrency(deal.offer_unit_price, deal.currency || 'USD') + ' per share'
                      : 'To be determined'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Deal Type</p>
                  <p className="text-base font-semibold text-black capitalize">
                    {deal.deal_type?.replace('_', ' ') || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Target Raise</p>
                  <p className="text-base font-semibold text-black">
                    {formatCurrency(deal.target_amount, deal.currency || 'USD')}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Fee Structure */}
            {feeStructure && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-black mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Fee Structure
                </div>
                <div className="space-y-3">
                  {feeStructure.management_fee_percent && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Management Fee</span>
                      <span className="text-sm font-semibold text-black">
                        {feeStructure.management_fee_percent}% annually
                      </span>
                    </div>
                  )}
                  {feeStructure.subscription_fee_percent && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Subscription Fee</span>
                      <span className="text-sm font-semibold text-black">
                        {feeStructure.subscription_fee_percent}%
                      </span>
                    </div>
                  )}
                  {feeStructure.carried_interest_percent && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Carried Interest</span>
                      <span className="text-sm font-semibold text-black">
                        {feeStructure.carried_interest_percent}%
                      </span>
                    </div>
                  )}
                  {feeStructure.minimum_ticket && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Minimum Ticket Size</span>
                      <span className="text-sm font-semibold text-black">
                        {feeStructure.minimum_ticket}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. FAQ Section */}
            <DealFaqSection dealId={dealId} />
          </div>

          {/* Right Column - Subscription Form (Sticky) */}
          <div className="lg:sticky lg:top-4">
            {/* Subscription Form - PROMINENT */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center bg-white rounded-full p-4 mb-4">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Submit Subscription</h3>
                <p className="text-blue-100 text-base">
                  Ready to invest? Complete your allocation request below.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <SubmitSubscriptionForm
                  dealId={deal.id}
                  currency={deal.currency ?? 'USD'}
                  existingSubmission={latestSubmission}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}