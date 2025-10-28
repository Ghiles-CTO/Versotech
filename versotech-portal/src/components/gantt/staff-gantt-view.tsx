'use client'

import { useMemo } from 'react'

import {
  GanttCreateMarkerTrigger,
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttMarker,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday
} from '@/components/kibo-ui/gantt'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export interface GanttFeatureDTO {
  id: string
  name: string
  startAt: string
  endAt: string
  status: {
    id: string
    name: string
    color?: string
  }
  group: {
    id: string
    name: string
  }
  owner?: {
    id: string
    name?: string
  }
}

export interface GanttMarkerDTO {
  id: string
  label: string
  date: string
  className?: string
}

interface StaffGanttViewProps {
  title: string
  description?: string
  features: GanttFeatureDTO[]
  markers?: GanttMarkerDTO[]
  brand?: 'versoholdings' | 'versotech'
}

export function StaffGanttView({ title, description, features, markers = [], brand = 'versotech' }: StaffGanttViewProps) {
  const timelineBounds = useMemo(() => {
    const addDays = (date: Date, amount: number) => new Date(date.getTime() + amount * 86_400_000)

    if (!features.length) {
      const today = new Date()
      return {
        start: addDays(today, -7),
        end: addDays(today, 21)
      }
    }

    const startTimes = features.map((feature) => new Date(feature.startAt).getTime())
    const endTimes = features.map((feature) => new Date(feature.endAt).getTime())

    const minStart = Math.min(...startTimes)
    const maxEnd = Math.max(...endTimes)

    const start = new Date(minStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(maxEnd)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }, [features])

  const parsedData = useMemo(() => {
    const grouped = new Map<string, { name: string; items: Array<GanttFeatureDTO & { startAtDate: Date; endAtDate: Date }> }>()

    features.forEach((feature) => {
      const startAtDate = new Date(feature.startAt)
      const endAtDate = new Date(feature.endAt)
      const groupId = feature.group.id

      if (!grouped.has(groupId)) {
        grouped.set(groupId, { name: feature.group.name, items: [] })
      }

      grouped.get(groupId)!.items.push({
        ...feature,
        startAtDate,
        endAtDate
      })
    })

    return Array.from(grouped.entries()).map(([groupId, value]) => ({
      id: groupId,
      name: value.name,
      items: value.items.sort((a, b) => a.startAtDate.getTime() - b.startAtDate.getTime())
    }))
  }, [features])

  const parsedMarkers = useMemo(() => {
    return markers.map((marker) => ({
      ...marker,
      date: new Date(marker.date)
    }))
  }, [markers])

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
        {description && (
          <CardDescription className={`text-sm ${isLight ? 'text-slate-600' : 'text-muted-foreground'}`}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {parsedData.length === 0 ? (
          <div className={`p-10 text-center text-sm ${isLight ? 'text-slate-500' : 'text-muted-foreground'}`}>
            No operational items scheduled yet. Workflow items will appear here automatically.
          </div>
        ) : (
          <div
            className={`relative h-[560px] border-t ${
              isLight ? 'border-slate-200/80 bg-white' : 'border-border/80 bg-card'
            }`}
          >
            <GanttProvider
              className="flex h-full w-full"
              zoom={120}
              startDate={timelineBounds.start}
              endDate={timelineBounds.end}
              brand={brand}
            >
              <GanttSidebar brand={brand}>
                {parsedData.map((group) => (
                  <GanttSidebarGroup key={group.id} name={group.name} brand={brand}>
                    {group.items.map((feature) => (
                      <GanttSidebarItem
                        key={feature.id}
                        feature={{
                          id: feature.id,
                          name: feature.name,
                          startAt: feature.startAtDate,
                          endAt: feature.endAtDate,
                          status: feature.status
                        }}
                        brand={brand}
                      />
                    ))}
                  </GanttSidebarGroup>
                ))}
              </GanttSidebar>

              <GanttTimeline brand={brand}>
                <div
                  className={`sticky top-0 z-10 flex flex-col gap-3 border-b px-4 pb-4 pt-4 ${
                    isLight ? 'border-slate-200/80 bg-white/95' : 'border-border/70 bg-card/95'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from(new Map(features.map((feature) => [feature.status.id, feature.status])).values()).map((status) => (
                      <Badge
                        key={status.id}
                        variant="outline"
                        className={`gap-2 rounded-full px-3 py-1 text-[11px] ${
                          isLight ? 'border-slate-200/80 bg-white/80 text-slate-600' : 'border-border bg-muted/60 text-foreground'
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: status.color || '#0f172a' }}
                        />
                        {status.name}
                      </Badge>
                    ))}
                  </div>
                  <GanttHeader brand={brand} />
                </div>

                <GanttFeatureList>
                  {parsedData.map((group) => (
                    <GanttFeatureListGroup key={group.id} className="space-y-3 px-2 py-4">
                      <p
                        className={`px-2 text-[11px] font-semibold uppercase tracking-wide ${
                          isLight ? 'text-slate-500' : 'text-muted-foreground'
                        }`}
                      >
                        {group.name}
                      </p>
                      {group.items.map((feature) => (
                        <div className="flex items-center gap-2 px-2" key={feature.id}>
                          <GanttFeatureItem
                            id={feature.id}
                            name={feature.name}
                            startAt={feature.startAtDate}
                            endAt={feature.endAtDate}
                            status={feature.status}
                            brand={brand}
                          >
                            {feature.owner?.name && (
                              <Avatar className={`h-6 w-6 border text-[10px] ${isLight ? 'border-slate-300 bg-slate-800 text-slate-100' : 'border-slate-700 bg-slate-800 text-slate-200'}`}>
                                <AvatarFallback className="text-[10px]">
                                  {feature.owner.name
                                    .split(' ')
                                    .map((part) => part.charAt(0))
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </GanttFeatureItem>
                        </div>
                      ))}
                    </GanttFeatureListGroup>
                  ))}
                </GanttFeatureList>

                {parsedMarkers.map((marker) => (
                  <GanttMarker
                    key={marker.id}
                    id={marker.id}
                    label={marker.label}
                    date={marker.date}
                    className={marker.className}
                  />
                ))}
                <GanttToday />
                <GanttCreateMarkerTrigger />
              </GanttTimeline>
            </GanttProvider>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
