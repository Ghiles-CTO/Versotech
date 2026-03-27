'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Clock3, Loader2, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RequestExtensionButtonProps {
  dealId: string
  dealName: string
  expiresAt: string | null
  daysRemaining: number | null
  allowExpired?: boolean
  initialPending?: boolean
  buttonLabel?: string
  successLabel?: string
  className?: string
}

export function RequestExtensionButton({
  dealId,
  dealName,
  expiresAt,
  daysRemaining,
  allowExpired = false,
  initialPending = false,
  buttonLabel,
  successLabel = 'Request Submitted',
  className
}: RequestExtensionButtonProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'pending' | 'saved' | 'error'>(
    initialPending ? 'pending' : 'idle'
  )
  const [error, setError] = useState<string | null>(null)
  const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : Number.NaN
  const isExpired = Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()
  const idleLabel = buttonLabel || (isExpired ? 'Request Access Again' : 'Request Extension')
  const visibleLabel =
    status === 'saving'
      ? 'Requesting…'
      : status === 'pending'
        ? 'Request Pending'
      : status === 'saved'
        ? successLabel
        : idleLabel

  useEffect(() => {
    setStatus(initialPending ? 'pending' : 'idle')
    setError(null)
  }, [initialPending])

  // Show for expiring-soon access, and optionally for already expired access.
  if (!expiresAt || (daysRemaining !== null && daysRemaining > 7) || (isExpired && !allowExpired)) {
    return null
  }

  const handleClick = async () => {
    setStatus('saving')
    setError(null)

    try {
      const response = await fetch('/api/data-room-access/request-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          reason: isExpired
            ? `Requesting renewed access to review ${dealName} data room materials after prior access expired`
            : `Requesting additional time to review ${dealName} data room materials`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'Extension request already pending approval') {
          setStatus('pending')
          return
        }
        throw new Error(data.error || 'Failed to submit extension request')
      }

      setStatus('pending')
    } catch (err) {
      console.error('Failed to request extension', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Could not submit the request. Please try again.')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className={cn('inline-flex flex-col', className)}>
      <Button
        type="button"
        variant={status === 'pending' ? 'outline' : status === 'saved' ? 'outline' : isExpired ? 'default' : 'outline'}
        size="sm"
        aria-label={visibleLabel}
        className={cn(
          'gap-2 font-medium transition-all duration-200',
          status === 'pending' &&
            'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/40',
          status === 'saved' &&
            'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-950/50',
          status === 'idle' && !isExpired &&
            'border-primary/25 text-primary hover:bg-primary/5 hover:border-primary/40 dark:border-primary/30 dark:hover:bg-primary/10'
        )}
        disabled={status === 'saving' || status === 'pending' || status === 'saved'}
        onClick={handleClick}
      >
        {status === 'saving' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : status === 'pending' ? (
          <Clock3 className="h-3.5 w-3.5" />
        ) : status === 'saved' ? (
          <Check className="h-3.5 w-3.5" />
        ) : isExpired ? (
          <RefreshCcw className="h-3.5 w-3.5" />
        ) : (
          <Clock3 className="h-3.5 w-3.5" />
        )}
        {visibleLabel}
      </Button>
      {status === 'error' && error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
