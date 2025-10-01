import { AppLayout } from '@/components/layout/app-layout'
import { createClient } from '@/lib/supabase/server'
import { CategorizedDocumentsClient } from '@/components/documents/categorized-documents-client'
import { Document, DocumentScope } from '@/types/documents'
import { redirect } from 'next/navigation'

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{
    type?: string
    vehicle?: string
    deal?: string
    search?: string
    limit?: string
    offset?: string
  }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/versoholdings/login')
  }

  // Get user's investors for context
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  if (!investorLinks || investorLinks.length === 0) {
    // User has no investor links, show empty state
    return (
      <AppLayout brand="versoholdings">
        <CategorizedDocumentsClient
          initialDocuments={[]}
          vehicles={[]}
        />
      </AppLayout>
    )
  }

  const investorIds = investorLinks.map(link => link.investor_id)

  // Get user's vehicles for filter options
  const { data: vehicleData } = await supabase
    .from('subscriptions')
    .select(`
      vehicle_id,
      vehicles!inner(id, name, type)
    `)
    .in('investor_id', investorIds)
    .eq('status', 'active')

  const vehicles = vehicleData
    ?.map(v => v.vehicles)
    .filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i) // unique
    || []

  // Fetch holdings documents only (exclude deals)
  let documents: Document[] = []

  type DocumentQueryResult = {
    id: string
    type: string
    file_key: string
    created_at: string
    watermark: Record<string, unknown> | null
    vehicle_id: string | null
    deal_id: string | null
    owner_investor_id: string | null
    created_by_profile: { display_name: string; email: string } | null
    investors: { id: string; legal_name: string } | null
    vehicles: { id: string; name: string; type: string } | null
    deals: { id: string; name: string; status: string | null } | null
  }

  // Query only holdings documents (vehicle-scoped, not deal-scoped)
  const { data: documentsData, error: documentsError, count } = await supabase
    .from('documents')
    .select(`
      id,
      type,
      file_key,
      created_at,
      watermark,
      vehicle_id,
      deal_id,
      owner_investor_id,
      created_by_profile:created_by(display_name, email),
      investors:owner_investor_id(id, legal_name),
      vehicles:vehicle_id(id, name, type),
      deals:deal_id(id, name, status)
    `, { count: 'exact' })
    .not('vehicle_id', 'is', null) // Only holdings documents
    .is('deal_id', null) // Exclude deal documents
    .order('created_at', { ascending: false })

  if (documentsError) {
    console.error('Documents query error:', documentsError)
  }

  if (documentsData) {
    const typedDocuments = documentsData as DocumentQueryResult[]

    documents = typedDocuments.map((doc) => {
      const fileName = doc.file_key ? doc.file_key.split('/').pop() : 'Unknown'

      const scope: DocumentScope = {}
      if (doc.investors) scope.investor = doc.investors
      if (doc.vehicles) scope.vehicle = {
        id: doc.vehicles.id,
        name: doc.vehicles.name,
        type: doc.vehicles.type
      }
      if (doc.deals) scope.deal = {
        id: doc.deals.id,
        name: doc.deals.name,
        status: doc.deals.status || undefined
      }

      return {
        id: doc.id,
        type: doc.type,
        file_name: fileName,
        file_key: doc.file_key,
        created_at: doc.created_at,
        created_by: doc.created_by_profile,
        scope,
        watermark: doc.watermark as Document['watermark']
      }
    })
  }

  return (
    <AppLayout brand="versoholdings">
      <CategorizedDocumentsClient
        initialDocuments={documents}
        vehicles={vehicles}
      />
    </AppLayout>
  )
}
