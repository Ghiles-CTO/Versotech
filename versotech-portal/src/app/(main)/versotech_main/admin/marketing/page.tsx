import { AlertCircle } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, hasPermission } from '@/lib/api-auth'
import { MarketingAdminClient } from './marketing-admin-client'

export const dynamic = 'force-dynamic'

export default async function MarketingAdminPage() {
  const supabase = await createClient()
  const { user, error } = await getAuthenticatedUser(supabase)

  if (error || !user) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-foreground">Authentication Required</h3>
        <p className="text-muted-foreground">Please log in to manage marketing announcements.</p>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAllowedRole = profile?.role === 'ceo' || profile?.role === 'staff_admin'
  const hasAdminPermission = isAllowedRole
    ? true
    : await hasPermission(supabase, user.id, ['super_admin'])

  if (!hasAdminPermission) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-foreground">Access Restricted</h3>
        <p className="text-muted-foreground">Marketing management is only available to CEO and staff admins.</p>
      </div>
    )
  }

  return <MarketingAdminClient />
}
