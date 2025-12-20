'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Users, Briefcase, Building2, HandshakeIcon, Scale } from 'lucide-react'

// Lazy load user type content components
import dynamic from 'next/dynamic'

const InvestorsContent = dynamic(
  () => import('./investors-content'),
  {
    loading: () => <LoadingState label="investors" />,
    ssr: false
  }
)

const IntroducersContent = dynamic(
  () => import('./introducers-content'),
  {
    loading: () => <LoadingState label="introducers" />,
    ssr: false
  }
)

const ArrangersContent = dynamic(
  () => import('./arrangers-content'),
  {
    loading: () => <LoadingState label="arrangers" />,
    ssr: false
  }
)

const PartnersContent = dynamic(
  () => import('./partners-content'),
  {
    loading: () => <LoadingState label="partners" />,
    ssr: false
  }
)

const CommercialPartnersContent = dynamic(
  () => import('./commercial-partners-content'),
  {
    loading: () => <LoadingState label="commercial partners" />,
    ssr: false
  }
)

const LawyersContent = dynamic(
  () => import('./lawyers-content'),
  {
    loading: () => <LoadingState label="lawyers" />,
    ssr: false
  }
)

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Loading {label}...</span>
    </div>
  )
}

const USER_TYPES = [
  { value: 'investors', label: 'Investors', icon: Users },
  { value: 'introducers', label: 'Introducers', icon: Briefcase },
  { value: 'arrangers', label: 'Arrangers', icon: Building2 },
  { value: 'partners', label: 'Partners', icon: HandshakeIcon },
  { value: 'commercial-partners', label: 'Commercial Partners', icon: Building2 },
  { value: 'lawyers', label: 'Lawyers', icon: Scale },
] as const

type UserType = typeof USER_TYPES[number]['value']

function UsersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const typeParam = searchParams.get('type') as UserType | null
  const [activeTab, setActiveTab] = useState<UserType>(typeParam || 'investors')

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserType)
    // Update URL without full page reload
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', value)
    router.push(`/versotech_main/users?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all user types across the platform
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          {USER_TYPES.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="investors" className="mt-6">
          <Suspense fallback={<LoadingState label="investors" />}>
            <InvestorsContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="introducers" className="mt-6">
          <Suspense fallback={<LoadingState label="introducers" />}>
            <IntroducersContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="arrangers" className="mt-6">
          <Suspense fallback={<LoadingState label="arrangers" />}>
            <ArrangersContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="partners" className="mt-6">
          <Suspense fallback={<LoadingState label="partners" />}>
            <PartnersContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="commercial-partners" className="mt-6">
          <Suspense fallback={<LoadingState label="commercial partners" />}>
            <CommercialPartnersContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="lawyers" className="mt-6">
          <Suspense fallback={<LoadingState label="lawyers" />}>
            <LawyersContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Consolidated Users Page for Unified Portal (versotech_main)
 *
 * Single page to manage all user types with tab-based navigation:
 * - Investors
 * - Introducers
 * - Arrangers
 * - Partners (Coming Soon)
 * - Commercial Partners (Coming Soon)
 * - Lawyers (Coming Soon)
 *
 * URL param: ?type=investors|introducers|arrangers|partners|commercial-partners|lawyers
 */
export default function UsersPage() {
  return (
    <Suspense fallback={<LoadingState label="users" />}>
      <UsersPageContent />
    </Suspense>
  )
}
