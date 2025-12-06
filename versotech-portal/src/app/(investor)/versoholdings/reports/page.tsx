import { redirect } from 'next/navigation'

import { AppLayout } from '@/components/layout/app-layout'
import { ReportsPageClient } from '@/components/reports/reports-page-client'
import { getProfile } from '@/lib/auth'
import { loadInvestorDocuments } from '@/lib/documents/investor-documents'
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
    redirect('/versoholdings/login')
  }

  const serviceSupabase = createServiceClient()

  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', profile.id)

  const investorIds = investorLinks?.map(link => link.investor_id) ?? []

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
