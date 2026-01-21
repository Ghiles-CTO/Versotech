import { CohortsSkeleton } from './components/cohorts-skeleton'

export default function CohortsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cohort Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Analyze user behavior patterns by signup or investment cohorts
          </p>
        </div>
        <div className="h-10 w-[220px] rounded-md bg-muted animate-pulse" />
      </div>

      {/* Content skeleton */}
      <CohortsSkeleton />
    </div>
  )
}
