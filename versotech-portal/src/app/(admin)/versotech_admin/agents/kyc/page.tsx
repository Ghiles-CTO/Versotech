import { redirect } from 'next/navigation'

export default function AgentKycPage() {
  redirect('/versotech_admin/agents?tab=kyc')
}

