import { requireStaffAuth } from '@/lib/auth'
import { EnhancedSubscriptionsPage } from './components/enhanced-subscriptions-page'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  await requireStaffAuth()

  return (
    <EnhancedSubscriptionsPage />
    )
}
