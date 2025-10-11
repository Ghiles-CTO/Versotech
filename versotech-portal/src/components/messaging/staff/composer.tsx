'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import type { ConversationMessage } from '@/types/messaging'

interface ConversationComposerProps {
  conversationId: string | null
  currentUserId: string
  onError?: (message: string) => void
  onMessageSent?: (message: ConversationMessage) => void
}

export function ConversationComposer({ conversationId, currentUserId, onError, onMessageSent }: ConversationComposerProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!conversationId || !message.trim()) return
    
    console.log('[Composer] Sending message to conversation:', conversationId)
    setIsSending(true)

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: message }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        console.error('[Composer] Error response:', error)
        throw new Error(error?.error || 'Failed to send message')
      }

      const result = await response.json()
      console.log('[Composer] Message sent successfully:', result)
      
      setMessage('')
      
      // Trigger callback with the sent message for optimistic UI update
      if (onMessageSent && result.message) {
        onMessageSent(result.message)
      }
    } catch (error: any) {
      console.error('[Composer] Send error:', error)
      onError?.(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border p-4 bg-card flex gap-3">
      <Textarea
        value={message}
        onChange={event => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={conversationId ? 'Write a message… (Ctrl+Enter to send)' : 'Select a conversation to reply'}
        disabled={!conversationId || isSending}
        rows={3}
        className="bg-background text-foreground border-border placeholder:text-muted-foreground"
      />
      <Button 
        onClick={handleSend} 
        disabled={!conversationId || isSending || !message.trim()}
        className="shrink-0"
      >
        {isSending ? 'Sending…' : 'Send'}
      </Button>
    </div>
  )
}



