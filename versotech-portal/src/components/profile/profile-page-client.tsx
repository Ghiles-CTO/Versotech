'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProfileImageUpload } from '@/components/profile/profile-image-upload'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { KYCDocumentsTab } from '@/components/profile/kyc-documents-tab'
import { CounterpartyEntitiesTab } from '@/components/profile/counterparty-entities-tab'
import { InvestorMembersTab } from '@/components/profile/investor-members-tab'
import { InvestorInfoForm } from '@/components/profile/investor-info-form'
import { KYCQuestionnaire } from '@/components/kyc/KYCQuestionnaire'
import { KYCAlert } from '@/components/dashboard/kyc-alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Settings, Briefcase, FileText, Building2, Bell, ShieldCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
    // We might need to fetch this separately if not in the profile object
    // For now assuming we can get it or pass it
  }
  variant?: 'investor' | 'staff'
}

export function ProfilePageClient({ profile: initialProfile, variant = 'investor' }: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const isStaff = variant === 'staff'
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'profile'

  // TODO: Fetch real KYC status. For now defaulting to not_started or fetching from API
  const [kycStatus, setKycStatus] = useState<string>('not_started')
  const [isEntityInvestor, setIsEntityInvestor] = useState(false)

  useEffect(() => {
    // Fetch KYC status
    const fetchKycStatus = async () => {
      try {
        // This endpoint needs to be verified/created
        const response = await fetch('/api/investors/me/kyc-status')
        if (response.ok) {
          const data = await response.json()
          setKycStatus(data.status)
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error)
      }
    }

    // Fetch investor type to determine if entity-type investor
    const fetchInvestorType = async () => {
      try {
        const response = await fetch('/api/investors/me/kyc-submissions')
        if (response.ok) {
          const data = await response.json()
          setIsEntityInvestor(data.is_entity_investor || false)
        }
      } catch (error) {
        console.error('Error fetching investor type:', error)
      }
    }

    if (!isStaff) {
      fetchKycStatus()
      fetchInvestorType()
    }
  }, [isStaff])

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

  const handleSubmitApplication = async () => {
    try {
      const response = await fetch('/api/investors/me/kyc-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' })
      })

      if (response.ok) {
        setKycStatus('pending')
        toast.success('KYC Application Submitted', {
          description: 'Your application is now under review.'
        })
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      toast.error('Submission Failed', {
        description: 'Please try again later.'
      })
    }
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

          {!isStaff && (
            <div className="mt-6">
              <KYCAlert status={kycStatus} />
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Tabs */}
      <div className="lg:col-span-2">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className={isStaff ? "grid w-full grid-cols-3 bg-white/5 border border-white/10" : `grid w-full ${isEntityInvestor ? 'grid-cols-6' : 'grid-cols-5'}`}>
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
              {isStaff ? <Bell className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              {isStaff ? 'Notifications' : 'Preferences'}
            </TabsTrigger>
            {!isStaff && (
              <>
                <TabsTrigger value="kyc">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  KYC & Onboarding
                </TabsTrigger>
                {isEntityInvestor && (
                  <TabsTrigger value="members">
                    <Users className="h-4 w-4 mr-2" />
                    Members
                  </TabsTrigger>
                )}
                <TabsTrigger value="entities">
                  <Building2 className="h-4 w-4 mr-2" />
                  Entities
                </TabsTrigger>
              </>
            )}
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
            <PreferencesEditor variant={variant} />
          </TabsContent>

          {!isStaff && (
            <>
              <TabsContent value="kyc" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">KYC Verification</h2>
                    <p className="text-muted-foreground">Complete your profile to unlock full access.</p>
                  </div>
                  {kycStatus !== 'completed' && kycStatus !== 'pending' && (
                    <Button onClick={handleSubmitApplication} className="bg-emerald-600 hover:bg-emerald-700">
                      Submit Application
                    </Button>
                  )}
                </div>

                {/* Step 1: Contact Information */}
                <InvestorInfoForm />

                {/* Step 2: Compliance Questionnaire */}
                <KYCQuestionnaire />

                {/* Step 3: Supporting Documents */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-medium mb-4">Supporting Documents</h3>
                  <KYCDocumentsTab />
                </div>
              </TabsContent>
              {isEntityInvestor && (
                <TabsContent value="members" className="mt-6">
                  <InvestorMembersTab />
                </TabsContent>
              )}
              <TabsContent value="entities" className="mt-6">
                <CounterpartyEntitiesTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
