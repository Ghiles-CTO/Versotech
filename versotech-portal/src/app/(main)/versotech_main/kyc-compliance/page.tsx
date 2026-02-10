import { KYCComplianceDashboard } from '@/components/compliance/kyc-compliance-dashboard'

export const metadata = {
  title: 'KYC Compliance | V E R S O',
  description: 'Monitor KYC compliance status across all entities',
}

export default function KYCCompliancePage() {
  return (
    <div className="container mx-auto py-6">
      <KYCComplianceDashboard />
    </div>
  )
}
