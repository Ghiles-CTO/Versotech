import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  description?: string  // Add backward compatibility
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral' | {  // Support both string and object formats
    value: number
    isPositive: boolean
  }
  trendValue?: string  // Add for backward compatibility
  className?: string
  interactive?: boolean  // Enable interactivity
  onDrillDown?: () => void  // Drill-down callback
  hasDetails?: boolean  // Show drill-down indicator
  additionalInfo?: {  // Extra info for expanded view
    breakdown?: Array<{ label: string; value: string | number }>
    change?: { period: string; value: string }
    benchmark?: { label: string; value: string }
  }
}

export function KPICard({
  title,
  value,
  subtitle,
  description, // Accept description prop
  icon: Icon,
  trend,
  trendValue, // Accept trendValue prop
  className,
  interactive = false,
  onDrillDown,
  hasDetails = false,
  additionalInfo
}: KPICardProps) {
  const isClickable = interactive && (onDrillDown || hasDetails)

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 border-0 shadow-md",
        isClickable && "cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={isClickable ? onDrillDown : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-gray-700 transition-colors">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" />}
          {hasDetails && (
            <div className="h-2 w-2 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-900 group-hover:to-blue-700 transition-all duration-300">
          {typeof value === 'number' 
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value)
            : value
          }
        </div>
        {(subtitle || description) && (
          <p className="text-xs text-muted-foreground">
            {subtitle || description}
          </p>
        )}
        {(trend || trendValue) && (
          <div className="flex items-center space-x-2 text-xs">
            {typeof trend === 'object' && trend.value && (
              <>
                <span className={cn(
                  "font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-muted-foreground">from last quarter</span>
              </>
            )}
            {typeof trend === 'string' && trendValue && (
              <>
                <span className={cn(
                  "font-medium",
                  trend === 'up' ? "text-green-600" :
                  trend === 'down' ? "text-red-600" : "text-gray-600"
                )}>
                  {trendValue}
                </span>
                <span className="text-muted-foreground">from last quarter</span>
              </>
            )}
          </div>
        )}

        {/* Additional Info for Interactive Cards */}
        {additionalInfo && isClickable && (
          <div className="mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {additionalInfo.change && (
              <div className="text-xs text-gray-500 mb-2">
                <span className="font-medium">{additionalInfo.change.period}:</span> {additionalInfo.change.value}
              </div>
            )}

            {additionalInfo.benchmark && (
              <div className="text-xs text-gray-500 mb-2">
                <span className="font-medium">{additionalInfo.benchmark.label}:</span> {additionalInfo.benchmark.value}
              </div>
            )}

            {additionalInfo.breakdown && additionalInfo.breakdown.length > 0 && (
              <div className="space-y-1">
                {additionalInfo.breakdown.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {hasDetails && (
              <div className="text-xs text-blue-600 font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity delay-150">
                Click for details →
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

