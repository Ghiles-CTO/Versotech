import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { AppLayout } from '@/components/layout/app-layout'
import { ReportsPageClient } from '@/components/reports/reports-page-client'
import { getProfile } from '@/lib/auth'
import { loadInvestorDocuments } from '@/lib/documents/investor-documents'
import { readActivePersonaCookieValues, resolveActiveInvestorLink } from '@/lib/kyc/active-investor-link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const params = await searchParams
  const initialView = params?.view === 'documents' ? 'documents' : 'requests'

  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  const serviceSupabase = createServiceClient()
  const cookieStore = await cookies()
  const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(cookieStore)
  const { link: investorLink } = await resolveActiveInvestorLink<{ investor_id: string }>({
    supabase: serviceSupabase,
    userId: profile.id,
    cookiePersonaType,
    cookiePersonaId,
    select: 'investor_id',
  })

  const investorIds = investorLink?.investor_id ? [investorLink.investor_id] : []

  // If user has no linked investors, skip the request tickets query
  const [requestsResult, documentsData] = await Promise.all([
    investorIds.length > 0
      ? serviceSupabase
          .from('request_tickets')
          .select(`
            *,
            investor:investors(id, legal_name),
            created_by_profile:profiles!request_tickets_created_by_fkey(id, display_name, email),
            assigned_to_profile:profiles!request_tickets_assigned_to_fkey(id, display_name, email),
            result_doc:documents(id, file_key, type, created_at)
          `)
          .in('investor_id', investorIds)
          .order('created_at', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),

    loadInvestorDocuments(serviceSupabase, investorIds)
  ])

  const requests = requestsResult.data || []

  return (
    <AppLayout brand="versoholdings">
      <ReportsPageClient
        initialRequests={requests}
        initialDocuments={documentsData.documents as any}
        folders={documentsData.folders}
        vehicles={documentsData.vehicles}
        initialView={initialView}
      />
    </AppLayout>
  )
}
