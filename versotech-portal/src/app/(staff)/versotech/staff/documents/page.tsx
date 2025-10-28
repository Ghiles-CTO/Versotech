import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { StaffDocumentsClient } from '@/components/documents/staff-documents-client'

export const dynamic = 'force-dynamic'

export default async function StaffDocumentsPage() {
  // Auth check using the same method as other staff pages
  const user = await requireStaffAuth()
  
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
    <StaffDocumentsClient
        initialVehicles={vehicles || []}
        userProfile={userProfile}
      />
    )
}
