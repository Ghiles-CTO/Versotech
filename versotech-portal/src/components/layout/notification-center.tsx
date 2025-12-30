'use client'

import { useState, useEffect } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import {
  Bell,
  CheckSquare,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface NotificationItem {
  id: string
  type: 'task' | 'message' | 'notification'
  title: string
  description?: string
  href: string
  read: boolean
  created_at: string
  deal_name?: string
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

  // Fetch notifications from multiple sources
  useEffect(() => {
    async function fetchNotifications() {
      if (!activePersona || !mounted) return

      setLoading(true)
      const supabase = createClient()
      const items: NotificationItem[] = []

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.warn('[NotificationCenter] No authenticated user found')
          setNotifications([])
          return
        }

        const userId = user.id

        // Fetch tasks
        let taskQuery = supabase
          .from('tasks')
          .select('id, title, description, created_at, owner_user_id, owner_investor_id')
          .in('status', ['pending', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(5)

        if (activePersona.persona_type === 'investor') {
          taskQuery = taskQuery.or(`owner_user_id.eq.${userId},owner_investor_id.eq.${activePersona.entity_id}`)
        } else {
          taskQuery = taskQuery.eq('owner_user_id', userId)
        }

        const { data: tasks } = await taskQuery

        if (tasks) {
          tasks.forEach((task: any) => {
            items.push({
              id: `task-${task.id}`,
              type: 'task',
              title: task.title,
              description: task.description,
              href: '/versotech_main/tasks',
              read: false,
              created_at: task.created_at
            })
          })
        }

        // Fetch unread messages using conversation participants + conversation preview
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', userId)
          .limit(50)

        const conversationIds = (participants || [])
          .map((row: any) => row.conversation_id)
          .filter(Boolean)

        if (conversationIds.length > 0) {
          let conversationQuery = supabase
            .from('conversations')
            .select('id, subject, preview, last_message_at, created_at, visibility')
            .in('id', conversationIds)
            .order('last_message_at', { ascending: false, nullsFirst: false })
            .limit(10)

          if (activePersona.persona_type !== 'staff') {
            conversationQuery = conversationQuery.in('visibility', ['investor', 'deal'])
          }

          const { data: conversations } = await conversationQuery

          const lastReadByConversation = new Map<string, string | null>()
          ;(participants || []).forEach((row: any) => {
            if (row.conversation_id) {
              lastReadByConversation.set(row.conversation_id, row.last_read_at ?? null)
            }
          })

          const unreadConversations = (conversations || []).filter((conv: any) => {
            const lastMessageAt = conv.last_message_at ?? conv.created_at
            if (!lastMessageAt) return false
            const lastReadAt = lastReadByConversation.get(conv.id)
            if (!lastReadAt) return true
            return new Date(lastMessageAt).getTime() > new Date(lastReadAt).getTime()
          })

          unreadConversations.slice(0, 5).forEach((conv: any) => {
            const lastMessageAt = conv.last_message_at ?? conv.created_at
            items.push({
              id: `msg-${conv.id}`,
              type: 'message',
              title: conv.subject || 'New message',
              description: conv.preview || 'You have a new message',
              href: '/versotech_main/inbox?tab=messages',
              read: false,
              created_at: lastMessageAt
            })
          })
        }

        // Fetch notifications for all personas (investor, lawyer, staff, etc.)
        // Notifications use read_at timestamp (null = unread)
        const { data: notifs } = await supabase
          .from('investor_notifications')
          .select('id, title, message, created_at, read_at, link')
          .eq('user_id', userId)
          .is('read_at', null)
          .order('created_at', { ascending: false })
          .limit(5)

        if (notifs) {
          notifs.forEach((notif: any) => {
            items.push({
              id: `notif-${notif.id}`,
              type: 'notification',
              title: notif.title,
              description: notif.message,
              href: notif.link || '/versotech_main/notifications',
              read: notif.read_at !== null,
              created_at: notif.created_at
            })
          })
        }

        // Sort by date and take top 10
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setNotifications(items.slice(0, 10))
      } catch (error) {
        console.error('[NotificationCenter] Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [activePersona, mounted])

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task': return CheckSquare
      case 'message': return MessageSquare
      case 'notification': return AlertCircle
      default: return Bell
    }
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
            ? "bg-[#1A1D24] border-white/10 text-white"
            : "bg-white border-gray-200"
        )}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className={isDark ? "text-white" : "text-gray-900"}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>

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
            {notifications.map((item) => {
              const Icon = getIcon(item.type)

              return (
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
                  <Link href={item.href} className="flex items-start gap-3 w-full">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isDark ? "bg-white/10" : "bg-gray-100"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        item.type === 'task' && "text-blue-500",
                        item.type === 'message' && "text-green-500",
                        item.type === 'notification' && "text-orange-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium truncate",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div className={cn(
                          "text-xs truncate",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          {item.description}
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
              )
            })}
          </div>
        )}

        <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-100"} />

        <DropdownMenuItem asChild>
          <Link
            href="/versotech_main/notifications"
            className={cn(
              "flex items-center justify-center text-sm py-2",
              isDark ? "text-blue-400" : "text-blue-600"
            )}
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
