import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProcessesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  if (user.role === 'staff_admin' || user.role === 'ceo') {
    redirect('/versotech_admin/processes')
  }

  redirect('/versotech_main/dashboard')
}
