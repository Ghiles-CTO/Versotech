import Link from 'next/link'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  FileText,
  Layers,
  MapPin,
  MessageSquare,
  Target,
  User as UserIcon
} from 'lucide-react'

import { AppLayout } from '@/components/layout/app-layout'
import { FeaturedDealsSection, type FeaturedDeal } from '@/components/dashboard/featured-deals-section'
import { InvestorActionCenter, type DashboardActivity, type DashboardTask } from '@/components/dashboard/investor-action-center'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { VideoIntroWrapper } from './video-intro-wrapper'

export const dynamic = 'force-dynamic'

interface DashboardContext {
  user: User | null
  investorIds: string[]
  profile: {
    displayName: string | null
    avatarUrl: string | null
    hasSeenIntroVideo: boolean
  } | null
}

interface PortfolioVehicle {
  id: string
  name: string
  type: string
  domicile?: string | null
  currency?: string | null
  subscriptions?: Array<{
    investor_id: string
    commitment: number | null
    status: string
  }> | null
  positions?: Array<{
    investor_id: string
    units: number | null
    cost_basis: number | null
    last_nav: number | null
    as_of_date: string | null
  }> | null
}

interface PortfolioData {
  hasData: boolean
  vehicles: PortfolioVehicle[]
  recentActivity: DashboardActivity[]
}

interface ActionCenterData {
  tasks: DashboardTask[]
  tasksTotal: number
}

interface UpcomingHighlight {
  id: string
  label: string
  description: string
  date: string
  href: string
  accent: 'blue' | 'amber'
}

async function getDashboardContext(): Promise<DashboardContext> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('[Investor Dashboard] Auth error:', error.message)
  }

  if (!user) {
    return {
      user: null,
      investorIds: [],
      profile: null
    }
  }

  const serviceSupabase = createServiceClient()

  // Fetch investor links and profile in parallel for performance
  const [investorLinksRes, profileRes] = await Promise.all([
    serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id),
    serviceSupabase
      .from('profiles')
      .select('display_name, avatar_url, has_seen_intro_video')
      .eq('id', user.id)
      .single()
  ])

  if (investorLinksRes.error) {
    console.error('[Investor Dashboard] Investor link error:', investorLinksRes.error.message)
  }

  const investorIds = investorLinksRes.data?.map(link => link.investor_id) ?? []

  return {
    user,
    investorIds,
    profile: profileRes.data ? {
      displayName: profileRes.data.display_name,
      avatarUrl: profileRes.data.avatar_url,
      hasSeenIntroVideo: profileRes.data.has_seen_intro_video ?? true
    } : null
  }
}

async function getPortfolioData(investorIds: string[]): Promise<PortfolioData> {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

  if (!investorIds.length) {
    return {
      hasData: false,
      vehicles: [],
      recentActivity: []
    }
  }

  try {
    const supabase = createServiceClient()

    const [positionsRes, subscriptionsRes, cashflowsRes, performanceRes, vehiclesRes, activityRes] = await Promise.all([
      supabase
        .from('positions')
        .select('*')
        .in('investor_id', investorIds),
      supabase
        .from('subscriptions')
        .select('commitment')
        .in('investor_id', investorIds)
        .eq('status', 'active'),
      supabase
        .from('cashflows')
        .select('type, amount')
        .in('investor_id', investorIds),
      supabase
        .from('performance_snapshots')
        .select('nav_value, contributed, distributed, dpi, tvpi, irr_net')
        .in('investor_id', investorIds)
        .order('snapshot_date', { ascending: false })
        .limit(investorIds.length),
      supabase
        .from('vehicles')
        .select(`
          id,
          name,
          type,
          domicile,
          currency,
          subscriptions!inner(investor_id, commitment, status),
          positions(investor_id, units, cost_basis, last_nav, as_of_date)
        `)
        .in('subscriptions.investor_id', investorIds)
        .eq('subscriptions.status', 'active'),
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
        .limit(10)
    ])

    const positions = positionsRes.data ?? []
    const subscriptions = subscriptionsRes.data ?? []
    const cashflows = cashflowsRes.data ?? []
    const latestPerformance = performanceRes.data ?? []
    const vehicles = (vehiclesRes.data ?? []) as PortfolioVehicle[]

    // Map event types to user-friendly display
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
      // deals comes back as object from single FK join
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

    const totalContributed = cashflows
      .filter(cf => cf.type === 'call')
      .reduce((sum, cf) => sum + (cf.amount ?? 0), 0)

    const totalDistributions = cashflows
      .filter(cf => cf.type === 'distribution')
      .reduce((sum, cf) => sum + (cf.amount ?? 0), 0)

    const totalCommitment = subscriptions
      .reduce((sum, sub) => sum + (sub.commitment ?? 0), 0)

    const unfundedCommitment = totalCommitment - totalContributed

    const currentNAV = positions
      .reduce((sum, pos) => sum + ((pos.units ?? 0) * (pos.last_nav ?? 0)), 0)

    let finalNAV = currentNAV
    let finalContributed = totalContributed
    let finalDistributions = totalDistributions

    if (latestPerformance.length > 0) {
      const aggregatedNAV = latestPerformance.reduce((sum, perf) => sum + (perf.nav_value ?? 0), 0)
      const aggregatedContributed = latestPerformance.reduce((sum, perf) => sum + (perf.contributed ?? 0), 0)
      const aggregatedDistributed = latestPerformance.reduce((sum, perf) => sum + (perf.distributed ?? 0), 0)

      finalNAV = aggregatedNAV || currentNAV
      finalContributed = aggregatedContributed || totalContributed
      finalDistributions = aggregatedDistributed || totalDistributions
    }

    const costBasis = positions.reduce((sum, pos) => sum + (pos.cost_basis ?? 0), 0)
    const hasData =
      finalContributed > 0 || finalNAV > 0 || costBasis > 0 || unfundedCommitment > 0 || finalDistributions > 0

    const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Investor Dashboard] portfolio-data-fetch: ${duration.toFixed(2)}ms`)
    }

    return {
      hasData,
      vehicles,
      recentActivity
    }
  } catch (error) {
    console.error('[Investor Dashboard] Portfolio data error:', error)
    return {
      hasData: false,
      vehicles: [],
      recentActivity: []
    }
  }
}

async function getFeaturedDeals(userId: string | null): Promise<FeaturedDeal[]> {
  if (!userId) {
    return []
  }

  try {
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
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
      .or(`close_at.is.null,close_at.gte.${now}`)
      .order('close_at', { ascending: true, nullsFirst: false })
      .limit(3)

    if (error) {
      console.error('[Investor Dashboard] Featured deals error:', error.message)
      return []
    }

    return (data ?? []) as unknown as FeaturedDeal[]
  } catch (error) {
    console.error('[Investor Dashboard] Featured deals exception:', error)
    return []
  }
}

async function getActionCenterData(userId: string | null, investorIds: string[]): Promise<ActionCenterData> {
  if (!userId) {
    return {
      tasks: [],
      tasksTotal: 0
    }
  }

  // Priority order: high first, then medium, then low
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }

  try {
    const supabase = createServiceClient()
    let query = supabase
      .from('tasks')
      .select('id, title, status, priority, due_at, category', { count: 'exact' })
      .not('status', 'eq', 'completed')
      .not('status', 'eq', 'waived')

    if (investorIds.length > 0) {
      query = query.or(`owner_user_id.eq.${userId},owner_investor_id.in.(${investorIds.join(',')})`)
    } else {
      query = query.eq('owner_user_id', userId)
    }

    const { data, count, error } = await query
      .order('due_at', { ascending: true, nullsFirst: false })
      .limit(12)

    if (error) {
      console.error('[Investor Dashboard] Action center task error:', error.message)
      return {
        tasks: [],
        tasksTotal: 0
      }
    }

    // Sort by priority (high → medium → low), then by due_at
    const sortedTasks = (data ?? []).sort((a, b) => {
      const pA = priorityOrder[a.priority] ?? 99
      const pB = priorityOrder[b.priority] ?? 99
      if (pA !== pB) return pA - pB
      // Secondary sort: due_at ascending, nulls last
      if (!a.due_at && !b.due_at) return 0
      if (!a.due_at) return 1
      if (!b.due_at) return -1
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    })

    return {
      tasks: sortedTasks as DashboardTask[],
      tasksTotal: count ?? sortedTasks.length
    }
  } catch (error) {
    console.error('[Investor Dashboard] Action center exception:', error)
    return {
      tasks: [],
      tasksTotal: 0
    }
  }
}

function formatVehicleMeta(vehicle: PortfolioVehicle) {
  const typeLabel = vehicle.type ? vehicle.type.replace(/_/g, ' ') : 'Vehicle'
  const location = vehicle.domicile || vehicle.currency || 'Global'
  return `${typeLabel} • ${location}`
}

function HoldingsSnapshot({ vehicles }: { vehicles: PortfolioVehicle[] }) {
  const displayed = vehicles.slice(0, 4)

  return (
    <Card className="h-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-1.5 border-b p-6">
        <CardTitle className="text-base font-semibold text-slate-900">Portfolio snapshot</CardTitle>
        <CardDescription className="text-sm text-slate-600">
          At-a-glance view of the vehicles you&apos;re currently allocated to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {displayed.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
            No active holdings yet. Allocations will appear here once your onboarding is complete.
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/versoholdings/vehicle/${vehicle.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white/90 p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{vehicle.name}</p>
                  <p className="text-xs text-slate-500">{formatVehicleMeta(vehicle)}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t p-6">
        <Badge variant="outline" className="rounded-full border-slate-200/80 bg-slate-50 text-slate-600">
          {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} tracked
        </Badge>
        <Link href="/versoholdings/holdings">
          <Button variant="outline" size="sm">
            Open holdings workspace
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function VersoServicesCard() {
  return (
    <Card className="h-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-1.5 border-b p-6">
        <CardTitle className="text-base font-semibold text-slate-900">VERSO concierge</CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Direct access to deal rooms, bespoke reporting, and support.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        <Button className="w-full justify-start rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 hover:border-primary/40 hover:bg-primary/5" variant="outline">
          <Layers className="mr-2 h-4 w-4" />
          Concluder™ Deal Room
        </Button>
        <Button className="w-full justify-start rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 hover:border-primary/40 hover:bg-primary/5" variant="outline">
          <Target className="mr-2 h-4 w-4" />
          Off-market opportunities
        </Button>
        <Button className="w-full justify-start rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 hover:border-primary/40 hover:bg-primary/5" variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Request position statement
        </Button>
        <Link href="/versoholdings/reports">
          <Button className="w-full justify-start rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 hover:border-primary/40 hover:bg-primary/5" variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Custom analytics request
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function WelcomePanel() {
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
    <section className="rounded-3xl border border-slate-200/80 bg-white px-8 py-10 shadow-sm">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Investor onboarding
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Welcome to VERSO Holdings
            </h2>
            <p className="text-sm text-slate-600">
              Complete your onboarding steps to unlock performance analytics, live deal access, and bespoke reporting matched to your mandate.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <Card
              key={highlight.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 text-left shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                {highlight.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{highlight.title}</h3>
              <p className="mt-1 text-xs text-slate-600">{highlight.description}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
          <Link href="/versoholdings/tasks" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Complete onboarding
            </Button>
          </Link>
          <Link href="/versoholdings/messages" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Contact VERSO team
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function ScheduleHighlights({ items }: { items: UpcomingHighlight[] }) {
  if (!items.length) {
    return (
      <Card className="h-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
        <CardHeader className="space-y-1.5 border-b p-6">
          <CardTitle className="text-base font-semibold text-slate-900">Upcoming schedule</CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Deadlines and deal milestones will surface here once they are scheduled.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-t p-6">
          <Link href="/versoholdings/calendar" className="w-full">
            <Button variant="outline" className="w-full">
              Open calendar
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const accentClasses: Record<UpcomingHighlight['accent'], string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return (
    <Card className="h-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-1.5 border-b p-6">
        <CardTitle className="text-base font-semibold text-slate-900">Upcoming schedule</CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Stay ahead of the next approvals, deal closes, and reporting deliverables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${accentClasses[item.accent]}`}
              >
                {item.label}
              </Badge>
              <span className="text-xs font-medium text-slate-500">{item.date}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{item.description}</p>
            <Link
              href={item.href}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View details
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t p-6">
        <Link href="/versoholdings/calendar" className="w-full">
          <Button variant="outline" className="w-full">
            Open calendar
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function buildUpcomingHighlights(deals: FeaturedDeal[], tasks: DashboardTask[]): UpcomingHighlight[] {
  const highlights: UpcomingHighlight[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Start of today

  // Deals are already filtered server-side to only include future closing dates
  const nextDeal = deals
    .filter(deal => deal.close_at)
    .sort((a, b) => new Date(a.close_at ?? 0).getTime() - new Date(b.close_at ?? 0).getTime())[0]

  if (nextDeal?.close_at) {
    const dueDate = new Date(nextDeal.close_at)
    highlights.push({
      id: `deal-${nextDeal.id}`,
      label: 'Deal close',
      description: `${nextDeal.name} closes ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      date: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      href: `/versoholdings/deal/${nextDeal.id}`,
      accent: 'blue'
    })
  }

  // Filter and sort tasks that are due in the future
  const nextTask = tasks
    .filter(task => task.due_at && new Date(task.due_at) >= now && task.status !== 'completed')
    .sort((a, b) => new Date(a.due_at ?? 0).getTime() - new Date(b.due_at ?? 0).getTime())[0]

  if (nextTask?.due_at) {
    const dueDate = new Date(nextTask.due_at)
    highlights.push({
      id: `task-${nextTask.id}`,
      label: 'Action item',
      description: nextTask.title,
      date: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      href: '/versoholdings/tasks',
      accent: 'amber'
    })
  }

  return highlights
}

export default async function InvestorDashboard() {
  const { user, investorIds, profile } = await getDashboardContext()
  const [portfolioData, featuredDeals, actionCenter] = await Promise.all([
    getPortfolioData(investorIds),
    getFeaturedDeals(user?.id ?? null),
    getActionCenterData(user?.id ?? null, investorIds)
  ])

  // Check if user has seen intro video (already fetched in getDashboardContext)
  const showIntroVideo = profile ? !profile.hasSeenIntroVideo : false
  const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-assets/videos/intro-video.mp4`

  const summaryTiles = [
    {
      label: 'Open opportunities',
      value: featuredDeals.length,
      helper: 'Available deals'
    },
    {
      label: 'Outstanding tasks',
      value: actionCenter.tasksTotal,
      helper: actionCenter.tasksTotal ? 'Pending actions' : 'All caught up'
    },
    {
      label: 'Active holdings',
      value: portfolioData.vehicles.length,
      helper: 'Investment vehicles'
    }
  ]

  const upcomingHighlights = buildUpcomingHighlights(featuredDeals, actionCenter.tasks)

  return (
    <VideoIntroWrapper showIntroVideo={showIntroVideo} videoUrl={videoUrl}>
      <AppLayout brand="versoholdings">
      <div className="space-y-12 px-6 pb-16 pt-10">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.9fr,1fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 shadow-sm overflow-hidden">
                    {profile?.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.displayName || 'Investor'}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        priority
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Investor portal
                    </p>
                    <h1 className="text-3xl font-semibold text-slate-900">
                      {profile?.displayName
                        ? `Welcome, ${profile.displayName.split(' ')[0]}`
                        : 'Welcome'}
                    </h1>
                    <p className="text-sm text-slate-600">
                      VERSO Holdings • Merchant Banking Group • Since 1958
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {summaryTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {tile.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{tile.value}</p>
                    <p className="mt-1 text-xs text-slate-600">{tile.helper}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                <Badge variant="outline" className="rounded-full border-slate-200/80 bg-slate-50 text-slate-600">
                  <MapPin className="mr-1 h-3 w-3" /> Luxembourg HQ
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-200/80 bg-slate-50 text-slate-600">
                  <Building2 className="mr-1 h-3 w-3" /> BVI Professional Fund
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-200/80 bg-slate-50 text-slate-600">
                  <Target className="mr-1 h-3 w-3" /> PE • VC • Real Estate
                </Badge>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link href="/versoholdings/holdings" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto">
                    View holdings
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/versoholdings/calendar" className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    Calendar & deadlines
                    <CalendarClock className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Portal snapshot
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-slate-600">
                Your investment dashboard with key metrics and upcoming deadlines.
              </p>
              <Link
                href="/versoholdings/tasks"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
              >
                Review action centre
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        <FeaturedDealsSection deals={featuredDeals} />

        <InvestorActionCenter
          tasks={actionCenter.tasks}
          tasksTotal={actionCenter.tasksTotal}
          recentActivity={portfolioData.recentActivity}
        />

        {portfolioData.hasData ? (
          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <HoldingsSnapshot vehicles={portfolioData.vehicles} />
            <ScheduleHighlights items={upcomingHighlights} />
          </div>
        ) : (
          <WelcomePanel />
        )}

        <VersoServicesCard />
      </div>
      </AppLayout>
    </VideoIntroWrapper>
  )
}
