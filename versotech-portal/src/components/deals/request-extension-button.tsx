'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Loader2, Check } from 'lucide-react'

interface RequestExtensionButtonProps {
  dealId: string
  dealName: string
  expiresAt: string | null
  daysRemaining: number | null
  className?: string
}

export function RequestExtensionButton({ dealId, dealName, expiresAt, daysRemaining, className }: RequestExtensionButtonProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Only show button if access is expiring soon (7 days or less)
  if (!expiresAt || (daysRemaining !== null && daysRemaining > 7)) {
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
          reason: `Requesting additional time to review ${dealName} data room materials`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit extension request')
      }

      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('Failed to request extension', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Could not submit the request. Please try again.')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className || "border-2 border-blue-600 text-blue-700 hover:bg-blue-50"}
        disabled={status === 'saving' || status === 'saved'}
        onClick={handleClick}
      >
        {status === 'saving' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            Requesting…
          </>
        ) : status === 'saved' ? (
          <>
            <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
            Request Submitted
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 mr-1.5" />
            Request Extension
          </>
        )}
      </Button>
      {status === 'error' && error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
