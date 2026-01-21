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
import { CohortsSkeleton } from './components/cohorts-skeleton'
import { CohortsDataTable } from './components/cohorts-data-table'

type GroupBy = 'signup_week' | 'signup_month' | 'first_investment_month'

const GROUPING_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'signup_month', label: 'By Signup Month' },
  { value: 'signup_week', label: 'By Signup Week' },
  { value: 'first_investment_month', label: 'By First Investment Month' },
]

function GroupingSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentGrouping = (searchParams.get('groupBy') as GroupBy) || 'signup_month'

  const handleGroupingChange = (value: GroupBy) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('groupBy', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={currentGrouping} onValueChange={handleGroupingChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select grouping" />
      </SelectTrigger>
      <SelectContent>
        {GROUPING_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CohortsContent() {
  const searchParams = useSearchParams()
  const groupBy = (searchParams.get('groupBy') as GroupBy) || 'signup_month'

  return <CohortsDataTable groupBy={groupBy} />
}

export default function CohortsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with title and grouping selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cohort Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Analyze user behavior patterns by signup or investment cohorts
          </p>
        </div>
        <Suspense fallback={<div className="h-10 w-[220px] rounded-md bg-muted animate-pulse" />}>
          <GroupingSelector />
        </Suspense>
      </div>

      {/* Main content with Suspense */}
      <Suspense fallback={<CohortsSkeleton />}>
        <CohortsContent />
      </Suspense>
    </div>
  )
}
