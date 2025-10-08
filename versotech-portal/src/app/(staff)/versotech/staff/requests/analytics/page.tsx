import { RequestAnalyticsClient } from './analytics-client'
import { AppLayout } from '@/components/layout/app-layout'

export default async function RequestAnalyticsPage() {
  return (
    <AppLayout brand="versotech">
      <RequestAnalyticsClient />
    </AppLayout>
  )
}
