'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { toast } from 'sonner'
import type { CreateCustomRequest } from '@/types/reports'
import { REQUEST_CATEGORIES, SLA_LABELS } from '@/lib/reports/constants'
import { AlertCircle, Send } from 'lucide-react'

interface CustomRequestModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCustomRequest) => Promise<void>
}

export function CustomRequestModal({ open, onClose, onSubmit }: CustomRequestModalProps) {
  const [formData, setFormData] = useState<CreateCustomRequest>({
    subject: '',
    category: 'other',
    priority: 'normal',
    details: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (formData.subject.length < 5) {
      toast.error('Subject must be at least 5 characters')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ subject: '', category: 'other', priority: 'normal', details: '' })
      onClose()
      toast.success('Request submitted successfully')
    } catch (error) {
      toast.error('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Submit Custom Request
          </DialogTitle>
          <DialogDescription>
            Need something specific? Send a request to the team at <strong>biz@realest.com</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Request Type</Label>
              <Select
                value={formData.category}
                onValueChange={(v: any) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority || 'normal'}
                onValueChange={(v: any) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Low</Badge>
                      <span className="text-xs text-muted-foreground">{SLA_LABELS.low}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">Normal</Badge>
                      <span className="text-xs text-muted-foreground">{SLA_LABELS.normal}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">High</Badge>
                      <span className="text-xs text-muted-foreground">{SLA_LABELS.high}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of what you need"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.subject.length}/200 characters
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              placeholder="Provide any additional context, specific requirements, date ranges, or other relevant information that will help the team understand your request..."
              rows={6}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              maxLength={5000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.details?.length || 0}/5000 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Expected Response Time
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  The team typically responds to {formData.priority || 'normal'} priority requests within{' '}
                  <strong>{SLA_LABELS[formData.priority as keyof typeof SLA_LABELS] || SLA_LABELS.normal}</strong>.
                  You'll receive a notification when your request is being processed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || formData.subject.length < 5}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
