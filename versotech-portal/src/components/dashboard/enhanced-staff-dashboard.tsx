'use client'

import { useState, useCallback } from 'react'
import { StaffActionCenter } from './staff-action-center'
import { RealtimeStaffDashboard } from './realtime-staff-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
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
  Globe,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardData {
  generatedAt: string
  kpis: {
    activeLps: number
    pendingKyc: number
    highPriorityKyc: number
    workflowRunsThisMonth: number
    complianceRate: number
  }
  pipeline: {
    kycPending: number
    ndaInProgress: number
    subscriptionReview: number
    nextCapitalCall?: {
      name: string
      dueDate: string
    }
  }
  processCenter: {
    activeWorkflows: number
  }
  management: {
    activeDeals: number
    activeRequests: number
    complianceRate: number
    activeInvestors: number
  }
  recentActivity: Array<{
    id: string
    title: string
    description: string | null
    activityType: string | null
    createdAt: string
  }>
  errors?: string[]
}

export function EnhancedStaffDashboard({
  initialData,
  className
}: {
  initialData: DashboardData
  className?: string
}) {
  const router = useRouter()
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(true)
  const [isCompactView, setIsCompactView] = useState(false)
  const [showRealtime, setShowRealtime] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'operations'>('overview')

  // Handle workflow trigger from action center
  const handleWorkflowTrigger = useCallback((workflowKey: string) => {
    // Navigate to processes page with workflow pre-selected
    router.push(`/versotech/staff/processes?workflow=${workflowKey}`)
    toast.info('Navigating to workflow trigger', {
      description: `Opening ${workflowKey} workflow`
    })
  }, [router])

  // Handle dashboard refresh
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  // Handle metrics update from realtime component
  const handleMetricsUpdate = useCallback((metrics: any) => {
    console.log('Metrics updated:', metrics)
  }, [])

  const cardBaseClasses =
    'bg-[#060608] border border-white/10 shadow-lg shadow-black/20 transition-colors hover:border-white/20'

  const sectionBorderClasses = 'border border-white/10 bg-[#060608]'

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(initialData.generatedAt))

  const kpiCards = [
    {
      label: 'Active LPs',
      value: initialData.kpis.activeLps,
      helper: initialData.management.activeInvestors > initialData.kpis.activeLps ? 'Includes investors in review' : null,
      icon: Users,
      accent: 'text-slate-200'
    },
    {
      label: 'Pending KYC/AML',
      value: initialData.kpis.pendingKyc,
      helper:
        initialData.kpis.highPriorityKyc > 0
          ? `${initialData.kpis.highPriorityKyc} high priority`
          : 'All standard priority',
      icon: AlertTriangle,
      accent: 'text-amber-300'
    },
    {
      label: 'Workflow Runs (MTD)',
      value: initialData.kpis.workflowRunsThisMonth,
      helper: 'Includes all n8n executions',
      icon: Workflow,
      accent: 'text-sky-300'
    },
    {
      label: 'Compliance Rate',
      value: `${initialData.kpis.complianceRate.toFixed(1)}%`,
      helper: 'Approved investors / total',
      icon: CheckCircle,
      accent: 'text-emerald-300'
    }
  ]

  const pipelineSections = [
    {
      title: 'KYC Processing',
      description: 'Professional investor verification',
      count: `${initialData.pipeline.kycPending} pending`,
      icon: PlayCircle,
      accent: 'text-sky-200',
      wrapper: 'border-sky-500/40 bg-sky-500/20'
    },
    {
      title: 'NDA Execution',
      description: 'DocuSign/Dropbox Sign processing',
      count: `${initialData.pipeline.ndaInProgress} in progress`,
      icon: FileText,
      accent: 'text-emerald-200',
      wrapper: 'border-emerald-500/40 bg-emerald-500/20'
    },
    {
      title: 'Subscription Processing',
      description: 'Subscription agreements under review',
      count: `${initialData.pipeline.subscriptionReview} review`,
      icon: Building2,
      accent: 'text-amber-200',
      wrapper: 'border-amber-500/40 bg-amber-500/20'
    },
    {
      title: 'Capital Calls',
      description: initialData.pipeline.nextCapitalCall
        ? `${initialData.pipeline.nextCapitalCall.name}`
        : 'No upcoming calls scheduled',
      count: initialData.pipeline.nextCapitalCall
        ? new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short'
          }).format(new Date(initialData.pipeline.nextCapitalCall.dueDate))
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
      value: initialData.management.activeDeals,
      icon: Building2,
      accent: 'text-sky-200'
    },
    {
      title: 'Request Management',
      description: 'Handle LP requests and SLAs',
      href: '/versotech/staff/requests',
      value: initialData.management.activeRequests,
      icon: ClipboardList,
      accent: 'text-amber-200'
    },
    {
      title: 'Compliance & Audit',
      description: 'Monitor regulatory posture',
      href: '/versotech/staff/audit',
      value: `${initialData.management.complianceRate.toFixed(1)}%`,
      icon: Shield,
      accent: 'text-emerald-200'
    },
    {
      title: 'LP Management',
      description: 'Investor onboarding & relationships',
      href: '/versotech/staff/investors',
      value: initialData.management.activeInvestors,
      icon: Users,
      accent: 'text-purple-200'
    }
  ]

  return (
    <div className={cn("bg-[#020204] text-slate-100 min-h-screen", className)}>
      <div className="flex">
        {/* Action Center Sidebar */}
        <div
          className={cn(
            "transition-all duration-300 border-r border-white/10",
            isActionCenterOpen ? "w-80" : "w-0 overflow-hidden"
          )}
        >
          {isActionCenterOpen && (
            <div className="h-screen sticky top-0 overflow-y-auto">
              <StaffActionCenter
                className="h-full rounded-none border-0"
                onWorkflowTrigger={handleWorkflowTrigger}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Header with Controls */}
          <div className="flex flex-col gap-4">
            {initialData.errors && initialData.errors.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                Some dashboard metrics are unavailable right now.
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

                {/* Dashboard Controls */}
                <div className="flex flex-col gap-3 items-end">
                  <div className="text-sm text-right text-slate-400">
                    <p>Operations Dashboard</p>
                    <p className="text-lg font-semibold text-white">{formattedDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsActionCenterOpen(!isActionCenterOpen)}
                      className="h-8 px-2 border-white/10 text-slate-200 hover:bg-white/10"
                    >
                      {isActionCenterOpen ? (
                        <>
                          <PanelLeftClose className="h-4 w-4 mr-1" />
                          Hide Actions
                        </>
                      ) : (
                        <>
                          <PanelLeftOpen className="h-4 w-4 mr-1" />
                          Show Actions
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCompactView(!isCompactView)}
                      className="h-8 px-2 border-white/10 text-slate-200 hover:bg-white/10"
                    >
                      {isCompactView ? (
                        <>
                          <Maximize2 className="h-4 w-4 mr-1" />
                          Expand
                        </>
                      ) : (
                        <>
                          <Minimize2 className="h-4 w-4 mr-1" />
                          Compact
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="h-8 px-2 border-white/10 text-slate-200 hover:bg-white/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
            <TabsList className="bg-black/50 border border-white/10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Real-time Updates Component */}
              {showRealtime && (
                <RealtimeStaffDashboard
                  initialData={{
                    activeLps: initialData.kpis.activeLps,
                    pendingKyc: initialData.kpis.pendingKyc,
                    workflowRuns: initialData.kpis.workflowRunsThisMonth,
                    complianceRate: initialData.kpis.complianceRate,
                    kycPipeline: initialData.pipeline.kycPending,
                    ndaInProgress: initialData.pipeline.ndaInProgress,
                    subscriptionReview: initialData.pipeline.subscriptionReview,
                    activeDeals: initialData.management.activeDeals,
                    activeRequests: initialData.management.activeRequests,
                    lastUpdated: initialData.generatedAt
                  }}
                  onMetricsUpdate={handleMetricsUpdate}
                />
              )}

              {/* KPI Cards */}
              <section className={cn(
                "grid gap-4",
                isCompactView ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
              )}>
                {kpiCards.map(({ label, value, helper, icon: Icon, accent }) => (
                  <Card key={label} className={`${cardBaseClasses}`}>
                    <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", isCompactView ? "pb-1" : "pb-2")}>
                      <CardTitle className={cn("font-medium text-slate-300", isCompactView ? "text-xs" : "text-sm")}>
                        {label}
                      </CardTitle>
                      <Icon className={cn(accent, isCompactView ? "h-4 w-4" : "h-5 w-5")} />
                    </CardHeader>
                    <CardContent className={isCompactView ? "pt-1" : ""}>
                      <div className={cn("font-semibold text-white", isCompactView ? "text-xl" : "text-3xl")}>
                        {value}
                      </div>
                      {!isCompactView && helper && (
                        <p className="mt-1 text-xs text-slate-400">{helper}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </section>

              {/* Operations Pipeline */}
              <Card className={`${sectionBorderClasses}`}>
                <CardHeader>
                  <CardTitle className="text-white">Operations Pipeline</CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time view of onboarding, compliance, and capital call activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "gap-4",
                    isCompactView ? "grid grid-cols-2" : "space-y-4"
                  )}>
                    {pipelineSections.map(({ title, description, count, icon: Icon, accent, wrapper }) => (
                      <div
                        key={title}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-4 backdrop-blur-sm",
                          wrapper,
                          isCompactView ? "py-3" : "py-4"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn(accent, isCompactView ? "h-4 w-4" : "h-5 w-5")} />
                          <div>
                            <p className={cn("font-medium text-white", isCompactView ? "text-sm" : "")}>
                              {title}
                            </p>
                            {!isCompactView && (
                              <p className="text-xs text-slate-200/80">{description}</p>
                            )}
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

              {/* Management Cards */}
              <section className={cn(
                "grid gap-4",
                isCompactView ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
              )}>
                {managementCards.map(({ title, description, href, value, icon: Icon, accent }) => (
                  <Link key={title} href={href} className="block">
                    <Card className={`${cardBaseClasses} h-full`}>
                      <CardHeader className={isCompactView ? "pb-2" : ""}>
                        <CardTitle className={cn(
                          "flex items-center gap-2 text-white",
                          isCompactView ? "text-sm" : "text-base"
                        )}>
                          <Icon className={cn(accent, isCompactView ? "h-4 w-4" : "h-5 w-5")} />
                          {title}
                        </CardTitle>
                        {!isCompactView && (
                          <CardDescription className="text-slate-400">{description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className={cn("font-semibold text-white", isCompactView ? "text-xl" : "text-3xl")}>
                          {value}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </section>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Coming Soon */}
              <Card className={`${sectionBorderClasses}`}>
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Analytics & Trends Coming Soon
                      </h3>
                      <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Historical trend charts, conversion analytics, and workflow performance metrics
                        will be available once historical data tracking is implemented.
                      </p>
                    </div>
                    <div className="pt-4">
                      <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-200">
                        Feature in Development
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              {/* Recent Operations */}
              <Card className={`${sectionBorderClasses}`}>
                <CardHeader>
                  <CardTitle className="text-white">Recent Operations</CardTitle>
                  <CardDescription className="text-slate-400">
                    Latest workflow executions and system events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {initialData.recentActivity.length === 0 ? (
                      <div className="rounded-md border border-dashed border-white/20 bg-black/30 p-6 text-center text-sm text-slate-400">
                        No recent operations recorded.
                      </div>
                    ) : (
                      initialData.recentActivity.map((activity) => (
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

              {/* Process Center */}
              <Card className={`${sectionBorderClasses}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-sky-300" />
                    Process Center
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Trigger n8n automation workflows ({initialData.processCenter.activeWorkflows} active)
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
            </TabsContent>
          </Tabs>

          {/* View Toggle Controls */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRealtime(!showRealtime)}
              className="text-xs text-slate-400 hover:text-white"
            >
              {showRealtime ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showRealtime ? 'Hide' : 'Show'} Real-time
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}