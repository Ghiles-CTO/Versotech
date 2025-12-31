'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  disabled?: boolean
  variant?: 'default' | 'dark'
}

export function DateRangePicker({
  value,
  onChange,
  className,
  disabled,
  variant = 'default',
}: DateRangePickerProps) {
  const isDark = variant === 'dark'
  const [date, setDate] = React.useState<DateRange | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onChange?.(range)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              'justify-start text-left font-normal',
              isDark
                ? 'bg-black/40 border-white/10 text-slate-200 hover:bg-white/10'
                : 'bg-background border-input hover:bg-accent hover:text-accent-foreground',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'w-auto p-0',
            isDark ? 'bg-[#0A1628] border-white/10' : 'bg-popover border-border'
          )}
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
