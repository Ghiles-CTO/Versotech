import { Metadata } from 'next'
import { requireStaffAuth } from '@/lib/auth'
import { KYCReviewClient } from './kyc-review-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'KYC Review | VERSO Tech',
  description: 'Review and approve investor KYC documents'
}

export default async function KYCReviewPage() {
  await requireStaffAuth()

  return (
    <div className="p-6 space-y-6">
      <KYCReviewClient />
    </div>
  )
}
