'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, FileText, TrendingUp, Calendar, FileBarChart, Loader2 } from 'lucide-react'
import type { ReportTypeConfig } from '@/types/reports'

interface QuickReportCardProps {
  config: ReportTypeConfig
  onGenerate: () => void
}

const iconMap = {
  FileText,
  TrendingUp,
  Calendar,
  FileBarChart,
}

export function QuickReportCard({ config, onGenerate }: QuickReportCardProps) {
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || FileText

  return (
    <Card className="border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
            <IconComponent className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
              {config.label}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2 text-sm text-gray-600">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{config.estimatedTime}</span>
          </div>
          <Button
            size="sm"
            onClick={onGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
