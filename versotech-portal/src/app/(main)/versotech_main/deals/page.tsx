import { createClient, createServiceClient } from '@/lib/supabase/server'
import { DealsListClient } from '@/components/deals/deals-list-client'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Deal {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  offer_unit_price: number | null
  created_at: string
  vehicles?: {
    name: string
    type: string
  }
  deal_memberships: any[]
}

/**
 * Deals Page for Unified Portal (versotech_main)
 *
 * Persona-aware deal management:
 * - CEO/Staff personas: See all deals (bypass RLS via service client)
 * - Other personas (arranger, investor, etc.): See deals they're members of
 */
export default async function DealsPage() {
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
            Please log in to view deals.
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

  let dealsData: Deal[] = []

  if (hasStaffAccess) {
    // Staff/CEO: Full access to all deals
    const { data: deals } = await serviceSupabase
      .from('deals')
      .select(`
        *,
        vehicles (
          name,
          type
        ),
        deal_memberships (
          user_id,
          role
        )
      `)
      .order('created_at', { ascending: false })

    dealsData = deals || []
  } else {
    // Other personas: Only deals they're members of
    const { data: deals } = await serviceSupabase
      .from('deals')
      .select(`
        *,
        vehicles (
          name,
          type
        ),
        deal_memberships!inner (
          user_id,
          role
        )
      `)
      .eq('deal_memberships.user_id', user.id)
      .order('created_at', { ascending: false })

    dealsData = deals || []
  }

  // Calculate summary statistics
  const summary = {
    total: dealsData.length,
    open: dealsData.filter(d => d.status === 'open').length,
    draft: dealsData.filter(d => d.status === 'draft').length,
    closed: dealsData.filter(d => d.status === 'closed').length,
    totalValue: dealsData.reduce((sum, deal) => {
      const price = deal.offer_unit_price || 0
      return sum + price * 1000
    }, 0)
  }

  return (
    <DealsListClient
      deals={dealsData}
      summary={summary}
      basePath="/versotech_main"
    />
  )
}
