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

export function useNotifications(userRole: string, userId?: string) {
  const [counts, setCounts] = useState<NotificationCounts>({
    tasks: 0,
    messages: 0,
    deals: 0,
    requests: 0,
    approvals: 0,
    notifications: 0,
    totalUnread: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchCounts = async () => {
      const supabase = createClient()

      try {
        // Fetch notification counts based on user role
        if (userRole === 'investor') {
          // Investor-specific counts
          const [tasksRes, messagesRes, dealsRes, notificationsRes] = await Promise.allSettled([
            // Open tasks for investor
            supabase
              .from('tasks')
              .select('id', { count: 'exact' })
              .eq('owner_user_id', userId)
              .in('status', ['pending', 'in_progress']),

            // Unread messages in conversations they participate in
            supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .not('sender_id', 'eq', userId)
              .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()), // Last 7 days

            // Active deals they can participate in
            supabase
              .from('deals')
              .select('id', { count: 'exact' })
              .eq('status', 'open'),

            // Unread notifications
            supabase
              .from('investor_notifications')
              .select('id', { count: 'exact' })
              .eq('user_id', userId)
              .is('read_at', null)
          ])

          const taskCount = tasksRes.status === 'fulfilled' ? (tasksRes.value.count || 0) : 0
          const messageCount = messagesRes.status === 'fulfilled' ? (messagesRes.value.count || 0) : 0
          const dealCount = dealsRes.status === 'fulfilled' ? (dealsRes.value.count || 0) : 0
          const notificationCount = notificationsRes.status === 'fulfilled' ? (notificationsRes.value.count || 0) : 0

          setCounts({
            tasks: taskCount,
            messages: messageCount,
            deals: dealCount,
            requests: 0,
            approvals: 0,
            notifications: notificationCount,
            totalUnread: taskCount + messageCount + notificationCount
          })

        } else if (userRole.startsWith('staff_')) {
          // Staff-specific counts
          const [tasksRes, messagesRes, requestsRes, approvalsRes, notificationsRes] = await Promise.allSettled([
            // Open tasks assigned to staff
            supabase
              .from('tasks')
              .select('id', { count: 'exact' })
              .eq('owner_user_id', userId)
              .in('status', ['pending', 'in_progress']),

            // Recent messages in staff conversations
            supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .not('sender_id', 'eq', userId)
              .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()), // Last 24 hours

            // Open request tickets
            supabase
              .from('request_tickets')
              .select('id', { count: 'exact' })
              .in('status', ['open', 'assigned']),

            // Pending approvals
            supabase
              .from('approvals')
              .select('id', { count: 'exact' })
              .eq('status', 'pending'),

            // Unread notifications (staff)
            supabase
              .from('investor_notifications')
              .select('id', { count: 'exact' })
              .eq('user_id', userId)
              .is('read_at', null)
          ])

          const taskCount = tasksRes.status === 'fulfilled' ? (tasksRes.value.count || 0) : 0
          const messageCount = messagesRes.status === 'fulfilled' ? (messagesRes.value.count || 0) : 0
          const requestCount = requestsRes.status === 'fulfilled' ? (requestsRes.value.count || 0) : 0
          const approvalCount = approvalsRes.status === 'fulfilled' ? (approvalsRes.value.count || 0) : 0
           const notificationCount = notificationsRes.status === 'fulfilled' ? (notificationsRes.value.count || 0) : 0

          setCounts({
            tasks: taskCount,
            messages: messageCount,
            deals: 0,
            requests: requestCount,
            approvals: approvalCount,
            notifications: notificationCount,
            totalUnread: taskCount + messageCount + requestCount + approvalCount + notificationCount
          })
        }

      } catch (error) {
        console.error('Error fetching notification counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()

    // Set up real-time subscriptions for key tables
    const supabase = createClient()

    const tasksChannel = supabase
      .channel('tasks_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `owner_user_id=eq.${userId}` },
        () => fetchCounts()
      )
      .subscribe()

    const messagesChannel = supabase
      .channel('messages_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchCounts()
      )
      .subscribe()

    const requestsChannel = supabase
      .channel('requests_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'request_tickets' },
        () => fetchCounts()
      )
      .subscribe()

    const approvalsChannel = supabase
      .channel('approvals_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'approvals' },
        () => fetchCounts()
      )
      .subscribe()

    const dealsChannel = supabase
      .channel('deals_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deals' },
        () => fetchCounts()
      )
      .subscribe()

    const investorNotificationsChannel = supabase
      .channel('investor_notifications_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'investor_notifications', filter: `user_id=eq.${userId}` },
        () => fetchCounts()
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(requestsChannel)
      supabase.removeChannel(approvalsChannel)
      supabase.removeChannel(dealsChannel)
      supabase.removeChannel(investorNotificationsChannel)
    }

  }, [userId, userRole])

  return { counts, loading }
}
