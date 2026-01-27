'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DollarSign } from 'lucide-react'

interface CashFlowDataPoint {
  period: string
  contributions: number
  distributions: number
  displayPeriod: string
}

interface CashFlowChartProps {
  data: CashFlowDataPoint[]
  currency?: string
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: Math.abs(value) >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(value)
}

export function CashFlowChart({ data, currency = 'USD' }: CashFlowChartProps) {
  const isEmpty = !data || data.length === 0

  if (isEmpty) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-br from-background to-muted/30 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5 text-violet-600" />
            Cash Flow History
          </CardTitle>
          <CardDescription className="text-muted-foreground">Contributions vs distributions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[320px] text-muted-foreground/70">
            <div className="text-center">
              <DollarSign className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No cash flow data available</p>
              <p className="text-xs text-muted-foreground/80 mt-2">Staff must add distributions via API</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-background to-muted/30 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
          <DollarSign className="h-5 w-5 text-violet-600" />
          Cash Flow History
        </CardTitle>
        <CardDescription className="text-muted-foreground">Contributions vs distributions over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="displayPeriod"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value as number, currency)}
              className="fill-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-card p-4 border border-border rounded-lg shadow-lg">
                      <p className="font-semibold text-foreground mb-3">{data.displayPeriod}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span className="text-sm text-muted-foreground">Contributions</span>
                          </div>
                          <span className="text-sm font-medium text-red-600">{formatCurrency(data.contributions, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                            <span className="text-sm text-muted-foreground">Distributions</span>
                          </div>
                          <span className="text-sm font-medium text-emerald-600">{formatCurrency(data.distributions, currency)}</span>
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">Net Cash</span>
                          <span className={`text-sm font-semibold ${
                            (data.distributions - data.contributions) >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(data.distributions - data.contributions, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => {
                return value === 'contributions' ? 'Capital Calls' : 'Distributions'
              }}
            />
            <Bar
              dataKey="contributions"
              fill="#dc2626"
              name="contributions"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="distributions"
              fill="#059669"
              name="distributions"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
