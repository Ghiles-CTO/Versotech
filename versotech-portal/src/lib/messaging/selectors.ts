import type { ConversationSummary, ConversationFilters } from '@/types/messaging'
import { isAgentChatConversation } from '@/lib/compliance/agent-chat'

export function applyConversationFilters(
  conversations: ConversationSummary[],
  filters: ConversationFilters
) {
  return conversations.filter((conversation) => {
    if (filters.type !== 'all' && conversation.type !== filters.type) return false
    if (filters.visibility !== 'all' && conversation.visibility !== filters.visibility) return false
    if (filters.dealId && conversation.dealId !== filters.dealId) return false
    if (filters.unreadOnly && (!conversation.unreadCount || conversation.unreadCount === 0)) return false
    if (filters.complianceOnly) {
      const metadata = (conversation.metadata as Record<string, any>) || {}
      const compliance = metadata.compliance
      const isAgentChat = isAgentChatConversation(metadata)
      if (!compliance?.flagged && !isAgentChat) return false
    }

    if (filters.search) {
      const query = filters.search.toLowerCase()
      const haystack: string[] = []

      if (conversation.subject) haystack.push(conversation.subject)
      if (conversation.preview) haystack.push(conversation.preview)
      if (conversation.ownerTeam) haystack.push(conversation.ownerTeam)

      conversation.participants.forEach((participant) => {
        if (participant.displayName) haystack.push(participant.displayName)
        if (participant.email) haystack.push(participant.email)
      })

      const matches = haystack.some((entry) => entry.toLowerCase().includes(query))
      if (!matches) return false
    }

    return true
  })
}

export function sortConversations(conversations: ConversationSummary[]) {
  return [...conversations].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime()
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime()
    return bTime - aTime
  })
}

