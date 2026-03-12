'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AskQuestionButtonProps {
  dealId: string
  dealName: string
  className?: string
}

export function AskQuestionButton({ dealId, dealName, className }: AskQuestionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAskQuestion = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/support/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initial_message: `Hi, I have a question about the ${dealName} deal.`,
          message_metadata: {
            source: 'deal_question',
            deal_id: dealId,
            deal_name: dealName,
          },
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Support conversation failed:', errorData)
        throw new Error(errorData.error || `Failed to open support conversation (${response.status})`)
      }

      const { conversation } = await response.json()

      router.push(`/versoholdings/messages?conversation=${conversation.id}`)
    } catch (err) {
      console.error('Failed to open support conversation:', err)
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button
        onClick={handleAskQuestion}
        disabled={isLoading}
        variant="outline"
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Opening support...
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask a Question
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
