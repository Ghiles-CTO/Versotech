import { AppLayout } from '@/components/layout/app-layout'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { CreateDealForm } from '@/components/deals/create-deal-form'

export const dynamic = 'force-dynamic'

export default async function CreateDealPage() {
  await requireStaffAuth()
  
  // Use service client to bypass RLS for staff users
  const supabase = createServiceClient()

  // Fetch entities for dropdown
  const { data: entities } = await supabase
    .from('vehicles')
    .select('id, name, type, currency, legal_jurisdiction, formation_date, logo_url, website_url')
    .order('name')

  return (
    <AppLayout brand="versotech">
      <div className="p-6 max-w-5xl mx-auto">
        <CreateDealForm entities={entities || []} />
      </div>
    </AppLayout>
  )
}
