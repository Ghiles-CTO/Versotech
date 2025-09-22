import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className 
}: KPICardProps) {
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 border-0 shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-gray-700 transition-colors">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" />}
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
        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center space-x-2 text-xs">
            <span className={cn(
              "font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-muted-foreground">from last quarter</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

