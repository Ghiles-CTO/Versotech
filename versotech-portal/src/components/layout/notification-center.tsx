'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePersona } from '@/contexts/persona-context'
import { useTheme } from '@/components/theme-provider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Bell,
  AlertCircle,
  CheckCheck
} from 'lucide-react'
import Link from 'next/link'

interface NotificationItem {
  id: string
  type: 'notification'
  title: string
  description?: string
  href: string
  read: boolean
  created_at: string
  deal_name?: string
  agent?: {
    name: string
    avatar_url: string | null
  } | null
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const { activePersona } = usePersona()
  const { theme } = useTheme()

  // Hydration fix: Only apply theme after component mounts to avoid SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use mounted check to prevent hydration mismatch (server renders light, client may have dark)
  const isDark = mounted && theme === 'staff-dark'

  // Fetch notifications via API route (uses service client, bypasses RLS)
  const fetchNotifications = useCallback(async () => {
    if (!activePersona || !mounted) return

    setLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=10')
      if (!response.ok) {
        setNotifications([])
        return
      }
      const data = await response.json()
      const items: NotificationItem[] = (data.notifications ?? []).map((n: any) => ({
        id: `notif-${n.id}`,
        type: 'notification' as const,
        title: n.title,
        description: n.message,
        href: n.link || '/versotech_main/notifications',
        read: !!n.read_at,
        created_at: n.created_at,
        agent: n.agent ?? null,
      }))
      setNotifications(items)
    } catch (error) {
      console.error('[NotificationCenter] Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [activePersona, mounted])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  // Extract real DB id from prefixed bell item id
  function stripIdPrefix(id: string): string {
    if (id.startsWith('lawyer-notif-')) return id.slice('lawyer-notif-'.length)
    if (id.startsWith('notif-')) return id.slice('notif-'.length)
    return id
  }

  // Mark a single notification as read (optimistic update + API call)
  async function markNotificationRead(item: NotificationItem) {
    if (item.type !== 'notification' || item.read) return
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [stripIdPrefix(item.id)] })
      })
    } catch (e) {
      console.error('[NotificationCenter] Failed to mark as read:', e)
    }
  }

  // Mark all notification-type items as read
  async function markAllNotificationsRead() {
    const notifItems = notifications.filter(n => n.type === 'notification' && !n.read)
    if (notifItems.length === 0) return
    // Optimistic update
    setNotifications(prev => prev.map(n =>
      n.type === 'notification' ? { ...n, read: true } : n
    ))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: notifItems.map(n => stripIdPrefix(n.id)) })
      })
    } catch (e) {
      console.error('[NotificationCenter] Failed to mark all as read:', e)
    }
  }

  // Refresh data + handle open state
  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen) fetchNotifications()
  }


  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Render placeholder button until mounted to prevent Radix UI hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative",
          isDark
            ? "text-gray-400 hover:text-white hover:bg-white/10"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
          className
        )}
      >
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative",
            isDark
              ? "text-gray-400 hover:text-white hover:bg-white/10"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            className
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]",
                "bg-red-500 text-white border-0"
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "w-80",
          isDark
            ? "bg-zinc-800 border-white/10 text-white"
            : "bg-white border-gray-200"
        )}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className={isDark ? "text-white" : "text-gray-900"}>
            Notifications
          </span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    markAllNotificationsRead()
                  }}
                  className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                  )}
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              </>
            )}
          </div>
        </DropdownMenuLabel>

        <div className="px-3 pb-2">
          <Button
            asChild
            variant="secondary"
            className={cn(
              "w-full justify-center text-sm",
              isDark
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            )}
          >
            <Link href="/versotech_main/notifications">
              Open notifications
            </Link>
          </Button>
        </div>

        <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-100"} />

        {loading ? (
          <div className="p-4 text-center">
            <div className={cn(
              "animate-spin h-5 w-5 mx-auto border-2 rounded-full",
              isDark ? "border-white/20 border-t-white" : "border-gray-200 border-t-gray-600"
            )} />
          </div>
        ) : notifications.length === 0 ? (
          <div className={cn(
            "p-4 text-center text-sm",
            isDark ? "text-gray-500" : "text-gray-500"
          )}>
            No notifications
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer",
                    isDark
                      ? "focus:bg-white/10"
                      : "focus:bg-gray-50",
                    !item.read && (isDark ? "bg-white/5" : "bg-blue-50/50")
                  )}
                >
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 w-full"
                    onClick={() => markNotificationRead(item)}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isDark ? "bg-white/10" : "bg-gray-100"
                    )}>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium leading-snug line-clamp-2 break-words",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div className={cn(
                          "text-xs leading-snug line-clamp-2 break-words",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          {item.description}
                        </div>
                      )}
                      {item.agent?.name && (
                        <div className={cn(
                          "text-[10px] mt-1 flex items-center gap-1",
                          isDark ? "text-gray-400" : "text-gray-500"
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
                        "text-xs mt-1",
                        isDark ? "text-gray-500" : "text-gray-400"
                      )}>
                        {formatTime(item.created_at)}
                        {item.deal_name && ` • ${item.deal_name}`}
                      </div>
                    </div>
                    {!item.read && (
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
