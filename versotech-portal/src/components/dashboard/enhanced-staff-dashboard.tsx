'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { StaffActionCenter } from './staff-action-center'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Users,
    Workflow,
    Shield,
    AlertTriangle,
    CheckCircle,
    Activity,
    DollarSign,
    ArrowUpRight,
    MoreHorizontal,
    CalendarRange,
    Wallet
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { format, parseISO } from 'date-fns'

// --- Types ---

interface MetricError {
    metric: string
    message: string
    code?: string
}

interface DashboardData {
    generatedAt: string
    kpis: {
        activeLps: number | null
        pendingKyc: number | null
        highPriorityKyc: number | null
        workflowRunsThisMonth: number | null
        complianceRate: number | null
    }
    processCenter: {
        activeWorkflows: number | null
    }
    management: {
        activeDeals: number | null
        activeRequests: number | null
        complianceRate: number | null
        activeInvestors: number | null
    }
    recentActivity: Array<{
        id: string
        title: string
        description: string | null
        activityType: 'fee' | 'subscription' | 'investor' | 'other'
        createdAt: string
        amount?: number
        status?: string
    }>
    charts: {
        fees: Array<{
            date: string
            amount: number
            type: string
        }>
        subscriptions: Array<{
            date: string
            amount: number
            status: string
        }>
    }
    errors?: MetricError[]
}

// --- Sub-Components (Memoized) ---

const DashboardHeader = React.memo(({
    formattedDate
}: {
    formattedDate: string
}) => (
    <header className="flex items-end justify-between pb-6 border-b border-white/5">
        <div className="space-y-1">
             <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/5 text-emerald-400 px-3 py-0.5 text-[10px] uppercase tracking-widest font-medium">
                    Financial Operations
                </Badge>
                <span className="h-1 w-1 rounded-full bg-zinc-700"></span>
                <span className="text-xs text-zinc-200 font-mono tracking-wider">{formattedDate}</span>
             </div>
             <h1 className="text-3xl font-light text-white tracking-tight">Executive Dashboard</h1>
        </div>
    </header>
))
DashboardHeader.displayName = 'DashboardHeader'

const KPICard = React.memo(({ kpi, glassCardStyle, labelStyle, valueStyle }: { kpi: any, glassCardStyle: string, labelStyle: string, valueStyle: string }) => {
    const Icon = kpi.icon
    return (
        <div className={glassCardStyle + " p-6 rounded-xl relative overflow-hidden group"}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <Icon className="w-16 h-16 text-white transform rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className={labelStyle}>{kpi.label}</h3>
                    <Icon className={cn("w-4 h-4 opacity-50 transition-opacity group-hover:opacity-100", kpi.accent)} />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className={valueStyle}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</span>
                    <span className="text-sm text-zinc-200 font-light">{kpi.subValue}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-200">
                    {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <MoreHorizontal className="w-3 h-3 text-zinc-300" />}
                    <span className={kpi.trend === 'up' ? "text-emerald-400" : "text-zinc-200"}>{kpi.change}</span>
                </div>
            </div>
        </div>
    )
})
KPICard.displayName = 'KPICard'

const FeesChart = React.memo(({ data, glassCardStyle }: { data: any[], glassCardStyle: string }) => (
    <Card className={glassCardStyle + " border-0 rounded-2xl"}>
        <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-light text-white tracking-wide flex items-center gap-2">
                        Revenue & Fees
                    </CardTitle>
                    <CardDescription className="text-zinc-200 text-xs uppercase tracking-wider mt-1">
                        Transaction Volume (LTM)
                    </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 border-emerald-900/50 font-mono text-[10px]">LIVE</Badge>
            </div>
        </CardHeader>
        <CardContent className="pl-2 pr-6 pb-6 pt-4">
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                            <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" stroke="#ffffff08" vertical={false} horizontal={true} />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#d4d4d8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#27272a', strokeWidth: 1 }}
                            dy={8}
                            height={40}
                        />
                        <YAxis
                            stroke="#d4d4d8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                            dx={-5}
                            width={60}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                borderColor: '#3f3f46',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)'
                            }}
                            itemStyle={{ color: '#10b981', fontSize: '14px', fontWeight: '600', fontFamily: 'system-ui' }}
                            labelStyle={{ color: '#d4d4d8', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Fee Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorFees)"
                            isAnimationActive={false}
                            dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, fill: '#10b981', stroke: '#18181b', strokeWidth: 3 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
))
FeesChart.displayName = 'FeesChart'

const SubscriptionsChart = React.memo(({ data, glassCardStyle }: { data: any[], glassCardStyle: string }) => (
    <Card className={glassCardStyle + " border-0 rounded-2xl"}>
        <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-light text-white tracking-wide flex items-center gap-2">
                        Capital Commitments
                    </CardTitle>
                    <CardDescription className="text-zinc-200 text-xs uppercase tracking-wider mt-1">
                        Subscription Flows (LTM)
                    </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span className="text-xs text-zinc-200">Committed</span>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="pl-2 pr-6 pb-6 pt-4">
            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={28} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="#ffffff08" vertical={false} horizontal={true} />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#d4d4d8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#27272a', strokeWidth: 1 }}
                            dy={8}
                            height={40}
                        />
                        <YAxis
                            stroke="#d4d4d8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}
                            dx={-5}
                            width={60}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                borderColor: '#3f3f46',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)'
                            }}
                            cursor={{ fill: '#ffffff08', radius: 4 }}
                            itemStyle={{ color: '#38bdf8', fontSize: '14px', fontWeight: '600', fontFamily: 'system-ui' }}
                            labelStyle={{ color: '#d4d4d8', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Capital']}
                        />
                        <Bar
                            dataKey="amount"
                            fill="#0ea5e9"
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={false}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
))
SubscriptionsChart.displayName = 'SubscriptionsChart'

const ErrorBanner = React.memo(({ errors }: { errors: MetricError[] }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-100">
                            {errors.length} metric{errors.length > 1 ? 's' : ''} unavailable
                        </p>
                        <p className="text-xs text-amber-200/70 mt-1">
                            Some dashboard metrics failed to load. Click to view details.
                        </p>
                        {isExpanded && (
                            <div className="mt-3 space-y-2">
                                {errors.map((error, idx) => (
                                    <div key={idx} className="pl-3 border-l-2 border-amber-500/40">
                                        <p className="text-xs font-mono text-amber-100">{error.metric}</p>
                                        <p className="text-xs text-amber-200/60 mt-0.5">{error.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-amber-300 hover:text-amber-100 hover:bg-amber-500/20"
                >
                    {isExpanded ? 'Hide' : 'Details'}
                </Button>
            </div>
        </div>
    )
})
ErrorBanner.displayName = 'ErrorBanner'

const LedgerItem = React.memo(({ activity }: { activity: any }) => {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'fee': return DollarSign
            case 'subscription': return Wallet
            case 'investor': return Users
            default: return Activity
        }
    }
    const Icon = getActivityIcon(activity.activityType)
    const isFee = activity.activityType === 'fee'

    return (
        <div className="group relative bg-zinc-900/30 border border-white/5 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors duration-200">
            <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-zinc-800 group-hover:bg-emerald-500/50 transition-colors rounded-r-full"></div>
            <div className="flex items-start justify-between gap-4 pl-3">
                <div className="flex gap-3">
                    <div className={cn(
                        "p-2 rounded-md h-fit mt-0.5 transition-colors",
                        isFee ? "bg-emerald-950/30 text-emerald-400" : "bg-zinc-800/50 text-zinc-200"
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-200 leading-tight">{activity.title}</p>
                        <p className="text-xs text-zinc-200 mt-1 leading-relaxed max-w-[200px]">{activity.description}</p>
                        <p className="text-[10px] text-zinc-300 font-mono mt-2 uppercase tracking-wider">
                            {format(parseISO(activity.createdAt), 'HH:mm')} • {activity.status || 'Processed'}
                        </p>
                    </div>
                </div>
                {activity.amount && (
                    <div className="text-right">
                        <span className={cn(
                            "text-sm font-mono font-medium block",
                            isFee ? "text-emerald-400" : "text-zinc-300"
                        )}>
                            {isFee ? '+' : ''}${activity.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-zinc-300 uppercase">USD</span>
                    </div>
                )}
            </div>
        </div>
    )
})
LedgerItem.displayName = 'LedgerItem'

// --- Main Component ---

export function EnhancedStaffDashboard({
    initialData,
    className
}: {
    initialData: DashboardData
    className?: string
}) {
    const router = useRouter()

    // Memoize handlers
    const handleWorkflowTrigger = useCallback((workflowKey: string) => {
        router.push(`/versotech/staff/processes?workflow=${workflowKey}`)
        toast.info('Initiating Process', {
            description: `Workflow sequence ${workflowKey} started.`
        })
    }, [router])

    // Memoize data processing
    const formattedDate = useMemo(() => 
        format(parseISO(initialData.generatedAt), 'dd MMM yyyy').toUpperCase(), 
        [initialData.generatedAt]
    )

    const formatChartDate = useCallback((dateStr: string) => {
        try {
             return format(parseISO(dateStr), 'MMM dd')
        } catch (e) {
            return dateStr
        }
    }, [])

    const feesData = useMemo(() => initialData.charts.fees.map(f => ({
        ...f,
        displayDate: formatChartDate(f.date)
    })), [initialData.charts.fees, formatChartDate])

    const subscriptionsData = useMemo(() => initialData.charts.subscriptions.map(s => ({
        ...s,
        displayDate: formatChartDate(s.date)
    })), [initialData.charts.subscriptions, formatChartDate])

    // KPI Data
    const kpiCards = useMemo(() => [
        {
            label: 'Total Active LPs',
            value: initialData.kpis.activeLps ?? 0,
            subValue: 'Investors',
            change: '+2.4%',
            trend: 'up',
            icon: Users,
            accent: 'text-zinc-200'
        },
        {
            label: 'Pending KYC',
            value: initialData.kpis.pendingKyc ?? 0,
            subValue: 'Reviews',
            change: initialData.kpis.highPriorityKyc && initialData.kpis.highPriorityKyc > 0 ? `${initialData.kpis.highPriorityKyc} High Priority` : 'Standard',
            trend: 'neutral',
            icon: Shield,
            accent: 'text-amber-200'
        },
        {
            label: 'Process Executions',
            value: initialData.kpis.workflowRunsThisMonth ?? 0,
            subValue: 'Workflows',
            change: 'MTD',
            trend: 'up',
            icon: Workflow,
            accent: 'text-sky-200'
        },
        {
            label: 'Compliance Index',
            value: initialData.kpis.complianceRate !== null ? `${initialData.kpis.complianceRate.toFixed(0)}%` : 'N/A',
            subValue: 'Verified',
            change: 'Target: 100%',
            trend: 'neutral',
            icon: CheckCircle,
            accent: 'text-emerald-200'
        }
    ], [initialData.kpis])

    // Styles
    const glassCard = "bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-black/50"
    const kpiValueStyle = "text-3xl xl:text-4xl font-light tracking-tight text-white"
    const kpiLabelStyle = "text-xs font-medium uppercase tracking-widest text-zinc-200 mb-1 group-hover:text-zinc-100 transition-colors"

    return (
        <div className={cn("bg-[#050505] text-zinc-200 min-h-screen flex flex-col font-sans selection:bg-emerald-500/30", className)}>
            <div className="flex-1 p-8 xl:p-10 max-w-[1800px] mx-auto w-full space-y-10">
                
                <DashboardHeader formattedDate={formattedDate} />

                {/* Error Banner */}
                {initialData.errors && initialData.errors.length > 0 && (
                    <ErrorBanner errors={initialData.errors} />
                )}

                {/* KPI Grid */}
                <section className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                    {kpiCards.map((kpi) => (
                        <KPICard 
                            key={kpi.label} 
                            kpi={kpi} 
                            glassCardStyle={glassCard} 
                            labelStyle={kpiLabelStyle} 
                            valueStyle={kpiValueStyle} 
                        />
                    ))}
                </section>

                {/* Main Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <FeesChart data={feesData} glassCardStyle={glassCard} />
                        <SubscriptionsChart data={subscriptionsData} glassCardStyle={glassCard} />
                    </div>

                    {/* Activity Feed */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-medium text-zinc-200 uppercase tracking-widest">Ledger</h2>
                            <CalendarRange className="w-4 h-4 text-zinc-300" />
                        </div>

                        <div className="space-y-3">
                             {initialData.recentActivity.length === 0 ? (
                                <div className="p-8 border border-dashed border-white/10 rounded-lg text-center">
                                    <p className="text-sm text-zinc-200">No recent transactions recorded.</p>
                                </div>
                            ) : (
                                initialData.recentActivity.map((activity) => (
                                    <LedgerItem key={activity.id} activity={activity} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Center */}
                <div className="pt-6 border-t border-white/5">
                    <StaffActionCenter
                        className="bg-zinc-900/20 border-white/5"
                        onWorkflowTrigger={handleWorkflowTrigger}
                    />
                </div>
            </div>
        </div>
    )
}
