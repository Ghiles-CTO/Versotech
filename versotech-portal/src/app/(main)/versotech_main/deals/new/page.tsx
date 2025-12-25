import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateDealForm } from '@/components/deals/create-deal-form'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Deal Creation Page for Unified Portal (versotech_main)
 *
 * Persona-aware access:
 * - Staff/CEO personas: Full access to create deals
 * - Other personas: Access denied
 */
export default async function CreateDealPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  // Check if user has staff persona for access
  const serviceClient = createServiceClient()
  const { data: personas } = await serviceClient.rpc('get_user_personas', {
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
            Deal creation is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch entities for dropdown
  const { data: entities } = await serviceClient
    .from('vehicles')
    .select('id, name, type, currency, legal_jurisdiction, formation_date, logo_url, website_url')
    .order('name')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <CreateDealForm
        entities={entities || []}
        basePath="/versotech_main"
      />
    </div>
  )
}
