'use client'

import { useEffect, useState } from 'react'
import { MessagingClient } from '@/components/messaging/staff/messaging-client'
import { fetchConversationsClient } from '@/lib/messaging/supabase'
import { isAccountSupportPersonaType } from '@/lib/messaging/account-support.shared'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePersona } from '@/contexts/persona-context'

export default function MessagesContent() {
  const { activePersona, isCEO, isStaff, isLoading: personaLoading } = usePersona()
  // Staff/CEO can create new conversations (requires access to investor/staff directories)
  // Use isCEO/isStaff which check ALL personas, not just active - so CEO with multiple personas retains this ability
  const canCreateConversation = isCEO || isStaff
  const [conversations, setConversations] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (personaLoading) {
      return
    }

    let cancelled = false

    async function fetchConversations() {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('Not authenticated')
          return
        }

        setCurrentUserId(user.id)

        if (isAccountSupportPersonaType(activePersona?.persona_type)) {
          const supportResponse = await fetch('/api/support/conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!supportResponse.ok && supportResponse.status !== 404) {
            const supportError = await supportResponse.json().catch(() => null)
            console.error('[MessagesContent] Failed to ensure support thread:', supportError)
          }
        }

        // Use API route (service client) to get all participants — not browser client (RLS-limited)
        const { conversations: data } = await fetchConversationsClient({
          includeMessages: true,
          limit: 50,
        })

        if (!cancelled) {
          setConversations(data)
          setError(null)
        }
      } catch (err) {
        console.error('[MessagesContent] Error:', err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load messages')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchConversations()
    return () => {
      cancelled = true
    }
  }, [activePersona?.entity_id, activePersona?.persona_type, canCreateConversation, personaLoading])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading messages...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Messages</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Not Authenticated</h3>
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    )
  }

  return (
    <MessagingClient
      initialConversations={conversations}
      currentUserId={currentUserId}
      canCreateConversation={canCreateConversation}
    />
  )
}
