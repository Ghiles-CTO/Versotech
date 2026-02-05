'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

interface HeaderNotificationsProps {
  userId: string
  userRole: string
  href: string
  className?: string
}

export function HeaderNotifications({ userId, userRole, href, className }: HeaderNotificationsProps) {
  const { counts, loading } = useNotifications(userRole, userId)
  const unreadCount = counts.notifications ?? 0

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn(
        'relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10',
        className
      )}
    >
      <Link href={href} aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {!loading && unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-0">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
