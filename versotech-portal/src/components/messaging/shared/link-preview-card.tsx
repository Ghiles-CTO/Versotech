'use client'

import { useState } from 'react'
import type { LinkPreview } from '@/lib/messaging/url-utils'
import { cn } from '@/lib/utils'
import { ExternalLink, Link } from 'lucide-react'

interface LinkPreviewCardProps {
  preview: LinkPreview
  isSelf: boolean
}

export function LinkPreviewCard({ preview, isSelf }: LinkPreviewCardProps) {
  const [imageError, setImageError] = useState(false)
  const showImage = preview.image && !imageError

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex flex-row w-full rounded-xl overflow-hidden border transition-opacity',
        'hover:opacity-90',
        isSelf
          ? 'border-primary-foreground/20 bg-primary-foreground/10'
          : 'border-border bg-muted/60'
      )}
    >
      {/* Thumbnail — flush left, ~40% width */}
      <div className={cn(
        'w-2/5 flex-shrink-0 self-stretch flex items-center justify-center',
        isSelf ? 'bg-primary-foreground/15' : 'bg-muted'
      )}>
        {showImage ? (
          <img
            src={preview.image!}
            alt={preview.title || ''}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Link className={cn(
            'h-6 w-6',
            isSelf ? 'text-primary-foreground/40' : 'text-muted-foreground/40'
          )} />
        )}
      </div>

      {/* Text — right side */}
      <div className="flex flex-col justify-center gap-1 min-w-0 flex-1 px-3 py-3">
        {/* Domain row */}
        <div className="flex items-center gap-1.5">
          {preview.favicon && (
            <img
              src={preview.favicon}
              alt=""
              className="h-3.5 w-3.5 rounded-sm flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span className={cn(
            'text-[10px] font-semibold uppercase tracking-widest truncate',
            isSelf ? 'text-primary-foreground/50' : 'text-muted-foreground/70'
          )}>
            {preview.domain}
          </span>
          <ExternalLink className={cn(
            'h-3 w-3 ml-auto flex-shrink-0',
            isSelf ? 'text-primary-foreground/40' : 'text-muted-foreground/40'
          )} />
        </div>

        {/* Title */}
        {preview.title && (
          <p className={cn(
            'text-[13px] font-semibold leading-snug line-clamp-2',
            isSelf ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {preview.title}
          </p>
        )}

        {/* Description */}
        {preview.description && (
          <p className={cn(
            'text-[11px] leading-relaxed line-clamp-2',
            isSelf ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  )
}
