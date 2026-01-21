import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FunnelSkeleton() {
  return (
    <div className="space-y-6">
      {/* Investment Funnel Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-44" />
          </div>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[100, 75, 50, 35, 20].map((width, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton
                  className="h-10 rounded"
                  style={{ width: `${width}%` }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Funnel Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-44" />
          </div>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[100, 80, 55, 40, 25].map((width, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton
                  className="h-10 rounded"
                  style={{ width: `${width}%` }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
