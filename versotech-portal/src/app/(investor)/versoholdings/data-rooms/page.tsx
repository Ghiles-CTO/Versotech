import { AppLayout } from '@/components/layout/app-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Image from 'next/image'
import {
  AlertCircle,
  CalendarClock,
  Clock8,
  FileText,
  ShieldCheck,
  Users,
  Handshake
} from 'lucide-react'
import { RequestExtensionButton } from '@/components/deals/request-extension-button'
import { DataRoomDocuments, DataRoomDocument } from '@/components/deals/data-room-documents'
import { NotifySimilarButton } from '@/components/deals/notify-similar-button'
import { SubmitSubscriptionForm } from '@/components/deals/submit-subscription-form'

export const dynamic = 'force-dynamic'

interface AccessRecord {
  id: string
  deal_id: string
  investor_id: string
  granted_at: string
  expires_at: string | null
  auto_granted: boolean
  notes: string | null
}

interface DealSummary {
  id: string
  name: string
  company_name: string | null
  company_logo_url: string | null
  company_website: string | null
  stage: string | null
  sector: string | null
  location: string | null
  close_at: string | null
  currency: string | null
}

interface InvestorSubscription {
  id: string
  deal_id: string
  status: string
  submitted_at: string
  payload_json: Record<string, any>
}

function formatDate(value: string | null, fallback = 'Open ended') {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return fallback
  return parsed.toLocaleDateString()
}

function daysUntil(date: string | null) {
  if (!date) return null
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function DataRoomsPage() {
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
    return (
      <AppLayout brand="versoholdings">
        <div className="p-6">
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No investor profile linked
            </h3>
            <p className="text-gray-500">
              Contact the VERSO team to activate your investor account.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const investorIds = investorLinks.map(link => link.investor_id)
  const primaryInvestorId = investorIds[0]

  const { data: accessData } = await serviceSupabase
    .from('deal_data_room_access')
    .select('id, deal_id, investor_id, granted_at, expires_at, auto_granted, notes, revoked_at')
    .in('investor_id', investorIds)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  const activeAccess: AccessRecord[] = (accessData ?? []) as AccessRecord[]

  const dealIds = Array.from(new Set(activeAccess.map(access => access.deal_id)))

  let dealSummaries: DealSummary[] = []
  let documents: DataRoomDocument[] = []
  let subscriptions: InvestorSubscription[] = []

  if (dealIds.length > 0) {
    const { data: deals } = await serviceSupabase
      .from('deals')
      .select('id, name, company_name, company_logo_url, company_website, stage, sector, location, close_at, currency')
      .in('id', dealIds)

    dealSummaries = deals ?? []

    const { data: docs } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('id, deal_id, folder, file_key, file_name, created_at')
      .in('deal_id', dealIds)
      .eq('visible_to_investors', true)
      .order('folder', { ascending: true })
      .order('file_name', { ascending: true })

    documents = (docs ?? []) as DataRoomDocument[]

    const { data: subscriptionRows } = await serviceSupabase
      .from('deal_subscription_submissions')
      .select('id, deal_id, status, submitted_at, payload_json')
      .in('deal_id', dealIds)
      .eq('investor_id', primaryInvestorId)
      .order('submitted_at', { ascending: false })

    subscriptions = (subscriptionRows ?? []) as InvestorSubscription[]
  }

  const documentsByDeal = documents.reduce<Record<string, DataRoomDocument[]>>((acc, doc) => {
    if (!acc[doc.deal_id]) {
      acc[doc.deal_id] = []
    }
    acc[doc.deal_id].push(doc)
    return acc
  }, {})

  const dealById = dealSummaries.reduce<Record<string, DealSummary>>((acc, deal) => {
    acc[deal.id] = deal
    return acc
  }, {})

  const subscriptionsByDeal = subscriptions.reduce<Record<string, InvestorSubscription[]>>((acc, submission) => {
    if (!acc[submission.deal_id]) {
      acc[submission.deal_id] = []
    }
    acc[submission.deal_id].push(submission)
    return acc
  }, {})

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Data Rooms</h1>
          <p className="text-gray-600">
            Review diligence documents, track access windows, and request support directly from the VERSO team.
          </p>
        </header>

        {activeAccess.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg bg-white">
            <ShieldCheck className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No data rooms unlocked yet</h2>
            <p className="text-gray-500">
              Submit interest on a deal or complete NDA requirements to unlock its data room.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeAccess.map((access) => {
              const deal = dealById[access.deal_id]
              const docsForDeal = documentsByDeal[access.deal_id] ?? []
              const submissionsForDeal = subscriptionsByDeal[access.deal_id] ?? []
              const daysRemaining = daysUntil(access.expires_at)
              const showExtension = daysRemaining !== null && daysRemaining <= 7

              return (
                <Card key={access.id} className="border border-gray-200 shadow-sm">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-3">
                        {deal?.company_logo_url ? (
                          <Image
                            src={deal.company_logo_url}
                            alt={`${deal.company_name ?? deal.name} logo`}
                            width={56}
                            height={56}
                            className="rounded-lg object-contain bg-white border border-gray-200 p-2"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-semibold">
                            {deal?.name?.charAt(0) ?? 'D'}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl text-gray-900">
                            {deal?.name ?? 'Deal'}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            {deal?.company_name ?? 'Issuer pending'}
                            {deal?.stage && <span className="text-gray-400">• {deal.stage}</span>}
                            {deal?.sector && <span className="text-gray-400">• {deal.sector}</span>}
                          </CardDescription>
                          {deal?.location && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3 text-emerald-500" />
                              {deal.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2 justify-end">
                          <CalendarClock className="h-4 w-4 text-gray-400" />
                          Granted {formatDate(access.granted_at)}
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Clock8 className="h-4 w-4 text-gray-400" />
                          {access.expires_at ? `Expires ${formatDate(access.expires_at)}` : 'No expiry'}
                        </div>
                        {deal?.close_at && (
                          <p className="text-xs text-gray-500">
                            Deal closes {formatDate(deal.close_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline">
                        Access type: {access.auto_granted ? 'Auto' : 'Manual'} approval
                      </Badge>
                      <Badge variant="outline">
                        {docsForDeal.length} document{docsForDeal.length === 1 ? '' : 's'}
                      </Badge>
                      {daysRemaining !== null && daysRemaining <= 3 && (
                        <Badge className="bg-amber-100 text-amber-700">
                          Expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Available documents
                      </div>
                      <DataRoomDocuments documents={docsForDeal} />
                    </section>

                    <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        {access.notes
                          ? access.notes
                          : 'Keep documents confidential. Reach out if you need clarifications or additional files.'}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {showExtension && (
                          <RequestExtensionButton
                            dealId={access.deal_id}
                            investorId={primaryInvestorId}
                          />
                        )}
                        <NotifySimilarButton
                          dealId={access.deal_id}
                          investorId={primaryInvestorId}
                        />
                      </div>
                    </section>

                    <section className="border-t pt-4 mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Handshake className="h-4 w-4 text-emerald-600" />
                          Submit Subscription Intent
                        </div>
                        {submissionsForDeal.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {submissionsForDeal[0].status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Share your definitive allocation request once diligence is complete. The VERSO team will review and respond.
                      </p>
                      <SubmitSubscriptionForm
                        dealId={access.deal_id}
                        currency={deal?.currency ?? 'USD'}
                        existingSubmission={submissionsForDeal[0] ?? null}
                      />
                    </section>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
