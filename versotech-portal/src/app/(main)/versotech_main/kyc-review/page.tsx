import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { KYCReviewClient } from '@/app/(staff)/versotech/staff/kyc-review/kyc-review-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'KYC Review | VERSO',
  description: 'Review and approve investor KYC documents'
}

export default async function KYCReviewPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  // Only CEO/staff_admin can access KYC review
  const isCEO = user.role === 'staff_admin' || user.role === 'ceo'

  if (!isCEO) {
    redirect('/versotech_main/dashboard')
  }

  return (
    <div className="space-y-6">
      <KYCReviewClient />
    </div>
  )
}
