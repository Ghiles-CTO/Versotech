import { requireStaffAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfilePageClient } from './profile-page-client'
import { User, Calendar, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StaffProfilePage() {
  const user = await requireStaffAuth()
  const supabase = await createClient()

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

  // Format member since date
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Format role display
  const roleDisplay = profile.role
    .replace('staff_', '')
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Staff Profile</h1>
          <p className="text-white/70 mt-1">
            Manage your staff account settings and preferences
          </p>
        </div>

        {/* Account Overview */}
        <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-white" />
            <CardTitle className="text-white">Account Overview</CardTitle>
          </div>
          <CardDescription className="text-white/60">
            Your VERSO Technologies staff portal account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-white/60">Staff Role</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-lg font-semibold text-white">{roleDisplay}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Member Since</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-white/60" />
                <p className="text-lg font-semibold text-white">{memberSince}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Account Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-lg font-semibold text-white">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Client-side Profile Management */}
        <ProfilePageClient profile={profile} variant="staff" />
      </div>
  )
}
