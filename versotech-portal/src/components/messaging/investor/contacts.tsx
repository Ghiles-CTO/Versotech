import type { ConversationFilters, ConversationSummary } from '@/types/messaging'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RefreshCw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { applyConversationFilters, sortConversations, formatRelativeTime, getInitials, truncateText } from '@/lib/messaging'

interface InvestorContactsProps {
  conversations: ConversationSummary[]
  filters: ConversationFilters
  onFiltersChange: (filters: ConversationFilters) => void
  onRefresh: () => void
  onSelectConversation: (conversationId: string) => void
  activeConversationId: string | null
  isLoading: boolean
}

export function InvestorContacts({
  conversations,
  filters,
  onFiltersChange,
  onRefresh,
  onSelectConversation,
  activeConversationId,
  isLoading,
}: InvestorContactsProps) {
  const [search, setSearch] = useState(filters.search || '')

  const filteredConversations = useMemo(() => {
    const nextFilters: ConversationFilters = { ...filters, search: search || undefined }
    const filtered = applyConversationFilters(conversations, nextFilters)
    return sortConversations(filtered)
  }, [conversations, filters, search])

  const unreadTotal = conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0)

  return (
    <aside className="w-[320px] border-r bg-card flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Team Contacts</h2>
            <p className="text-xs text-muted-foreground">Message your Verso relationship team</p>
          </div>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search conversations"
        />

        <Button
          variant={filters.unreadOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, unreadOnly: !filters.unreadOnly })}
        >
          Unread {filters.unreadOnly ? '' : `(${unreadTotal})`}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            {isLoading ? 'Loading conversations…' : 'No conversations yet.'}
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            {filteredConversations.map(conversation => {
              const isActive = conversation.id === activeConversationId
              const staffParticipant = conversation.participants.find(p => (p.role || '').startsWith('staff_'))
              const contactName = staffParticipant?.displayName || staffParticipant?.email || conversation.subject || 'Verso Team'
              const timestamp = conversation.lastMessageAt || conversation.createdAt
              
              return (
                <li key={conversation.id}>
                  <button
                    className={cn(
                      'w-full text-left px-3 py-3 rounded-lg transition-all',
                      'hover:bg-muted/50',
                      isActive ? 'bg-muted shadow-sm' : 'bg-transparent'
                    )}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(contactName)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary-foreground">
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
                            conversation.unreadCount > 0 ? "text-foreground" : "text-foreground"
                          )}>
                            {contactName}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0" suppressHydrationWarning>
                            {formatRelativeTime(timestamp)}
                          </span>
                        </div>
                        
                        <p className={cn(
                          "text-xs truncate",
                          conversation.unreadCount > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground"
                        )}>
                          {truncateText(conversation.preview || conversation.latestMessage?.body || 'Start the conversation', 60)}
                        </p>
                        
                        {staffParticipant?.role && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">
                              {staffParticipant.role.replace('staff_', '')}
                            </Badge>
                          </div>
                        )}
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



