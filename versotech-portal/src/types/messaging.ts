export type ConversationVisibility = 'investor' | 'internal' | 'deal'
export type ConversationType = 'dm' | 'group' | 'deal_room' | 'broadcast'
export type ParticipantRole = 'owner' | 'member' | 'viewer'
export type MessageType = 'text' | 'system' | 'file'

export interface ConversationParticipant {
  id: string
  displayName: string | null
  email: string | null
  role: string | null
  avatarUrl: string | null
  participantRole: ParticipantRole
  joinedAt: string
  lastReadAt: string | null
  lastNotifiedAt: string | null
  isMuted: boolean
  isPinned: boolean
}

export interface MessageSender {
  id: string | null
  displayName: string | null
  email: string | null
  role: string | null
  avatarUrl: string | null
}

export interface ConversationMessage {
  id: string
  conversationId: string
  senderId: string | null
  body: string | null
  messageType: MessageType
  fileKey: string | null
  replyToMessageId: string | null
  metadata: Record<string, unknown>
  createdAt: string
  editedAt: string | null
  deletedAt: string | null
  sender: MessageSender | null
  readBy: string[]
}

export interface ConversationSummary {
  id: string
  subject: string | null
  preview: string | null
  type: ConversationType
  visibility: ConversationVisibility
  ownerTeam: string | null
  dealId: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  lastMessageAt: string | null
  lastMessageId: string | null
  archivedAt: string | null
  metadata: Record<string, unknown>
  participants: ConversationParticipant[]
  unreadCount: number
  latestMessage?: ConversationMessage | null
  participantCount: number
}

export interface PaginatedList<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ConversationFilters {
  visibility: ConversationVisibility | 'all'
  type: ConversationType | 'all'
  unreadOnly?: boolean
  search?: string
  dealId?: string
  complianceOnly?: boolean
}


