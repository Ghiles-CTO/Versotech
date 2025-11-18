'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
  created_at: string
  updated_at: string
}

interface FaqFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealId: string
  faq: FAQ | null
  onSave: () => void
}

export function FaqFormDialog({ open, onOpenChange, dealId, faq, onSave }: FaqFormDialogProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question)
      setAnswer(faq.answer)
    } else {
      setQuestion('')
      setAnswer('')
    }
  }, [faq, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim() || !answer.trim()) {
      toast.error('Question and answer are required')
      return
    }

    setLoading(true)

    try {
      const url = faq
        ? `/api/deals/${dealId}/faqs/${faq.id}`
        : `/api/deals/${dealId}/faqs`

      const method = faq ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save FAQ')
      }

      toast.success(faq ? 'FAQ updated successfully' : 'FAQ created successfully')

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving FAQ:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save FAQ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{faq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            <DialogDescription>
              {faq ? 'Update the question and answer' : 'Create a new frequently asked question for this deal'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What is the minimum investment amount?"
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground">
                {question.length}/500 characters
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide a clear and concise answer..."
                rows={6}
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground">
                {answer.length}/5000 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {faq ? 'Update' : 'Create'} FAQ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
