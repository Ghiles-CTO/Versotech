import { AppLayout } from '@/components/layout/app-layout'
import { ReportsPageClient } from '@/components/reports/reports-page-client'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  // Auth check
  const profile = await getProfile()

  if (!profile) {
    redirect('/versoholdings/login')
  }

  const supabase = await createClient()

  // Fetch initial data server-side
  const [reportsResult, requestsResult] = await Promise.all([
    supabase
      .from('report_requests')
      .select(`
        *,
        investor:investors(legal_name),
        result_doc:documents!report_requests_result_doc_id_fkey(*)
      `)
      .eq('investor_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
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
      .limit(20)
  ])

  const reports = reportsResult.data || []
  const requests = requestsResult.data || []

  return (
    <AppLayout brand="versoholdings">
      <ReportsPageClient
        initialReports={reports}
        initialRequests={requests}
      />
    </AppLayout>
  )
}
