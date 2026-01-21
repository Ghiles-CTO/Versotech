'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardSkeleton } from './dashboard-skeleton'
import { DashboardKPICards } from './components/dashboard-kpi-cards'
import { DashboardActivityChart } from './components/dashboard-activity-chart'
import { DashboardApprovalQueue } from './components/dashboard-approval-queue'
import { DashboardActivityFeed } from './components/dashboard-activity-feed'
import { DashboardComplianceAlerts } from './components/dashboard-compliance-alerts'

type DateRange = '7' | '30' | '90'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

function DateRangeSelector() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentRange = (searchParams.get('days') as DateRange) || '30'

  // Wait for client-side hydration before rendering Radix Select
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRangeChange = (value: DateRange) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('days', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Render a static placeholder during SSR to avoid Radix ID mismatches
  if (!mounted) {
    return (
      <div className="h-10 w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center justify-between">
        <span>{DATE_RANGE_OPTIONS.find(o => o.value === currentRange)?.label || 'Select range'}</span>
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    )
  }

  return (
    <Select value={currentRange} onValueChange={handleRangeChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const days = searchParams.get('days') || '30'

  return (
    <div className="space-y-6">
      {/* KPI Cards - US-005 */}
      <DashboardKPICards days={days} />

      {/* Charts and widgets - US-006 to US-009 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart - US-006 */}
        <DashboardActivityChart days={days} />

        {/* Approval Queue - US-007 */}
        <DashboardApprovalQueue days={days} />

        {/* Activity Feed - US-008 */}
        <DashboardActivityFeed days={days} />

        {/* Compliance Alerts - US-009 */}
        <DashboardComplianceAlerts days={days} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with title and date range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform health and key metrics
          </p>
        </div>
        <Suspense fallback={<div className="h-10 w-[160px] rounded-md bg-muted animate-pulse" />}>
          <DateRangeSelector />
        </Suspense>
      </div>

      {/* Main dashboard content with Suspense */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
