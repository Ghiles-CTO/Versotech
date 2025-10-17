'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'

interface CalendarEvent {
  id: string
  name: string
  startAt: Date
  endAt: Date
  status?: { id: string; name: string; color?: string }
  description?: string
}

interface CalendarDayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  events: CalendarEvent[]
  brand?: 'versoholdings' | 'versotech'
}

export function CalendarDayModal({ open, onOpenChange, date, events, brand = 'versotech' }: CalendarDayModalProps) {
  const isLight = brand === 'versoholdings'

  if (!date) return null

  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${isLight ? 'bg-white text-gray-900' : 'bg-card text-foreground'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>
            {format(date, 'EEEE, MMMM d, yyyy')}
            {isToday && <span className="ml-2 text-sm font-normal text-primary">(Today)</span>}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {events.length === 0 ? (
              <div className={`rounded-lg border border-dashed p-8 text-center ${isLight ? 'border-gray-300 bg-gray-50' : 'border-border bg-muted/30'}`}>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`}>
                  No events scheduled for this day
                </p>
              </div>
            ) : (
              events.map((event) => {
                const color = event.status?.color || '#3b82f6'
                const rgb = hexToRgb(color)

                return (
                  <div
                    key={event.id}
                    className={`rounded-lg border p-4 shadow-sm ${isLight ? 'border-gray-200 bg-white' : 'border-border bg-card'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>
                            {event.name}
                          </h3>
                          {event.status && (
                            <span
                              className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: isLight ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
                                color: isLight ? color : `rgb(${Math.min(255, rgb.r + 80)}, ${Math.min(255, rgb.g + 80)}, ${Math.min(255, rgb.b + 80)})`
                              }}
                            >
                              {event.status.name}
                            </span>
                          )}
                        </div>

                        <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`}>
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>
                              {format(event.startAt, 'MMM d')} - {format(event.endAt, 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>

                        {event.description && (
                          <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-foreground/80'}`}>
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return { r, g, b }
}
