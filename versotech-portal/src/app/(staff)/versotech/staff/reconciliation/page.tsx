import { redirect } from 'next/navigation'
import { requireStaffAuth } from '@/lib/auth'
import { ReconciliationPageClient } from './components/reconciliation-page-client'

export const dynamic = 'force-dynamic'

export default async function ReconciliationPage() {
  const profile = await requireStaffAuth()
  if (!profile) {
    redirect('/versotech/login')
  }

  return (
    <div className="p-6">
      <ReconciliationPageClient />
    </div>
  )
}
