import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-white/10" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md bg-white/10" />
          <Skeleton className="h-10 w-10 rounded-md bg-white/10" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-4 w-4 rounded bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-white/10 mb-2" />
              <Skeleton className="h-3 w-32 bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-black/40 border-white/10">
            <CardHeader>
              <Skeleton className="h-5 w-40 bg-white/10 mb-2" />
              <Skeleton className="h-4 w-56 bg-white/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-white/10 mb-2" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 bg-white/10" />
                  <Skeleton className="h-3 w-72 bg-white/5" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
