'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Send, Loader2, Check, CheckCheck, MoreVertical,
  Trash2, Edit2, User, Shield, Sparkles, ArrowLeft, ChevronRight, MessageCircle
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

interface StaffMember {
  id: string
  display_name: string
  email: string
  role: string
  conversationId?: string | null
  lastMessageAt?: string | null
  unreadCount?: number
}

// Predefined quick message templates
const QUICK_MESSAGES = [
  "I have a question about my portfolio",
  "Can you provide an update on my investments?",
  "I'd like to discuss capital call details",
  "Please send me the latest reports",
  "I need help with document access",
  "Can we schedule a call?"
]

const getRoleLabel = (role: string) => {
  if (role === 'staff_admin') return 'Admin'
  if (role === 'staff_rm') return 'Relationship Manager'
  if (role === 'staff_ops') return 'Operations'
  return 'Team'
}

const getRoleColor = (role: string) => {
  if (role === 'staff_admin') return 'bg-purple-100 text-purple-700 border-purple-200'
  if (role === 'staff_rm') return 'bg-blue-100 text-blue-700 border-blue-200'
  if (role === 'staff_ops') return 'bg-green-100 text-green-700 border-green-200'
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

export function InvestorChat() {
  const [viewMode, setViewMode] = useState<'contacts' | 'chat'>('contacts')
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [showQuickMessages, setShowQuickMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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

  // Load staff members on mount
  useEffect(() => {
    loadStaffMembers()
  }, [])

  const loadStaffMembers = async () => {
    try {
      const response = await fetch('/api/staff/available')
      const data = await response.json()

      if (response.ok) {
        setStaffMembers(data.staff || [])
      } else {
        toast.error('Failed to load contacts')
      }
    } catch (error) {
      console.error('Error loading staff members:', error)
      toast.error('Error loading contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const selectStaff = async (staff: StaffMember) => {
    setSelectedStaff(staff)
    setViewMode('chat')
    setIsLoading(true)
    await loadConversation(staff.id)
  }

  const backToContacts = () => {
    setViewMode('contacts')
    setSelectedStaff(null)
    setConversation(null)
    setMessages([])
    loadStaffMembers() // Refresh the list
  }

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

  const loadConversation = async (staffId: string) => {
    try {
      const response = await fetch(`/api/conversations/staff?staff_id=${staffId}`)
      const data = await response.json()

      if (response.ok) {
        const normalizedConversation = {
          ...data.conversation,
          messages: (data.conversation.messages || [])
            .filter((m: Message) => !m.deleted_at)
            .sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        }

        setConversation(normalizedConversation)
        setMessages(normalizedConversation.messages)

        if (normalizedConversation.id) {
          await markConversationAsRead(normalizedConversation.id, staffId)
        }
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
        const orderedMessages = (data.messages || [])
          .filter((m: Message) => !m.deleted_at)
          .sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        setMessages(orderedMessages)
        await markConversationAsRead(conversationId, selectedStaff?.id)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || isSending) return

    setIsSending(true)
    const messageText = newMessage
    const tempId = `temp-${Date.now()}`

    // Optimistically add message to UI immediately
    const optimisticMessage: Message = {
      id: tempId,
      body: messageText,
      created_at: new Date().toISOString(),
      message_type: 'text',
      sender: {
        id: currentUserId || '',
        display_name: 'You',
        email: '',
        role: 'investor'
      }
    }

    // Add to messages array immediately for instant feedback
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')

    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: messageText }),
      })

      if (response.ok) {
        // Reload messages to get the real message from server (with correct ID, etc.)
        await loadMessages(conversation.id)
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempId))
        const error = await response.json()
        toast.error(error.error || 'Failed to send message')
        // Restore the message text so user can try again
        setNewMessage(messageText)
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
      console.error('Error sending message:', error)
      toast.error('Error sending message')
      // Restore the message text so user can try again
      setNewMessage(messageText)
    } finally {
      setIsSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      // Optimistically remove from UI
      setMessages(prev => prev.filter(m => m.id !== messageId))

      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Message deleted')
      } else {
        // Reload on error to restore the message
        const error = await response.json()
        toast.error(error.error || 'Failed to delete message')
        if (conversation) {
          loadMessages(conversation.id)
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Error deleting message')
      // Reload on error to restore the message
      if (conversation) {
        loadMessages(conversation.id)
      }
    }
  }

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id)
    setEditingText(message.body)
  }

  const saveEdit = async (messageId: string) => {
    if (!editingText.trim()) return

    const previousText = messages.find(m => m.id === messageId)?.body

    try {
      // Optimistically update the message in UI
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, body: editingText, edited_at: new Date().toISOString() }
          : m
      ))
      setEditingMessageId(null)
      setEditingText('')

      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editingText }),
      })

      if (response.ok) {
        toast.success('Message updated')
        // Reload to get the exact data from server
        if (conversation) {
          await loadMessages(conversation.id)
        }
      } else {
        // Revert on error
        setMessages(prev => prev.map(m => 
          m.id === messageId && previousText
            ? { ...m, body: previousText, edited_at: undefined }
            : m
        ))
        const error = await response.json()
        toast.error(error.error || 'Failed to update message')
      }
    } catch (error) {
      // Revert on error
      setMessages(prev => prev.map(m => 
        m.id === messageId && previousText
          ? { ...m, body: previousText, edited_at: undefined }
          : m
      ))
      console.error('Error updating message:', error)
      toast.error('Error updating message')
    }
  }

  const markConversationAsRead = async (conversationId: string, staffId?: string | null) => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST'
      })
      if (staffId) {
        setStaffMembers(prev => prev.map(member => (
          member.id === staffId
            ? { ...member, unreadCount: 0, conversationId }
            : member
        )))
      } else {
        setStaffMembers(prev => prev.map(member => (
          member.conversationId === conversationId
            ? { ...member, unreadCount: 0 }
            : member
        )))
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error)
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const handleQuickMessage = (message: string) => {
    setNewMessage(message)
    setShowQuickMessages(false)
    inputRef.current?.focus()
  }

  const staffMember = conversation?.participants.find(p => p.role.startsWith('staff_'))

  // Contact Selection View
  if (viewMode === 'contacts') {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading contacts...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="p-6 bg-white border-b">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Messages</h2>
          <p className="text-sm text-gray-600">Select a team member to start a conversation</p>
        </div>

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {staffMembers.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No team members available</p>
              </div>
            ) : (
              staffMembers.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => selectStaff(staff)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-gray-100 group-hover:border-blue-200 transition-colors">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                        {staff.display_name?.charAt(0) || staff.email?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {staff.display_name || staff.email}
                        </h3>
                        {staff.unreadCount && staff.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {staff.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">Verso Holdings</p>
                        <span className="text-gray-300">•</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getRoleColor(staff.role))}
                        >
                          {getRoleLabel(staff.role)}
                        </Badge>
                      </div>
                      {staff.conversationId && staff.lastMessageAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last message: {new Date(staff.lastMessageAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Chat View
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Unable to load conversation</p>
          <p className="text-sm text-gray-600 mt-1">Please try again later</p>
          <Button onClick={backToContacts} className="mt-4">
            Back to Contacts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* WhatsApp-style Header */}
      <div className="flex items-center gap-3 p-4 bg-white border-b shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={backToContacts}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-12 w-12 border-2 border-blue-100 shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
            {staffMember?.display_name?.charAt(0) || selectedStaff?.display_name?.charAt(0) || 'V'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">
            {staffMember?.display_name || selectedStaff?.display_name || 'Verso Team'}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Verso Holdings
            </p>
            <Badge variant="outline" className={cn("text-xs px-1.5 py-0", getRoleColor(staffMember?.role || selectedStaff?.role || ''))}>
              {getRoleLabel(staffMember?.role || selectedStaff?.role || '')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area - WhatsApp Style */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#f0f2f5'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a message to {staffMember?.display_name || selectedStaff?.display_name || 'Verso Holdings'}
              </p>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3">Quick messages:</p>
                <div className="space-y-2">
                  {QUICK_MESSAGES.slice(0, 3).map((msg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickMessage(msg)}
                      className="w-full text-left text-sm px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
                    <span className="bg-white/90 backdrop-blur-sm text-xs text-gray-600 font-medium px-4 py-1.5 rounded-full shadow-sm">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={cn(
                  "flex gap-2 items-end max-w-[85%]",
                  isOwnMessage ? "flex-row-reverse ml-auto" : "mr-auto"
                )}>
                  {/* Avatar for staff messages */}
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-semibold">
                        {message.sender?.display_name?.charAt(0) || 'J'}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 shadow-sm relative group",
                    isOwnMessage
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
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

      {/* Quick Messages Panel */}
      {showQuickMessages && messages.length > 0 && (
        <div className="px-4 py-2 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Quick messages</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickMessages(false)}
              className="h-6 text-xs"
            >
              Close
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_MESSAGES.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickMessage(msg)}
                className="text-left text-xs px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 border border-gray-200"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp-style Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 items-end">
          {!showQuickMessages && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuickMessages(!showQuickMessages)}
              className="rounded-full h-10 w-10 text-gray-500 hover:text-blue-500 hover:bg-blue-50"
              title="Quick messages"
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          )}
          <Input
            ref={inputRef}
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
            className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <Button
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim()}
            size="icon"
            className="rounded-full h-10 w-10 bg-blue-500 hover:bg-blue-600 shadow-sm"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
