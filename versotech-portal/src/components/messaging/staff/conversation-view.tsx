import type { ConversationSummary, ConversationMessage } from '@/types/messaging'
import { useEffect, useMemo, useState, useRef } from 'react'
import { fetchConversationMessages, markConversationRead, subscribeToConversationUpdates } from '@/lib/messaging'
import { groupMessages, getInitials, formatRelativeTime, getDateDivider, shouldShowDateDivider } from '@/lib/messaging/utils'
import { MessageBubble } from '@/components/messaging/shared/message-bubble'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Send, Paperclip, MoreVertical, Users, Smile, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface ConversationViewProps {
  conversation: ConversationSummary
  currentUserId: string
  onRead?: () => void
  onError?: (message: string) => void
  onDelete?: (conversationId: string) => void
}

export function ConversationView({ conversation, currentUserId, onRead, onError, onDelete }: ConversationViewProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [composerMessage, setComposerMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  console.log('[ConversationView] Rendering with', messages.length, 'messages for conversation:', conversation.id)
  
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    console.log('[ConversationView] Auto-scroll triggered, messages:', messages.length)
    if (messages.length > 0 && messagesEndRef.current) {
      console.log('[ConversationView] Scrolling to bottom')
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Load initial messages
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setMessages([])
    
    fetchConversationMessages(conversation.id, { limit: 200 })
      .then(data => {
        if (!isMounted) return
        setMessages(data)
        onRead?.()
        markConversationRead(conversation.id).catch(console.error)
      })
      .catch(error => {
        console.error('Load messages error', error)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [conversation.id, onRead])

  // Handle message sending with optimistic update
  const handleSend = async () => {
    if (!composerMessage.trim()) return
    
    console.log('[ConversationView] Sending message:', composerMessage)
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
      console.log('[ConversationView] Message sent, adding optimistically:', result.message)
      
      // Add message optimistically
      if (result.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === result.message.id)) return prev
          return [...prev, result.message]
        })
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

  // Subscribe to new messages in realtime (for messages from OTHER users)
  useEffect(() => {
    console.log('[ConversationView] Setting up realtime for conversation:', conversation.id)
    
    const cleanup = subscribeToConversationUpdates(conversation.id, {
      onMessage: (newMessage) => {
        console.log('[ConversationView] Received new message from realtime:', newMessage)
        setMessages(prev => {
          console.log('[ConversationView] Current messages before add:', prev.length)
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) {
            console.log('[ConversationView] Message already exists, skipping')
            return prev
          }
          console.log('[ConversationView] Adding realtime message to list')
          const updated = [...prev, newMessage]
          console.log('[ConversationView] Messages after add:', updated.length)
          return updated
        })
        // Mark as read if we&apos;re viewing
        markConversationRead(conversation.id).catch(console.error)
      }
    })

    return () => {
      console.log('[ConversationView] Cleaning up realtime for conversation:', conversation.id)
      cleanup()
    }
  }, [conversation.id])

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Enhanced Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Participant Avatars */}
            <div className="flex -space-x-2">
              {conversation.participants.slice(0, 3).map((participant, idx) => (
                <Avatar key={participant.id} className="h-9 w-9 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted text-foreground">
                    {getInitials(participant.displayName || participant.email)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {conversation.participants.length > 3 && (
                <Avatar className="h-9 w-9 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted text-foreground">
                    +{conversation.participants.length - 3}
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
                <span>{conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}</span>
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

      <ScrollArea className="flex-1 bg-muted/20">
        <div className="px-4 py-6 md:px-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-3/4 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start the conversation by sending a message below.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {groupedMessages.map((message, index) => {
                const isSelf = message.senderId === currentUserId
                const senderInfo = message.sender?.displayName 
                  ? { name: message.sender.displayName, email: message.sender.email }
                  : participantsLookup.get(message.senderId || '')
                const displayName = senderInfo?.name || 'Unknown User'
                
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
                      message={message}
                      senderName={displayName}
                      senderEmail={senderInfo?.email}
                      isSelf={isSelf}
                      isGroupStart={message.isGroupStart}
                      isGroupEnd={message.isGroupEnd}
                      showAvatar={message.showAvatar}
                      showTimestamp={message.showTimestamp}
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
      
      {/* Enhanced Composer (WhatsApp/Slack style) */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              disabled={isSending}
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              disabled={isSending}
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          {/* Message Input Container */}
          <div className="flex-1 relative bg-background rounded-lg border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all">
            <Textarea
              value={composerMessage}
              onChange={event => setComposerMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              disabled={isSending}
              className={cn(
                "min-h-[44px] max-h-32 resize-none",
                "bg-transparent text-foreground border-0",
                "placeholder:text-muted-foreground",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "px-4 py-2.5"
              )}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '44px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isSending || !composerMessage.trim()}
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 transition-all rounded-full",
              composerMessage.trim() ? "scale-100" : "scale-95 opacity-50"
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


