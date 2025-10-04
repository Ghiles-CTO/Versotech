'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, FileText, TrendingUp, Calendar, FileBarChart, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { ReportType } from '@/types/reports'

interface QuickReportCardProps {
  reportType: ReportType
  label: string
  description: string
  estimatedTime: string
  icon: string
  onGenerate: () => Promise<void>
}

const iconMap = {
  FileText,
  TrendingUp,
  Calendar,
  FileBarChart,
}

export function QuickReportCard({
  reportType,
  label,
  description,
  estimatedTime,
  icon,
  onGenerate
}: QuickReportCardProps) {
  const [generating, setGenerating] = useState(false)
  const IconComponent = iconMap[icon as keyof typeof iconMap] || FileText

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await onGenerate()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
            <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold">{label}</div>
          </div>
        </CardTitle>
        <CardDescription className="mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{estimatedTime}</span>
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="shadow-sm"
          >
            {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
