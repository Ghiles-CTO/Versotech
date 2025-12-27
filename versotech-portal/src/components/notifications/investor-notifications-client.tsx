'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Check,
  Bell,
  BellOff,
  Search,
  Filter,
  Send,
  Inbox,
  FileText,
  Briefcase,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  link?: string | null
  read_at?: string | null
  created_at: string
  type?: string | null
  created_by?: string | null
  deal_id?: string | null
}

// Notification type labels and icons
const NOTIFICATION_TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  deal: { label: 'Deal', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
  subscription: { label: 'Subscription', icon: FileText, color: 'bg-green-100 text-green-800' },
  signature: { label: 'Signature', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  dataroom: { label: 'Dataroom', icon: FileText, color: 'bg-indigo-100 text-indigo-800' },
  kyc: { label: 'KYC', icon: Users, color: 'bg-orange-100 text-orange-800' },
  nda: { label: 'NDA', icon: FileText, color: 'bg-teal-100 text-teal-800' },
  agreement: { label: 'Agreement', icon: FileText, color: 'bg-pink-100 text-pink-800' },
  proxy_subscription: { label: 'Proxy Subscription', icon: Users, color: 'bg-cyan-100 text-cyan-800' },
  task: { label: 'Task', icon: CheckCircle2, color: 'bg-yellow-100 text-yellow-800' },
  reminder: { label: 'Reminder', icon: Clock, color: 'bg-amber-100 text-amber-800' },
  general: { label: 'General', icon: Bell, color: 'bg-gray-100 text-gray-800' },
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

export default function InvestorNotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'inbox' | 'sent'>('inbox')

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') {
        params.set('type', typeFilter)
      }
      if (viewMode === 'sent') {
        params.set('created_by_me', 'true')
      }

      const response = await fetch(`/api/notifications?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to load notifications')
      const data = await response.json()
      setNotifications(data.notifications ?? [])
      if (data.types) {
        setAvailableTypes(data.types)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [typeFilter, viewMode])

  // Filter notifications by search
  const filteredNotifications = notifications.filter(n => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      n.title?.toLowerCase().includes(searchLower) ||
      n.message?.toLowerCase().includes(searchLower)
    )
  })

  const unreadNotifications = filteredNotifications.filter(n => !n.read_at)
  const readNotifications = filteredNotifications.filter(n => n.read_at)
  const unreadIds = unreadNotifications.map(n => n.id)

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
      toast.success('Marked all as read')
      fetchNotifications()
    } catch (error) {
      console.error(error)
      toast.error('Failed to mark notifications as read')
    } finally {
      setMarking(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      })
      if (!response.ok) throw new Error('Failed to mark notification read')
      fetchNotifications()
    } catch (error) {
      console.error(error)
    }
  }

  const renderNotification = (notification: Notification) => {
    const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type || 'general'] || NOTIFICATION_TYPE_CONFIG.general
    const TypeIcon = typeConfig.icon

    return (
      <Card
        key={notification.id}
        className={cn(
          'border transition-colors hover:border-primary/50',
          notification.read_at ? 'bg-white' : 'bg-blue-50/50 border-blue-200'
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn('p-2 rounded-lg shrink-0', typeConfig.color)}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base text-gray-900 truncate">
                    {notification.title}
                  </CardTitle>
                  {!notification.read_at && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      New
                    </Badge>
                  )}
                  {notification.type && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {typeConfig.label}
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1">
                  {formatTimeAgo(notification.created_at)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!notification.read_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {notification.link && (
                <Button asChild variant="outline" size="sm">
                  <Link href={notification.link}>
                    Open
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{notification.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay up to date with deal activity, agreements, and subscription progress.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={unreadIds.length === 0 || marking || viewMode === 'sent'}
          onClick={markAllRead}
          className="gap-2"
        >
          {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Mark all read ({unreadIds.length})
        </Button>
      </div>

      {/* Tabs for Inbox/Sent */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'inbox' | 'sent')}>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />
              Sent by Me
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableTypes.map((type) => {
                  const config = NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.general
                  return (
                    <SelectItem key={type} value={type} className="capitalize">
                      {config.label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="inbox" className="mt-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="py-12 text-center">
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {search || typeFilter !== 'all'
                    ? 'No notifications match your filters'
                    : "You're all caught up! New updates will show here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Unread Section */}
              {unreadNotifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Unread ({unreadNotifications.length})
                  </h3>
                  <div className="space-y-3">
                    {unreadNotifications.map(renderNotification)}
                  </div>
                </div>
              )}

              {/* Read Section */}
              {readNotifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Earlier ({readNotifications.length})
                  </h3>
                  <div className="space-y-3">
                    {readNotifications.map(renderNotification)}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading sent notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="py-12 text-center">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {search || typeFilter !== 'all'
                    ? 'No sent notifications match your filters'
                    : "No notifications sent yet. Notifications you create will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(renderNotification)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
