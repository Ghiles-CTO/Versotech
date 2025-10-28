import { requireStaffAuth } from '@/lib/auth'
import { SubscriptionsPageClient } from './components/subscriptions-page-client'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  await requireStaffAuth()

  return (
    <SubscriptionsPageClient />
    )
}
