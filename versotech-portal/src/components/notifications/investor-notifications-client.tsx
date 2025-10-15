'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  link?: string | null
  read_at?: string | null
  created_at: string
}

export default function InvestorNotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to load notifications')
      const data = await response.json()
      setNotifications(data.notifications ?? [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)

  const markAllRead = async () => {
    if (unreadIds.length === 0 || marking) return
    setMarking(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unreadIds })
      })
      if (!response.ok) throw new Error('Failed to mark notifications read')
      fetchNotifications()
    } catch (error) {
      console.error(error)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay up to date with deal activity, NDA access, and subscription progress.</p>
        </div>
        <Button
          variant="outline"
          disabled={unreadIds.length === 0 || marking}
          onClick={markAllRead}
          className="gap-2"
        >
          {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Mark all read
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="py-12 text-center text-gray-500">
            You&apos;re all caught up! New updates will show here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => {
            const created = new Date(notification.created_at).toLocaleString()
            return (
              <Card
                key={notification.id}
                className={`border ${notification.read_at ? 'bg-white' : 'bg-blue-50'}`}
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                      {notification.title}
                      {!notification.read_at && <Badge variant="secondary">New</Badge>}
                    </CardTitle>
                    <CardDescription>{created}</CardDescription>
                  </div>
                  {notification.link && (
                    <Button asChild variant="link" className="text-sm">
                      <a href={notification.link}>Open</a>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{notification.message}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
