'use client'

import { useState } from 'react'
import { ProfileImageUpload } from '@/components/profile/profile-image-upload'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Settings, Briefcase } from 'lucide-react'

interface ProfilePageClientProps {
  profile: {
    id: string
    email: string | null
    display_name: string | null
    title: string | null
    avatar_url: string | null
    phone: string | null
    office_location: string | null
    bio: string | null
    role: string
    created_at: string
  }
  variant?: 'investor' | 'staff'
}

export function ProfilePageClient({ profile: initialProfile, variant = 'investor' }: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const isStaff = variant === 'staff'

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfile(prev => ({
      ...prev,
      avatar_url: newAvatarUrl
    }))
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(prev => ({
      ...prev,
      ...updatedProfile
    }))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column - Avatar */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <ProfileImageUpload
            currentAvatarUrl={profile.avatar_url}
            userName={profile.display_name || profile.email || (isStaff ? 'Staff User' : 'User')}
            onAvatarUpdate={handleAvatarUpdate}
          />

          {/* Quick Info Card - Staff Only */}
          {isStaff && (
            <div className="mt-6 p-4 border border-white/10 rounded-lg bg-white/5 space-y-3">
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  Contact
                </p>
                <p className="text-sm mt-1 text-white">{profile.email}</p>
                {profile.phone && (
                  <p className="text-sm text-white/70">{profile.phone}</p>
                )}
              </div>

              {profile.office_location && (
                <div>
                  <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                    Office
                  </p>
                  <p className="text-sm mt-1 text-white">{profile.office_location}</p>
                </div>
              )}

              {profile.title && (
                <div>
                  <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                    Title
                  </p>
                  <p className="text-sm mt-1 text-white">{profile.title}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Tabs */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={isStaff ? "grid w-full grid-cols-3 bg-white/5 border border-white/10" : "grid w-full grid-cols-3"}>
            <TabsTrigger
              value="profile"
              className={isStaff ? "data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70" : ""}
            >
              {isStaff ? <Briefcase className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={isStaff ? "data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70" : ""}
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className={isStaff ? "data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70" : ""}
            >
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileForm
              userId={profile.id}
              initialData={profile}
              onUpdate={handleProfileUpdate}
              showStaffFields={isStaff}
            />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <PasswordChangeForm />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <PreferencesEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
