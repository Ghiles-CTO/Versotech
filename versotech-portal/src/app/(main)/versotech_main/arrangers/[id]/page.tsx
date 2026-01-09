import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ArrangerDetailClient } from '@/components/staff/arrangers/arranger-detail-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ArrangerDetail = {
  id: string
  legal_name: string
  registration_number: string | null
  tax_id: string | null
  regulator: string | null
  license_number: string | null
  license_type: string | null
  license_expiry_date: string | null
  email: string | null
  phone: string | null
  address: string | null
  kyc_status: string
  kyc_approved_at: string | null
  kyc_approved_by: string | null
  kyc_expires_at: string | null
  kyc_notes: string | null
  metadata: any
  status: string
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

type Deal = {
  id: string
  name: string
  status: string
  target_amount: number | null
  created_at: string
}

type Vehicle = {
  id: string
  name: string
  status: string
  created_at: string
}

/**
 * Arranger Detail Page for Unified Portal (versotech_main)
 *
 * Persona-aware access:
 * - Staff/CEO personas: Full access to arranger details
 * - Other personas: Access denied
 */
export default async function ArrangerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  // Check if user has staff persona for access
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceClient = createServiceClient()

  if (!hasStaffAccess) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Arranger details are only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch arranger details
  const { data: arranger, error } = await serviceClient
    .from('arranger_entities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !arranger) {
    console.error('[Arranger Detail] Error:', error)
    notFound()
  }

  // Fetch related deals
  const { data: dealsData } = await serviceClient
    .from('deals')
    .select('id, name, status, target_amount, created_at')
    .eq('arranger_entity_id', id)
    .order('created_at', { ascending: false })

  const deals: Deal[] = (dealsData || []).map(d => ({
    id: d.id,
    name: d.name,
    status: d.status || 'unknown',
    target_amount: d.target_amount,
    created_at: d.created_at
  }))

  // Fetch related vehicles
  const { data: vehiclesData } = await serviceClient
    .from('vehicles')
    .select('id, name, status, created_at')
    .eq('arranger_entity_id', id)
    .order('created_at', { ascending: false })

  const vehicles: Vehicle[] = (vehiclesData || []).map(v => ({
    id: v.id,
    name: v.name,
    status: v.status || 'unknown',
    created_at: v.created_at
  }))

  // Fetch document count from entity_document_links
  const { count: documentCount } = await serviceClient
    .from('entity_document_links')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', 'arranger')
    .eq('entity_id', id)

  // Calculate metrics
  const activeDeals = deals.filter(d =>
    ['draft', 'open', 'allocation_pending', 'in_progress'].includes(d.status)
  ).length

  // Note: vehicles.aum doesn't exist in schema, so totalAum defaults to 0
  const metrics = {
    totalDeals: deals.length,
    activeDeals,
    totalVehicles: vehicles.length,
    totalAum: 0,
    documentCount: documentCount || 0
  }

  const arrangerData = arranger as ArrangerDetail

  return (
    <ArrangerDetailClient
      arranger={arrangerData}
      metrics={metrics}
      deals={deals}
      vehicles={vehicles}
    />
  )
}
