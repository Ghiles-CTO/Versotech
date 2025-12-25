'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  badge?: React.ReactNode
  isDark?: boolean
}

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
  badge,
  isDark = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className={cn(
      'overflow-hidden',
      isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-6 transition-colors',
          isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className={isDark ? 'text-zinc-400' : 'text-gray-500'}>{icon}</span>}
          <span className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{title}</span>
          {badge}
        </div>
        <div className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
          {isOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>
      </button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <CardContent className={cn('pt-0 border-t', isDark ? 'border-white/5' : 'border-gray-200')}>
          <div className="pt-6">{children}</div>
        </CardContent>
      </div>
    </Card>
  )
}
