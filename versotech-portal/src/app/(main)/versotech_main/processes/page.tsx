import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProcessCenterClient } from '@/components/staff/process-center-client'

export const dynamic = 'force-dynamic'

export default async function ProcessesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  // Only CEO/staff can access Process Center
  const isCEO = user.role === 'staff_admin' || user.role === 'ceo' ||
                user.role === 'staff_ops' || user.role === 'staff_rm'

  if (!isCEO) {
    redirect('/versotech_main/dashboard')
  }

  return (
    <ProcessCenterClient profile={user as any} />
  )
}
