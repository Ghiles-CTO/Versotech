'use client'

import { useMemo, useState } from 'react'

import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  useCalendar
} from '@/components/kibo-ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDayModal } from './calendar-day-modal'

export interface CalendarEvent {
  id: string
  name: string
  startAt: string
  endAt: string
  status: {
    id: string
    name: string
    color?: string
  }
  description?: string
}

interface CalendarViewProps {
  title: string
  description?: string
  events: CalendarEvent[]
  emptyMessage?: string
  brand?: 'versoholdings' | 'versotech'
}

export function CalendarView({ title, description, events, emptyMessage, brand = 'versotech' }: CalendarViewProps) {
  const parsedEvents = useMemo(() => {
    return events
      .map((event) => ({
        ...event,
        startAt: new Date(event.startAt),
        endAt: new Date(event.endAt)
      }))
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
  }, [events])

  const [startYear, endYear] = useMemo(() => {
    if (parsedEvents.length === 0) {
      const currentYear = new Date().getFullYear()
      return [currentYear, currentYear]
    }

    const minYear = parsedEvents.reduce((min, event) => Math.min(min, event.startAt.getFullYear()), parsedEvents[0].startAt.getFullYear())
    const maxYear = parsedEvents.reduce((max, event) => Math.max(max, event.endAt.getFullYear()), parsedEvents[0].endAt.getFullYear())

    return [minYear, maxYear]
  }, [parsedEvents])

  const legend = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color?: string }>()
    parsedEvents.forEach((event) => {
      if (!map.has(event.status.id)) {
        map.set(event.status.id, event.status)
      }
    })
    return Array.from(map.values())
  }, [parsedEvents])

  const isLight = brand === 'versoholdings'

  return (
    <Card
      className={`overflow-hidden rounded-2xl border shadow-sm ${
        isLight ? 'border-slate-200/80 bg-white' : 'border-border/80 bg-card text-card-foreground'
      }`}
    >
      <CardHeader
        className={`space-y-1.5 border-b p-6 ${
          isLight ? 'border-slate-200/80 bg-slate-50/40' : 'border-border/80 bg-muted/30'
        }`}
      >
        <CardTitle className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-foreground'}`}>{title}</CardTitle>
        {description && <CardDescription className={`max-w-2xl text-sm ${isLight ? 'text-slate-600' : 'text-muted-foreground'}`}>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {parsedEvents.length === 0 ? (
          <div
            className={`rounded-2xl border border-dashed p-6 text-center text-sm ${
              isLight ? 'border-slate-200/90 bg-slate-50/80 text-slate-500' : 'border-border/80 bg-muted/30 text-muted-foreground'
            }`}
          >
            {emptyMessage || 'No scheduled activity yet. Upcoming items will appear here automatically.'}
          </div>
        ) : (
          <CalendarProvider defaultDate={new Date()} defaultSelectedDate={new Date()}>
            <CalendarSurface
              startYear={startYear}
              endYear={endYear}
              legend={legend}
              events={parsedEvents as any}
              emptyMessage={emptyMessage}
              brand={brand}
            />
          </CalendarProvider>
        )}
      </CardContent>
    </Card>
  )
}

function CalendarSurface({
  startYear,
  endYear,
  legend,
  events,
  emptyMessage,
  brand = 'versotech'
}: {
  startYear: number
  endYear: number
  legend: Array<{ id: string; name: string; color?: string }>
  events: Array<CalendarEvent & { startAt: Date; endAt: Date }>
  emptyMessage?: string
  brand?: 'versoholdings' | 'versotech'
}) {
  const { selectedDate } = useCalendar()
  const [modalOpen, setModalOpen] = useState(false)
  const [clickedDate, setClickedDate] = useState<Date | null>(null)

  const dayEvents = useMemo(() => {
    const date = clickedDate || selectedDate
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    return events.filter((event) => event.startAt <= dayEnd && event.endAt >= dayStart)
  }, [events, selectedDate, clickedDate])

  const handleDayClick = (date: Date) => {
    setClickedDate(date)
    setModalOpen(true)
  }

  const isLight = brand === 'versoholdings'

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border p-5 shadow-sm ${
          isLight ? 'border-slate-200/80 bg-white/90' : 'border-border/80 bg-muted/40'
        }`}
      >
        <CalendarDate>
          <CalendarDatePicker>
            <CalendarMonthPicker brand={brand} />
            <CalendarYearPicker start={startYear} end={endYear} brand={brand} />
          </CalendarDatePicker>
          <CalendarDatePagination brand={brand} />
        </CalendarDate>
      </div>

      {legend.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {legend.map((entry) => (
            <Badge
              key={entry.id}
              variant="outline"
              className={`gap-2 rounded-full px-3 py-1 text-xs ${
                isLight ? 'border-slate-200/80 bg-slate-50 text-slate-600' : 'border-border bg-muted/60 text-foreground'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || '#4f46e5' }}
              />
              {entry.name}
            </Badge>
          ))}
        </div>
      )}

      <div
        className={`space-y-5 rounded-2xl border p-5 shadow-sm ${
          isLight ? 'border-slate-200/80 bg-white' : 'border-border/80 bg-card'
        }`}
      >
        <CalendarHeader brand={brand} />
        <CalendarBody features={events} brand={brand} onDayClick={handleDayClick} />
      </div>

      <CalendarDayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={clickedDate}
        events={dayEvents}
        brand={brand}
      />
    </div>
  )
}
