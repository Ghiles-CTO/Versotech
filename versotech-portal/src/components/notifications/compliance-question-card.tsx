'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { usePersona } from '@/contexts/persona-context'
import { toast } from 'sonner'

interface ComplianceQuestionCardProps {
  title?: string
  description?: string
  className?: string
}

export function ComplianceQuestionCard({
  title = 'Have a compliance question?',
  description = 'Send your question to the compliance team. They will follow up through notifications.',
  className,
}: ComplianceQuestionCardProps) {
  const { activePersona } = usePersona()
  const [summary, setSummary] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!summary.trim()) {
      toast.error('Please enter your compliance question.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          persona: {
            persona_type: activePersona?.persona_type ?? null,
            entity_id: activePersona?.entity_id ?? null,
            entity_name: activePersona?.entity_name ?? null,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Failed to send compliance question')
      }

      toast.success('Compliance question sent.')
      setSummary('')
    } catch (error: any) {
      toast.error(error?.message || 'Unable to send compliance question')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Describe the compliance question or concern."
          rows={4}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting || !summary.trim()}>
            {isSubmitting ? 'Sending…' : 'Send question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
