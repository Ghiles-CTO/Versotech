import { createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { CreateDealForm } from '@/components/deals/create-deal-form'

export const dynamic = 'force-dynamic'

export default async function CreateDealPage() {
  await requireStaffAuth()

  // Use service client to bypass RLS for staff users
  const supabase = createServiceClient()

  // Fetch entities for dropdown (include arranger_entity_id for auto-population)
  const { data: entities } = await supabase
    .from('vehicles')
    .select('id, name, type, currency, legal_jurisdiction, formation_date, logo_url, website_url, arranger_entity_id')
    .order('name')

  return (
    <div className="p-6 max-w-5xl mx-auto">
        <CreateDealForm
          entities={entities || []}
          basePath="/versotech/staff"
        />
      </div>
    )
}
