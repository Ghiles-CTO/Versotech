import { requireStaffAuth } from '@/lib/auth'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Users,
  FileText,
  Clock,
  MessageSquare,
  TrendingUp,
  Shield,
  Database,
  Workflow,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Building2,
  Activity,
  PlayCircle,
  Zap,
  BarChart3,
  Target,
  Globe
} from 'lucide-react'
import { getStaffDashboardData } from '@/lib/staff/dashboard-data'

export const dynamic = 'force-dynamic'

const cardBaseClasses =
  'bg-[#060608] border border-white/10 shadow-lg shadow-black/20 transition-colors hover:border-white/20'

const sectionBorderClasses = 'border border-white/10 bg-[#060608]'

export default async function StaffDashboard() {
  await requireStaffAuth()

  const data = await getStaffDashboardData()

  const statusMessages: string[] = []
  if (data.errors && data.errors.length > 0) {
    statusMessages.push('Some dashboard metrics are unavailable right now.')
  }

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(data.generatedAt))

  const kpiCards = [
    {
      label: 'Active LPs',
      value: data.kpis.activeLps,
      helper: data.management.activeInvestors > data.kpis.activeLps ? 'Includes investors in review' : null,
      icon: Users,
      accent: 'text-slate-200'
    },
    {
      label: 'Pending KYC/AML',
      value: data.kpis.pendingKyc,
      helper:
        data.kpis.highPriorityKyc > 0
          ? `${data.kpis.highPriorityKyc} high priority`
          : 'All standard priority',
      icon: AlertTriangle,
      accent: 'text-amber-300'
    },
    {
      label: 'Workflow Runs (MTD)',
      value: data.kpis.workflowRunsThisMonth,
      helper: 'Includes all n8n executions',
      icon: Workflow,
      accent: 'text-sky-300'
    },
    {
      label: 'Compliance Rate',
      value: `${data.kpis.complianceRate.toFixed(1)}%`,
      helper: 'Approved investors / total',
      icon: CheckCircle,
      accent: 'text-emerald-300'
    }
  ]

  const pipelineSections = [
    {
      title: 'KYC Processing',
      description: 'Professional investor verification',
      count: `${data.pipeline.kycPending} pending`,
      icon: PlayCircle,
      accent: 'text-sky-200',
      wrapper: 'border-sky-500/40 bg-sky-500/20'
    },
    {
      title: 'NDA Execution',
      description: 'DocuSign/Dropbox Sign processing',
      count: `${data.pipeline.ndaInProgress} in progress`,
      icon: FileText,
      accent: 'text-emerald-200',
      wrapper: 'border-emerald-500/40 bg-emerald-500/20'
    },
    {
      title: 'Subscription Processing',
      description: 'Subscription agreements under review',
      count: `${data.pipeline.subscriptionReview} review`,
      icon: Building2,
      accent: 'text-amber-200',
      wrapper: 'border-amber-500/40 bg-amber-500/20'
    },
    {
      title: 'Capital Calls',
      description: data.pipeline.nextCapitalCall
        ? `${data.pipeline.nextCapitalCall.name}`
        : 'No upcoming calls scheduled',
      count: data.pipeline.nextCapitalCall
        ? new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short'
          }).format(new Date(data.pipeline.nextCapitalCall.dueDate))
        : 'All clear',
      icon: Clock,
      accent: 'text-purple-200',
      wrapper: 'border-purple-500/40 bg-purple-500/20'
    }
  ]

  const managementCards = [
    {
      title: 'Deal Management',
      description: 'Manage opportunities & allocations',
      href: '/versotech/staff/deals',
      value: data.management.activeDeals,
      icon: Building2,
      accent: 'text-sky-200'
    },
    {
      title: 'Request Management',
      description: 'Handle LP requests and SLAs',
      href: '/versotech/staff/requests',
      value: data.management.activeRequests,
      icon: ClipboardList,
      accent: 'text-amber-200'
    },
    {
      title: 'Compliance & Audit',
      description: 'Monitor regulatory posture',
      href: '/versotech/staff/audit',
      value: `${data.management.complianceRate.toFixed(1)}%`,
      icon: Shield,
      accent: 'text-emerald-200'
    },
    {
      title: 'LP Management',
      description: 'Investor onboarding & relationships',
      href: '/versotech/staff/investors',
      value: data.management.activeInvestors,
      icon: Users,
      accent: 'text-purple-200'
    }
  ]

  return (
    <AppLayout brand="versotech">
      <div className="bg-[#020204] text-slate-100 min-h-screen">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4">
            {statusMessages.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                {statusMessages.join(' ')}
              </div>
            )}

            <div className="border-b border-white/10 pb-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-white/20 bg-black/40 text-xs text-slate-200">
                      <Shield className="mr-1 h-3 w-3" />
                      BVI FSC Regulated
                    </Badge>
                    <Badge variant="outline" className="border-white/20 bg-black/40 text-xs text-slate-200">
                      <Globe className="mr-1 h-3 w-3" />
                      GDPR Compliant
                    </Badge>
                    <Badge variant="outline" className="border-white/20 bg-black/40 text-xs text-slate-200">
                      <Activity className="mr-1 h-3 w-3" />
                      n8n Workflows Active
                    </Badge>
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white">VERSO Operations</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">
                      Merchant Banking Operations • Multi-Vehicle Management • BVI/GDPR Compliant
                    </p>
                  </div>
                </div>
                <div className="text-sm text-right text-slate-400">
                  <p>Operations Dashboard</p>
                  <p className="text-lg font-semibold text-white">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map(({ label, value, helper, icon: Icon, accent }) => (
              <Card key={label} className={`${cardBaseClasses}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">{label}</CardTitle>
                  <Icon className={`h-5 w-5 ${accent}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-white">{value}</div>
                  {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className={`${sectionBorderClasses} lg:col-span-1`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-sky-300" />
                  Process Center
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Trigger n8n automation workflows ({data.processCenter.activeWorkflows} active)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Positions Statement', icon: BarChart3 },
                  { label: 'NDA Agent', icon: FileText },
                  { label: 'Shared-Drive Notification', icon: Database },
                  { label: 'Inbox Manager', icon: MessageSquare },
                  { label: 'LinkedIn Leads Scraper', icon: Target },
                  { label: 'Reporting Agent', icon: TrendingUp }
                ].map(({ label, icon: Icon }) => (
                  <Link key={label} href="/versotech/staff/processes" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/10 bg-black/40 text-slate-200 hover:bg-black/60 hover:text-white"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className={`${sectionBorderClasses} lg:col-span-2`}>
              <CardHeader>
                <CardTitle className="text-white">Operations Pipeline</CardTitle>
                <CardDescription className="text-slate-400">
                  Real-time view of onboarding, compliance, and capital call activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineSections.map(({ title, description, count, icon: Icon, accent, wrapper }) => (
                    <div
                      key={title}
                      className={`flex items-center justify-between rounded-lg border px-4 py-4 backdrop-blur-sm ${wrapper}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${accent}`} />
                        <div>
                          <p className="font-medium text-white">{title}</p>
                          <p className="text-xs text-slate-200/80">{description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-black/60 text-slate-100">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className={`${sectionBorderClasses}`}>
            <CardHeader>
              <CardTitle className="text-white">Recent Operations</CardTitle>
              <CardDescription className="text-slate-400">
                Latest workflow executions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.length === 0 ? (
                  <div className="rounded-md border border-dashed border-white/20 bg-black/30 p-6 text-center text-sm text-slate-400">
                    No recent operations recorded.
                  </div>
                ) : (
                  data.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-300" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-slate-400">{activity.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Intl.DateTimeFormat('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(new Date(activity.createdAt))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {managementCards.map(({ title, description, href, value, icon: Icon, accent }) => (
              <Link key={title} href={href} className="block">
                <Card className={`${cardBaseClasses} h-full`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <Icon className={`h-5 w-5 ${accent}`} />
                      {title}
                    </CardTitle>
                    <CardDescription className="text-slate-400">{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-white">{value}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </AppLayout>
  )
}