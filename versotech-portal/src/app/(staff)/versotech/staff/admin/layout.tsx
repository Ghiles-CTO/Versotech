import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech/login')
  }

  // Check if user has super_admin permission
  const supabase = await createClient()
  const { data: permission } = await supabase
    .from('staff_permissions')
    .select('permission')
    .eq('user_id', user.id)
    .eq('permission', 'super_admin')
    .single()

  if (!permission) {
    // Redirect non-super-admins to staff dashboard
    redirect('/versotech/staff')
  }

  return <>{children}</>
}
