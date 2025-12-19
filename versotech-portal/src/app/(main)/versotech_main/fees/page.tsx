import { createClient, createServiceClient } from '@/lib/supabase/server'
import { FeesPageClient } from './fees-page-client'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

/**
 * Fees Page for Unified Portal (versotech_main)
 *
 * Persona-aware fees management:
 * - Staff/CEO personas: Full access to fee management
 * - Other personas: Access denied
 */
export default async function FeesPage() {
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
            Please log in to view fees management.
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
            Fees management is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  return <FeesPageClient />
}
