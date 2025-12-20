import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProcessCenterClient } from '@/components/staff/process-center-client'

export const dynamic = 'force-dynamic'

export default async function AdminProcessesPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/versotech_main/login')
  }

  return <ProcessCenterClient profile={profile as any} />
}
