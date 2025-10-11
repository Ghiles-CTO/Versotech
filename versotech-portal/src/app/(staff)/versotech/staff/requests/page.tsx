import { AppLayout } from '@/components/layout/app-layout'
import { RequestManagementPage } from '@/components/staff/requests/request-management-page'

export const dynamic = 'force-dynamic'

export default async function StaffRequestsPage() {
  return (
    <AppLayout brand="versotech">
      <RequestManagementPage />
    </AppLayout>
  )
}



