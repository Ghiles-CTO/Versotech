import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfilePageClient } from '@/components/profile/profile-page-client'
import { User, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/versotech_main/login')
  }

  // Fetch complete profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading profile data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine variant based on role
  const isStaff = ['staff_admin', 'staff_ops', 'staff_rm', 'staff', 'admin'].includes(profile.role)

  // Format member since date
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Account Overview</CardTitle>
          </div>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Type</p>
              <p className="text-lg font-semibold capitalize">{profile.role.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg font-semibold">{memberSince}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client-side Profile Management */}
      <ProfilePageClient profile={profile} variant={isStaff ? 'staff' : 'investor'} />
    </div>
  )
}
