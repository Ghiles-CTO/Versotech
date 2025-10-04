'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare, Send, Paperclip, User, Clock, CheckCircle2,
  Search, Filter, Plus, MoreVertical, Download, File, Users,
  AlertCircle, Loader2, X
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
  type: 'dm' | 'group' | 'deal_room'
  deal_id?: string
  created_at: string
  last_message_at: string
  participants: Array<{
    id: string
    display_name: string
    email: string
    role: string
  }>
  unread_count?: number
  latest_message?: Message
}

export function ChatInterfaceEnhanced({ className }: { className?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'dm' | 'group' | 'deal_room' | 'unread'>('all')
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
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

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Subscribe to realtime message updates
  useEffect(() => {
    if (!selectedConversation) return

    const messageChannel = supabase
      .channel(`messages_${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        (payload) => {
          loadMessages(selectedConversation)
        }
      )
      .subscribe()

    // Subscribe to typing indicators (using Supabase presence)
    const presenceChannel = supabase
      .channel(`typing_${selectedConversation}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const typingUserIds = new Set<string>()
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.typing && presence.user_id !== currentUserId) {
              typingUserIds.add(presence.user_id)
            }
          })
        })
        setTypingUsers(typingUserIds)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [selectedConversation, currentUserId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark conversation as read when viewing
  useEffect(() => {
    if (selectedConversation && currentUserId) {
      markConversationAsRead(selectedConversation)
    }
  }, [selectedConversation, currentUserId])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (response.ok) {
        setConversations(data.conversations || [])
        if (data.conversations?.length > 0 && !selectedConversation) {
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
        setMessages(data.messages.reverse() || [])
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
        // Stop typing indicator
        broadcastTyping(false)
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

  const markConversationAsRead = async (conversationId: string) => {
    try {
      // Update last_read_at in conversation_participants
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUserId)

      // Update local state
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ))
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (!selectedConversation || !currentUserId) return

    const channel = supabase.channel(`typing_${selectedConversation}`)

    if (isTyping) {
      channel.track({
        user_id: currentUserId,
        typing: true
      })
    } else {
      channel.untrack()
    }
  }, [selectedConversation, currentUserId])

  const handleTyping = useCallback(() => {
    broadcastTyping(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false)
    }, 2000)
  }, [broadcastTyping])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    if (role === 'investor') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (role.startsWith('staff_')) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getConversationTypeIcon = (type: string) => {
    if (type === 'deal_room') return <Users className="h-4 w-4" />
    if (type === 'group') return <Users className="h-4 w-4" />
    return <MessageSquare className="h-4 w-4" />
  }

  const filteredConversations = conversations.filter(conv => {
    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'unread' && (!conv.unread_count || conv.unread_count === 0)) return false
      if (filterType !== 'unread' && conv.type !== filterType) return false
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        conv.subject?.toLowerCase().includes(query) ||
        conv.participants.some(p =>
          p.display_name?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query)
        )
      )
    }

    return true
  })

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-4 h-[700px]", className)}>

      {/* Conversations Sidebar */}
      <Card className="md:col-span-4 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {(['all', 'unread', 'dm', 'group', 'deal_room'] as const).map((filter) => (
              <Badge
                key={filter}
                variant={filterType === filter ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setFilterType(filter)}
              >
                {filter === 'all' && 'All'}
                {filter === 'unread' && 'Unread'}
                {filter === 'dm' && 'Direct'}
                {filter === 'group' && 'Groups'}
                {filter === 'deal_room' && 'Deals'}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation.id)
                    loadMessages(conversation.id)
                  }}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all",
                    "hover:bg-accent",
                    selectedConversation === conversation.id
                      ? 'bg-accent border-l-4 border-primary'
                      : 'border-l-4 border-transparent'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getConversationTypeIcon(conversation.type)}
                        <h4 className="font-medium text-sm truncate">
                          {conversation.subject || 'Untitled Conversation'}
                        </h4>
                      </div>

                      {conversation.latest_message && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.latest_message.sender.display_name}: {conversation.latest_message.body}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {conversation.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>
                    </div>

                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="default" className="ml-auto shrink-0">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Messages Area */}
      <Card className="md:col-span-8 flex flex-col">
        {selectedConversation && selectedConv ? (
          <>
            {/* Conversation Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getConversationTypeIcon(selectedConv.type)}
                    {selectedConv.subject || 'Conversation'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedConv.participants.slice(0, 3).map((participant) => (
                        <Badge
                          key={participant.id}
                          variant="outline"
                          className={cn("text-xs", getRoleColor(participant.role))}
                        >
                          <User className="h-3 w-3 mr-1" />
                          {participant.display_name || participant.email}
                        </Badge>
                      ))}
                      {selectedConv.participants.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedConv.participants.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      View Participants
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export Transcript
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <Separator />

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, idx) => {
                  const isOwnMessage = message.sender?.id === currentUserId
                  const showAvatar = idx === 0 || messages[idx - 1].sender?.id !== message.sender?.id

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isOwnMessage && "flex-row-reverse"
                      )}
                    >
                      {/* Avatar */}
                      {showAvatar ? (
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          isOwnMessage ? "bg-primary" : "bg-muted"
                        )}>
                          <User className={cn(
                            "h-4 w-4",
                            isOwnMessage ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                        </div>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}

                      {/* Message Content */}
                      <div className={cn(
                        "flex-1 max-w-[70%]",
                        isOwnMessage && "flex flex-col items-end"
                      )}>
                        {showAvatar && (
                          <div className={cn(
                            "flex items-center gap-2 mb-1",
                            isOwnMessage && "flex-row-reverse"
                          )}>
                            <span className="font-medium text-sm">
                              {message.sender?.display_name || message.sender?.email}
                            </span>
                            <Badge variant="outline" className={cn("text-xs", getRoleColor(message.sender?.role))}>
                              {message.sender?.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatMessageTime(message.created_at)}
                            </span>
                          </div>
                        )}

                        <div className={cn(
                          "rounded-lg p-3 break-words",
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}>
                          {message.message_type === 'system' ? (
                            <div className="flex items-center gap-2 text-sm italic">
                              <AlertCircle className="h-4 w-4" />
                              {message.body}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                          )}

                          {message.file_key && (
                            <div className="mt-2 flex items-center gap-2 p-2 rounded bg-background/10">
                              <File className="h-4 w-4" />
                              <span className="text-xs">Attachment</span>
                              <Button size="sm" variant="ghost" className="ml-auto h-6">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Someone is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            {/* Message Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="resize-none min-h-[60px]"
                  rows={2}
                />

                <Button
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="shrink-0"
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a conversation from the list to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
