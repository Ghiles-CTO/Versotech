import type { ConversationFilters, ConversationSummary } from '@/types/messaging'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, RefreshCw, MessageSquarePlus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { applyConversationFilters, sortConversations, formatRelativeTime, getInitials, truncateText } from '@/lib/messaging'
import { isAgentChatConversation } from '@/lib/compliance/agent-chat'

interface ConversationsSidebarProps {
  conversations: ConversationSummary[]
  filters: ConversationFilters
  onFiltersChange: (filters: ConversationFilters) => void
  onRefresh: () => void
  onSelectConversation: (conversationId: string) => void
  onCreateConversation: (mode: 'dm' | 'group') => void
  activeConversationId: string | null
  isLoading: boolean
  errorMessage: string | null
  /** If false, hides New Chat/Group buttons. Default: true */
  canCreateConversation?: boolean
}

const VISIBILITY_FILTERS: Array<{ value: ConversationFilters['visibility']; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'investor', label: 'Investor' },
  { value: 'internal', label: 'Internal' },
  { value: 'deal', label: 'Deals' },
]

const TYPE_FILTERS: Array<{ value: ConversationFilters['type']; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'dm', label: 'Direct' },
  { value: 'group', label: 'Group' },
  { value: 'deal_room', label: 'Deal Rooms' },
  { value: 'broadcast', label: 'Broadcasts' },
]

export function ConversationsSidebar({
  conversations,
  filters,
  onFiltersChange,
  onRefresh,
  onSelectConversation,
  onCreateConversation,
  activeConversationId,
  isLoading,
  errorMessage,
  canCreateConversation = true,
}: ConversationsSidebarProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')

  const filteredConversations = useMemo(() => {
    const nextFilters: ConversationFilters = {
      ...filters,
      search: searchValue || undefined,
    }
    const filtered = applyConversationFilters(conversations, nextFilters)
    return sortConversations(filtered)
  }, [conversations, filters, searchValue])

  const handleVisibilityChange = (value: ConversationFilters['visibility']) => {
    onFiltersChange({ ...filters, visibility: value })
  }

  const handleTypeChange = (value: ConversationFilters['type']) => {
    onFiltersChange({ ...filters, type: value })
  }

  const toggleUnread = () => {
    onFiltersChange({ ...filters, unreadOnly: !filters.unreadOnly })
  }

  const toggleCompliance = () => {
    onFiltersChange({ ...filters, complianceOnly: !filters.complianceOnly })
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const unreadTotals = useMemo(() => {
    const totals: Record<ConversationFilters['visibility'], number> = {
      all: 0,
      investor: 0,
      internal: 0,
      deal: 0,
    }

    for (const conversation of conversations) {
      totals.all += conversation.unreadCount || 0
      totals[conversation.visibility] += conversation.unreadCount || 0
    }

    return totals
  }, [conversations])

  const complianceCount = useMemo(() => {
    return conversations.filter((conversation) => {
      const metadata = (conversation.metadata as Record<string, any>) || {}
      const compliance = metadata.compliance
      return Boolean(compliance?.flagged || isAgentChatConversation(metadata))
    }).length
  }, [conversations])

  return (
    <aside className="w-full sm:w-[360px] border-r border-border bg-card flex flex-col text-foreground min-h-0">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between gap-2 text-foreground">
          <div>
            <h2 className="text-lg font-semibold">Messages</h2>
            <p className="text-xs text-muted-foreground">Track investor and internal threads</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-foreground hover:text-foreground hover:bg-muted"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.visibility} onValueChange={handleVisibilityChange}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent className="bg-muted text-popover-foreground border-border">
              {VISIBILITY_FILTERS.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{filter.label}</span>
                    <Badge variant="secondary" className="bg-secondary text-foreground">
                      {unreadTotals[filter.value]}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-muted text-popover-foreground border-border">
              {TYPE_FILTERS.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button
            variant={filters.unreadOnly ? 'default' : 'outline'}
            size="sm"
            className="w-full text-popover-foreground"
            onClick={toggleUnread}
          >
            Unread {filters.unreadOnly ? '' : `(${unreadTotals.all})`}
          </Button>
          {canCreateConversation && (
            <Button
              variant={filters.complianceOnly ? 'default' : 'outline'}
              size="sm"
              className="w-full text-popover-foreground"
              onClick={toggleCompliance}
            >
              Compliance {filters.complianceOnly ? '' : `(${complianceCount})`}
            </Button>
          )}

          {canCreateConversation && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onCreateConversation('dm')}
              >
                <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
                New Chat
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border text-popover-foreground hover:bg-muted"
                onClick={() => onCreateConversation('group')}
              >
                <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
                New Group
              </Button>
            </div>
          )}
        </div>

        <Input
          placeholder="Search conversations"
          value={searchValue}
          onChange={event => handleSearchChange(event.target.value)}
          className="bg-muted border-border text-popover-foreground placeholder:text-muted-foreground"
        />

        {errorMessage ? (
          <div className="text-xs text-red-600 dark:text-red-300 border border-red-300 dark:border-red-500/40 bg-red-100 dark:bg-red-500/10 p-2 rounded">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            {isLoading ? 'Loading conversations…' : 'No conversations match your filters.'}
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            {filteredConversations.map(conversation => {
              const isActive = conversation.id === activeConversationId
              const firstParticipant = conversation.participants[0]
              const timestamp = conversation.lastMessageAt || conversation.createdAt
              const compliance = (conversation.metadata as Record<string, any>)?.compliance
              const agentChat = (conversation.metadata as Record<string, any>)?.agent_chat as Record<string, any> | undefined
              const agentName = typeof agentChat?.agent_name === 'string' ? agentChat.agent_name : null
              const agentAvatar = typeof agentChat?.agent_avatar_url === 'string' ? agentChat.agent_avatar_url : null
              const displayName =
                (!canCreateConversation && (agentName || conversation.subject))
                  ? (agentName || conversation.subject || 'Compliance Team')
                  : (conversation.subject || 'Untitled Conversation')
              const displayAvatarUrl = (!canCreateConversation && agentAvatar) ? agentAvatar : firstParticipant?.avatarUrl
              const displayAvatarName = (!canCreateConversation && agentName)
                ? agentName
                : (firstParticipant?.displayName || firstParticipant?.email || displayName)
              
              return (
                <li key={conversation.id}>
                  <button
                    className={cn(
                      'w-full text-left px-3 py-3 rounded-lg group',
                      'transition-all duration-200 ease-out',
                      'hover:bg-muted/80 hover:shadow-md hover:scale-[1.02]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'active:scale-[0.98]',
                      isActive ? 'bg-muted shadow-sm scale-[1.01]' : 'bg-transparent'
                    )}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-11 w-11 transition-transform duration-200 group-hover:scale-110">
                          {displayAvatarUrl && (
                            <AvatarImage src={displayAvatarUrl} alt={displayAvatarName || 'User'} />
                          )}
                          <AvatarFallback className="bg-secondary text-foreground text-sm font-medium">
                            {getInitials(displayAvatarName)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-[10px] font-bold text-white">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className={cn(
                            "font-semibold truncate text-sm",
                            conversation.unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-foreground"
                          )}>
                            {displayName}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0" suppressHydrationWarning>
                            {formatRelativeTime(timestamp)}
                          </span>
                        </div>
                        
                        <p className={cn(
                          "text-xs truncate",
                          conversation.unreadCount > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground"
                        )}>
                          {truncateText(conversation.preview || conversation.latestMessage?.body || 'No messages yet', 60)}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[10px] capitalize border-border text-muted-foreground px-1.5 py-0">
                            {conversation.type.replace('_', ' ')}
                          </Badge>
                          {compliance?.flagged && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                              Compliance
                            </Badge>
                          )}
                          {conversation.participants.length > 1 && (
                            <span className="text-[10px] text-muted-foreground">
                              {conversation.participants.length} participants
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
