'use client'

import { Suspense } from 'react'
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

type DateRange = '7' | '30' | '90'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

function DateRangeSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentRange = (searchParams.get('days') as DateRange) || '30'

  const handleRangeChange = (value: DateRange) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('days', value)
    router.push(`${pathname}?${params.toString()}`)
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

        {/* Placeholder for activity feed - US-008 */}
        <div className="h-80 rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Activity feed coming in US-008</p>
        </div>

        {/* Placeholder for compliance alerts - US-009 */}
        <div className="h-80 rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Compliance alerts coming in US-009</p>
        </div>
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
