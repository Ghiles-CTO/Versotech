'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface MonthlyGanttFeature {
  id: string
  name: string
  startAt: string
  endAt: string
  status: {
    id: string
    name: string
    color?: string
  }
  type: 'deal' | 'task'
}

interface MonthlyGanttViewProps {
  title: string
  description?: string
  features: MonthlyGanttFeature[]
  brand?: 'versoholdings' | 'versotech'
}

export function MonthlyGanttView({ title, description, features, brand = 'versotech' }: MonthlyGanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<MonthlyGanttFeature | null>(null)
  const isLight = brand === 'versoholdings'

  // Get first and last day of current month
  const monthStart = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  }, [currentDate])

  const monthEnd = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
  }, [currentDate])

  // Generate days array for the current month
  const daysInMonth = useMemo(() => {
    const days: Date[] = []
    const current = new Date(monthStart)
    while (current <= monthEnd) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [monthStart, monthEnd])

  // Filter features that overlap with current month
  const monthFeatures = useMemo(() => {
    return features.filter((feature) => {
      const featureStart = new Date(feature.startAt)
      const featureEnd = new Date(feature.endAt)
      // Feature overlaps if it starts before month ends AND ends after month starts
      return featureStart <= monthEnd && featureEnd >= monthStart
    })
  }, [features, monthStart, monthEnd])

  // Group features by type
  const { deals, tasks } = useMemo(() => {
    const deals = monthFeatures.filter((f) => f.type === 'deal')
    const tasks = monthFeatures.filter((f) => f.type === 'task')
    return { deals, tasks }
  }, [monthFeatures])

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <Card className={`shadow-lg ${isLight ? 'border border-gray-200 bg-white' : 'border border-border bg-card text-card-foreground'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>{title}</CardTitle>
            {description && <CardDescription className={isLight ? 'text-gray-600' : 'text-muted-foreground'}>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className={isLight ? 'border-gray-300' : ''}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className={`min-w-[100px] ${isLight ? 'border-gray-300' : ''}`}
            >
              Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className={isLight ? 'border-gray-300' : ''}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className={`mt-4 text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>
          {monthName}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {monthFeatures.length === 0 ? (
          <div className={`rounded-xl border border-dashed p-8 text-center text-sm ${isLight ? 'border-gray-300 bg-gray-50 text-gray-500' : 'border-border bg-muted/30 text-muted-foreground'}`}>
            No deals or tasks scheduled for {monthName}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Deals Section */}
            {deals.length > 0 && (
              <div className="space-y-3">
                <h3 className={`text-sm font-semibold uppercase tracking-wide ${isLight ? 'text-gray-700' : 'text-foreground'}`}>
                  Deal Windows ({deals.length})
                </h3>
                <div className="relative">
                  <TimelineGrid days={daysInMonth} brand={brand} />
                  <div className="space-y-2">
                    {deals.map((feature) => (
                      <TimelineBar
                        key={feature.id}
                        feature={feature}
                        monthStart={monthStart}
                        monthEnd={monthEnd}
                        daysInMonth={daysInMonth.length}
                        brand={brand}
                        onClick={() => setSelectedEvent(feature)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Section */}
            {tasks.length > 0 && (
              <div className="space-y-3">
                <h3 className={`text-sm font-semibold uppercase tracking-wide ${isLight ? 'text-gray-700' : 'text-foreground'}`}>
                  Action Items ({tasks.length})
                </h3>
                <div className="relative">
                  <TimelineGrid days={daysInMonth} brand={brand} />
                  <div className="space-y-2">
                    {tasks.map((feature) => (
                      <TimelineBar
                        key={feature.id}
                        feature={feature}
                        monthStart={monthStart}
                        monthEnd={monthEnd}
                        daysInMonth={daysInMonth.length}
                        brand={brand}
                        onClick={() => setSelectedEvent(feature)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className={isLight ? 'bg-white border-gray-200' : 'bg-card border-border'}>
          <DialogHeader>
            <DialogTitle className={isLight ? 'text-gray-900' : 'text-foreground'}>
              {selectedEvent?.name}
            </DialogTitle>
            <DialogDescription className={isLight ? 'text-gray-600' : 'text-muted-foreground'}>
              {selectedEvent?.status.name}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold ${isLight ? 'text-gray-700' : 'text-foreground'}`}>Start Date</h4>
                  <p className={isLight ? 'text-gray-600' : 'text-muted-foreground'}>
                    {new Date(selectedEvent.startAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h4 className={`font-semibold ${isLight ? 'text-gray-700' : 'text-foreground'}`}>End Date</h4>
                  <p className={isLight ? 'text-gray-600' : 'text-muted-foreground'}>
                    {new Date(selectedEvent.endAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div>
                <h4 className={`font-semibold ${isLight ? 'text-gray-700' : 'text-foreground'}`}>Type</h4>
                <p className={isLight ? 'text-gray-600' : 'text-muted-foreground'}>
                  {selectedEvent.type === 'deal' ? 'Deal Window' : 'Action Item'}
                </p>
              </div>
              <div>
                <h4 className={`font-semibold ${isLight ? 'text-gray-700' : 'text-foreground'}`}>Duration</h4>
                <p className={isLight ? 'text-gray-600' : 'text-muted-foreground'}>
                  {Math.ceil((new Date(selectedEvent.endAt).getTime() - new Date(selectedEvent.startAt).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function TimelineGrid({ days, brand }: { days: Date[]; brand: 'versoholdings' | 'versotech' }) {
  const isLight = brand === 'versoholdings'

  return (
    <div className={`mb-4 flex items-center border-b pb-2 ${isLight ? 'border-gray-200' : 'border-border'}`}>
      {days.map((day, index) => {
        const isWeekend = day.getDay() === 0 || day.getDay() === 6
        const dayNum = day.getDate()

        return (
          <div
            key={index}
            className="flex-1 text-center"
            style={{ minWidth: '32px' }}
          >
            <div className={`text-xs font-medium ${isWeekend ? (isLight ? 'text-gray-400' : 'text-muted-foreground') : (isLight ? 'text-gray-600' : 'text-foreground')}`}>
              {dayNum}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TimelineBar({
  feature,
  monthStart,
  monthEnd,
  daysInMonth,
  brand,
  onClick
}: {
  feature: MonthlyGanttFeature
  monthStart: Date
  monthEnd: Date
  daysInMonth: number
  brand: 'versoholdings' | 'versotech'
  onClick: () => void
}) {
  const isLight = brand === 'versoholdings'

  // Calculate bar position and width
  const featureStart = new Date(feature.startAt)
  const featureEnd = new Date(feature.endAt)

  // Clamp to month boundaries
  const barStart = featureStart < monthStart ? monthStart : featureStart
  const barEnd = featureEnd > monthEnd ? monthEnd : featureEnd

  // Calculate day offsets (0-indexed)
  const startDay = Math.floor((barStart.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
  const endDay = Math.floor((barEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
  const duration = endDay - startDay + 1

  // Convert to percentages
  const leftPercent = (startDay / daysInMonth) * 100
  const widthPercent = (duration / daysInMonth) * 100

  // Get color styling
  const color = feature.status.color || '#3b82f6'
  const barStyles = getBarStyles(color, isLight)

  // Different heights for different types
  const barHeight = feature.type === 'task' ? 'h-8' : 'h-12'
  const textSize = feature.type === 'task' ? 'text-sm' : 'text-xs'
  const minWidth = feature.type === 'task' ? '120px' : '80px'

  return (
    <div className={`relative ${barHeight} flex items-center`}>
      <div
        className={`absolute rounded-md px-3 py-2 ${textSize} font-semibold shadow-sm transition-all hover:shadow-md hover:z-10 truncate flex items-center gap-2 cursor-pointer`}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          minWidth: minWidth,
          ...barStyles
        }}
        title={`${feature.name} (${feature.status.name}) - Click for details`}
        onClick={onClick}
      >
        <span className="truncate">{feature.name}</span>
      </div>
    </div>
  )
}

function getBarStyles(colorHex: string, isLight: boolean) {
  // Convert hex to RGB
  const hex = colorHex.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  if (isLight) {
    // For light backgrounds - saturated, visible colors
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
      border: `2px solid rgba(${r}, ${g}, ${b}, 0.6)`,
      color: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`
    }
  } else {
    // For dark backgrounds - lighter, brighter colors
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
      border: `2px solid rgba(${r}, ${g}, ${b}, 0.7)`,
      color: `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`
    }
  }
}
