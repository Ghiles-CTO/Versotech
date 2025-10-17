'use client'

import { Suspense, useMemo } from 'react'

import { CalendarView, type CalendarEvent } from '@/components/calendar/calendar-view'

export interface CalendarSplitViewProps {
  calendarEvents: CalendarEvent[]
  emptyCalendarMessage?: string
  brand?: 'versoholdings' | 'versotech'
}

function CalendarSplitViewInner({
  calendarEvents,
  emptyCalendarMessage,
  brand = 'versotech'
}: CalendarSplitViewProps) {
  const calendarData = useMemo(() => calendarEvents, [calendarEvents])

  return (
    <div className="w-full">
      <CalendarView
        title="Schedule"
        description="Upcoming deadlines, deliverables, and deal activity."
        events={calendarData}
        emptyMessage={emptyCalendarMessage}
        brand={brand}
      />
    </div>
  )
}

export function CalendarSplitView(props: CalendarSplitViewProps) {
  return (
    <Suspense fallback={<CalendarSplitViewFallback brand={props.brand} />}>
      <CalendarSplitViewInner {...props} />
    </Suspense>
  )
}

function CalendarSplitViewFallback({ brand = 'versotech' }: { brand?: 'versoholdings' | 'versotech' }) {
  const isLight = brand === 'versoholdings'

  return (
    <div className={`h-96 w-full animate-pulse rounded-2xl border ${isLight ? 'border-slate-200/80 bg-slate-100/60' : 'border-border bg-muted/30'}`} />
  )
}
