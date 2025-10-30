import { requireStaffAuth } from '@/lib/auth'
import { StyledSubscriptionsPage } from './components/styled-subscriptions-page'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  await requireStaffAuth()

  return (
    <StyledSubscriptionsPage />
    )
}
