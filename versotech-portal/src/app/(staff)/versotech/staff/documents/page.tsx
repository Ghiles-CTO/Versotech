import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { AppLayout } from '@/components/layout/app-layout'
import { StaffDocumentsClient } from '@/components/documents/staff-documents-client'

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
    <AppLayout brand="versotech">
      <StaffDocumentsClient
        initialVehicles={vehicles || []}
        userProfile={userProfile}
      />
    </AppLayout>
  )
}
