'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { usePersona, Persona } from '@/contexts/persona-context'
import { useTheme } from '@/components/theme-provider'
import { InvestorActionCenter, DashboardTask, DashboardActivity } from '@/components/dashboard/investor-action-center'
import { FeaturedDealsSection, FeaturedDeal } from '@/components/dashboard/featured-deals-section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  FileText,
  Layers,
  MapPin,
  MessageSquare,
  Target,
  User as UserIcon,
  Loader2
} from 'lucide-react'

interface PortfolioVehicle {
  id: string
  name: string
  type: string
  domicile?: string | null
  currency?: string | null
}

interface InvestorDashboardData {
  profile: {
    displayName: string | null
    avatarUrl: string | null
  } | null
  vehicles: PortfolioVehicle[]
  featuredDeals: FeaturedDeal[]
  tasks: DashboardTask[]
  tasksTotal: number
  recentActivity: DashboardActivity[]
  hasPortfolioData: boolean
}

interface InvestorDashboardProps {
  investorId: string
  userId: string
  persona: Persona
}

function formatVehicleMeta(vehicle: PortfolioVehicle) {
  const typeLabel = vehicle.type ? vehicle.type.replace(/_/g, ' ') : 'Vehicle'
  const location = vehicle.domicile || vehicle.currency || 'Global'
  return `${typeLabel} • ${location}`
}

function DashboardSkeleton() {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  return (
    <div className="space-y-8 animate-pulse">
      <div className={cn(
        "rounded-3xl border p-8",
        isDark ? "border-white/10 bg-white/5" : "border-slate-200/80 bg-white"
      )}>
        <div className="grid gap-8 lg:grid-cols-[1.9fr,1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function HoldingsSnapshot({ vehicles }: { vehicles: PortfolioVehicle[] }) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const displayed = vehicles.slice(0, 4)

  return (
    <Card className={cn(
      "h-full overflow-hidden rounded-2xl border shadow-sm",
      isDark ? "border-white/10 bg-card" : "border-slate-200/80"
    )}>
      <CardHeader className="space-y-1.5 border-b p-6">
        <CardTitle className={cn(
          "text-base font-semibold",
          isDark ? "text-white" : "text-slate-900"
        )}>Portfolio snapshot</CardTitle>
        <CardDescription className={cn(
          "text-sm",
          isDark ? "text-gray-400" : "text-slate-600"
        )}>
          At-a-glance view of the vehicles you&apos;re currently allocated to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {displayed.length === 0 ? (
          <div className={cn(
            "rounded-xl border border-dashed p-6 text-center text-sm",
            isDark
              ? "border-white/10 bg-white/5 text-gray-400"
              : "border-slate-200/80 bg-slate-50/80 text-slate-500"
          )}>
            No active holdings yet. Allocations will appear here once your onboarding is complete.
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/versotech_main/opportunities?vehicle=${vehicle.id}`}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-xl border p-4 transition-all hover:border-primary/40 hover:bg-primary/5",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200/80 bg-white/90"
                )}
              >
                <div className="space-y-1">
                  <p className={cn(
                    "text-sm font-semibold",
                    isDark ? "text-white" : "text-slate-900"
                  )}>{vehicle.name}</p>
                  <p className={cn(
                    "text-xs",
                    isDark ? "text-gray-400" : "text-slate-500"
                  )}>{formatVehicleMeta(vehicle)}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t p-6">
        <Badge variant="outline" className={cn(
          "rounded-full",
          isDark
            ? "border-white/10 bg-white/5 text-gray-300"
            : "border-slate-200/80 bg-slate-50 text-slate-600"
        )}>
          {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} tracked
        </Badge>
        <Link href="/versotech_main/opportunities">
          <Button variant="outline" size="sm">
            Open holdings workspace
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function VersoServicesCard() {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  return (
    <Card className={cn(
      "h-full overflow-hidden rounded-2xl border shadow-sm",
      isDark ? "border-white/10 bg-card" : "border-slate-200/80"
    )}>
      <CardHeader className="space-y-1.5 border-b p-6">
        <CardTitle className={cn(
          "text-base font-semibold",
          isDark ? "text-white" : "text-slate-900"
        )}>VERSO concierge</CardTitle>
        <CardDescription className={cn(
          "text-sm",
          isDark ? "text-gray-400" : "text-slate-600"
        )}>
          Direct access to deal rooms, bespoke reporting, and support.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        <Link href="/versotech_main/opportunities">
          <Button className={cn(
            "w-full justify-start rounded-xl border hover:border-primary/40 hover:bg-primary/5",
            isDark
              ? "border-white/10 bg-white/5 text-gray-200"
              : "border-slate-200/80 bg-white/80 text-slate-700"
          )} variant="outline">
            <Layers className="mr-2 h-4 w-4" />
            Concluder™ Deal Room
          </Button>
        </Link>
        <Link href="/versotech_main/opportunities">
          <Button className={cn(
            "w-full justify-start rounded-xl border hover:border-primary/40 hover:bg-primary/5",
            isDark
              ? "border-white/10 bg-white/5 text-gray-200"
              : "border-slate-200/80 bg-white/80 text-slate-700"
          )} variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Off-market opportunities
          </Button>
        </Link>
        <Link href="/versotech_main/documents">
          <Button className={cn(
            "w-full justify-start rounded-xl border hover:border-primary/40 hover:bg-primary/5",
            isDark
              ? "border-white/10 bg-white/5 text-gray-200"
              : "border-slate-200/80 bg-white/80 text-slate-700"
          )} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Request position statement
          </Button>
        </Link>
        <Link href="/versotech_main/inbox">
          <Button className={cn(
            "w-full justify-start rounded-xl border hover:border-primary/40 hover:bg-primary/5",
            isDark
              ? "border-white/10 bg-white/5 text-gray-200"
              : "border-slate-200/80 bg-white/80 text-slate-700"
          )} variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Custom analytics request
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function WelcomePanel() {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  const highlights = [
    {
      id: 'fund',
      title: 'VERSO FUND',
      description: 'BVI professional mutual fund access',
      icon: <Building2 className="h-6 w-6" />
    },
    {
      id: 'real-estate',
      title: 'REAL Empire',
      description: 'Institutional real estate securitisation',
      icon: <Target className="h-6 w-6" />
    },
    {
      id: 'lux',
      title: 'Luxembourg Platforms',
      description: 'European investment infrastructure',
      icon: <MapPin className="h-6 w-6" />
    }
  ]

  return (
    <section className={cn(
      "rounded-3xl border px-8 py-10 shadow-sm",
      isDark ? "border-white/10 bg-card" : "border-slate-200/80 bg-white"
    )}>
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm",
            isDark ? "bg-white/10 text-white" : "bg-slate-900 text-white"
          )}>
            <Building2 className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <p className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              isDark ? "text-gray-400" : "text-slate-500"
            )}>
              Investor onboarding
            </p>
            <h2 className={cn(
              "text-3xl font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}>
              Welcome to VERSO Holdings
            </h2>
            <p className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-slate-600"
            )}>
              Complete your onboarding steps to unlock performance analytics, live deal access, and bespoke reporting matched to your mandate.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <Card
              key={highlight.id}
              className={cn(
                "rounded-2xl border p-6 text-left shadow-sm",
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200/80 bg-slate-50/60"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm",
                isDark
                  ? "bg-white/10 text-white"
                  : "bg-white text-slate-900"
              )}>
                {highlight.icon}
              </div>
              <h3 className={cn(
                "mt-4 text-sm font-semibold",
                isDark ? "text-white" : "text-slate-900"
              )}>{highlight.title}</h3>
              <p className={cn(
                "mt-1 text-xs",
                isDark ? "text-gray-400" : "text-slate-600"
              )}>{highlight.description}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
          <Link href="/versotech_main/tasks" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Complete onboarding
            </Button>
          </Link>
          <Link href="/versotech_main/inbox" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Contact VERSO team
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export function InvestorDashboard({ investorId, userId, persona }: InvestorDashboardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const [data, setData] = useState<InvestorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const investorIds = [investorId]

        // Fetch all data in parallel
        const [
          profileRes,
          vehiclesRes,
          dealsRes,
          tasksRes,
          activityRes,
          positionsRes
        ] = await Promise.all([
          // Profile
          supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', userId)
            .single(),

          // Vehicles with active subscriptions
          supabase
            .from('vehicles')
            .select(`
              id,
              name,
              type,
              domicile,
              currency,
              subscriptions!inner(investor_id, status)
            `)
            .in('subscriptions.investor_id', investorIds)
            .eq('subscriptions.status', 'active'),

          // Featured deals user has access to
          supabase
            .from('deals')
            .select(`
              id,
              name,
              status,
              deal_type,
              currency,
              offer_unit_price,
              open_at,
              close_at,
              company_name,
              company_logo_url,
              sector,
              location,
              vehicles ( id, name, type ),
              deal_memberships!inner ( user_id )
            `)
            .eq('deal_memberships.user_id', userId)
            .eq('status', 'open')
            .order('close_at', { ascending: true, nullsFirst: false })
            .limit(3),

          // Tasks
          supabase
            .from('tasks')
            .select('id, title, status, priority, due_at, category', { count: 'exact' })
            .not('status', 'eq', 'completed')
            .not('status', 'eq', 'waived')
            .or(`owner_user_id.eq.${userId},owner_investor_id.in.(${investorIds.join(',')})`)
            .order('due_at', { ascending: true, nullsFirst: false })
            .limit(12),

          // Activity
          supabase
            .from('deal_activity_events')
            .select(`
              id,
              event_type,
              payload,
              occurred_at,
              deal_id,
              deals:deal_id(name)
            `)
            .in('investor_id', investorIds)
            .order('occurred_at', { ascending: false })
            .limit(10),

          // Positions (to check if user has portfolio data)
          supabase
            .from('positions')
            .select('id')
            .in('investor_id', investorIds)
            .limit(1)
        ])

        // Map activity events to dashboard activity format
        const eventTypeMap: Record<string, { title: string; activity_type: string }> = {
          im_interested: { title: 'Expressed Interest', activity_type: 'deal' },
          nda_completed: { title: 'NDA Signed', activity_type: 'document' },
          data_room_submit: { title: 'Allocation Submitted', activity_type: 'allocation' },
          subscription_completed: { title: 'Subscription Completed', activity_type: 'deal' },
          data_room_granted: { title: 'Data Room Access', activity_type: 'document' },
          closed_deal_interest: { title: 'Interest Registered', activity_type: 'deal' },
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentActivity: DashboardActivity[] = (activityRes.data ?? []).map((event: any) => {
          const mapping = eventTypeMap[event.event_type] || { title: event.event_type, activity_type: 'deal' }
          const dealName = event.deals?.name || 'Deal'
          const amount = (event.payload?.commitment || event.payload?.indicative_amount) as number | undefined

          return {
            id: event.id,
            title: mapping.title,
            description: amount ? `${dealName} - $${amount.toLocaleString()}` : dealName,
            activity_type: mapping.activity_type,
            created_at: event.occurred_at,
            importance: 'normal',
            read_status: null
          }
        })

        // Sort tasks by priority then due date
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
        const sortedTasks = (tasksRes.data ?? []).sort((a, b) => {
          const pA = priorityOrder[a.priority] ?? 99
          const pB = priorityOrder[b.priority] ?? 99
          if (pA !== pB) return pA - pB
          if (!a.due_at && !b.due_at) return 0
          if (!a.due_at) return 1
          if (!b.due_at) return -1
          return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        })

        setData({
          profile: profileRes.data ? {
            displayName: profileRes.data.display_name,
            avatarUrl: profileRes.data.avatar_url
          } : null,
          vehicles: (vehiclesRes.data ?? []) as PortfolioVehicle[],
          featuredDeals: (dealsRes.data ?? []) as unknown as FeaturedDeal[],
          tasks: sortedTasks as DashboardTask[],
          tasksTotal: tasksRes.count ?? sortedTasks.length,
          recentActivity,
          hasPortfolioData: (positionsRes.data?.length ?? 0) > 0 || (vehiclesRes.data?.length ?? 0) > 0
        })
      } catch (err) {
        console.error('[InvestorDashboard] Error fetching data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (investorId && userId) {
      fetchDashboardData()
    }
  }, [investorId, userId])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error || 'Unable to load dashboard'}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const displayName = persona.entity_name || data.profile?.displayName || 'Investor'
  const firstName = displayName.split(' ')[0]

  const summaryTiles = [
    {
      label: 'Open opportunities',
      value: data.featuredDeals.length,
      helper: 'Available deals'
    },
    {
      label: 'Outstanding tasks',
      value: data.tasksTotal,
      helper: data.tasksTotal ? 'Pending actions' : 'All caught up'
    },
    {
      label: 'Active holdings',
      value: data.vehicles.length,
      helper: 'Investment vehicles'
    }
  ]

  return (
    <div className="space-y-12 px-0 pb-16 pt-2">
      {/* Welcome Header Section */}
      <section className={cn(
        "rounded-3xl border p-8 shadow-sm",
        isDark ? "border-white/10 bg-card" : "border-slate-200/80 bg-white"
      )}>
        <div className="grid gap-8 lg:grid-cols-[1.9fr,1fr]">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full border shadow-sm overflow-hidden",
                  isDark
                    ? "bg-gradient-to-br from-white/10 to-white/5 border-white/10"
                    : "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-200"
                )}>
                  {data.profile?.avatarUrl ? (
                    <Image
                      src={data.profile.avatarUrl}
                      alt={displayName}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      priority
                    />
                  ) : persona.entity_logo_url ? (
                    <Image
                      src={persona.entity_logo_url}
                      alt={displayName}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      priority
                    />
                  ) : (
                    <UserIcon className={cn(
                      "h-8 w-8",
                      isDark ? "text-gray-400" : "text-slate-400"
                    )} />
                  )}
                </div>
                <div className="space-y-1">
                  <p className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide",
                    isDark ? "text-gray-400" : "text-slate-500"
                  )}>
                    Investor portal
                  </p>
                  <h1 className={cn(
                    "text-3xl font-semibold",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    Welcome, {firstName}
                  </h1>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-slate-600"
                  )}>
                    VERSO Holdings • Merchant Banking Group • Since 1958
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {summaryTiles.map((tile) => (
                <div
                  key={tile.label}
                  className={cn(
                    "rounded-2xl border p-4 shadow-sm",
                    isDark
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200/80 bg-slate-50/70"
                  )}
                >
                  <p className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide",
                    isDark ? "text-gray-400" : "text-slate-500"
                  )}>
                    {tile.label}
                  </p>
                  <p className={cn(
                    "mt-2 text-2xl font-semibold",
                    isDark ? "text-white" : "text-slate-900"
                  )}>{tile.value}</p>
                  <p className={cn(
                    "mt-1 text-xs",
                    isDark ? "text-gray-400" : "text-slate-600"
                  )}>{tile.helper}</p>
                </div>
              ))}
            </div>

            <div className={cn(
              "flex flex-wrap items-center gap-2 text-xs font-medium",
              isDark ? "text-gray-400" : "text-slate-600"
            )}>
              <Badge variant="outline" className={cn(
                "rounded-full",
                isDark
                  ? "border-white/10 bg-white/5 text-gray-300"
                  : "border-slate-200/80 bg-slate-50 text-slate-600"
              )}>
                <MapPin className="mr-1 h-3 w-3" /> Luxembourg HQ
              </Badge>
              <Badge variant="outline" className={cn(
                "rounded-full",
                isDark
                  ? "border-white/10 bg-white/5 text-gray-300"
                  : "border-slate-200/80 bg-slate-50 text-slate-600"
              )}>
                <Building2 className="mr-1 h-3 w-3" /> BVI Professional Fund
              </Badge>
              <Badge variant="outline" className={cn(
                "rounded-full",
                isDark
                  ? "border-white/10 bg-white/5 text-gray-300"
                  : "border-slate-200/80 bg-slate-50 text-slate-600"
              )}>
                <Target className="mr-1 h-3 w-3" /> PE • VC • Real Estate
              </Badge>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href="/versotech_main/opportunities" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto">
                  View holdings
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/versotech_main/tasks" className="w-full sm:w-auto">
                <Button size="sm" variant="outline" className="w-full sm:w-auto">
                  Calendar & deadlines
                  <CalendarClock className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className={cn(
            "rounded-2xl border p-6 shadow-sm",
            isDark
              ? "border-white/10 bg-white/5"
              : "border-slate-200/80 bg-slate-50/70"
          )}>
            <p className={cn(
              "text-[11px] font-semibold uppercase tracking-wide",
              isDark ? "text-gray-400" : "text-slate-500"
            )}>
              Portal snapshot
            </p>
            <p className={cn(
              "mt-3 text-2xl font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <Separator className="my-4" />
            <p className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-slate-600"
            )}>
              Your investment dashboard with key metrics and upcoming deadlines.
            </p>
            <Link
              href="/versotech_main/tasks"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              Review action centre
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <FeaturedDealsSection deals={data.featuredDeals} />

      {/* Action Center */}
      <InvestorActionCenter
        tasks={data.tasks}
        tasksTotal={data.tasksTotal}
        recentActivity={data.recentActivity}
      />

      {/* Holdings or Welcome Panel */}
      {data.hasPortfolioData ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <HoldingsSnapshot vehicles={data.vehicles} />
          <VersoServicesCard />
        </div>
      ) : (
        <WelcomePanel />
      )}

      {data.hasPortfolioData && <VersoServicesCard />}
    </div>
  )
}
