import { createClient } from '@/lib/supabase/server'
import { StyledSubscriptionsPage } from '@/app/(staff)/versotech/staff/subscriptions/components/styled-subscriptions-page'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Subscriptions Page for Unified Portal (versotech_main)
 *
 * Persona-aware subscription management:
 * - Staff/CEO personas: Full access to subscription management
 * - Other personas: Access denied
 */
export default async function SubscriptionsPage() {
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
            Please log in to view subscriptions.
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
            Subscription management is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  return <StyledSubscriptionsPage basePath="/versotech_main" />
}
