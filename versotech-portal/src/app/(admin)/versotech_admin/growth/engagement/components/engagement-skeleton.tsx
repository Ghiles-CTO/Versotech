import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function EngagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Row: Two charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions by Type skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-3 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton
                    className="h-6 flex-1"
                    style={{ width: `${100 - i * 10}%` }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement by Day skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-3 w-52 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-[200px] pt-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton
                    className="w-8"
                    style={{ height: `${40 + Math.random() * 100}px` }}
                  />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle: Peak Hours skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-3 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-[180px] pt-4 overflow-x-auto">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[32px]">
                <Skeleton
                  className="w-5"
                  style={{ height: `${20 + Math.random() * 120}px` }}
                />
                <Skeleton className="h-3 w-5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom: Top Engaged Users skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-3 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
