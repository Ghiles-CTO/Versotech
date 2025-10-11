import { RequestAnalyticsClient } from './analytics-client'
import { AppLayout } from '@/components/layout/app-layout'

export const dynamic = 'force-dynamic'

export default async function RequestAnalyticsPage() {
  return (
    <AppLayout brand="versotech">
      <RequestAnalyticsClient />
    </AppLayout>
  )
}
