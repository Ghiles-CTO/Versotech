import { createClient } from '@/lib/supabase/server'
import { VehicleSummaryPageClient } from './vehicle-summary-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Vehicle Summary Page for Unified Portal (versotech_main)
 *
 * Persona-aware vehicle summary:
 * - Staff/CEO personas: Full access to vehicle summary
 * - Other personas: Access denied
 */
export default async function VehicleSummaryPage() {
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
            Please log in to view vehicle summary.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO persona for full access
  const hasStaffAccess = await checkStaffAccess(user.id)

  if (!hasStaffAccess) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Vehicle summary is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  return <VehicleSummaryPageClient />
}
