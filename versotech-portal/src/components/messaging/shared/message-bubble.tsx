'use client'

import { useMemo } from 'react'
import type { ConversationMessage } from '@/types/messaging'
import type { LinkPreview } from '@/lib/messaging/url-utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatFullTimestamp, getInitials } from '@/lib/messaging/utils'
import { LinkPreviewCard } from '@/components/messaging/shared/link-preview-card'
import { CheckCheck, Check, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const URL_REGEX_GLOBAL = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi

function linkifyBody(text: string, isSelf: boolean) {
  const parts: (string | React.ReactElement)[] = []
  let lastIndex = 0

  for (const match of text.matchAll(URL_REGEX_GLOBAL)) {
    const url = match[0]
    const start = match.index!
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start))
    }
    parts.push(
      <a
        key={start}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'underline break-all',
          isSelf ? 'text-primary-foreground/90 hover:text-primary-foreground' : 'text-primary hover:text-primary/80'
        )}
      >
        {url}
      </a>
    )
    lastIndex = start + url.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

interface MessageBubbleProps {
  message: ConversationMessage
  senderName: string
  assistantName?: string | null
  showAssistantBadge?: boolean
  senderEmail?: string | null
  senderAvatarUrl?: string | null
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
  assistantName,
  showAssistantBadge = true,
  senderEmail,
  senderAvatarUrl,
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
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(
        'flex gap-2 group',
        isSelf ? 'flex-row-reverse' : 'flex-row',
        !isGroupStart && 'mt-0.5',
        isGroupStart && 'mt-5'
      )}
    >
      {/* Avatar */}
      <div className={cn('flex-shrink-0 self-end', !showAvatar && 'w-9')}>
        {showAvatar ? (
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm transition-transform duration-200 group-hover:scale-110">
            {senderAvatarUrl && (
              <AvatarImage src={senderAvatarUrl} alt={senderName} />
            )}
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
          <div className="flex items-center gap-2 px-2 mb-0.5">
            <span className="text-xs font-semibold text-foreground/80">
              {senderName}
            </span>
          </div>
        )}

        {/* Message Bubble (WhatsApp style) */}
        <div
          className={cn(
            'relative px-3.5 py-2.5 rounded-lg text-[14px] leading-relaxed',
            'transition-all duration-200 ease-out',
            isSelf
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'bg-card text-foreground border border-border shadow-sm',
            // Rounded corners with tail effect
            'rounded-tl-2xl rounded-tr-2xl',
            isSelf ? 'rounded-bl-2xl rounded-br-md' : 'rounded-bl-md rounded-br-2xl',
            isGroupStart && (isSelf ? 'rounded-br-2xl' : 'rounded-bl-2xl'),
            'group-hover:shadow-xl group-hover:-translate-y-0.5',
            isSelf ? 'group-hover:shadow-primary/30' : 'group-hover:shadow-lg',
            'max-w-full'
          )}
          title={formatFullTimestamp(message.createdAt)}
        >
          <div className="flex flex-col">
            {(() => {
              const lp = (message.metadata as Record<string, unknown>)?.link_preview as LinkPreview | undefined
              const displayBody = lp?.url
                ? (message.body ?? '').replace(lp.url, '').trim()
                : message.body
              return displayBody ? (
                <p className="whitespace-pre-wrap break-words">
                  {linkifyBody(displayBody, isSelf)}
                </p>
              ) : null
            })()}

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
                <span className="ml-0.5 inline-flex items-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {message.readBy && message.readBy.length > 0 ? (
                      <motion.span
                        key="read"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="text-blue-300"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="sent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              )}
            </div>

            {/* Link Preview Card + URL — bottom of bubble */}
            {(() => {
              const lp = (message.metadata as Record<string, unknown>)?.link_preview as LinkPreview | undefined
              if (!lp?.url) return null
              return (
                <div className="flex flex-col gap-1 mt-1">
                  <LinkPreviewCard preview={lp} isSelf={isSelf} />
                  <a
                    href={lp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'text-[11px] break-all underline',
                      isSelf ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-primary hover:text-primary/80'
                    )}
                  >
                    {lp.url}
                  </a>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
