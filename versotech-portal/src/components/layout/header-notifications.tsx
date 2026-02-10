'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

type NotificationItem = {
  id: string
  title: string
  message: string
  link?: string | null
  read_at?: string | null
  created_at: string
  agent?: {
    id: string
    name: string
    avatar_url: string | null
  } | null
}

interface HeaderNotificationsProps {
  userId: string
  userRole: string
  href: string
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function HeaderNotifications({ href, userId, userRole }: HeaderNotificationsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  const refreshCounts = async () => {
    try {
      const response = await fetch('/api/notifications/counts')
      if (!response.ok) return
      const data = await response.json()
      const nextCount = Number(data?.counts?.notifications ?? 0)
      setUnreadCount(Number.isNaN(nextCount) ? 0 : nextCount)
    } catch (error) {
      console.error('[HeaderNotifications] Failed to load counts', error)
    }
  }

  const refreshItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=5')
      if (!response.ok) return
      const data = await response.json()
      setItems(data.notifications ?? [])
    } catch (error) {
      console.error('[HeaderNotifications] Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCounts()
  }, [userId, userRole])

  useEffect(() => {
    if (open) {
      refreshCounts()
      refreshItems()
    }
  }, [open])

  const unreadLabel = useMemo(() => {
    if (unreadCount <= 0) return null
    return unreadCount > 9 ? '9+' : String(unreadCount)
  }, [unreadCount])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative',
            isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadLabel && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-0">
              {unreadLabel}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          'w-80',
          isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-gray-200'
        )}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className={isDark ? 'text-white' : 'text-gray-900'}>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <div className="px-3 pb-2">
          <Button
            asChild
            variant="secondary"
            className={cn(
              'w-full justify-center text-sm',
              isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            )}
          >
            <Link href={href}>Open notifications</Link>
          </Button>
        </div>
        <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-100'} />

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                asChild
                className={cn(
                  'flex items-start gap-3 p-3 cursor-pointer',
                  isDark ? 'focus:bg-white/10' : 'focus:bg-gray-50',
                  !item.read_at && (isDark ? 'bg-white/5' : 'bg-blue-50/50')
                )}
              >
                <Link href={item.link || href} className="flex items-start gap-3 w-full">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isDark ? 'bg-white/10' : 'bg-gray-100'
                  )}>
                    <Bell className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium leading-snug line-clamp-2 break-words',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.title}
                    </div>
                    <div className={cn(
                      'text-xs leading-snug line-clamp-2 break-words',
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {item.message || '—'}
                    </div>
                    {item.agent?.name && (
                      <div className={cn(
                        'text-[10px] mt-1 flex items-center gap-1',
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        <Avatar className="h-4 w-4">
                          {item.agent.avatar_url && (
                            <AvatarImage src={item.agent.avatar_url} alt={item.agent.name} />
                          )}
                          <AvatarFallback className="text-[6px]">
                            {item.agent.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        From {item.agent.name}
                      </div>
                    )}
                    <div className={cn(
                      'text-xs mt-1',
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    )}>
                      {formatTimeAgo(item.created_at)}
                    </div>
                  </div>
                  {!item.read_at && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
