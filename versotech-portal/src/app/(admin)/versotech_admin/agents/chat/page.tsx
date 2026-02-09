import { redirect } from 'next/navigation'

export default function AgentChatLogsPage() {
  redirect('/versotech_admin/agents?tab=chat')
}

