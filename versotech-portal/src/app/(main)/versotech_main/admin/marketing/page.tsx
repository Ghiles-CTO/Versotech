import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MarketingAdminPage() {
  redirect('/versotech_admin/marketing')
}
