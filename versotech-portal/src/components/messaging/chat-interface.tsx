'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Paperclip, User, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  body: string
  file_key?: string
  created_at: string
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
  type: 'dm' | 'group'
  created_at: string
  participants: Array<{
    id: string
    display_name: string
    email: string
    role: string
  }>
}

export function ChatInterface({ className }: { className?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Subscribe to realtime message updates
  useEffect(() => {
    if (!selectedConversation) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        (payload) => {
          // Add new message to the list
          const newMessage = payload.new as any
          loadMessages(selectedConversation) // Reload to get sender info
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      
      if (response.ok) {
        setConversations(data.conversations || [])
        if (data.conversations?.length > 0) {
          setSelectedConversation(data.conversations[0].id)
          loadMessages(data.conversations[0].id)
        }
      } else {
        toast.error('Failed to load conversations')
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Error loading conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages.reverse() || []) // Reverse to show oldest first
      } else {
        toast.error('Failed to load messages')
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Error loading messages')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    
    try {
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: newMessage
        }),
      })

      if (response.ok) {
        setNewMessage('')
        // Message will be added via realtime subscription
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getRoleColor = (role: string) => {
    if (role === 'investor') return 'bg-blue-100 text-blue-800'
    if (role.startsWith('staff_')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] ${className}`}>
      
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation.id)
                  loadMessages(conversation.id)
                }}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                  selectedConversation === conversation.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    {conversation.subject || 'General Discussion'}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {conversation.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conversation.participants.length} participants
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(conversation.created_at)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {conversations.find(c => c.id === selectedConversation)?.subject || 'Conversation'}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {conversations
                  .find(c => c.id === selectedConversation)
                  ?.participants.map((participant) => (
                    <Badge 
                      key={participant.id} 
                      variant="secondary" 
                      className={getRoleColor(participant.role)}
                    >
                      <User className="h-3 w-3 mr-1" />
                      {participant.display_name || participant.email}
                    </Badge>
                  ))}
              </div>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.sender?.display_name || message.sender?.email}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(message.sender?.role)}`}>
                        {message.sender?.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm bg-gray-50 rounded-lg p-3 break-words">
                      {message.body}
                    </p>
                    {message.file_key && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Paperclip className="h-3 w-3 mr-1" />
                          Attachment
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                  {isSending ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

