import { createClient } from '@/lib/supabase/server'
import { checkCeoOnlyAccess, getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StaffDocuments } from '@/components/documents/staff'

export const dynamic = 'force-dynamic'

export default async function StaffDocumentsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/versotech_main/login')
  }

  const hasAccess = await checkCeoOnlyAccess(user.id)
  if (!hasAccess) {
    throw new Error('CEO access required')
  }

  const supabase = await createClient()

  // Fetch all vehicles for folder initialization
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, name, type')
    .order('name')

  // Map AuthUser to expected profile format
  const userProfile = {
    role: user.role,
    display_name: user.displayName,
    title: user.title
  }

  return (
    <StaffDocuments
      initialVehicles={vehicles || []}
      userProfile={userProfile}
    />
  )
}
