import { redirect } from 'next/navigation'

export default function AdminOfacScreeningsPage() {
  redirect('/versotech_admin/agents?tab=risk')
}
