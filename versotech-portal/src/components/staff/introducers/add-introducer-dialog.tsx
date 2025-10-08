'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAddIntroducer } from '@/components/staff/introducers/add-introducer-context'
import { toast } from 'sonner'

export function AddIntroducerDialog() {
  const [legalName, setLegalName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [commissionBps, setCommissionBps] = useState<number | ''>('')
  const [commissionCapAmount, setCommissionCapAmount] = useState<number | ''>('')
  const [paymentTerms, setPaymentTerms] = useState('net_30')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  const { open, setOpen, refresh } = useAddIntroducer()

  const resetForm = () => {
    setLegalName('')
    setContactName('')
    setEmail('')
    setCommissionBps('')
    setCommissionCapAmount('')
    setPaymentTerms('net_30')
    setStatus('active')
    setNotes('')
  }

  const handleCreate = () => {
    startTransition(async () => {
      if (!legalName.trim()) {
        toast.error('Legal name is required')
        return
      }

      if (commissionBps !== '' && (Number(commissionBps) < 0 || Number(commissionBps) > 300)) {
        toast.error('Default commission must be between 0 and 300 bps')
        return
      }

      try {
        const response = await fetch('/api/staff/introducers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            legal_name: legalName.trim(),
            contact_name: contactName.trim() || null,
            email: email.trim() || null,
            default_commission_bps: commissionBps === '' ? null : Number(commissionBps),
            commission_cap_amount: commissionCapAmount === '' ? null : Number(commissionCapAmount),
            payment_terms: paymentTerms,
            status,
            notes: notes.trim() || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[AddIntroducerDialog] Failed to create introducer', data)
          toast.error(data?.error ?? 'Failed to create introducer')
          return
        }

        toast.success('Introducer created')
        setOpen(false)
        resetForm()
        await refresh()
      } catch (err) {
        console.error('[AddIntroducerDialog] Unexpected error', err)
        toast.error('Failed to create introducer')
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Introducer</DialogTitle>
          <DialogDescription>Capture introducer contact information and default commercial terms.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input
              id="legalName"
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
              placeholder="e.g. Meridian Capital Partners"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactName">Primary Contact</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jane.smith@example.com"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="commissionBps">Default Commission (bps)</Label>
              <Input
                id="commissionBps"
                type="number"
                min={0}
                max={300}
                value={commissionBps}
                onChange={(event) => setCommissionBps(event.target.value === '' ? '' : Number(event.target.value))}
                placeholder="150"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commissionCap">Commission Cap (optional)</Label>
              <Input
                id="commissionCap"
                type="number"
                min={0}
                value={commissionCapAmount}
                onChange={(event) => setCommissionCapAmount(event.target.value === '' ? '' : Number(event.target.value))}
                placeholder="50000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger>
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net_15">Net 15</SelectItem>
                  <SelectItem value="net_30">Net 30</SelectItem>
                  <SelectItem value="net_45">Net 45</SelectItem>
                  <SelectItem value="net_60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Commission arrangements, regional focus, etc."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Creating…' : 'Create Introducer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

