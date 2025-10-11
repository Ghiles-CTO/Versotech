import type { ConversationMessage } from '@/types/messaging'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatFullTimestamp, getInitials } from '@/lib/messaging/utils'
import { CheckCheck, Check, Trash2 } from 'lucide-react'

interface MessageBubbleProps {
  message: ConversationMessage
  senderName: string
  senderEmail?: string | null
  isSelf: boolean
  isGroupStart: boolean
  isGroupEnd: boolean
  showAvatar: boolean
  showTimestamp: boolean
  onDelete?: (messageId: string) => void
}

export function MessageBubble({
  message,
  senderName,
  senderEmail,
  isSelf,
  isGroupStart,
  isGroupEnd,
  showAvatar,
  showTimestamp,
  onDelete,
}: MessageBubbleProps) {
  
  if (message.deletedAt) {
    return (
      <div className={cn('flex items-center gap-2 py-1', isSelf ? 'justify-end' : 'justify-start')}>
        <span className="text-xs italic text-muted-foreground">
          Message deleted
        </span>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'flex gap-2 group animate-in fade-in slide-in-from-bottom-1 duration-200',
        isSelf ? 'flex-row-reverse' : 'flex-row',
        !isGroupStart && 'mt-0.5',
        isGroupStart && 'mt-5'
      )}
    >
      {/* Avatar */}
      <div className={cn('flex-shrink-0 self-end', !showAvatar && 'w-9')}>
        {showAvatar ? (
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarFallback className="text-xs bg-muted text-foreground font-medium">
              {getInitials(senderName)}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 max-w-[75%] md:max-w-[65%] relative', isSelf && 'items-end')}>
        {/* Delete Button (shows on hover) */}
        {isSelf && onDelete && !message.deletedAt && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-10 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        
        {/* Sender Name (only at group start) */}
        {isGroupStart && !isSelf && (
          <span className="text-xs font-semibold text-foreground/80 px-2 mb-0.5">
            {senderName}
          </span>
        )}

        {/* Message Bubble (WhatsApp style) */}
        <div
          className={cn(
            'relative px-3 py-2 rounded-lg text-[13px] leading-relaxed transition-all',
            isSelf 
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
              : 'bg-card text-foreground border border-border/50 shadow-sm',
            // Rounded corners with tail effect
            'rounded-tl-lg rounded-tr-lg',
            isSelf ? 'rounded-bl-lg rounded-br-sm' : 'rounded-bl-sm rounded-br-lg',
            isGroupStart && (isSelf ? 'rounded-br-lg' : 'rounded-bl-lg'),
            'group-hover:shadow-lg',
            'max-w-full'
          )}
          title={formatFullTimestamp(message.createdAt)}
        >
          <div className="flex flex-col">
            <p className="whitespace-pre-wrap break-words">
              {message.body}
            </p>
            
            {/* Inline metadata (WhatsApp style - time in corner) */}
            <div className={cn(
              'flex items-center gap-1 mt-1 justify-end select-none',
              isSelf ? 'text-primary-foreground/60' : 'text-muted-foreground/70'
            )}>
              {message.editedAt && (
                <span className="text-[9px] italic mr-1">Edited</span>
              )}
              <span className="text-[9px] font-medium">
                {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
              {isSelf && (
                <span className="ml-0.5">
                  {message.readBy && message.readBy.length > 0 
                    ? <CheckCheck className="h-3.5 w-3.5" />
                    : <Check className="h-3.5 w-3.5" />
                  }
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

