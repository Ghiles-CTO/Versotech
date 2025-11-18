'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'

interface AllocationData {
  name: string
  value: number
  percentage: number
}

interface PortfolioAllocationChartProps {
  data: AllocationData[]
}

const COLORS = ['#1e40af', '#0891b2', '#059669', '#7c3aed', '#c026d3', '#dc2626', '#ea580c', '#ca8a04']

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(value)
}

export function PortfolioAllocationChart({ data }: PortfolioAllocationChartProps) {
  const isEmpty = !data || data.length === 0

  if (isEmpty) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Portfolio Allocation
          </CardTitle>
          <CardDescription className="text-gray-600">Breakdown by investment vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[320px] text-gray-400">
            <div className="text-center">
              <PieChartIcon className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No allocation data available</p>
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
          <PieChartIcon className="h-5 w-5 text-blue-600" />
          Portfolio Allocation
        </CardTitle>
        <CardDescription className="text-gray-600">Breakdown by investment vehicle</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => {
                return percentage > 5 ? `${name}: ${percentage.toFixed(1)}%` : ''
              }}
              outerRadius={100}
              innerRadius={65}
              fill="#8884d8"
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
