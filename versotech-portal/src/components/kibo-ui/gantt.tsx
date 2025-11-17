'use client'

import React, { createContext, useContext, useMemo } from 'react'

export type GanttFeature = {
  id: string
  name: string
  startAt: Date
  endAt: Date
  status?: { id: string; name: string; color?: string }
  owner?: { id: string; name?: string; image?: string }
}

interface GanttContextValue {
  startDate: Date
  endDate: Date
  zoom: number
}

const GanttContext = createContext<GanttContextValue | null>(null)

// Date utility functions
function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function differenceInDays(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = copy.getDate() - day
  return new Date(copy.setDate(diff))
}

// Generate week-based segments for the timeline
function generateWeekSegments(startDate: Date, endDate: Date) {
  const segments: Array<{
    start: Date
    end: Date
    month: string
    year: number
    weekLabel: string
    width: number
  }> = []

  const totalDays = differenceInDays(startDate, endDate)
  let current = new Date(startDate)

  while (current < endDate) {
    const weekStart = new Date(current)
    const weekEnd = new Date(Math.min(addDays(current, 6).getTime(), endDate.getTime()))
    const spanDays = differenceInDays(weekStart, weekEnd) + 1

    segments.push({
      start: weekStart,
      end: weekEnd,
      month: weekStart.toLocaleDateString(undefined, { month: 'short' }),
      year: weekStart.getFullYear(),
      weekLabel: `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      width: (spanDays / totalDays) * 100
    })

    current = addDays(weekEnd, 1)
  }

  return segments
}

// Provider
interface GanttProviderProps {
  children: React.ReactNode
  startDate: Date | string
  endDate: Date | string
  className?: string
  zoom?: number
  brand?: 'versoholdings' | 'versotech'
}

export function GanttProvider({
  children,
  startDate,
  endDate,
  className,
  zoom = 100,
  brand = 'versotech'
}: GanttProviderProps) {
  const normalizedStart = startDate instanceof Date ? startDate : new Date(startDate)
  const normalizedEnd = endDate instanceof Date ? endDate : new Date(endDate)

  // Ensure valid range
  const start = new Date(normalizedStart.getFullYear(), normalizedStart.getMonth(), normalizedStart.getDate())
  const end = normalizedEnd > normalizedStart ? new Date(normalizedEnd.getFullYear(), normalizedEnd.getMonth(), normalizedEnd.getDate()) : addDays(start, 30)

  const value = useMemo<GanttContextValue>(
    () => ({ startDate: start, endDate: end, zoom }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start.getTime(), end.getTime(), zoom]
  )

  return (
    <div className={className}>
      <GanttContext.Provider value={value}>{children}</GanttContext.Provider>
    </div>
  )
}

function useGanttContext() {
  const context = useContext(GanttContext)
  if (!context) {
    throw new Error('Gantt components must be used within GanttProvider')
  }
  return context
}

// Sidebar Components
export function GanttSidebar({
  children,
  brand = 'versotech'
}: {
  children: React.ReactNode
  brand?: 'versoholdings' | 'versotech'
}) {
  const isLight = brand === 'versoholdings'
  return (
    <aside
      className={`w-64 flex-shrink-0 overflow-y-auto border-r ${isLight ? 'border-gray-200 bg-white' : 'border-border bg-card'}`}
    >
      <div className="p-4">{children}</div>
    </aside>
  )
}

export function GanttSidebarGroup({
  name,
  children,
  brand = 'versotech'
}: {
  name: string
  children: React.ReactNode
  brand?: 'versoholdings' | 'versotech'
}) {
  const isLight = brand === 'versoholdings'
  return (
    <div className="mb-6">
      <p className={`mb-3 text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-foreground'}`}>
        {name}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export function GanttSidebarItem({
  feature,
  onSelectItem,
  brand = 'versotech'
}: {
  feature: GanttFeature
  onSelectItem?: (id: string) => void
  brand?: 'versoholdings' | 'versotech'
}) {
  const isLight = brand === 'versoholdings'
  const color = feature.status?.color || '#3b82f6'

  return (
    <button
      type="button"
      onClick={() => onSelectItem?.(feature.id)}
      className={`group w-full rounded-lg border px-3 py-2 text-left text-sm transition-all hover:shadow-sm ${
        isLight
          ? 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 hover:bg-gray-100'
          : 'border-border bg-muted/30 text-foreground hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="flex-1 truncate font-medium">{feature.name}</span>
      </div>
    </button>
  )
}

// Timeline Components
export function GanttTimeline({
  children,
  brand = 'versotech'
}: {
  children: React.ReactNode
  brand?: 'versoholdings' | 'versotech'
}) {
  const isLight = brand === 'versoholdings'
  return (
    <section
      className={`relative flex-1 overflow-auto ${isLight ? 'bg-white' : 'bg-background'}`}
    >
      <div className="min-w-[800px]">{children}</div>
    </section>
  )
}

export function GanttHeader({
  brand = 'versotech'
}: {
  brand?: 'versoholdings' | 'versotech'
}) {
  const { startDate, endDate } = useGanttContext()
  const segments = useMemo(() => generateWeekSegments(startDate, endDate), [startDate, endDate])
  const isLight = brand === 'versoholdings'

  // Group segments by month for the month header
  const monthGroups = useMemo(() => {
    const groups: Array<{ month: string; year: number; segments: typeof segments }> = []
    segments.forEach((segment) => {
      const lastGroup = groups[groups.length - 1]
      const monthKey = `${segment.month}-${segment.year}`
      const lastKey = lastGroup ? `${lastGroup.month}-${lastGroup.year}` : ''

      if (lastKey === monthKey) {
        lastGroup.segments.push(segment)
      } else {
        groups.push({ month: segment.month, year: segment.year, segments: [segment] })
      }
    })

    return groups.map((group) => ({
      ...group,
      totalWidth: group.segments.reduce((sum, seg) => sum + seg.width, 0)
    }))
  }, [segments])

  return (
    <div
      className={`sticky top-0 z-20 border-b ${isLight ? 'border-gray-200 bg-white' : 'border-border bg-card'}`}
    >
      {/* Month header */}
      <div className="flex border-b overflow-hidden">
        {monthGroups.map((group, idx) => (
          <div
            key={`${group.month}-${group.year}-${idx}`}
            className={`flex-shrink-0 flex items-center justify-center border-r py-2.5 text-sm font-semibold ${
              isLight
                ? 'border-gray-200 bg-gray-50 text-gray-900'
                : 'border-border bg-muted/20 text-foreground'
            }`}
            style={{ width: `${group.totalWidth}%`, minWidth: '80px' }}
          >
            <span className="whitespace-nowrap">{group.month} {group.year}</span>
          </div>
        ))}
      </div>

      {/* Week header */}
      <div className="flex overflow-hidden">
        {segments.map((segment, idx) => (
          <div
            key={`${segment.start.toISOString()}-${idx}`}
            className={`flex-shrink-0 flex items-center justify-center border-r py-2 text-xs font-medium ${
              isLight ? 'border-gray-200 text-gray-600' : 'border-border text-muted-foreground'
            }`}
            style={{ width: `${segment.width}%`, minWidth: '60px' }}
          >
            <span className="whitespace-nowrap truncate px-1">{segment.weekLabel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GanttFeatureList({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

export function GanttFeatureListGroup({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

export function GanttFeatureItem({
  id,
  name,
  startAt,
  endAt,
  status,
  children,
  brand = 'versotech'
}: GanttFeature & { children?: React.ReactNode; brand?: 'versoholdings' | 'versotech' }) {
  const { startDate, endDate } = useGanttContext()
  const isLight = brand === 'versoholdings'

  // Calculate position and width
  const totalDays = differenceInDays(startDate, endDate)
  const featureStart = Math.max(startAt.getTime(), startDate.getTime())
  const featureEnd = Math.min(endAt.getTime(), endDate.getTime())

  const offsetDays = differenceInDays(startDate, new Date(featureStart))
  const durationDays = Math.max(1, differenceInDays(new Date(featureStart), new Date(featureEnd)))

  const offset = (offsetDays / totalDays) * 100
  const width = Math.max((durationDays / totalDays) * 100, 2) // Minimum 2% width

  const barColor = status?.color || '#3b82f6'
  const barStyles = getBarStyles(barColor, isLight)

  return (
    <div
      className={`group relative flex h-14 items-center border-b ${isLight ? 'border-gray-100' : 'border-border/50'}`}
    >
      <div
        className="absolute flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold shadow-sm transition-all hover:shadow-md hover:z-10"
        style={{
          left: `${offset}%`,
          width: `${width}%`,
          ...barStyles
        }}
        title={name}
      >
        <span className="truncate">{name}</span>
        {children}
      </div>
    </div>
  )
}

export function GanttMarker({
  date,
  label,
  className
}: {
  id?: string
  date: Date
  label: string
  className?: string
}) {
  const { startDate, endDate } = useGanttContext()
  const totalDays = differenceInDays(startDate, endDate)
  const markerDays = differenceInDays(startDate, date)
  const offset = (markerDays / totalDays) * 100

  if (offset < 0 || offset > 100) return null

  return (
    <div
      className="pointer-events-none absolute inset-y-0 flex w-0.5 flex-col"
      style={{ left: `${offset}%` }}
    >
      <div className="h-full w-px bg-primary/40" />
      <div
        className={`pointer-events-auto absolute top-4 -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium shadow-sm ${
          className || 'border-primary/30 bg-primary/10 text-primary'
        }`}
      >
        {label}
      </div>
    </div>
  )
}

export function GanttToday() {
  const today = new Date()
  return (
    <div className="px-4 py-3 text-xs text-muted-foreground">
      Today: {today.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
    </div>
  )
}

export function GanttCreateMarkerTrigger({
  onCreateMarker
}: {
  onCreateMarker?: (date: Date) => void
}) {
  return (
    <div className="px-4 pb-6">
      <button
        type="button"
        className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        onClick={() => onCreateMarker?.(new Date())}
      >
        Add marker
      </button>
    </div>
  )
}

// Styling helper
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
