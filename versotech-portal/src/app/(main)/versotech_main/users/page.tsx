'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Users, Briefcase, Building2, HandshakeIcon, Scale, UserCog } from 'lucide-react'

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

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Loading {label}...</span>
    </div>
  )
}

function ComingSoon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    partners: <HandshakeIcon className="h-12 w-12 text-muted-foreground/50" />,
    'commercial-partners': <Building2 className="h-12 w-12 text-muted-foreground/50" />,
    lawyers: <Scale className="h-12 w-12 text-muted-foreground/50" />,
  }

  const labels: Record<string, string> = {
    partners: 'Partner Management',
    'commercial-partners': 'Commercial Partner Management',
    lawyers: 'Lawyer Management',
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        {icons[type] || <UserCog className="h-12 w-12 text-muted-foreground/50" />}
        <h3 className="mt-4 text-lg font-medium text-foreground">{labels[type] || 'Management'}</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
          This feature is coming soon. {type === 'partners' && 'Partners will be able to view shared transactions and co-invest in deals.'}
          {type === 'commercial-partners' && 'Commercial partners will manage client relationships and proxy subscriptions.'}
          {type === 'lawyers' && 'Legal counsel will access assigned deals and manage escrow accounts.'}
        </p>
      </CardContent>
    </Card>
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
          <ComingSoon type="partners" />
        </TabsContent>

        <TabsContent value="commercial-partners" className="mt-6">
          <ComingSoon type="commercial-partners" />
        </TabsContent>

        <TabsContent value="lawyers" className="mt-6">
          <ComingSoon type="lawyers" />
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
