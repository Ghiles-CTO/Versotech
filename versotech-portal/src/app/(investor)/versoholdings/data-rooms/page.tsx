import { AppLayout } from '@/components/layout/app-layout'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import { DataRoomDocument } from '@/components/deals/data-room-documents'
import { DataRoomPreviewCard } from '@/components/deals/data-room-preview-card'

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
  return parsed.toLocaleDateString(undefined, { timeZone: 'UTC' })
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

  const now = new Date().toISOString()
  const { data: accessData } = await serviceSupabase
    .from('deal_data_room_access')
    .select('id, deal_id, investor_id, granted_at, expires_at, auto_granted, notes, revoked_at')
    .in('investor_id', investorIds)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('granted_at', { ascending: false })

  const activeAccess: AccessRecord[] = (accessData ?? []) as AccessRecord[]

  const dealIds = Array.from(new Set(activeAccess.map(access => access.deal_id)))

  let dealSummaries: DealSummary[] = []
  let documents: DataRoomDocument[] = []
  let subscriptions: InvestorSubscription[] = []

  if (dealIds.length > 0) {
    const { data: deals } = await serviceSupabase
      .from('deals')
      .select('id, name, company_name, company_logo_url, stage, sector, location, close_at, currency')
      .in('id', dealIds)

    dealSummaries = deals ?? []

    const { data: docs } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('id, deal_id, folder, file_key, file_name, created_at, external_link')
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
      <div className="p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-black">Data Rooms</h1>
          <p className="text-sm text-black">
            Browse available deals, review documents, and submit subscription requests.
          </p>
        </header>

        {activeAccess.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-black mb-1">No data rooms available</h2>
            <p className="text-sm text-gray-600">
              Submit interest on a deal or complete NDA requirements to unlock access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAccess.map((access) => {
              const deal = dealById[access.deal_id]
              if (!deal) return null

              const docsForDeal = documentsByDeal[access.deal_id] ?? []
              const submissionsForDeal = subscriptionsByDeal[access.deal_id] ?? []

              return (
                <DataRoomPreviewCard
                  key={access.id}
                  deal={deal}
                  access={{
                    granted_at: access.granted_at,
                    expires_at: access.expires_at
                  }}
                  documentCount={docsForDeal.length}
                  status={submissionsForDeal[0]?.status ?? null}
                />
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
