"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChatInterfaceEnhanced } from '@/components/messaging/chat-interface-enhanced'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type VisibilityFilter = 'all' | 'investor' | 'internal' | 'deal'
type TypeFilter = 'all' | 'dm' | 'group' | 'deal_room' | 'broadcast'

interface StaffMessagesPageProps {
  currentUserId: string
  initialConversations?: ConversationSummary[]
  initialVisibility?: VisibilityFilter
}

interface ConversationSummary {
  id: string
  subject: string | null
  type: TypeFilter
  visibility: VisibilityFilter
  owner_team: string | null
  deal_id: string | null
  created_by: string | null
  created_at: string
  last_message_at: string | null
  participants: Array<{
    id: string
    display_name: string | null
    email: string | null
    role: string | null
    participant_role: string | null
    last_read_at: string | null
  }>
  latest_message: {
    id: string
    body: string | null
    message_type: string | null
    created_at: string
    sender: {
      id: string | null
      display_name: string | null
      email: string | null
      role: string | null
    } | null
  } | null
  unread_count: number
}

interface ConversationsResponse {
  conversations: ConversationSummary[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  filters: {
    visibility: VisibilityFilter
    type: TypeFilter
    unread_only: boolean
    search: string | null
  }
}

const VISIBILITY_ORDER: VisibilityFilter[] = ['all', 'investor', 'internal', 'deal']

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dm', label: 'Direct' },
  { value: 'group', label: 'Group' },
  { value: 'deal_room', label: 'Deal Rooms' },
  { value: 'broadcast', label: 'Broadcast' },
]

export function StaffMessagesPage({
  currentUserId,
  initialConversations = [],
  initialVisibility = 'all',
}: StaffMessagesPageProps) {
  const supabase = useMemo(() => createClient(), [])

  const [isInitialLoading, setIsInitialLoading] = useState(initialConversations.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations)
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>(initialVisibility)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)
  const [broadcastSubject, setBroadcastSubject] = useState('Investor Update')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastSending, setBroadcastSending] = useState(false)

  const fetchConversations = useCallback(async () => {
    setErrorMessage(null)
    setIsRefreshing(true)

    try {
      const params = new URLSearchParams({
        visibility: visibilityFilter,
        type: typeFilter,
      })

      if (showUnreadOnly) {
        params.set('unread', 'true')
      }

      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim())
      }

      const response = await fetch(`/api/conversations?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.error || 'Failed to load conversations'
        throw new Error(message)
      }

      const data = (await response.json()) as ConversationsResponse
      setConversations(data.conversations || [])
    } catch (error: any) {
      console.error('StaffMessagesPage fetch error:', error)
      setErrorMessage(error.message || 'Unable to load conversations')
    } finally {
      setIsInitialLoading(false)
      setIsRefreshing(false)
    }
  }, [visibilityFilter, typeFilter, showUnreadOnly, searchTerm])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const channel = supabase.channel('staff_conversations_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversation_participants' }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations, supabase])

  const handleVisibilityChange = (next: VisibilityFilter) => {
    setVisibilityFilter(next)
  }

  const refresh = () => {
    fetchConversations()
  }

  const handleBroadcastSubmit = async () => {
    if (!broadcastMessage.trim()) {
      toast.error('Message body is required')
      return
    }

    setBroadcastSending(true)
    try {
      const response = await fetch('/api/conversations/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: broadcastSubject.trim() || 'Investor Broadcast',
          message: broadcastMessage.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to send broadcast')
      }

      toast.success('Broadcast sent to all investors')
      setBroadcastMessage('')
      setIsBroadcastOpen(false)
      fetchConversations()
    } catch (error: any) {
      console.error('Broadcast error:', error)
      toast.error(error.message || 'Unable to send broadcast')
    } finally {
      setBroadcastSending(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        </div>
      </div>
    )
  }

  const visibilityTabs = VISIBILITY_ORDER.map((visibility) => {
    const label =
      visibility === 'all'
        ? 'All'
        : visibility === 'investor'
        ? 'Investor'
        : visibility === 'internal'
        ? 'Internal'
        : 'Deals'

    const unreadCount = conversations
      .filter((conv) => visibility === 'all' || conv.visibility === visibility)
      .reduce((total, conv) => total + (conv.unread_count || 0), 0)

    return {
      value: visibility,
      label,
      unreadCount,
    }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="px-6 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
              <p className="text-sm text-muted-foreground">
                Monitor investor and internal conversations across the staff portal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={refresh} disabled={isRefreshing} size="sm">
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Refresh
              </Button>
              <Button size="sm" onClick={() => setIsBroadcastOpen(true)}>
                New Investor Broadcast
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {visibilityTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={visibilityFilter === tab.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleVisibilityChange(tab.value as VisibilityFilter)}
                  className={cn(
                    'relative',
                    visibilityFilter === tab.value ? 'shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  {tab.label}
                  {tab.unreadCount > 0 ? (
                    <Badge className="ml-2 rounded-full" variant="secondary">
                      {tab.unreadCount}
                    </Badge>
                  ) : null}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showUnreadOnly ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowUnreadOnly((value) => !value)}
                className={cn('rounded-full', showUnreadOnly && 'shadow-sm')}
              >
                Unread
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Type:</span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                  className="bg-background border border-input rounded-md px-2 py-1 text-sm"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="border border-input rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-md">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterfaceEnhanced
          className="px-6 py-4"
          initialConversations={conversations}
          visibilityFilter={visibilityFilter}
          onVisibilityChange={setVisibilityFilter}
          currentUserId={currentUserId}
        />
      </div>

      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send broadcast to all investors</DialogTitle>
            <DialogDescription>
              This will create a conversation and send a message to every active investor user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="broadcast-subject">Subject</Label>
              <Input
                id="broadcast-subject"
                value={broadcastSubject}
                onChange={(event) => setBroadcastSubject(event.target.value)}
                placeholder="Investor Update"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-body">Message</Label>
              <Textarea
                id="broadcast-body"
                value={broadcastMessage}
                onChange={(event) => setBroadcastMessage(event.target.value)}
                placeholder="Write your update for all investors..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBroadcastOpen(false)}
              disabled={broadcastSending}
            >
              Cancel
            </Button>
            <Button onClick={handleBroadcastSubmit} disabled={broadcastSending}>
              {broadcastSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

