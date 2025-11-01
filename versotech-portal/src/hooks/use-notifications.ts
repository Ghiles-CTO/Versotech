'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NotificationCounts {
  tasks: number
  messages: number
  deals: number
  requests: number
  approvals: number
  notifications: number
  totalUnread: number
}

const INITIAL_COUNTS: NotificationCounts = {
  tasks: 0,
  messages: 0,
  deals: 0,
  requests: 0,
  approvals: 0,
  notifications: 0,
  totalUnread: 0
}

const STAFF_REQUEST_STATUSES = ['open', 'assigned', 'in_progress', 'awaiting_info'] as const
const STAFF_APPROVAL_STATUSES = ['pending'] as const
const STAFF_STATUS_FILTER = STAFF_REQUEST_STATUSES.join(',')
const STAFF_APPROVAL_FILTER = STAFF_APPROVAL_STATUSES.join(',')

export function useNotifications(userRole: string, userId?: string) {
  const [counts, setCounts] = useState<NotificationCounts>(INITIAL_COUNTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true
    let supabaseClient: ReturnType<typeof createClient> | null = null

    const fetchCounts = async (silent = false) => {
      if (!silent) {
        setLoading(true)
      }

      try {
        const response = await fetch('/api/notifications/counts', {
          cache: 'no-store',
          signal: AbortSignal.timeout(10000), // 10s timeout
        })

        if (response.status === 401) {
          if (isMounted) {
            setCounts(INITIAL_COUNTS)
            if (!silent) {
              setLoading(false)
            }
          }
          return
        }

        if (!response.ok) {
          // Don't throw on 404 or other errors during dev server restarts
          if (!silent) {
            console.warn(`Failed to load notification counts (${response.status})`)
          }
          return
        }

        const payload = await response.json()
        if (isMounted && payload?.counts) {
          setCounts(payload.counts as NotificationCounts)
        }
      } catch (error) {
        // Silently ignore fetch errors during polling - they happen during dev server restarts
        if (!silent && error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'AbortError') {
          console.warn('Failed to fetch notification counts:', error.message)
        }
      } finally {
        if (isMounted && !silent) {
          setLoading(false)
        }
      }
    }

    void fetchCounts()

    try {
      supabaseClient = createClient()
    } catch (error) {
      console.error('Failed to initialize Supabase client for notifications:', error)
      setLoading(false)
      return () => {
        isMounted = false
      }
    }

    const subscriptions: any[] = []

    subscriptions.push(
      supabaseClient
        .channel(`notifications_tasks_${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: `owner_user_id=eq.${userId}` },
          () => {
            void fetchCounts(true)
          }
        )
        .subscribe()
    )

    subscriptions.push(
      supabaseClient
        .channel(`notifications_investor_${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'investor_notifications', filter: `user_id=eq.${userId}` },
          () => {
            void fetchCounts(true)
          }
        )
        .subscribe()
    )

    if (userRole.startsWith('staff_')) {
      subscriptions.push(
        supabaseClient
          .channel('notifications_requests')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'request_tickets', filter: `status=in.(${STAFF_STATUS_FILTER})` },
            () => {
              void fetchCounts(true)
            }
          )
          .subscribe()
      )

      subscriptions.push(
        supabaseClient
          .channel('notifications_approvals')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'approvals', filter: `status=in.(${STAFF_APPROVAL_FILTER})` },
            () => {
              void fetchCounts(true)
            }
          )
          .subscribe()
      )
    }

    const intervalId = window.setInterval(() => {
      void fetchCounts(true)
    }, 60_000)

    return () => {
      isMounted = false
      subscriptions.forEach((channel) => {
        supabaseClient?.removeChannel(channel)
      })
      window.clearInterval(intervalId)
    }
  }, [userId, userRole])

  return { counts, loading }
}
