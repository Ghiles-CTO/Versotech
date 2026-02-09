import { redirect } from 'next/navigation'

export default function AgentActivityPage() {
  redirect('/versotech_admin/agents?tab=activity')
}

