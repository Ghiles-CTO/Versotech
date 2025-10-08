import { AppLayout } from '@/components/layout/app-layout'
import { StaffMessagesPage } from '@/components/messaging/staff-messages-page'
import { requireAuth } from '@/lib/auth'

export default async function StaffMessages() {
  const profile = await requireAuth(['staff_admin', 'staff_ops', 'staff_rm'])

  return (
    <AppLayout brand="versotech">
      <StaffMessagesPage currentUserId={profile.id} />
    </AppLayout>
  )
}

