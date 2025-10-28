import { redirect } from 'next/navigation'

import { AppLayout } from '@/components/layout/app-layout'
import { ReportsPageClient } from '@/components/reports/reports-page-client'
import { getProfile } from '@/lib/auth'
import { loadInvestorDocuments } from '@/lib/documents/investor-documents'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const params = await searchParams
  const initialView = params?.view === 'documents' ? 'documents' : 'reports'

  const profile = await getProfile()

  if (!profile) {
    redirect('/versoholdings/login')
  }

  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', profile.id)

  const investorIds = investorLinks?.map(link => link.investor_id) ?? []

  const [reportsResult, requestsResult, documentsData] = await Promise.all([
    serviceSupabase
      .from('report_requests')
      .select(`
        *,
        investor:investors(legal_name),
        result_doc:documents!report_requests_result_doc_id_fkey(*)
      `)
      .eq('investor_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),

    serviceSupabase
      .from('request_tickets')
      .select(`
        *,
        investor:investors(legal_name),
        created_by_profile:profiles!request_tickets_created_by_fkey(display_name, avatar),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey(display_name, avatar),
        result_doc:documents(*)
      `)
      .eq('investor_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),

    loadInvestorDocuments(serviceSupabase, investorIds)
  ])

  const reports = reportsResult.data || []
  const requests = requestsResult.data || []

  return (
    <AppLayout brand="versoholdings">
      <ReportsPageClient
        initialReports={reports}
        initialRequests={requests}
        initialDocuments={documentsData.documents as any}
        folders={documentsData.folders}
        vehicles={documentsData.vehicles}
        initialView={initialView}
      />
    </AppLayout>
  )
}
