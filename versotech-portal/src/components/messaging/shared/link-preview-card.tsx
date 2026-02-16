'use client'

import { useState } from 'react'
import type { LinkPreview } from '@/lib/messaging/url-utils'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface LinkPreviewCardProps {
  preview: LinkPreview
  isSelf: boolean
}

export function LinkPreviewCard({ preview, isSelf }: LinkPreviewCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block rounded-lg overflow-hidden mt-2 border transition-colors',
        'hover:brightness-95',
        isSelf
          ? 'border-primary-foreground/20 bg-primary-foreground/10'
          : 'border-border bg-muted/50'
      )}
    >
      {/* OG Image */}
      {preview.image && !imageError && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={preview.image}
            alt={preview.title || ''}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Text content */}
      <div className="px-3 py-2.5 space-y-1">
        {/* Domain + favicon */}
        <div className="flex items-center gap-1.5">
          {preview.favicon && (
            <img
              src={preview.favicon}
              alt=""
              className="h-3.5 w-3.5 rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span className={cn(
            'text-[10px] font-medium uppercase tracking-wide',
            isSelf ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}>
            {preview.domain}
          </span>
          <ExternalLink className={cn(
            'h-2.5 w-2.5 ml-auto',
            isSelf ? 'text-primary-foreground/40' : 'text-muted-foreground/50'
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
            isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  )
}
