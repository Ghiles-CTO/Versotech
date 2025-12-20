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
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: Math.abs(value) >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(value)
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const isEmpty = !data || data.length === 0

  if (isEmpty) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
            <DollarSign className="h-5 w-5 text-violet-600" />
            Cash Flow History
          </CardTitle>
          <CardDescription className="text-gray-600">Contributions vs distributions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[320px] text-gray-400">
            <div className="text-center">
              <DollarSign className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No cash flow data available</p>
              <p className="text-xs text-gray-500 mt-2">Staff must add distributions via API</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
          <DollarSign className="h-5 w-5 text-violet-600" />
          Cash Flow History
        </CardTitle>
        <CardDescription className="text-gray-600">Contributions vs distributions over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="displayPeriod"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900 mb-3">{data.displayPeriod}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span className="text-sm text-gray-600">Contributions</span>
                          </div>
                          <span className="text-sm font-medium text-red-600">{formatCurrency(data.contributions)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                            <span className="text-sm text-gray-600">Distributions</span>
                          </div>
                          <span className="text-sm font-medium text-emerald-600">{formatCurrency(data.distributions)}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">Net Cash</span>
                          <span className={`text-sm font-semibold ${
                            (data.distributions - data.contributions) >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(data.distributions - data.contributions)}
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
