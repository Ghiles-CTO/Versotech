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
import { isAgentChatConversation } from '@/lib/compliance/agent-chat'

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

function resolveAvailableMessagingHeight(target: HTMLElement): number {
  const mainElement = target.closest('main')
  if (!mainElement) return 720
  const mainRect = mainElement.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const offsetWithinMain = Math.max(0, targetRect.top - mainRect.top)
  return Math.max(320, mainRect.height - offsetWithinMain)
}

function resetMainScrollPosition(target: HTMLElement) {
  const mainElement = target.closest('main')
  if (!mainElement) return
  mainElement.scrollTo({ top: 0, behavior: 'auto' })
}

export function MessagingClient({ initialConversations, currentUserId, canCreateConversation = true }: MessagingClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const initialCompliance = searchParams?.get('compliance') === 'true'
  const requestedConversationId = searchParams?.get('conversation') || null
  const [filters, setFilters] = useState<ConversationFilters>({
    ...INITIAL_FILTERS,
    complianceOnly: initialCompliance,
  })
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations)
  const [isLoading, setIsLoading] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    if (requestedConversationId && initialConversations.some((c) => c.id === requestedConversationId)) {
      return requestedConversationId
    }
    return initialConversations[0]?.id || null
  })
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

  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null
  const hideAssistantBadge = activeConversation ? isAgentChatConversation(activeConversation.metadata) : false

  useEffect(() => {
    if (!requestedConversationId) return
    if (requestedConversationId === activeConversationId) return
    const exists = conversations.some((conversation) => conversation.id === requestedConversationId)
    if (!exists) return
    setActiveConversationId(requestedConversationId)
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === requestedConversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    )
    markConversationRead(requestedConversationId).catch(console.error)
  }, [requestedConversationId, conversations, activeConversationId])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    resetMainScrollPosition(element)

    const updateHeight = () => {
      const target = containerRef.current
      if (!target) return
      const available = resolveAvailableMessagingHeight(target)
      setContainerHeight(available)
    }

    updateHeight()
    requestAnimationFrame(updateHeight)
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
      resizeObserver?.disconnect()
    }
  }, [])

  const loadConversations = useCallback(async (nextFilters?: ConversationFilters, silent = false) => {
    if (!silent) setIsLoading(true)
    setErrorMessage(null)
    try {
      const filtersToUse = nextFilters || filters
      const { conversations: data } = await fetchConversationsClient({ ...filtersToUse, includeMessages: true, limit: 50 })
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
    const channel = supabase
      .channel('staff_conversations_all')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      }, () => {
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
          void fetchConversationsClient({ ...filters, includeMessages: true, limit: 50 })
            .then(({ conversations: data }) => {
              setConversations(data)
            })
            .catch(console.error)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, filters])

  const handleComposerError = useCallback((message: string) => {
    toast.error(message)
  }, [])
  
  const handleDeleteConversation = useCallback((conversationId: string) => {
    // Remove from local state
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    setActiveConversationId(null)
    toast.success('Conversation deleted')
  }, [])

  useEffect(() => {
    // Only load directories if user can create conversations (staff only)
    if (!canCreateConversation) {
      return
    }

    const loadDirectories = async () => {
      try {
        const [staffResponse, investorResponse] = await Promise.all([
          fetch('/api/staff/available'),
          fetch('/api/investors/available'),
        ])

        if (staffResponse.ok) {
          const data = await staffResponse.json()
          setStaffDirectory(data.staff || [])
        } else {
          console.error('[MessagingClient] Staff fetch failed:', staffResponse.status)
        }

        if (investorResponse.ok) {
          const data = await investorResponse.json()
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
	            showAssistantBadge={canCreateConversation && !hideAssistantBadge}
	            showComplianceControls={canCreateConversation}
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


