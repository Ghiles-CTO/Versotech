import { DashboardSkeleton } from './dashboard-skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-[160px] rounded-md bg-muted animate-pulse" />
      </div>

      {/* Content skeleton */}
      <DashboardSkeleton />
    </div>
  )
}
