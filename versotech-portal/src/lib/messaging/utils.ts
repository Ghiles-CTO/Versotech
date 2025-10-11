import type { ConversationMessage } from '@/types/messaging'

/**
 * Format a timestamp as relative time (e.g., "2m ago", "Yesterday at 3:45 PM")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const messageTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000)
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  }
  
  // Less than 24 hours
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  }
  
  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (messageTime.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${messageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
  
  // Older - show full date
  return messageTime.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: messageTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Format a full timestamp for display
 */
export function formatFullTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Group consecutive messages from the same sender within a time window
 */
export interface GroupedMessage extends ConversationMessage {
  isGroupStart: boolean
  isGroupEnd: boolean
  showAvatar: boolean
  showTimestamp: boolean
}

export function groupMessages(
  messages: ConversationMessage[],
  groupWindowMinutes = 5
): GroupedMessage[] {
  if (messages.length === 0) return []
  
  const grouped: GroupedMessage[] = []
  
  for (let i = 0; i < messages.length; i++) {
    const current = messages[i]
    const prev = i > 0 ? messages[i - 1] : null
    const next = i < messages.length - 1 ? messages[i + 1] : null
    
    // Check if this message should be grouped with the previous one
    const shouldGroupWithPrev = prev && 
      prev.senderId === current.senderId &&
      !prev.deletedAt &&
      !current.deletedAt &&
      (new Date(current.createdAt).getTime() - new Date(prev.createdAt).getTime()) < (groupWindowMinutes * 60 * 1000)
    
    // Check if this message should be grouped with the next one
    const shouldGroupWithNext = next &&
      next.senderId === current.senderId &&
      !next.deletedAt &&
      !current.deletedAt &&
      (new Date(next.createdAt).getTime() - new Date(current.createdAt).getTime()) < (groupWindowMinutes * 60 * 1000)
    
    grouped.push({
      ...current,
      isGroupStart: !shouldGroupWithPrev,
      isGroupEnd: !shouldGroupWithNext,
      showAvatar: !shouldGroupWithPrev, // Only show avatar at start of group
      showTimestamp: !shouldGroupWithNext, // Only show timestamp at end of group
    })
  }
  
  return grouped
}

/**
 * Get initials from a name for avatar fallback
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  
  return name.substring(0, 2).toUpperCase()
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '…'
}

/**
 * Get date divider label for grouping messages by date
 */
export function getDateDivider(timestamp: string): string {
  const messageDate = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Reset time to midnight for comparison
  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
  
  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    return 'Today'
  }
  
  if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday'
  }
  
  // Within this week
  const diffDays = Math.floor((todayOnly.getTime() - messageDateOnly.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    return messageDate.toLocaleDateString('en-US', { weekday: 'long' })
  }
  
  // Older
  return messageDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Check if two messages should have a date divider between them
 */
export function shouldShowDateDivider(currentMessage: ConversationMessage, previousMessage?: ConversationMessage): boolean {
  if (!previousMessage) return true
  
  const currentDate = new Date(currentMessage.createdAt)
  const previousDate = new Date(previousMessage.createdAt)
  
  // Different day
  return currentDate.toDateString() !== previousDate.toDateString()
}

