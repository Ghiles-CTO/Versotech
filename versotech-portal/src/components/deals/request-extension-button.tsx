'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { CalendarClock, Loader2, Check } from 'lucide-react'

interface RequestExtensionButtonProps {
  dealId: string
  investorId: string
  className?: string
}

export function RequestExtensionButton({ dealId, investorId, className }: RequestExtensionButtonProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleClick = async () => {
    setStatus('saving')
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from('investor_interest_signals')
        .insert({
          deal_id: dealId,
          investor_id: investorId,
          signal_type: 'data_room_extension_request',
          created_by: user?.id ?? null,
          metadata: {}
        })

      if (insertError) {
        throw insertError
      }

      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      console.error('Failed to request extension', err)
      setStatus('error')
      setError('Could not submit the request. Please try again.')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        className={className}
        disabled={status === 'saving'}
        onClick={handleClick}
      >
        {status === 'saving' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Sending…
          </>
        ) : status === 'saved' ? (
          <>
            <Check className="h-4 w-4 mr-2 text-emerald-500" />
            Request received
          </>
        ) : (
          <>
            <CalendarClock className="h-4 w-4 mr-2" />
            Request access extension
          </>
        )}
      </Button>
      {status === 'error' && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
