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

type AddIntroductionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  introducers: Array<{ id: string; legalName: string }>
  deals: Array<{ id: string; name: string }>
}

export function AddIntroductionDialog({ open, onOpenChange, introducers, deals }: AddIntroductionDialogProps) {
  const [introducerId, setIntroducerId] = useState('')
  const [prospectEmail, setProspectEmail] = useState('')
  const [dealId, setDealId] = useState('')
  const [commissionOverride, setCommissionOverride] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const resetForm = () => {
    setIntroducerId('')
    setProspectEmail('')
    setDealId('')
    setCommissionOverride('')
    setNotes('')
  }

  const handleCreate = () => {
    startTransition(async () => {
      if (!introducerId || introducerId.trim() === '') {
        toast.error('Please select an introducer')
        return
      }

      if (!prospectEmail.trim()) {
        toast.error('Prospect email is required')
        return
      }

      if (!dealId || dealId.trim() === '') {
        toast.error('Please select a deal')
        return
      }

      if (commissionOverride !== '' && (Number(commissionOverride) < 0 || Number(commissionOverride) > 300)) {
        toast.error('Commission override must be between 0 and 300 bps')
        return
      }

      try {
        const payload = {
          introducer_id: introducerId,
          prospect_email: prospectEmail.trim(),
          deal_id: dealId,
          commission_rate_override_bps: commissionOverride === '' ? null : Number(commissionOverride),
          notes: notes.trim() || null,
        }

        const response = await fetch('/api/staff/introductions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const text = await response.text()

          let data
          try {
            data = JSON.parse(text)
          } catch (e) {
            toast.error(`Failed to create introduction: ${text || 'Unknown error'}`)
            return
          }

          if (data?.details) {
            toast.error(`Validation failed: ${JSON.stringify(data.details.fieldErrors || data.details)}`)
          } else {
            toast.error(data?.error ?? 'Failed to create introduction')
          }
          return
        }

        toast.success('Introduction recorded')
        onOpenChange(false)
        resetForm()
        router.refresh()
      } catch (err) {
        toast.error('Failed to create introduction')
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value)
        if (!value) {
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Introduction</DialogTitle>
          <DialogDescription>Track a new referral from an introducer partner.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Introducer</Label>
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prospectEmail">Prospect Email</Label>
            <Input
              id="prospectEmail"
              type="email"
              value={prospectEmail}
              onChange={(event) => setProspectEmail(event.target.value)}
              placeholder="prospect@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label>Deal</Label>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Recording…' : 'Record Introduction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
