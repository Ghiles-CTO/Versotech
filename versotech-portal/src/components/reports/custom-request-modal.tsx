'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { CreateCustomRequest } from '@/types/reports'
import { CUSTOM_REQUEST_DATA_FOCUS, CUSTOM_REQUEST_FORMATS, REQUEST_CATEGORIES, SLA_LABELS } from '@/lib/reports/constants'
import { AlertCircle, Send } from 'lucide-react'

interface VehicleOption {
  id: string
  name: string
  type: string
}

interface CustomRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCustomRequest) => Promise<void>
  vehicles?: VehicleOption[]
}

export function CustomRequestModal({ open, onOpenChange, onSubmit, vehicles = [] }: CustomRequestModalProps) {
  const [formData, setFormData] = useState<CreateCustomRequest>({
    subject: '',
    category: 'analysis',
    priority: 'normal',
    details: '',
    preferredFormat: 'pdf',
    includeBenchmark: false,
    followUpCall: false,
    dataFocus: [],
    dueDate: undefined,
    vehicleId: undefined,
  })
  const [submitting, setSubmitting] = useState(false)

  const vehicleOptions = useMemo(() => (
    vehicles.map((vehicle) => ({ value: vehicle.id, label: vehicle.name, type: vehicle.type }))
  ), [vehicles])

  const handleSubmit = async () => {
    if (formData.subject.length < 5) {
      toast.error('Subject must be at least 5 characters')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        vehicleId: formData.vehicleId || undefined,
        dueDate: formData.dueDate || undefined,
        dataFocus: formData.dataFocus || [],
      })
      setFormData({
        subject: '',
        category: 'analysis',
      priority: 'normal',
        details: '',
        preferredFormat: 'pdf',
        includeBenchmark: false,
        followUpCall: false,
        dataFocus: [],
        dueDate: undefined,
        vehicleId: undefined,
      })
      onOpenChange(false)
      toast.success('Request submitted successfully')
    } catch (error) {
      toast.error('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !submitting && onOpenChange(value)}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Submit Custom Request
          </DialogTitle>
          <DialogDescription>
            Need something specific? Send a request to the team at <strong>biz@realest.com</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4">
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

          {/* Related Investment Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Related Holding (Optional)</Label>
              <Select
                value={formData.vehicleId || 'none'}
                onValueChange={(v: any) => setFormData({ ...formData, vehicleId: v === 'none' ? undefined : v })}
              >
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="No specific holding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific holding</SelectItem>
                  {vehicleOptions.map((vehicle) => (
                    <SelectItem key={vehicle.value} value={vehicle.value}>
                      {vehicle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Connecting the request to a holding helps the team pull the right data faster.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Target Delivery Date</Label>
              <Input
                id="due-date"
                type="date"
                value={formData.dueDate || ''}
                onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
              />
              <p className="text-xs text-muted-foreground">Optional — let us know if you have a deadline in mind.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-format">Deliverable Format</Label>
            <Select
              value={formData.preferredFormat || 'pdf'}
              onValueChange={(value) => setFormData({ ...formData, preferredFormat: value as any })}
            >
              <SelectTrigger id="preferred-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOM_REQUEST_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Focus */}
          <div className="space-y-2">
            <Label>Focus Areas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CUSTOM_REQUEST_DATA_FOCUS.map((item) => {
                const selected = formData.dataFocus?.includes(item.value as string)
                return (
                  <label
                    key={item.value}
                    className="flex items-start gap-2 rounded-md border p-3 text-sm hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) => {
                        const current = new Set(formData.dataFocus || [])
                        if (checked) {
                          current.add(item.value as string)
                        } else {
                          current.delete(item.value as string)
                        }
                        setFormData({ ...formData, dataFocus: Array.from(current) })
                      }}
                    />
                    <div>
                      <div className="font-medium">{item.label}</div>
                    </div>
                  </label>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">Select one or more focus areas to guide the analysis.</p>
          </div>

          {/* Additional Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm bg-muted/30">
              <Checkbox
                checked={!!formData.includeBenchmark}
                onCheckedChange={(checked) => setFormData({ ...formData, includeBenchmark: !!checked })}
              />
              <div>
                <div className="font-medium">Include benchmark comparisons</div>
                <p className="text-xs text-muted-foreground">Adds relevant indexes (where available) to performance analysis.</p>
              </div>
            </label>

            <label className="flex items-start gap-2 rounded-md border p-3 text-sm bg-muted/30">
              <Checkbox
                checked={!!formData.followUpCall}
                onCheckedChange={(checked) => setFormData({ ...formData, followUpCall: !!checked })}
              />
              <div>
                <div className="font-medium">Request follow-up call</div>
                <p className="text-xs text-muted-foreground">The team will schedule a call to walk through the results.</p>
              </div>
            </label>
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

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
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
