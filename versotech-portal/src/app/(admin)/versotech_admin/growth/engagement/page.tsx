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
import { EngagementSkeleton } from './components/engagement-skeleton'
import { ActionsTypeChart } from './components/actions-type-chart'
import { EngagementByDayChart } from './components/engagement-by-day-chart'
import { PeakHoursChart } from './components/peak-hours-chart'
import { TopEngagedUsersTable } from './components/top-engaged-users-table'

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

function EngagementContent() {
  const searchParams = useSearchParams()
  const days = searchParams.get('days') || '30'

  return (
    <div className="space-y-6">
      {/* Top Row: Actions by Type (larger) + Engagement by Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions by Type - Horizontal bar chart (top 10) */}
        <ActionsTypeChart days={days} />

        {/* Engagement by Day - Vertical bar chart (Mon-Sun) */}
        <EngagementByDayChart days={days} />
      </div>

      {/* Middle: Peak Activity Hours - Full width */}
      <PeakHoursChart days={days} />

      {/* Bottom: Top Engaged Users Table */}
      <TopEngagedUsersTable days={days} />
    </div>
  )
}

export default function EngagementPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with title and date range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Engagement Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analyze user behavior patterns and identify peak engagement times
          </p>
        </div>
        <Suspense fallback={<div className="h-10 w-[160px] rounded-md bg-muted animate-pulse" />}>
          <DateRangeSelector />
        </Suspense>
      </div>

      {/* Main content with Suspense */}
      <Suspense fallback={<EngagementSkeleton />}>
        <EngagementContent />
      </Suspense>
    </div>
  )
}
