import type { SupabaseClient } from '@supabase/supabase-js'
import type { Document, DocumentScope, Vehicle } from '@/types/documents'

interface DocumentFolder {
  id: string
  name: string
  path: string
  folder_type: string
  vehicle?: {
    id: string
    name: string
  }
}

interface RawDocument {
  id: string
  name: string | null
  type: string
  file_key: string
  file_size_bytes: number | null
  created_at: string
  watermark: Record<string, unknown> | null
  vehicle_id: string | null
  deal_id: string | null
  owner_investor_id: string | null
  created_by_profile: { display_name: string; email: string } | null
  investors: { id: string; legal_name: string } | null
  vehicles: { id: string; name: string; type: string } | null
  deals: { id: string; name: string; status: string | null } | null
  folder: {
    id: string
    name: string
    path: string
    folder_type: string
  } | null
}

export interface InvestorDocumentData {
  documents: Array<Document & { name?: string; folder?: RawDocument['folder'] }>
  vehicles: Vehicle[]
  folders: DocumentFolder[]
}

const BASE_DOCUMENT_SELECT = `
  id,
  name,
  type,
  file_key,
  file_size_bytes,
  created_at,
  watermark,
  vehicle_id,
  deal_id,
  owner_investor_id,
  folder_id,
  created_by_profile:created_by(display_name, email),
  investors:owner_investor_id(id, legal_name),
  vehicles:vehicle_id(id, name, type),
  deals:deal_id(id, name, status),
  folder:document_folders(id, name, path, folder_type)
`

export async function loadInvestorDocuments(
  supabase: SupabaseClient,
  investorIds: string[]
): Promise<InvestorDocumentData> {
  if (!investorIds.length) {
    return { documents: [], vehicles: [], folders: [] }
  }

  const documentsMap = new Map<string, Document & { name?: string; folder?: RawDocument['folder'] }>()

  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('vehicle_id, vehicles!inner(id, name, type)')
    .in('investor_id', investorIds)
    .eq('status', 'active')

  const vehicles = Array.from(
    new Map(
      (subscriptionData ?? [])
        .map((entry) => entry.vehicles)
        .filter(Boolean)
        .map((vehicle: any) => [vehicle.id, vehicle])
    ).values()
  ) as unknown as Vehicle[]

  const collectDocuments = (entries: RawDocument[] | null | undefined) => {
    if (!entries) return

    entries.forEach((doc) => {
      const fileName = doc.name ?? doc.file_key?.split('/').pop() ?? 'Document'

      const scope: DocumentScope = {}
      if (doc.investors) scope.investor = doc.investors
      if (doc.vehicles) {
        scope.vehicle = {
          id: doc.vehicles.id,
          name: doc.vehicles.name,
          type: doc.vehicles.type
        }
      }
      if (doc.deals) {
        scope.deal = {
          id: doc.deals.id,
          name: doc.deals.name,
          status: doc.deals.status ?? undefined
        }
      }

      documentsMap.set(doc.id, {
        id: doc.id,
        name: fileName,
        type: doc.type,
        file_name: fileName,
        file_key: doc.file_key,
        file_size_bytes: doc.file_size_bytes ?? undefined,
        created_at: doc.created_at,
        created_by: doc.created_by_profile ?? undefined,
        scope,
        watermark: doc.watermark as Document['watermark'],
        folder: doc.folder ?? undefined
      })
    })
  }

  const { data: ownerDocuments, error: ownerError } = await supabase
    .from('documents')
    .select(BASE_DOCUMENT_SELECT)
    .in('owner_investor_id', investorIds)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (ownerError) {
    console.error('[Documents] Owner documents query error:', ownerError.message)
  }

  collectDocuments(ownerDocuments as unknown as RawDocument[])

  const vehicleIds = vehicles.map(vehicle => vehicle.id).filter(Boolean)
  if (vehicleIds.length > 0) {
    const { data: vehicleDocuments, error: vehicleError } = await supabase
      .from('documents')
      .select(BASE_DOCUMENT_SELECT)
      .in('vehicle_id', vehicleIds)
      .is('deal_id', null)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (vehicleError) {
      console.error('[Documents] Vehicle documents query error:', vehicleError.message)
    }

    collectDocuments(vehicleDocuments as unknown as RawDocument[])
  }

  const { data: foldersData } = await supabase
    .from('document_folders')
    .select('*')
    .order('path', { ascending: true })

  return {
    documents: Array.from(documentsMap.values()),
    vehicles,
    folders: (foldersData ?? []) as DocumentFolder[]
  }
}
