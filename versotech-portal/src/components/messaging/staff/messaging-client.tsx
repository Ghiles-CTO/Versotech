'use client'

import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ConversationSummary, ConversationFilters } from '@/types/messaging'
import { fetchConversationsClient, markConversationRead } from '@/lib/messaging'
import { ConversationsSidebar } from './sidebar'
import { ConversationView } from './conversation-view'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { NewConversationDialog } from './new-conversation-dialog'
import type { StaffDirectoryEntry, InvestorDirectoryEntry } from './new-conversation-dialog'

interface MessagingClientProps {
  initialConversations: ConversationSummary[]
  currentUserId: string
  /** If false, hides "New Conversation" and doesn't load staff/investor directories. Default: true (staff behavior) */
  canCreateConversation?: boolean
}

const INITIAL_FILTERS: ConversationFilters = {
  visibility: 'all',
  type: 'all',
  complianceOnly: false,
}

export function MessagingClient({ initialConversations, currentUserId, canCreateConversation = true }: MessagingClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const initialCompliance = searchParams?.get('compliance') === 'true'
  const [filters, setFilters] = useState<ConversationFilters>({
    ...INITIAL_FILTERS,
    complianceOnly: initialCompliance,
  })
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations)
  const [isLoading, setIsLoading] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversations[0]?.id || null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [conversationMode, setConversationMode] = useState<'dm' | 'group'>('dm')
  const [staffDirectory, setStaffDirectory] = useState<StaffDirectoryEntry[]>([])
  const [investorDirectory, setInvestorDirectory] = useState<InvestorDirectoryEntry[]>([])
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  // Ref to track active conversation without recreating subscriptions
  const activeConversationIdRef = useRef(activeConversationId)
  activeConversationIdRef.current = activeConversationId

  console.log('[MessagingClient] Initial conversations:', initialConversations.length)
  console.log('[MessagingClient] Current conversations state:', conversations.length)
  console.log('[MessagingClient] Filters:', filters)

  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateHeight = () => {
      const target = containerRef.current
      if (!target) return
      const mainElement = target.closest('main')
      if (!mainElement) return
      const mainRect = mainElement.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const offsetWithinMain = targetRect.top - mainRect.top
      const available = Math.max(320, mainRect.height - offsetWithinMain)
      setContainerHeight(available)
    }

    updateHeight()
    const handleResize = () => requestAnimationFrame(updateHeight)
    window.addEventListener('resize', handleResize)

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => requestAnimationFrame(updateHeight))

    const mainElement = element.closest('main')
    if (resizeObserver && mainElement) {
      resizeObserver.observe(mainElement)
    }

    const previousOverflowY = mainElement?.style.overflowY

    if (mainElement) {
      mainElement.style.overflowY = 'hidden'
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver?.disconnect()
      if (mainElement) {
        if (previousOverflowY) {
          mainElement.style.overflowY = previousOverflowY
        } else {
          mainElement.style.removeProperty('overflow-y')
        }
      }
    }
  }, [])

  const loadConversations = useCallback(async (nextFilters?: ConversationFilters, silent = false) => {
    console.log('[MessagingClient] loadConversations called with filters:', nextFilters || filters, 'silent:', silent)
    if (!silent) setIsLoading(true)
    setErrorMessage(null)
    try {
      const filtersToUse = nextFilters || filters
      const { conversations: data } = await fetchConversationsClient({ ...filtersToUse, includeMessages: true, limit: 50 })
      console.log('[MessagingClient] Fetched conversations:', data.length)
      setConversations(data)

      // If no conversations found and we have an active one, keep it
      // Otherwise select the first one
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id)
      }
    } catch (error: any) {
      console.error('[MessagingClient] Load conversations error', error)
      setErrorMessage(error.message || 'Failed to load conversations')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [filters, activeConversationId])

  useEffect(() => {
    if (initialCompliance) {
      const nextFilters: ConversationFilters = {
        ...filters,
        complianceOnly: true,
      }
      loadConversations(nextFilters, true)
    }
  }, [initialCompliance, loadConversations])

  const handleFiltersChange = useCallback((nextFilters: ConversationFilters) => {
    setFilters(nextFilters)
    loadConversations(nextFilters)
  }, [loadConversations])

  const handleRefresh = useCallback(() => {
    loadConversations(filters)
  }, [loadConversations, filters])

  const handleConversationRefresh = useCallback(() => {
    loadConversations(filters, true)
  }, [loadConversations, filters])

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId)
    // Optimistically update local state to clear unread badge immediately
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ))
    markConversationRead(conversationId).catch(console.error)
  }, [])

  // Global realtime subscription for conversations and messages
  useEffect(() => {
    console.log('[Staff Messages] Setting up realtime subscription')

    const channel = supabase
      .channel('staff_conversations_all')
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
      console.log('[Staff Messages] Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [supabase, filters])

  const handleComposerError = useCallback((message: string) => {
    toast.error(message)
  }, [])
  
  const handleDeleteConversation = useCallback((conversationId: string) => {
    console.log('[MessagingClient] Deleting conversation:', conversationId)
    // Remove from local state
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    setActiveConversationId(null)
    toast.success('Conversation deleted')
  }, [])

  useEffect(() => {
    // Only load directories if user can create conversations (staff only)
    if (!canCreateConversation) {
      console.log('[MessagingClient] Skipping directory load - user cannot create conversations')
      return
    }

    const loadDirectories = async () => {
      try {
        console.log('[MessagingClient] Loading staff and investor directories...')
        const [staffResponse, investorResponse] = await Promise.all([
          fetch('/api/staff/available'),
          fetch('/api/investors/available'),
        ])

        if (staffResponse.ok) {
          const data = await staffResponse.json()
          console.log('[MessagingClient] Staff directory loaded:', data.staff?.length || 0, 'members')
          setStaffDirectory(data.staff || [])
        } else {
          console.error('[MessagingClient] Staff fetch failed:', staffResponse.status)
        }

        if (investorResponse.ok) {
          const data = await investorResponse.json()
          console.log('[MessagingClient] Investor directory loaded:', data.investors?.length || 0, 'investors')
          console.log('[MessagingClient] Sample investor:', data.investors?.[0])
          setInvestorDirectory(data.investors || [])
        } else {
          console.error('[MessagingClient] Investor fetch failed:', investorResponse.status)
        }
      } catch (error) {
        console.error('[MessagingClient] Failed to load directories', error)
      }
    }

    loadDirectories()
  }, [canCreateConversation])

  const handleCreateConversation = async (payload: {
    subject: string
    participantIds: string[]
    visibility: ConversationFilters['visibility']
    type: ConversationFilters['type']
    initialMessage?: string
  }) => {
    const uniqueParticipants = Array.from(new Set(payload.participantIds))

    console.log('[MessagingClient] Creating conversation:', {
      subject: payload.subject,
      participants: uniqueParticipants.length,
      type: payload.type,
      visibility: payload.visibility
    })

    if (!uniqueParticipants.length) {
      toast.error('Select at least one participant')
      return
    }

    setIsCreatingConversation(true)
    try {
      const requestBody = {
        subject: payload.subject,
        participant_ids: uniqueParticipants,
        type: payload.type,
        visibility: payload.visibility === 'all' ? 'internal' : payload.visibility,
        initial_message: payload.initialMessage,
      }
      
      console.log('[MessagingClient] Request payload:', requestBody)

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        console.error('[MessagingClient] Create conversation error:', data)
        throw new Error(data?.error || 'Failed to create conversation')
      }

      const result = await response.json()
      console.log('[MessagingClient] Conversation created:', result)

      toast.success('Conversation created successfully!')
      setIsNewConversationOpen(false)
      await loadConversations(filters)

      if (result?.conversation?.id) {
        setActiveConversationId(result.conversation.id)
      }
    } catch (error: any) {
      console.error('[MessagingClient] Create conversation failed:', error)
      toast.error(error.message || 'Unable to create conversation')
    } finally {
      setIsCreatingConversation(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 overflow-hidden"
      style={containerHeight ? { height: `${containerHeight}px` } : undefined}
    >
      <ConversationsSidebar
        conversations={conversations}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={(mode) => {
          setConversationMode(mode)
          setIsNewConversationOpen(true)
        }}
        activeConversationId={activeConversationId}
        isLoading={isLoading}
        errorMessage={errorMessage}
        canCreateConversation={canCreateConversation}
      />
      <div className="flex-1 flex flex-col min-h-0">
        {activeConversation ? (
          <ConversationView
            key={activeConversation.id}
            conversation={activeConversation}
            currentUserId={currentUserId}
            onRead={() => markConversationRead(activeConversation.id)}
            onError={handleComposerError}
            onDelete={handleDeleteConversation}
            onRefresh={handleConversationRefresh}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to get started
          </div>
        )}
      </div>
      {canCreateConversation && (
        <NewConversationDialog
          open={isNewConversationOpen}
          onOpenChange={setIsNewConversationOpen}
          mode={conversationMode}
          staffDirectory={staffDirectory}
          investorDirectory={investorDirectory}
          onCreate={handleCreateConversation}
          isSubmitting={isCreatingConversation}
        />
      )}
    </div>
  )
}


