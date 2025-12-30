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
      // Get default support staff via API (bypasses RLS - investors can't see staff profiles)
      const staffResponse = await fetch('/api/support/default-staff')
      if (!staffResponse.ok) {
        const staffError = await staffResponse.json().catch(() => ({}))
        throw new Error(staffError.error || 'Unable to find support team member')
      }

      const { staff_id: adminId } = await staffResponse.json()

      // Create conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: `Question about ${dealName}`,
          participant_ids: [adminId],
          type: 'dm',
          visibility: 'investor',
          initial_message: `Hi, I have a question about the ${dealName} deal.`
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Conversation creation failed:', errorData)
        throw new Error(errorData.error || `Failed to create conversation (${response.status})`)
      }

      const { conversation } = await response.json()

      // Navigate to messages page with the new conversation
      router.push(`/versotech_main/messages?conversation=${conversation.id}`)
    } catch (err) {
      console.error('Failed to create conversation:', err)
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
            Starting conversation...
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
