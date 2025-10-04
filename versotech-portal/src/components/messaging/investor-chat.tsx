'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Send, Loader2, Check, CheckCheck, MoreVertical,
  Trash2, Edit2, User, Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Message {
  id: string
  body: string
  file_key?: string
  message_type?: 'text' | 'system' | 'file'
  created_at: string
  edited_at?: string
  deleted_at?: string
  sender: {
    id: string
    display_name: string
    email: string
    role: string
  }
}

interface Conversation {
  id: string
  subject: string
  participants: Array<{
    id: string
    display_name: string
    email: string
    role: string
  }>
  messages: Message[]
}

export function InvestorChat() {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  // Load conversation on mount
  useEffect(() => {
    loadConversation()
  }, [])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversation?.id) return

    const channel = supabase
      .channel(`messages_${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          loadMessages(conversation.id)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          loadMessages(conversation.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversation = async () => {
    try {
      const response = await fetch('/api/conversations/staff')
      const data = await response.json()

      if (response.ok) {
        setConversation(data.conversation)
        setMessages(data.conversation.messages || [])
      } else {
        toast.error(data.error || 'Failed to load conversation')
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Error loading conversation')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages.reverse().filter((m: Message) => !m.deleted_at) || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || isSending) return

    setIsSending(true)

    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMessage }),
      })

      if (response.ok) {
        setNewMessage('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error sending message')
    } finally {
      setIsSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Message deleted')
        if (conversation) {
          loadMessages(conversation.id)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Error deleting message')
    }
  }

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id)
    setEditingText(message.body)
  }

  const saveEdit = async (messageId: string) => {
    if (!editingText.trim()) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editingText }),
      })

      if (response.ok) {
        toast.success('Message updated')
        setEditingMessageId(null)
        setEditingText('')
        if (conversation) {
          loadMessages(conversation.id)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update message')
      }
    } catch (error) {
      console.error('Error updating message:', error)
      toast.error('Error updating message')
    }
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditingText('')
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const staffMember = conversation?.participants.find(p => p.role.startsWith('staff_'))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium">Unable to load conversation</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-[700px] max-w-4xl mx-auto border-2">
      {/* WhatsApp-style Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
            {staffMember?.display_name?.charAt(0) || 'V'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {staffMember?.display_name || 'VERSO Team'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {staffMember?.role === 'staff_admin' && 'Admin'}
            {staffMember?.role === 'staff_rm' && 'Relationship Manager'}
            {!staffMember && 'Support Team'}
          </p>
        </div>
      </div>

      {/* Messages Area - WhatsApp Style */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message, idx) => {
            const isOwnMessage = message.sender?.id === currentUserId
            const showDate = idx === 0 ||
              new Date(messages[idx - 1].created_at).toDateString() !==
              new Date(message.created_at).toDateString()

            return (
              <div key={message.id}>
                {/* Date Separator */}
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-white/80 backdrop-blur-sm text-xs text-muted-foreground px-3 py-1 rounded-full border shadow-sm">
                      {new Date(message.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={cn(
                  "flex gap-2 items-end",
                  isOwnMessage && "flex-row-reverse"
                )}>
                  {/* Avatar for staff messages */}
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 mb-1">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs">
                        {message.sender?.display_name?.charAt(0) || 'V'}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative group",
                    isOwnMessage
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white text-gray-900 rounded-bl-sm"
                  )}>
                    {/* Message Actions */}
                    {isOwnMessage && !editingMessageId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                              isOwnMessage ? "text-white hover:bg-blue-600" : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(message)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMessage(message.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {/* Editing Mode */}
                    {editingMessageId === message.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className={cn(
                            "bg-white/10 border-white/20",
                            isOwnMessage ? "text-white placeholder:text-white/60" : ""
                          )}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(message.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(message.id)} className="h-7 text-xs">
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 text-xs">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Message Content */}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.body}
                        </p>

                        {/* Message Footer */}
                        <div className={cn(
                          "flex items-center gap-1 mt-1 text-xs",
                          isOwnMessage ? "text-white/70 justify-end" : "text-gray-500"
                        )}>
                          {message.edited_at && (
                            <span className="italic mr-1">edited</span>
                          )}
                          <span>{formatTime(message.created_at)}</span>
                          {isOwnMessage && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 rounded-full border-gray-300 focus:border-blue-500"
          />
          <Button
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim()}
            size="icon"
            className="rounded-full h-10 w-10 bg-blue-500 hover:bg-blue-600"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
