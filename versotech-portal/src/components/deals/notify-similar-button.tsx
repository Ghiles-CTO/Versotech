'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Loader2, BellRing, Check } from 'lucide-react'

interface NotifySimilarButtonProps {
  dealId: string
  investorId: string
  className?: string
}

export function NotifySimilarButton({ dealId, investorId, className }: NotifySimilarButtonProps) {
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
          signal_type: 'notify_similar',
          created_by: user?.id ?? null,
          metadata: {}
        })

      if (insertError) {
        throw insertError
      }

      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      console.error('Failed to record interest signal', err)
      setStatus('error')
      setError('Could not save your preference. Please try again.')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const isSaving = status === 'saving'
  const isSaved = status === 'saved'

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant={isSaved ? 'default' : 'secondary'}
        className={className}
        onClick={handleClick}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving…
          </>
        ) : isSaved ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            We&apos;ll keep you posted
          </>
        ) : (
          <>
            <BellRing className="h-4 w-4 mr-2" />
            Notify me about similar deals
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
