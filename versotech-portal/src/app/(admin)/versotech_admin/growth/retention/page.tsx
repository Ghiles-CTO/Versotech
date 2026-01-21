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
import { RetentionSkeleton } from './components/retention-skeleton'
import { RetentionKPICards } from './components/retention-kpi-cards'
import { CohortMatrix } from './components/cohort-matrix'
import { AtRiskUsersTable } from './components/at-risk-users-table'

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

function RetentionContent() {
  const searchParams = useSearchParams()
  const days = searchParams.get('days') || '30'

  return (
    <div className="space-y-6">
      {/* Retention KPI Cards */}
      <RetentionKPICards days={days} />

      {/* Cohort Retention Matrix */}
      <CohortMatrix days={days} />

      {/* At-Risk Users Table */}
      <AtRiskUsersTable days={days} />
    </div>
  )
}

export default function RetentionPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with title and date range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Retention Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analyze user retention patterns and identify at-risk users
          </p>
        </div>
        <Suspense fallback={<div className="h-10 w-[160px] rounded-md bg-muted animate-pulse" />}>
          <DateRangeSelector />
        </Suspense>
      </div>

      {/* Main content with Suspense */}
      <Suspense fallback={<RetentionSkeleton />}>
        <RetentionContent />
      </Suspense>
    </div>
  )
}
