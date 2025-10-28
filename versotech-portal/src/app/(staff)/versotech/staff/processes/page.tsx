import { requireStaffAuth } from '@/lib/auth'
import { ProcessCenterClient } from '@/components/staff/process-center-client'

export const dynamic = 'force-dynamic'

export default async function ProcessesPage() {
  const profile = await requireStaffAuth()

  return (
    <ProcessCenterClient profile={profile as any} />
    )
}