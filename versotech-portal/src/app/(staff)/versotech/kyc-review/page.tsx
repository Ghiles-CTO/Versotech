import { Metadata } from 'next'
import { KYCReviewClient } from './kyc-review-client'

export const metadata: Metadata = {
  title: 'KYC Review | VERSO Tech',
  description: 'Review and approve investor KYC documents'
}

export default function KYCReviewPage() {
  return <KYCReviewClient />
}
