import { AppLayout } from '@/components/layout/app-layout'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'
import { redirect } from 'next/navigation'
import { CreateDealForm } from '@/components/deals/create-deal-form'

export default async function CreateDealPage() {
  // Use service client to bypass RLS for demo sessions
  const supabase = createServiceClient()

  // Check for demo session
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  
  if (!demoCookie) {
    redirect('/versotech/staff/deals')
  }

  const demoSession = parseDemoSession(demoCookie.value)
  if (!demoSession) {
    redirect('/versotech/staff/deals')
  }

  console.log('[Create Deal] Demo user:', demoSession.email, demoSession.role)

  // Fetch entities for dropdown
  const { data: entities } = await supabase
    .from('vehicles')
    .select('id, name, type, currency, legal_jurisdiction, formation_date')
    .order('name')

  return (
    <AppLayout brand="versotech">
      <div className="p-6 max-w-5xl mx-auto">
        <CreateDealForm entities={entities || []} />
      </div>
    </AppLayout>
  )
}
