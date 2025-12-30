import { AppLayout } from '@/components/layout/app-layout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvestorNotificationsClient from '@/components/notifications/investor-notifications-client'

export const dynamic = 'force-dynamic'

export default async function InvestorNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AppLayout brand="versoholdings">
      <InvestorNotificationsClient />
    </AppLayout>
  )
}
