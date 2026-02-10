import { redirect } from 'next/navigation'

export default function OfacScreeningsPage() {
  redirect('/versotech_admin/agents?tab=risk')
}
