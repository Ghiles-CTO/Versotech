import { GrowthOverviewSkeleton } from './components/growth-overview-skeleton'

export default function GrowthOverviewLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded-md animate-pulse mt-2" />
        </div>
        <div className="h-10 w-[160px] rounded-md bg-muted animate-pulse" />
      </div>

      {/* Content skeleton */}
      <GrowthOverviewSkeleton />
    </div>
  )
}
