import { redirect } from 'next/navigation'

export default function ProcessesPage() {
  // Processes page has moved to the Admin Portal
  redirect('/versotech_admin/processes')
}
