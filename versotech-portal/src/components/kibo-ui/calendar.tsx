'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

type CalendarFeature = {
  id: string
  name: string
  startAt: Date
  endAt: Date
  status?: { id: string; name: string; color?: string }
  description?: string
}

interface CalendarContextValue {
  currentDate: Date
  selectedDate: Date
  goToNextMonth: () => void
  goToPreviousMonth: () => void
  goToToday: () => void
  setMonth: (monthIndex: number) => void
  setYear: (year: number) => void
  selectDate: (date: Date) => void
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

// Date utility functions
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  const copy = new Date(date)
  copy.setMonth(copy.getMonth() + amount)
  return copy
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function generateMonthMatrix(date: Date) {
  const matrix: Array<{ date: Date; isCurrentMonth: boolean }> = []
  const start = startOfMonth(date)
  const startWeekday = start.getDay()
  const firstVisibleDay = addDays(start, -startWeekday)

  for (let i = 0; i < 42; i += 1) {
    const current = addDays(firstVisibleDay, i)
    matrix.push({
      date: current,
      isCurrentMonth: current.getMonth() === date.getMonth()
    })
  }

  return matrix
}

// Provider Component
export function CalendarProvider({
  children,
  defaultDate = new Date(),
  defaultSelectedDate
}: {
  children: React.ReactNode
  defaultDate?: Date
  defaultSelectedDate?: Date
}) {
  const [currentDate, setCurrentDate] = useState(startOfMonth(defaultDate))
  const [selectedDate, setSelectedDate] = useState(startOfDay(defaultSelectedDate ?? defaultDate))

  const value = useMemo<CalendarContextValue>(() => {
    return {
      currentDate,
      selectedDate,
      goToNextMonth: () => {
        setCurrentDate((prev) => startOfMonth(addMonths(prev, 1)))
      },
      goToPreviousMonth: () => {
        setCurrentDate((prev) => startOfMonth(addMonths(prev, -1)))
      },
      goToToday: () => {
        const today = startOfMonth(new Date())
        setCurrentDate(today)
        setSelectedDate(startOfDay(new Date()))
      },
      setMonth: (monthIndex: number) =>
        setCurrentDate((prev) => startOfMonth(new Date(prev.getFullYear(), monthIndex, 1))),
      setYear: (year: number) =>
        setCurrentDate((prev) => startOfMonth(new Date(year, prev.getMonth(), 1))),
      selectDate: (date: Date) => setSelectedDate(startOfDay(date))
    }
  }, [currentDate, selectedDate])

  return (
    <CalendarContext.Provider value={value}>
      <div className="flex flex-col gap-4">{children}</div>
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('Calendar components must be used within CalendarProvider')
  }
  return context
}

// UI Components
export function CalendarDate({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">{children}</div>
}

export function CalendarDatePicker({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>
}

export function CalendarMonthPicker({ brand = 'versotech' }: { brand?: 'versoholdings' | 'versotech' }) {
  const { currentDate, setMonth } = useCalendar()
  const isLight = brand === 'versoholdings'
  return (
    <select
      className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-border bg-card text-foreground'}`}
      value={currentDate.getMonth()}
      onChange={(event) => setMonth(Number(event.target.value))}
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <option key={index} value={index}>
          {new Date(2000, index).toLocaleString('default', { month: 'long' })}
        </option>
      ))}
    </select>
  )
}

export function CalendarYearPicker({ start, end, brand = 'versotech' }: { start: number; end: number; brand?: 'versoholdings' | 'versotech' }) {
  const { currentDate, setYear } = useCalendar()
  const isLight = brand === 'versoholdings'
  const years = useMemo(() => {
    const list: number[] = []
    const min = Math.min(start, end)
    const max = Math.max(start, end)
    for (let year = min; year <= max; year += 1) {
      list.push(year)
    }
    return list
  }, [start, end])

  return (
    <select
      className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-border bg-card text-foreground'}`}
      value={currentDate.getFullYear()}
      onChange={(event) => setYear(Number(event.target.value))}
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}

export function CalendarDatePagination({ brand = 'versotech' }: { brand?: 'versoholdings' | 'versotech' }) {
  const { goToNextMonth, goToPreviousMonth, goToToday } = useCalendar()
  const isLight = brand === 'versoholdings'
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`}
        onClick={goToPreviousMonth}
      >
        Previous
      </button>
      <button
        type="button"
        className={`rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`}
        onClick={goToToday}
      >
        Today
      </button>
      <button
        type="button"
        className={`rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`}
        onClick={goToNextMonth}
      >
        Next
      </button>
    </div>
  )
}

export function CalendarHeader({ brand = 'versotech' }: { brand?: 'versoholdings' | 'versotech' }) {
  const { currentDate } = useCalendar()
  const isLight = brand === 'versoholdings'

  return (
    <div className="flex flex-col gap-3">
      <div className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>
      <div className={`grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
          <div key={weekday} className="px-2 text-center">
            {weekday}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalendarBody({
  features,
  children,
  brand = 'versotech',
  onDayClick
}: {
  features: Array<Omit<CalendarFeature, 'startAt' | 'endAt'> & { startAt: Date | string; endAt: Date | string }>
  children?: (args: { feature: CalendarFeature; brand?: 'versoholdings' | 'versotech' }) => React.ReactNode
  brand?: 'versoholdings' | 'versotech'
  onDayClick?: (date: Date) => void
}) {
  const { currentDate, selectedDate, selectDate } = useCalendar()
  const today = startOfDay(new Date())
  const isLight = brand === 'versoholdings'

  const normalizedFeatures = useMemo<CalendarFeature[]>(() => {
    return features.map((feature) => ({
      ...feature,
      startAt: feature.startAt instanceof Date ? feature.startAt : new Date(feature.startAt),
      endAt: feature.endAt instanceof Date ? feature.endAt : new Date(feature.endAt)
    }))
  }, [features])

  const matrix = useMemo(() => generateMonthMatrix(currentDate), [currentDate])

  const handleDayClick = (date: Date) => {
    selectDate(date)
    onDayClick?.(date)
  }

  return (
    <div
      className={`grid grid-cols-7 gap-2 rounded-2xl border p-2 md:gap-3 md:p-4 ${
        isLight ? 'border-slate-200/80 bg-white/90' : 'border-border/80 bg-muted/20'
      }`}
    >
      {matrix.map(({ date, isCurrentMonth }) => {
        const dayEvents = normalizedFeatures.filter((feature) => {
          const start = startOfDay(feature.startAt)
          const end = endOfDay(feature.endAt)
          return date >= start && date <= end
        })

        const isToday = isSameDay(date, today)
        const isSelected = isSameDay(date, selectedDate)

        const baseClasses = [
          'flex min-h-[92px] flex-col rounded-xl border px-2 py-2 text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
        ]

        if (isLight) {
          if (isCurrentMonth) {
            baseClasses.push('border-slate-200 bg-white text-slate-900 hover:border-primary/40 hover:bg-primary/5')
          } else {
            baseClasses.push('border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200')
          }
        } else {
          if (isCurrentMonth) {
            baseClasses.push('border-border/70 bg-muted/40 text-foreground hover:border-primary/30 hover:bg-muted/60')
          } else {
            baseClasses.push('border-border/40 bg-muted/10 text-muted-foreground hover:border-border/60')
          }
        }

        if (isSelected) {
          baseClasses.push('border-primary/60 bg-primary/10 ring-2 ring-primary/40')
        } else if (isToday) {
          baseClasses.push('border-primary/40 bg-primary/5')
        } else {
          baseClasses.push('border-transparent')
        }

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => handleDayClick(date)}
            className={baseClasses.join(' ')}
            aria-pressed={isSelected}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className={`text-sm font-semibold leading-none ${isToday ? 'text-primary' : ''}`}>
                {date.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <span className="rounded-full bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {dayEvents.length}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {dayEvents.slice(0, 2).map((feature) =>
                children ? (
                  <React.Fragment key={feature.id}>{children({ feature, brand })}</React.Fragment>
                ) : (
                  <CalendarItem key={feature.id} feature={feature} brand={brand} />
                )
              )}
              {dayEvents.length > 2 && (
                <div className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/20 text-primary text-center">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function CalendarItem({ feature, brand = 'versotech' }: { feature: CalendarFeature; brand?: 'versoholdings' | 'versotech' }) {
  const color = feature.status?.color || '#3b82f6'
  const styles = getEventStyle(color, brand)

  return (
    <div
      className="rounded px-1.5 py-1 text-[10px] font-semibold truncate"
      style={styles}
      title={feature.name}
    >
      {feature.name}
    </div>
  )
}

function getEventStyle(colorHex: string, brand: 'versoholdings' | 'versotech' = 'versotech') {
  const isLight = brand === 'versoholdings'

  // Convert hex to RGB
  const hex = colorHex.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  if (isLight) {
    // For light backgrounds - use more saturated, visible colors
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
      border: `1.5px solid rgba(${r}, ${g}, ${b}, 0.6)`,
      color: `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`
    }
  } else {
    // For dark backgrounds - use lighter, brighter colors
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
      border: `1.5px solid rgba(${r}, ${g}, ${b}, 0.7)`,
      color: `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`
    }
  }
}
