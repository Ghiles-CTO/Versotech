import { ArrangersDashboard, type ArrangersDashboardProps } from '@/components/staff/arrangers/arrangers-dashboard'
import { AddArrangerProvider } from '@/components/staff/arrangers/add-arranger-context'
import { AddArrangerDialog } from '@/components/staff/arrangers/add-arranger-dialog'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ArrangerEntityRecord = {
  id: string
  legal_name: string | null
  registration_number: string | null
  tax_id: string | null
  regulator: string | null
  license_number: string | null
  license_type: string | null
  license_expiry_date: string | null
  email: string | null
  phone: string | null
  address: string | null
  kyc_status: string | null
  kyc_approved_at: string | null
  kyc_approved_by: string | null
  kyc_expires_at: string | null
  kyc_notes: string | null
  metadata: any
  status: string | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

/**
 * Arrangers Page for Unified Portal (versotech_main)
 *
 * Persona-aware arranger entity management:
 * - Staff/CEO personas: Full access to arrangers
 * - Other personas: Access denied
 */
export default async function ArrangersPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view arrangers.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO persona for full access
  const serviceSupabase = createServiceClient()
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const hasStaffAccess = personas?.some(
    (p: any) => p.persona_type === 'staff'
  ) || false

  if (!hasStaffAccess) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Arrangers management is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch arranger entities
  const { data: arrangersData, error: arrangersError } = await serviceSupabase
    .from('arranger_entities')
    .select('*')
    .order('created_at', { ascending: false })

  if (arrangersError) {
    console.error('[Arrangers] Failed to fetch arrangers', arrangersError)
  }

  const arrangersRecords = (arrangersData ?? []) as ArrangerEntityRecord[]

  // Fetch deals count per arranger
  const { data: dealsData } = await serviceSupabase
    .from('deals')
    .select('id, arranger_entity_id, name, status')
    .not('arranger_entity_id', 'is', null)

  const dealsByArranger = new Map<string, { total: number; active: number }>()
  ;(dealsData ?? []).forEach((deal) => {
    const arrangerId = deal.arranger_entity_id
    if (!arrangerId) return

    const current = dealsByArranger.get(arrangerId) || { total: 0, active: 0 }
    current.total += 1
    if (deal.status === 'open' || deal.status === 'allocation_pending') {
      current.active += 1
    }
    dealsByArranger.set(arrangerId, current)
  })

  // Fetch vehicles count per arranger
  const { data: vehiclesData } = await serviceSupabase
    .from('vehicles')
    .select('id, arranger_entity_id, name, nav, currency')
    .not('arranger_entity_id', 'is', null)

  const vehiclesByArranger = new Map<string, { total: number; totalAum: number }>()
  ;(vehiclesData ?? []).forEach((vehicle) => {
    const arrangerId = vehicle.arranger_entity_id
    if (!arrangerId) return

    const current = vehiclesByArranger.get(arrangerId) || { total: 0, totalAum: 0 }
    current.total += 1
    current.totalAum += Number(vehicle.nav ?? 0)
    vehiclesByArranger.set(arrangerId, current)
  })

  // Fetch documents count per arranger
  const { data: documentsData } = await serviceSupabase
    .from('documents')
    .select('id, arranger_entity_id')
    .not('arranger_entity_id', 'is', null)

  const documentsByArranger = new Map<string, number>()
  ;(documentsData ?? []).forEach((doc) => {
    const arrangerId = doc.arranger_entity_id
    if (!arrangerId) return
    documentsByArranger.set(arrangerId, (documentsByArranger.get(arrangerId) || 0) + 1)
  })

  // Transform data
  const arrangers: ArrangersDashboardProps['arrangers'] = arrangersRecords.map((record) => {
    const deals = dealsByArranger.get(record.id) || { total: 0, active: 0 }
    const vehicles = vehiclesByArranger.get(record.id) || { total: 0, totalAum: 0 }
    const documentCount = documentsByArranger.get(record.id) || 0

    return {
      id: record.id,
      legalName: record.legal_name ?? 'Unnamed Entity',
      registrationNumber: record.registration_number,
      taxId: record.tax_id,
      regulator: record.regulator,
      licenseNumber: record.license_number,
      licenseType: record.license_type,
      licenseExpiryDate: record.license_expiry_date,
      email: record.email,
      phone: record.phone,
      address: record.address,
      kycStatus: record.kyc_status ?? 'draft',
      kycApprovedAt: record.kyc_approved_at,
      kycApprovedBy: record.kyc_approved_by,
      kycExpiresAt: record.kyc_expires_at,
      kycNotes: record.kyc_notes,
      metadata: record.metadata,
      status: record.status ?? 'active',
      createdAt: record.created_at,
      createdBy: record.created_by,
      updatedAt: record.updated_at,
      updatedBy: record.updated_by,
      totalDeals: deals.total,
      activeDeals: deals.active,
      totalVehicles: vehicles.total,
      totalAum: vehicles.totalAum,
      documentCount,
    }
  })

  // Calculate summary stats
  const summary = arrangers.reduce<ArrangersDashboardProps['summary']>(
    (acc, arranger) => {
      acc.totalEntities += 1
      if (arranger.status === 'active') {
        acc.activeEntities += 1
      }
      if (arranger.kycStatus === 'approved') {
        acc.kycApproved += 1
      }
      acc.totalDeals += arranger.totalDeals
      acc.totalVehicles += arranger.totalVehicles
      acc.totalAum += arranger.totalAum
      return acc
    },
    {
      totalEntities: 0,
      activeEntities: 0,
      kycApproved: 0,
      totalDeals: 0,
      totalVehicles: 0,
      totalAum: 0,
    }
  )

  // Fetch all deals for assignment dialog
  const { data: allDealsData } = await serviceSupabase
    .from('deals')
    .select('id, name')
    .in('status', ['draft', 'open', 'allocation_pending'])
    .order('name', { ascending: true })

  const deals = (allDealsData ?? []).map((d) => ({ id: d.id, name: d.name || 'Untitled Deal' }))

  // Fetch all vehicles for assignment dialog
  const { data: allVehiclesData } = await serviceSupabase
    .from('vehicles')
    .select('id, name')
    .order('name', { ascending: true })

  const vehicles = (allVehiclesData ?? []).map((v) => ({ id: v.id, name: v.name || 'Untitled Vehicle' }))

  return (
    <div className="p-6">
      <AddArrangerProvider>
        <ArrangersDashboard
          summary={summary}
          arrangers={arrangers}
          deals={deals}
          vehicles={vehicles}
        />
        <AddArrangerDialog />
      </AddArrangerProvider>
    </div>
  )
}
