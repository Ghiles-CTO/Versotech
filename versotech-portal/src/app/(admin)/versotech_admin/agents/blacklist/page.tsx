import { redirect } from 'next/navigation'

export default function AgentBlacklistPage() {
  redirect('/versotech_admin/agents?tab=blacklist')
}

