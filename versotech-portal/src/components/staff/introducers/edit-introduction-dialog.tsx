'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Introduction = {
  id: string
  introducerId?: string
  introducerName: string
  prospectEmail: string
  dealId?: string
  dealName: string
  status: string
  introducedAt: string | null
  commissionAmount: number | null
  commissionStatus: string | null
  commissionRateOverrideBps?: number | null
  notes?: string | null
}

type EditIntroductionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  introduction: Introduction | null
  introducers?: Array<{ id: string; legalName: string }>
  deals?: Array<{ id: string; name: string }>
}

export function EditIntroductionDialog({
  open,
  onOpenChange,
  introduction,
  introducers = [],
  deals = []
}: EditIntroductionDialogProps) {
  const [introducerId, setIntroducerId] = useState('')
  const [prospectEmail, setProspectEmail] = useState('')
  const [dealId, setDealId] = useState('')
  const [status, setStatus] = useState('')
  const [commissionOverride, setCommissionOverride] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (introduction) {
      setIntroducerId(introduction.introducerId || '')
      setProspectEmail(introduction.prospectEmail)
      setDealId(introduction.dealId || '')
      setStatus(introduction.status)
      setCommissionOverride(introduction.commissionRateOverrideBps || '')
      setNotes(introduction.notes || '')
    }
  }, [introduction])

  const handleUpdate = () => {
    if (!introduction) return

    startTransition(async () => {
      if (!prospectEmail.trim()) {
        toast.error('Prospect email is required')
        return
      }

      if (commissionOverride !== '' && (Number(commissionOverride) < 0 || Number(commissionOverride) > 300)) {
        toast.error('Commission override must be between 0 and 300 bps')
        return
      }

      try {
        const payload: Record<string, any> = {
          status,
          commission_rate_override_bps: commissionOverride === '' ? null : Number(commissionOverride),
          notes: notes.trim() || null,
        }

        // Only include changed fields
        if (introducerId && introducerId !== introduction.introducerId) {
          payload.introducer_id = introducerId
        }
        if (prospectEmail.trim() !== introduction.prospectEmail) {
          payload.prospect_email = prospectEmail.trim()
        }
        if (dealId && dealId !== introduction.dealId) {
          payload.deal_id = dealId
        }

        const response = await fetch(`/api/staff/introductions/${introduction.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const text = await response.text()

          let data
          try {
            data = JSON.parse(text)
          } catch (e) {
            toast.error(`Failed to update introduction: ${text || 'Unknown error'}`)
            return
          }

          if (data?.details) {
            toast.error(`Validation failed: ${JSON.stringify(data.details.fieldErrors || data.details)}`)
          } else {
            toast.error(data?.error ?? 'Failed to update introduction')
          }
          return
        }

        toast.success('Introduction updated')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        toast.error('Failed to update introduction')
      }
    })
  }

  const handleDelete = () => {
    if (!introduction) return

    if (!confirm('Are you sure you want to delete this introduction? This action cannot be undone.')) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/staff/introductions/${introduction.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          toast.error(data?.error ?? 'Failed to delete introduction')
          return
        }

        toast.success('Introduction deleted')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        toast.error('Failed to delete introduction')
      }
    })
  }

  if (!introduction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Introduction</DialogTitle>
          <DialogDescription>Update introduction status and details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Introducer</Label>
            {introducers.length > 0 ? (
              <Select value={introducerId} onValueChange={setIntroducerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select introducer" />
                </SelectTrigger>
                <SelectContent>
                  {introducers.map((intro) => (
                    <SelectItem key={intro.id} value={intro.id}>
                      {intro.legalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={introduction.introducerName} disabled className="bg-muted" />
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prospectEmail">Prospect Email</Label>
            <Input
              id="prospectEmail"
              type="email"
              value={prospectEmail}
              onChange={(e) => setProspectEmail(e.target.value)}
              placeholder="prospect@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label>Deal</Label>
            {deals.length > 0 ? (
              <Select value={dealId} onValueChange={setDealId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deal" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={introduction.dealName} disabled className="bg-muted" />
            )}
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="commissionOverride">Commission Rate Override (bps, optional)</Label>
            <Input
              id="commissionOverride"
              type="number"
              min={0}
              max={300}
              value={commissionOverride}
              onChange={(event) =>
                setCommissionOverride(event.target.value === '' ? '' : Number(event.target.value))
              }
              placeholder="Leave empty to use introducer's default rate"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Additional context about this introduction..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? 'Updating…' : 'Update Introduction'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
