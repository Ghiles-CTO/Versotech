import { createClient, createServiceClient } from '@/lib/supabase/server'
import InvestorNotificationsClient from '@/components/notifications/investor-notifications-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Notifications Page for Unified Portal (versotech_main)
 *
 * Persona-aware notifications:
 * - All authenticated users can view their notifications
 */
export default async function NotificationsPage() {
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
            Please log in to view notifications.
          </p>
        </div>
      </div>
    )
  }

  // Check user personas to ensure they have at least one active persona
  const serviceSupabase = createServiceClient()
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  if (!personas || personas.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Notifications require an active persona.
          </p>
        </div>
      </div>
    )
  }

  const hasStaffAccess = await checkStaffAccess(user.id)

  const complianceAlerts = hasStaffAccess
    ? await serviceSupabase
        .from('compliance_alerts')
        .select('id, alert_type, severity, description, status, assigned_to, created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => data || [])
    : []

  const complianceTasks = hasStaffAccess
    ? await serviceSupabase
        .from('tasks')
        .select('id, title, description, status, priority, due_at, action_url, owner_user_id')
        .eq('category', 'compliance')
        .in('status', ['pending', 'in_progress'])
        .order('due_at', { ascending: true, nullsLast: true })
        .limit(30)
        .then(({ data }) => data || [])
    : []

  return (
    <div className="p-6">
      <InvestorNotificationsClient
        isStaff={hasStaffAccess}
        currentUserId={user.id}
        complianceAlerts={complianceAlerts}
        complianceTasks={complianceTasks}
      />
    </div>
  )
}
