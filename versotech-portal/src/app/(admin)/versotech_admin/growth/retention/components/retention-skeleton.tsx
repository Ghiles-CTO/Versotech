import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function RetentionSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cohort Matrix */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-3 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-2 mb-3 pb-2 border-b">
              <Skeleton className="h-4 w-20" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16 mx-auto" />
              ))}
            </div>
            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-2 py-2">
                <Skeleton className="h-4 w-16" />
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className="h-8 w-full rounded"
                    style={{ opacity: colIndex <= rowIndex ? 1 : 0.3 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Users Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-3 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
