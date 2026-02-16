'use client'

import type { ConversationSummary, ConversationMessage } from '@/types/messaging'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { fetchConversationMessages, markConversationRead, subscribeToConversationUpdates, getClientSupabase } from '@/lib/messaging'
import { extractFirstUrl } from '@/lib/messaging/url-utils'
import { groupMessages, getInitials, formatRelativeTime, getDateDivider, shouldShowDateDivider } from '@/lib/messaging/utils'
import { MessageBubble } from '@/components/messaging/shared/message-bubble'
import { MessageSkeleton } from '@/components/messaging/message-skeleton'
import { AutoExpandTextarea } from '@/components/ui/auto-expand-textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Send, MoreVertical, Users, Trash2, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

// Module-level tracker for pending agent replies. Survives component unmount/remount
// so the new instance can pick up polling where the old one left off.
const pendingAgentReplies = new Map<
  string,
  { messageId: string; conversationId: string; triggeredAt: number }
>()

interface ConversationViewProps {
  conversation: ConversationSummary
  currentUserId: string
  showAssistantBadge?: boolean
  showComplianceControls?: boolean
  onRead?: () => void
  onError?: (message: string) => void
  onDelete?: (conversationId: string) => void
  onRefresh?: () => void
}

export function ConversationView({
  conversation,
  currentUserId,
  showAssistantBadge = true,
  showComplianceControls = true,
  onRead,
  onError,
  onDelete,
  onRefresh,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [composerMessage, setComposerMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const didInitialScrollRef = useRef(false)
  const isNearBottomRef = useRef(true)
  const [showComplianceDialog, setShowComplianceDialog] = useState(false)
  const [complianceReason, setComplianceReason] = useState('')
  const [complianceUrgency, setComplianceUrgency] = useState<'low' | 'medium' | 'high'>('medium')
  const [complianceSubmitting, setComplianceSubmitting] = useState(false)
  const isMountedRef = useRef(true)
  // When non-null, an interval refetches messages until the agent reply is found.
  const [pendingReplyMessageId, setPendingReplyMessageId] = useState<string | null>(() => {
    const pending = pendingAgentReplies.get(conversation.id)
    if (pending && Date.now() - pending.triggeredAt < 60_000) return pending.messageId
    return null
  })

  // Typing indicator state
  const [typingUsers, setTypingUsers] = useState<Map<string, { name: string; expiresAt: number }>>(new Map())
  const lastTypingBroadcastRef = useRef(0)
  const typingChannelRef = useRef<ReturnType<ReturnType<typeof getClientSupabase>['channel']> | null>(null)

  useEffect(() => {
    // Must explicitly set to true on mount so that React Strict Mode's
    // double-mount cycle (mount → cleanup → mount) restores the ref
    // after the first cleanup sets it to false.
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Typing indicator: broadcast channel + listener
  useEffect(() => {
    const supabase = getClientSupabase()
    const channel = supabase.channel(`typing-${conversation.id}`)

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, userName } = payload.payload as { userId: string; userName: string }
        if (userId === currentUserId) return
        setTypingUsers(prev => {
          const next = new Map(prev)
          next.set(userId, { name: userName, expiresAt: Date.now() + 3000 })
          return next
        })
      })
      .subscribe()

    typingChannelRef.current = channel

    return () => {
      typingChannelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [conversation.id, currentUserId])

  // Auto-clear expired typing indicators
  useEffect(() => {
    if (typingUsers.size === 0) return
    const timerId = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => {
        const next = new Map(prev)
        let changed = false
        for (const [id, entry] of next) {
          if (entry.expiresAt <= now) {
            next.delete(id)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(timerId)
  }, [typingUsers.size])

  // Broadcast typing event (throttled to max once per 2s)
  const broadcastTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingBroadcastRef.current < 2000) return
    lastTypingBroadcastRef.current = now

    const self = conversation.participants.find(p => p.id === currentUserId)
    const userName = self?.displayName || self?.email || 'Someone'

    typingChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, userName },
    })
  }, [conversation.participants, currentUserId])

  // Live participant read-status tracking (updated via realtime)
  const [liveReadAt, setLiveReadAt] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    for (const p of conversation.participants) {
      if (p.lastReadAt) map.set(p.id, p.lastReadAt)
    }
    return map
  })

  // Reset when switching conversations
  useEffect(() => {
    const map = new Map<string, string>()
    for (const p of conversation.participants) {
      if (p.lastReadAt) map.set(p.id, p.lastReadAt)
    }
    setLiveReadAt(map)
  }, [conversation.id, conversation.participants])

  const handleDeleteConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversation.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }
      
      onDelete?.(conversation.id)
      setShowDeleteDialog(false)
    } catch (error: any) {
      onError?.(error.message || 'Failed to delete conversation')
    }
  }
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages/${messageId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete message')
      }
      
      // Remove message from local state
      setMessages(prev => prev.filter(m => m.id !== messageId))
      setMessageToDelete(null)
    } catch (error: any) {
      onError?.(error.message || 'Failed to delete message')
    }
  }

  const complianceMeta = useMemo(() => {
    const metadata = (conversation.metadata as Record<string, any>) || {}
    return metadata.compliance || {}
  }, [conversation.metadata])

  const agentChatMeta = useMemo(() => {
    const metadata = (conversation.metadata as Record<string, any>) || {}
    const agentChat = metadata.agent_chat || {}
    return {
      agentName: typeof agentChat.agent_name === 'string' ? agentChat.agent_name : null,
      agentAvatarUrl: typeof agentChat.agent_avatar_url === 'string' ? agentChat.agent_avatar_url : null,
    }
  }, [conversation.metadata])

  const displayParticipants = useMemo(() => {
    const nonSelfParticipants = conversation.participants.filter((participant) => participant.id !== currentUserId)
    if (nonSelfParticipants.length > 0) return nonSelfParticipants
    if (!agentChatMeta.agentName) return conversation.participants

    return [
      {
        id: `agent:${agentChatMeta.agentName}`,
        displayName: agentChatMeta.agentName,
        email: null,
        role: 'staff_compliance',
        avatarUrl: agentChatMeta.agentAvatarUrl,
        participantRole: 'member',
        joinedAt: conversation.createdAt,
        lastReadAt: null,
        lastNotifiedAt: null,
        isMuted: false,
        isPinned: false,
      },
    ]
  }, [agentChatMeta.agentAvatarUrl, agentChatMeta.agentName, conversation.createdAt, conversation.participants, currentUserId])

  // Total participant count includes self + virtual agent for display purposes
  const totalParticipantCount = agentChatMeta.agentName
    ? Math.max(conversation.participants.length + 1, 2)
    : conversation.participants.length

  const complianceStatus = complianceMeta?.status || (complianceMeta?.flagged ? 'open' : null)

  const submitComplianceAction = async (action: 'flag' | 'resolve') => {
    setComplianceSubmitting(true)
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: action === 'flag' ? complianceReason : undefined,
          urgency: action === 'flag' ? complianceUrgency : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Failed to update compliance flag')
      }

      toast.success(
        action === 'flag' ? 'Compliance flag added' : 'Compliance flag resolved'
      )
      setShowComplianceDialog(false)
      if (action === 'flag') {
        setComplianceReason('')
      }
      onRefresh?.()
    } catch (error: any) {
      console.error('[ConversationView] Compliance action error:', error)
      toast.error(error?.message || 'Failed to update compliance status')
    } finally {
      setComplianceSubmitting(false)
    }
  }

  const participantsLookup = useMemo(() => {
    const map = new Map<string, { name: string, email: string | null }>()
    conversation.participants.forEach(participant => {
      if (participant.id) {
        map.set(participant.id, {
          name: participant.displayName || participant.email || 'Unknown User',
          email: participant.email
        })
      }
    })
    // Also add current user if not in participants
    if (currentUserId && !map.has(currentUserId)) {
      map.set(currentUserId, { name: 'You', email: null })
    }
    return map
  }, [conversation.participants, currentUserId])

  // Group messages for better visual flow
  const groupedMessages = useMemo(() => {
    return groupMessages(messages)
  }, [messages])

  const getViewport = () => {
    const root = scrollAreaRef.current
    if (!root) return null
    return root.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]')
  }

  // Track whether user is near the bottom to avoid jumpy scrolls while reading history
  useEffect(() => {
    const viewport = getViewport()
    if (!viewport) return

    const handleScroll = () => {
      const distanceFromBottom = viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight)
      isNearBottomRef.current = distanceFromBottom < 120
    }

    handleScroll()
    viewport.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      viewport.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Reset auto-scroll state when switching conversations
  useEffect(() => {
    didInitialScrollRef.current = false
  }, [conversation.id])

  // Auto-scroll to bottom on initial load, and only when user is near bottom afterward
  useEffect(() => {
    if (messages.length === 0 || !messagesEndRef.current) return

    if (!didInitialScrollRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
      didInitialScrollRef.current = true
      return
    }

    if (isNearBottomRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Load initial messages
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    const seedMessages = conversation.latestMessage ? [conversation.latestMessage] : []
    setMessages(seedMessages)
    
    fetchConversationMessages(conversation.id, { limit: 200 })
      .then(data => {
        if (!isMounted) return
        setMessages(data.length > 0 ? data : seedMessages)
        onRead?.()
        markConversationRead(conversation.id).catch(console.error)
      })
      .catch(error => {
        console.error('Load messages error', error)
        if (isMounted && seedMessages.length > 0) {
          setMessages(seedMessages)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [conversation.id, onRead])

  // Interval-based polling while waiting for an agent reply.
  // Fires every 3s and stops once the reply appears or 45s elapses.
  useEffect(() => {
    if (!pendingReplyMessageId) return

    const intervalId = setInterval(async () => {
      try {
        const updated = await fetchConversationMessages(conversation.id, { limit: 200 })
        if (!isMountedRef.current) return
        setMessages(updated.length > 0 ? updated : (conversation.latestMessage ? [conversation.latestMessage] : []))

        const hasReply = updated.some((msg) => {
          const meta = (msg.metadata || {}) as Record<string, unknown>
          return meta.source === 'compliance_assistant' && meta.reply_to_message_id === pendingReplyMessageId
        })
        if (hasReply) {
          pendingAgentReplies.delete(conversation.id)
          setPendingReplyMessageId(null)
        }
      } catch {
        // Ignore fetch errors during polling
      }
    }, 3000)

    // Safety timeout: stop polling after 45s regardless
    const timeoutId = setTimeout(() => {
      pendingAgentReplies.delete(conversation.id)
      setPendingReplyMessageId(null)
    }, 45_000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [pendingReplyMessageId, conversation.id])

  // Handle message sending with optimistic update
  const handleSend = async () => {
    if (!composerMessage.trim()) return

    setIsSending(true)

    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: composerMessage }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Failed to send message')
      }

      const result = await response.json()
      
      // Add message optimistically
      if (result.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === result.message.id)) return prev
          return [...prev, result.message]
        })
      }

      if (result?.agentReplyEligible && result?.message?.id) {
        // Track at module level (survives unmount) and in component state (drives interval polling).
        pendingAgentReplies.set(conversation.id, {
          messageId: result.message.id,
          conversationId: conversation.id,
          triggeredAt: Date.now(),
        })
        setPendingReplyMessageId(result.message.id)

        // Fire-and-forget: trigger the AI agent reply on the server.
        // The interval-based polling effect will pick up the reply once it's in the DB.
        void fetch(`/api/conversations/${conversation.id}/agent-reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message_id: result.message.id }),
        }).catch((error) => {
          console.error('[ConversationView] Failed to trigger agent reply', error)
        })
      }

      // Fire-and-forget: fetch OG link preview for the sent message
      if (result?.message?.id && composerMessage) {
        const firstUrl = extractFirstUrl(composerMessage)
        if (firstUrl) {
          void fetch('/api/link-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_id: result.message.id, url: firstUrl }),
          }).catch((error) => {
            console.error('[ConversationView] Link preview fetch failed', error)
          })
        }
      }

      setComposerMessage('')
    } catch (error: any) {
      console.error('[ConversationView] Send error:', error)
      onError?.(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      handleSend()
    }
  }

  // Subscribe to new messages + participant read status in realtime
  useEffect(() => {
    const cleanup = subscribeToConversationUpdates(conversation.id, {
      onMessage: (newMessage) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
        markConversationRead(conversation.id).catch(console.error)
      },
      onMessageUpdate: (updatedMessage) => {
        setMessages(prev =>
          prev.map(m => m.id === updatedMessage.id ? { ...m, metadata: updatedMessage.metadata } : m)
        )
      },
      onParticipantRead: (userId, lastReadAt) => {
        setLiveReadAt(prev => {
          const next = new Map(prev)
          next.set(userId, lastReadAt)
          return next
        })
      },
    })

    return () => {
      cleanup()
    }
  }, [conversation.id])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Enhanced Header */}
      <header className="relative z-10 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Participant Avatars */}
            <div className="flex -space-x-2">
              {displayParticipants.slice(0, 3).map((participant) => (
                <Avatar key={participant.id} className="h-9 w-9 border-2 border-background">
                  {participant.avatarUrl && (
                    <AvatarImage src={participant.avatarUrl} alt={participant.displayName || participant.email || 'User'} />
                  )}
                  <AvatarFallback className="text-xs bg-muted text-foreground">
                    {getInitials(participant.displayName || participant.email)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {displayParticipants.length > 3 && (
                <Avatar className="h-9 w-9 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted text-foreground">
                    +{displayParticipants.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            {/* Conversation Info */}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground">
                {conversation.subject || 'Untitled Conversation'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{totalParticipantCount} participant{totalParticipantCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize border-border text-foreground">
              {conversation.type.replace('_', ' ')}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Mute Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {showComplianceControls && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setShowComplianceDialog(true)}
                    >
                      Flag for Compliance
                    </DropdownMenuItem>
                    {complianceMeta?.flagged && complianceStatus !== 'resolved' && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => submitComplianceAction('resolve')}
                      >
                        Mark Compliance Resolved
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 bg-muted/20">
        <div className="px-4 py-6 md:px-8">
          {isLoading ? (
            <MessageSkeleton count={3} />
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
              <div className="relative mb-6">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-8 backdrop-blur-sm border border-primary/10">
                  <MessageSquare className="h-12 w-12 text-primary/60" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary/20 animate-ping" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start the Conversation
              </h3>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                No messages yet. Break the ice and send the first message to{' '}
                <span className="font-medium text-foreground">
                  {displayParticipants[0]?.displayName || 'your team'}
                </span>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {groupedMessages.map((message, index) => {
                const isSelf = message.senderId === currentUserId
                const metadata = (message.metadata || {}) as Record<string, unknown>
                const isAssistantMessage = metadata.ai_generated === true
                const assistantName =
                  typeof metadata.assistant_name === 'string' ? metadata.assistant_name : null
                const assistantAvatarUrl =
                  typeof metadata.assistant_avatar_url === 'string' ? metadata.assistant_avatar_url : null
                const senderInfo = message.sender?.displayName
                  ? { name: message.sender.displayName, email: message.sender.email }
                  : participantsLookup.get(message.senderId || '')
                const displayName = senderInfo?.name || assistantName || (isAssistantMessage ? 'Compliance Assistant' : 'Unknown User')

                // Compute readBy from live participant lastReadAt timestamps
                const msgTime = new Date(message.createdAt).getTime()
                const computedReadBy = isSelf
                  ? conversation.participants
                      .filter(p => {
                        if (p.id === currentUserId) return false
                        const readAt = liveReadAt.get(p.id)
                        return readAt && new Date(readAt).getTime() >= msgTime
                      })
                      .map(p => p.id)
                  : []
                const messageWithReadBy = computedReadBy.length > 0
                  ? { ...message, readBy: computedReadBy }
                  : message

                // Check if we need a date divider
                const previousMessage = index > 0 ? groupedMessages[index - 1] : undefined
                const showDivider = shouldShowDateDivider(message, previousMessage)

                return (
                  <div key={message.id}>
                    {/* Date Divider (WhatsApp/Slack style) */}
                    {showDivider && (
                      <div className="flex items-center justify-center my-6">
                        <div className="px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm">
                          <span className="text-xs font-medium text-muted-foreground">
                            {getDateDivider(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    <MessageBubble
                      message={messageWithReadBy}
                      senderName={displayName}
                      assistantName={isAssistantMessage ? assistantName || 'Compliance Assistant' : null}
                      senderEmail={senderInfo?.email}
                      senderAvatarUrl={message.sender?.avatarUrl ?? assistantAvatarUrl ?? null}
                      isSelf={isSelf}
                      isGroupStart={message.isGroupStart}
                      isGroupEnd={message.isGroupEnd}
                      showAvatar={message.showAvatar}
                      showTimestamp={message.showTimestamp}
                      showAssistantBadge={showAssistantBadge}
                      onDelete={setMessageToDelete}
                    />
                  </div>
                )
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-6 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5 bg-card border-t border-border">
          <span className="inline-flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          <span className="italic">
            {Array.from(typingUsers.values()).map(u => u.name).join(', ')}{' '}
            {typingUsers.size === 1 ? 'is' : 'are'} typing…
          </span>
        </div>
      )}

      {/* Enhanced Composer (WhatsApp/Slack style) */}
      <div className={cn("relative z-10 border-t border-border bg-card px-6 py-4", typingUsers.size > 0 && "border-t-0")}>
        <div className="flex items-end gap-2">
          {/* Message Input Container */}
          <div className="flex-1 relative">
            <AutoExpandTextarea
              value={composerMessage}
              onChange={event => { setComposerMessage(event.target.value); broadcastTyping() }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              disabled={isSending}
              className={cn(
                "min-h-[44px] max-h-[200px]",
                "bg-background text-foreground",
                "border-border focus-within:border-primary",
                "placeholder:text-muted-foreground",
                "transition-all duration-200",
                "px-4 py-3"
              )}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isSending || !composerMessage.trim()}
            size="icon"
            className={cn(
              "h-11 w-11 shrink-0 rounded-full shadow-lg",
              "transition-all duration-200 ease-out",
              composerMessage.trim()
                ? "scale-100 opacity-100 hover:scale-105 hover:shadow-xl active:scale-95"
                : "scale-90 opacity-50 cursor-not-allowed"
            )}
          >
            {isSending ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Helper Text */}
        {composerMessage.trim() && !isSending && (
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            Press <kbd className="px-1 py-0.5 rounded bg-muted text-foreground text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-muted text-foreground text-[10px]">Enter</kbd> to send
          </p>
        )}
      </div>
      
      <Dialog open={showComplianceControls && showComplianceDialog} onOpenChange={setShowComplianceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag for Compliance</DialogTitle>
            <DialogDescription>
              Tag this conversation for Wayne to review and follow up.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Urgency</label>
              <select
                value={complianceUrgency}
                onChange={(event) => setComplianceUrgency(event.target.value as 'low' | 'medium' | 'high')}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reason</label>
              <textarea
                value={complianceReason}
                onChange={(event) => setComplianceReason(event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Summarize the compliance concern or question."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowComplianceDialog(false)}
              disabled={complianceSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => submitComplianceAction('flag')}
              disabled={complianceSubmitting || !complianceReason.trim()}
            >
              {complianceSubmitting ? 'Saving...' : 'Flag conversation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Message Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
