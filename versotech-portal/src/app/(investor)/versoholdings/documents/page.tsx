import { AppLayout } from '@/components/layout/app-layout'
import { createClient } from '@/lib/supabase/server'
import { CategorizedDocumentsClient } from '@/components/documents/categorized-documents-client'
import { InvestorFoldersClient } from '@/components/documents/investor-folders-client'
import { Document, DocumentScope } from '@/types/documents'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  await searchParams
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

  // Fetch holdings documents and investor files (exclude deals)
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

  const baseSelect = `
      id,
      name,
      type,
      file_key,
      created_at,
      watermark,
      vehicle_id,
      deal_id,
      owner_investor_id,
      folder_id,
      is_published,
      created_by_profile:created_by(display_name, email),
      investors:owner_investor_id(id, legal_name),
      vehicles:vehicle_id(id, name, type),
      deals:deal_id(id, name, status),
      folder:document_folders(id, name, path, folder_type)
    `

  const documentsMap = new Map<string, Document>()

  const collectDocuments = (entries: DocumentQueryResult[] | null | undefined) => {
    return (entries || []).forEach((doc) => {
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

      documentsMap.set(doc.id, {
        id: doc.id,
        type: doc.type,
        file_name: fileName,
        file_key: doc.file_key,
        created_at: doc.created_at,
        created_by: doc.created_by_profile,
        scope,
        watermark: doc.watermark as Document['watermark']
      })
    })
  }

  // First, fetch documents linked directly to investor IDs (fallback)
  if (investorIds.length > 0) {
    console.log('[DocumentsPage] Fetching owner documents for investors:', investorIds)
    const { data: ownerDocuments, error: ownerDocsError } = await supabase
      .from('documents')
      .select(baseSelect)
      .in('owner_investor_id', investorIds)
      .is('deal_id', null)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (ownerDocsError) {
      console.error('Owner documents query error:', ownerDocsError)
    } else {
      console.log('[DocumentsPage] Owner documents count:', ownerDocuments?.length ?? 0)
    }

    collectDocuments(ownerDocuments as DocumentQueryResult[])
  } else {
    console.log('[DocumentsPage] No investor IDs available; skipping owner document query')
  }

  // Then overlay vehicle-linked documents, ensuring no duplicates
  const vehicleIds = vehicles.map(vehicle => vehicle.id).filter(Boolean)
  console.log('[DocumentsPage] Derived vehicle IDs:', vehicleIds)

  if (vehicleIds.length > 0) {
    const { data: vehicleDocuments, error: vehicleDocsError } = await supabase
      .from('documents')
      .select(baseSelect)
      .in('vehicle_id', vehicleIds)
      .is('deal_id', null)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (vehicleDocsError) {
      console.error('Vehicle documents query error:', vehicleDocsError)
    } else {
      console.log('[DocumentsPage] Vehicle documents count:', vehicleDocuments?.length ?? 0)
    }

    collectDocuments(vehicleDocuments as DocumentQueryResult[])
  } else {
    console.log('[DocumentsPage] No vehicle IDs found for investor subscriptions; skipping vehicle document query')
  }

  documents = Array.from(documentsMap.values())
  console.log('[DocumentsPage] Total documents collected:', documents.length)

  // Fetch accessible folders
  const { data: foldersData } = await supabase
    .from('document_folders')
    .select('*')
    .order('path', { ascending: true })

  const folders = foldersData || []

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6">
        <Tabs defaultValue="folders" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="folders">By Folders</TabsTrigger>
            <TabsTrigger value="categories">By Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="folders">
            <InvestorFoldersClient
              folders={folders}
              documents={documents}
            />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategorizedDocumentsClient
              initialDocuments={documents}
              vehicles={vehicles}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
