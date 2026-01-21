import { FunnelSkeleton } from './components/funnel-skeleton'

export default function FunnelLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* Content skeleton */}
      <FunnelSkeleton />
    </div>
  )
}
