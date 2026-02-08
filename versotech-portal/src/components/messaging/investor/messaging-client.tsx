'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ConversationSummary, ConversationFilters } from '@/types/messaging'
import { fetchConversationsClient, markConversationRead } from '@/lib/messaging'
import { InvestorContacts } from './contacts'
import { ConversationView } from '@/components/messaging/staff/conversation-view'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface InvestorMessagingClientProps {
  currentUserId: string
  initialConversations: ConversationSummary[]
}

const INITIAL_FILTERS: ConversationFilters = {
  visibility: 'investor',
  type: 'all',
}

function resolveAvailableMessagingHeight(target: HTMLElement): number {
  const top = Math.max(0, target.getBoundingClientRect().top)
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800
  const bottomPadding = 16
  return Math.max(320, viewportHeight - top - bottomPadding)
}

function resetMessagingViewportScroll(target: HTMLElement) {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  let ancestor: HTMLElement | null = target
  while (ancestor) {
    if (ancestor.scrollHeight > ancestor.clientHeight + 1) {
      ancestor.scrollTop = 0
    }
    ancestor = ancestor.parentElement
  }

  const contentWrapper = target.closest('.app-content-inner') as HTMLElement | null
  if (contentWrapper) {
    contentWrapper.scrollTop = 0
  }

  const contentContainer = target.closest('.app-content') as HTMLElement | null
  if (contentContainer) {
    contentContainer.scrollTop = 0
  }

  const nestedScrollContainers = target.querySelectorAll<HTMLElement>(
    '.overflow-y-auto, [data-radix-scroll-area-viewport]'
  )
  nestedScrollContainers.forEach((element) => {
    element.scrollTop = 0
  })
}

export function InvestorMessagingClient({ currentUserId, initialConversations }: InvestorMessagingClientProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversations[0]?.id || null)
  const [filters, setFilters] = useState<ConversationFilters>(INITIAL_FILTERS)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  // Ref to track active conversation without recreating subscriptions
  const activeConversationIdRef = useRef(activeConversationId)
  activeConversationIdRef.current = activeConversationId

  const activeConversation = useMemo(() => conversations.find(conv => conv.id === activeConversationId) || null, [conversations, activeConversationId])

  const loadConversations = useCallback(async (nextFilters?: ConversationFilters, silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const filtersToUse = nextFilters || filters
      const { conversations: data } = await fetchConversationsClient({ ...filtersToUse, includeMessages: true, limit: 50 })
      setConversations(data)

      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load conversations')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [filters, activeConversationId])

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId)
    // Optimistically update local state to clear unread badge immediately
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ))
    markConversationRead(conversationId).catch(console.error)
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateHeight = () => {
      const target = containerRef.current
      if (!target) return
      const available = resolveAvailableMessagingHeight(target)
      setContainerHeight(available)
    }

    const forceScrollReset = () => {
      const target = containerRef.current
      if (!target) return
      resetMessagingViewportScroll(target)
    }

    updateHeight()
    forceScrollReset()
    requestAnimationFrame(() => {
      forceScrollReset()
      requestAnimationFrame(forceScrollReset)
    })
    const resetDelays = [100, 240, 500, 900]
    const resetTimers = resetDelays.map((delay) => window.setTimeout(forceScrollReset, delay))
    const handleResize = () => requestAnimationFrame(updateHeight)
    window.addEventListener('resize', handleResize)

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => requestAnimationFrame(updateHeight))

    const mainElement = element.closest('main')
    if (resizeObserver && mainElement) {
      resizeObserver.observe(mainElement)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      resetTimers.forEach((timerId) => window.clearTimeout(timerId))
      resizeObserver?.disconnect()
    }
  }, [])

  // Load initial conversations
  useEffect(() => {
    void loadConversations(filters)
  }, [filters, loadConversations])

  // Global realtime subscription for conversations and messages
  useEffect(() => {
    console.log('[Investor Messages] Setting up realtime subscription')

    const supabase = createClient()
    const channel = supabase
      .channel('investor_conversations_all')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      }, () => {
        console.log('[Realtime] New conversation created, refreshing list')
        void fetchConversationsClient({ ...filters, includeMessages: true, limit: 50 })
          .then(({ conversations: data }) => {
            setConversations(data)
          })
          .catch(console.error)
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Refresh conversation list when new messages arrive in non-active conversations
        // This updates preview text, timestamps, and unread counts
        const messageConvId = (payload.new as { conversation_id?: string })?.conversation_id
        if (messageConvId && messageConvId !== activeConversationIdRef.current) {
          console.log('[Realtime] New message in background conversation, refreshing list')
          void fetchConversationsClient({ ...filters, includeMessages: true, limit: 50 })
            .then(({ conversations: data }) => {
              setConversations(data)
            })
            .catch(console.error)
        }
      })
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status)
      })

    return () => {
      console.log('[Investor Messages] Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [filters])

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 overflow-hidden"
      style={containerHeight ? { height: `${containerHeight}px` } : undefined}
    >
      <InvestorContacts
        conversations={conversations}
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={() => void loadConversations(filters)}
        onSelectConversation={handleSelectConversation}
        activeConversationId={activeConversationId}
        isLoading={isLoading}
      />
      <div className="flex-1 flex flex-col min-h-0">
        {activeConversation ? (
          <ConversationView
            key={activeConversation.id}
            conversation={activeConversation}
            currentUserId={currentUserId}
            onRead={() => markConversationRead(activeConversation.id)}
            onError={message => toast.error(message)}
            onDelete={(id) => {
              setConversations(prev => prev.filter(c => c.id !== id))
              setActiveConversationId(null)
              toast.success('Conversation deleted')
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to view messages.
          </div>
        )}
      </div>
    </div>
  )
}

