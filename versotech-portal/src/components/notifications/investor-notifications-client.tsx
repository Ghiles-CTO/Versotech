'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { usePersona } from '@/contexts/persona-context'
import { ComplianceAlerts } from '@/components/audit/compliance-alerts'

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
  investor_id?: string | null
  agent_id?: string | null
  agent?: {
    id: string
    name: string
    avatar_url: string | null
  } | null
}

interface ComplianceAlert {
  id: string
  audit_log_id: string | null
  alert_type: string
  severity: string
  description: string | null
  status: string
  assigned_to: string | null
  created_at: string
}

interface ComplianceTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string | null
  due_at: string | null
  action_url: string | null
  owner_user_id: string | null
}

// Notification type labels and icons
// Map every real DB type to a display category
const NOTIFICATION_TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  // Broad categories
  deal: { label: 'Deal', icon: Briefcase, color: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' },
  subscription: { label: 'Subscription', icon: FileText, color: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' },
  signature: { label: 'Signature', icon: FileText, color: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' },
  dataroom: { label: 'Dataroom', icon: FileText, color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300' },
  kyc: { label: 'KYC', icon: Users, color: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300' },
  nda: { label: 'NDA', icon: FileText, color: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300' },
  agreement: { label: 'Agreement', icon: FileText, color: 'bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300' },
  proxy_subscription: { label: 'Proxy Subscription', icon: Users, color: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300' },
  task: { label: 'Task', icon: CheckCircle2, color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300' },
  reminder: { label: 'Reminder', icon: Clock, color: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
  // Specific DB types → mapped to proper labels
  signature_required: { label: 'Signature', icon: FileText, color: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' },
  introducer_agreement_pending: { label: 'Agreement', icon: FileText, color: 'bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300' },
  introducer_agreement_signed: { label: 'Agreement', icon: FileText, color: 'bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300' },
  approval_granted: { label: 'Approval', icon: CheckCircle2, color: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' },
  certificate_issued: { label: 'Certificate', icon: FileText, color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
  introducer_payment_confirmed: { label: 'Commission', icon: Briefcase, color: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300' },
  introducer_commission_accrued: { label: 'Commission', icon: Briefcase, color: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300' },
  introducer_invoice_sent: { label: 'Commission', icon: Briefcase, color: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300' },
  introducer_invoice_approved: { label: 'Commission', icon: Briefcase, color: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300' },
  payment_confirmed: { label: 'Payment', icon: Briefcase, color: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300' },
  investment_activated: { label: 'Investment', icon: Briefcase, color: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' },
  compliance_question: { label: 'Compliance', icon: AlertCircle, color: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300' },
  deal_invite: { label: 'Deal', icon: Briefcase, color: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' },
  subscription_pack_ready: { label: 'Subscription', icon: FileText, color: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' },
  nda_modification_request: { label: 'NDA', icon: FileText, color: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300' },
  profile_approved: { label: 'Profile', icon: Users, color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' },
  info: { label: 'Info', icon: Bell, color: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300' },
  general: { label: 'General', icon: Bell, color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' },
}

// Human-readable label for the filter dropdown (deduped by display label)
function getTypeLabel(type: string): string {
  return NOTIFICATION_TYPE_CONFIG[type]?.label ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const PERSONA_ROUTE_PREFIXES: Record<string, string[]> = {
  investor: [
    '/versotech_main/opportunities',
    '/versotech_main/portfolio',
    '/versotech_main/documents',
    '/versotech_main/inbox',
    '/versotech_main/profile',
    '/versotech_main/versosign',
    '/versotech_main/subscription-packs',
    '/versotech_main/deals',
  ],
  arranger: [
    '/versotech_main/my-mandates',
    '/versotech_main/subscription-packs',
    '/versotech_main/escrow',
    '/versotech_main/arranger-reconciliation',
    '/versotech_main/fee-plans',
    '/versotech_main/payment-requests',
    '/versotech_main/my-partners',
    '/versotech_main/my-introducers',
    '/versotech_main/my-commercial-partners',
    '/versotech_main/my-lawyers',
    '/versotech_main/versosign',
    '/versotech_main/arranger-profile',
  ],
  introducer: [
    '/versotech_main/introductions',
    '/versotech_main/introducer-agreements',
    '/versotech_main/my-commissions',
    '/versotech_main/versosign',
    '/versotech_main/introducer-profile',
  ],
  partner: [
    '/versotech_main/opportunities',
    '/versotech_main/partner-transactions',
    '/versotech_main/my-commissions',
    '/versotech_main/shared-transactions',
    '/versotech_main/versosign',
    '/versotech_main/partner-profile',
  ],
  commercial_partner: [
    '/versotech_main/opportunities',
    '/versotech_main/client-transactions',
    '/versotech_main/my-commissions',
    '/versotech_main/portfolio',
    '/versotech_main/placement-agreements',
    '/versotech_main/commercial-partner-profile',
    '/versotech_main/notifications',
    '/versotech_main/messages',
  ],
  lawyer: [
    '/versotech_main/assigned-deals',
    '/versotech_main/escrow',
    '/versotech_main/subscription-packs',
    '/versotech_main/versosign',
    '/versotech_main/lawyer-reconciliation',
    '/versotech_main/lawyer-profile',
  ],
}

const SHARED_ROUTE_PREFIXES = [
  '/versotech_main/notifications',
  '/versotech_main/versosign',
  '/versotech_main/documents',
  '/versotech_main/inbox',
  '/versotech_main/messages',
]

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

function getInitials(name?: string | null) {
  if (!name) return 'A'
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface InvestorNotificationsClientProps {
  isStaff?: boolean
  currentUserId?: string
  complianceAlerts?: ComplianceAlert[]
  complianceTasks?: ComplianceTask[]
}

export default function InvestorNotificationsClient({
  isStaff = false,
  currentUserId,
  complianceAlerts = [],
  complianceTasks = [],
}: InvestorNotificationsClientProps) {
  const { activePersona, personas, hasMultiplePersonas } = usePersona()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'inbox' | 'compliance'>('inbox')
  const [personaFilter, setPersonaFilter] = useState<string>('all')

  useEffect(() => {
    if (hasMultiplePersonas && activePersona?.entity_id) {
      setPersonaFilter(activePersona.entity_id)
    }
  }, [hasMultiplePersonas, activePersona?.entity_id])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
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
  }, [viewMode])

  // Filter by type label client-side (groups multiple DB types under one display label)
  const typeFilteredNotifications = useMemo(() => {
    if (typeFilter === 'all') return notifications
    const selectedLabel = getTypeLabel(typeFilter)
    return notifications.filter(n => {
      const label = getTypeLabel(n.type || 'general')
      return label === selectedLabel
    })
  }, [notifications, typeFilter])

  // Filter notifications by search
  const filteredNotifications = typeFilteredNotifications.filter(n => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      n.title?.toLowerCase().includes(searchLower) ||
      n.message?.toLowerCase().includes(searchLower)
    )
  })

  const selectedPersona = useMemo(() => {
    if (personaFilter === 'all') return null
    return personas.find(p => p.entity_id === personaFilter) || activePersona || null
  }, [personaFilter, personas, activePersona])

  const personaFilteredNotifications = useMemo(() => {
    if (!selectedPersona) return filteredNotifications

    const personaType = selectedPersona.persona_type
    if (personaType === 'ceo' || personaType === 'staff') {
      return filteredNotifications
    }

    const allowedPrefixes = PERSONA_ROUTE_PREFIXES[personaType] || []

    return filteredNotifications.filter((notification) => {
      if (notification.investor_id) {
        if (personaType !== 'investor') return false
        return notification.investor_id === selectedPersona.entity_id
      }

      if (!notification.link) return true

      if (SHARED_ROUTE_PREFIXES.some(prefix => notification.link!.startsWith(prefix))) {
        return true
      }

      return allowedPrefixes.some(prefix => notification.link!.startsWith(prefix))
    })
  }, [filteredNotifications, selectedPersona])

  const unreadNotifications = personaFilteredNotifications.filter(n => !n.read_at)
  const readNotifications = personaFilteredNotifications.filter(n => n.read_at)
  const unreadIds = unreadNotifications.map(n => n.id)

  const markAllRead = async () => {
    if (unreadIds.length === 0 || marking || viewMode !== 'inbox') return
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
    const hasAgent = !!notification.agent?.name

    return (
      <Card
        key={notification.id}
        className={cn(
          'border transition-all hover:border-primary/50 hover:shadow-sm',
          notification.read_at
            ? 'bg-white dark:bg-zinc-900'
            : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Leading visual: agent avatar (large) or type icon */}
            {hasAgent ? (
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-zinc-800 shadow-sm">
                {notification.agent!.avatar_url && (
                  <AvatarImage src={notification.agent!.avatar_url} alt={notification.agent!.name} />
                )}
                <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {getInitials(notification.agent!.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className={cn('p-2.5 rounded-lg shrink-0', typeConfig.color)}>
                <TypeIcon className="h-4 w-4" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Top row: title + badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {notification.title}
                </span>
                {!notification.read_at && (
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0">
                    New
                  </Badge>
                )}
                {notification.type && notification.type !== 'general' && notification.type !== 'info' && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {typeConfig.label}
                  </Badge>
                )}
              </div>

              {/* Agent name line */}
              {hasAgent && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  From <span className="font-medium text-foreground/70">{notification.agent!.name}</span>
                </p>
              )}

              {/* Message body */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 whitespace-pre-wrap leading-relaxed line-clamp-3">
                {notification.message}
              </p>

              {/* Bottom row: time + actions */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(notification.created_at)}
                </span>
                <div className="flex items-center gap-2">
                  {!notification.read_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Read
                    </Button>
                  )}
                  {notification.link && (
                    <Button asChild variant="outline" size="sm" className="h-7 px-3 text-xs">
                      <Link
                        href={notification.link}
                        onClick={() => {
                          if (!notification.read_at) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        Open
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
          disabled={unreadIds.length === 0 || marking || viewMode !== 'inbox'}
          onClick={markAllRead}
          className="gap-2"
        >
          {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Mark all read ({unreadIds.length})
        </Button>
      </div>

      {/* Tabs for Inbox/Sent */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'inbox' | 'compliance')}>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/versotech_main/inbox">
                <Inbox className="h-4 w-4" />
                Inbox
              </Link>
            </Button>
            {isStaff && (
              <TabsList>
                <TabsTrigger value="inbox" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="compliance" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Compliance
                </TabsTrigger>
              </TabsList>
            )}
          </div>

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
            {hasMultiplePersonas && (
              <Select value={personaFilter} onValueChange={setPersonaFilter}>
                <SelectTrigger className="w-[220px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Personas</SelectItem>
                  {personas.map((persona) => (
                    <SelectItem key={persona.entity_id} value={persona.entity_id}>
                      {persona.entity_name} ({persona.persona_type})
                      {activePersona?.entity_id === persona.entity_id ? ' • Current' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(() => {
                  // Deduplicate: group DB types by their display label, pick first type as value
                  const seen = new Map<string, string>()
                  for (const type of availableTypes) {
                    const label = getTypeLabel(type)
                    if (label === 'General') continue // skip "General" — it's noise
                    if (!seen.has(label)) seen.set(label, type)
                  }
                  return Array.from(seen.entries()).map(([label, type]) => (
                    <SelectItem key={type} value={type}>
                      {label}
                    </SelectItem>
                  ))
                })()}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="inbox" className="mt-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading notifications...
            </div>
          ) : personaFilteredNotifications.length === 0 ? (
            <Card className="border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <CardContent className="py-12 text-center">
                <BellOff className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
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

        {isStaff && (
          <TabsContent value="compliance" className="mt-6 space-y-6">
            <ComplianceAlerts alerts={complianceAlerts} />

            <Card>
              <CardHeader>
                <CardTitle>Compliance Tasks</CardTitle>
                <CardDescription>Open tasks that need compliance review</CardDescription>
              </CardHeader>
              <CardContent>
                {complianceTasks.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No open compliance tasks
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complianceTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between gap-4 p-3 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">{task.title}</span>
                            {task.priority && (
                              <Badge variant="secondary" className="capitalize">
                                {task.priority}
                              </Badge>
                            )}
                            {task.owner_user_id && task.owner_user_id === currentUserId && (
                              <Badge variant="outline">Assigned to you</Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          {task.due_at && (
                            <p className="text-xs text-muted-foreground">
                              Due {new Date(task.due_at).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                            </p>
                          )}
                        </div>
                        {task.action_url ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={task.action_url}>Open</Link>
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
