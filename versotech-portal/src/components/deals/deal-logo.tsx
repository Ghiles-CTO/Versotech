'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type LogoFit = 'cover' | 'contain'
type LogoRadius = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface DealLogoProps {
  src?: string | null
  alt: string
  size?: number
  rounded?: LogoRadius
  className?: string
  fallback?: ReactNode
  fallbackText?: string
}

const radiusClasses: Record<LogoRadius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
}

export function DealLogo({
  src,
  alt,
  size = 48,
  rounded = 'lg',
  className,
  fallback,
  fallbackText
}: DealLogoProps) {
  const [fit, setFit] = useState<LogoFit>('cover')

  const handleLoad = (img: HTMLImageElement) => {
    const ratio = img.naturalWidth / img.naturalHeight
    const shouldContain = ratio > 1.6 || ratio < 0.7
    setFit(shouldContain ? 'contain' : 'cover')
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden border border-border bg-background',
        radiusClasses[rounded],
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          onLoadingComplete={handleLoad}
          className={cn(
            'h-full w-full',
            fit === 'contain' ? 'object-contain p-1' : 'object-cover'
          )}
        />
      ) : (
        fallback || (
          <span className="text-muted-foreground font-semibold text-sm">
            {fallbackText || '—'}
          </span>
        )
      )}
    </div>
  )
}
