'use client'

import { useEffect, useState } from 'react'
import { ArrangersDashboard, type ArrangersDashboardProps } from '@/components/staff/arrangers/arrangers-dashboard'
import { AddArrangerProvider } from '@/components/staff/arrangers/add-arranger-context'
import { AddArrangerDialog } from '@/components/staff/arrangers/add-arranger-dialog'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

export default function ArrangersContent() {
  const [arrangers, setArrangers] = useState<ArrangersDashboardProps['arrangers']>([])
  const [summary, setSummary] = useState<ArrangersDashboardProps['summary']>({
    totalEntities: 0,
    activeEntities: 0,
    kycApproved: 0,
    totalDeals: 0,
    totalVehicles: 0,
    totalAum: 0,
  })
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([])
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArrangers() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch arranger entities
        const { data: arrangersData, error: arrangersError } = await supabase
          .from('arranger_entities')
          .select('*')
          .order('created_at', { ascending: false })

        if (arrangersError) throw arrangersError

        const arrangersRecords = (arrangersData ?? []) as ArrangerEntityRecord[]

        // Fetch deals count per arranger
        const { data: dealsData } = await supabase
          .from('deals')
          .select('id, arranger_entity_id, name, status')
          .not('arranger_entity_id', 'is', null)

        const dealsByArranger = new Map<string, { total: number; active: number }>()
        ;(dealsData ?? []).forEach((deal: any) => {
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
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, arranger_entity_id, name, nav, currency')
          .not('arranger_entity_id', 'is', null)

        const vehiclesByArranger = new Map<string, { total: number; totalAum: number }>()
        ;(vehiclesData ?? []).forEach((vehicle: any) => {
          const arrangerId = vehicle.arranger_entity_id
          if (!arrangerId) return

          const current = vehiclesByArranger.get(arrangerId) || { total: 0, totalAum: 0 }
          current.total += 1
          current.totalAum += Number(vehicle.nav ?? 0)
          vehiclesByArranger.set(arrangerId, current)
        })

        // Fetch documents count per arranger
        const { data: documentsData } = await supabase
          .from('documents')
          .select('id, arranger_entity_id')
          .not('arranger_entity_id', 'is', null)

        const documentsByArranger = new Map<string, number>()
        ;(documentsData ?? []).forEach((doc: any) => {
          const arrangerId = doc.arranger_entity_id
          if (!arrangerId) return
          documentsByArranger.set(arrangerId, (documentsByArranger.get(arrangerId) || 0) + 1)
        })

        // Transform data
        const processedArrangers: ArrangersDashboardProps['arrangers'] = arrangersRecords.map((record) => {
          const dealsInfo = dealsByArranger.get(record.id) || { total: 0, active: 0 }
          const vehiclesInfo = vehiclesByArranger.get(record.id) || { total: 0, totalAum: 0 }
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
            totalDeals: dealsInfo.total,
            activeDeals: dealsInfo.active,
            totalVehicles: vehiclesInfo.total,
            totalAum: vehiclesInfo.totalAum,
            documentCount,
          }
        })

        setArrangers(processedArrangers)

        // Calculate summary stats
        const calculatedSummary = processedArrangers.reduce<ArrangersDashboardProps['summary']>(
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

        setSummary(calculatedSummary)

        // Fetch all deals for assignment dialog
        const { data: allDealsData } = await supabase
          .from('deals')
          .select('id, name')
          .in('status', ['draft', 'open', 'allocation_pending'])
          .order('name', { ascending: true })

        setDeals((allDealsData ?? []).map((d: any) => ({ id: d.id, name: d.name || 'Untitled Deal' })))

        // Fetch all vehicles for assignment dialog
        const { data: allVehiclesData } = await supabase
          .from('vehicles')
          .select('id, name')
          .order('name', { ascending: true })

        setVehicles((allVehiclesData ?? []).map((v: any) => ({ id: v.id, name: v.name || 'Untitled Vehicle' })))

        setError(null)
      } catch (err) {
        console.error('[ArrangersContent] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load arrangers')
      } finally {
        setLoading(false)
      }
    }

    fetchArrangers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading arrangers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Arrangers</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <AddArrangerProvider>
      <ArrangersDashboard
        summary={summary}
        arrangers={arrangers}
        deals={deals}
        vehicles={vehicles}
      />
      <AddArrangerDialog />
    </AddArrangerProvider>
  )
}
