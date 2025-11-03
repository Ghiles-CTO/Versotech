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

type Introducer = {
  id: string
  legalName: string
  contactName: string | null
  email: string | null
  defaultCommissionBps: number
  commissionCapAmount: number | null
  paymentTerms: string | null
  status: string
  notes?: string | null
}

type EditIntroducerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  introducer: Introducer | null
}

export function EditIntroducerDialog({ open, onOpenChange, introducer }: EditIntroducerDialogProps) {
  const [legalName, setLegalName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [commissionBps, setCommissionBps] = useState<number | ''>('')
  const [commissionCapAmount, setCommissionCapAmount] = useState<number | ''>('')
  const [paymentTerms, setPaymentTerms] = useState('net_30')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (introducer) {
      setLegalName(introducer.legalName)
      setContactName(introducer.contactName || '')
      setEmail(introducer.email || '')
      setCommissionBps(introducer.defaultCommissionBps || '')
      setCommissionCapAmount(introducer.commissionCapAmount || '')
      setPaymentTerms(introducer.paymentTerms || 'net_30')
      setStatus(introducer.status)
      setNotes(introducer.notes || '')
    }
  }, [introducer])

  const handleUpdate = () => {
    if (!introducer) return

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
        const response = await fetch(`/api/staff/introducers/${introducer.id}`, {
          method: 'PATCH',
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
          toast.error(data?.error ?? 'Failed to update introducer')
          return
        }

        toast.success('Introducer updated')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        toast.error('Failed to update introducer')
      }
    })
  }

  const handleDelete = () => {
    if (!introducer) return

    if (!confirm('Are you sure you want to delete this introducer? This action cannot be undone.')) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/staff/introducers/${introducer.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const text = await response.text()

          let data
          try {
            data = JSON.parse(text)
          } catch (e) {
            toast.error(`Failed to delete introducer: ${text || 'Unknown error'}`)
            return
          }

          toast.error(data?.error ?? 'Failed to delete introducer')
          return
        }

        toast.success('Introducer deleted')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        toast.error('Failed to delete introducer')
      }
    })
  }

  if (!introducer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Introducer</DialogTitle>
          <DialogDescription>Update introducer contact information and commercial terms.</DialogDescription>
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
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? 'Updating…' : 'Update Introducer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
