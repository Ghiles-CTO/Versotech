'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AddCommercialPartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const entityTypes = [
  { label: 'Entity', value: 'entity' },
  { label: 'Individual', value: 'individual' },
]

const cpTypes = [
  { label: 'Bank', value: 'bank' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Wealth Manager', value: 'wealth-manager' },
  { label: 'Broker', value: 'broker' },
  { label: 'Custodian', value: 'custodian' },
  { label: 'Other', value: 'other' },
]

export function AddCommercialPartnerDialog({ open, onOpenChange }: AddCommercialPartnerDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [type, setType] = useState('entity')
  const [cpType, setCpType] = useState('bank')
  const [regulatoryStatus, setRegulatoryStatus] = useState('')
  const [regulatoryNumber, setRegulatoryNumber] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setName('')
    setLegalName('')
    setType('entity')
    setCpType('bank')
    setRegulatoryStatus('')
    setRegulatoryNumber('')
    setJurisdiction('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setCountry('')
    setCity('')
    setPaymentTerms('')
    setNotes('')
  }

  const handleCreate = () => {
    startTransition(async () => {
      if (!name.trim()) {
        toast.error('Partner name is required')
        return
      }

      try {
        const response = await fetch('/api/admin/commercial-partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            legal_name: legalName.trim() || null,
            type,
            cp_type: cpType,
            status: 'active',
            regulatory_status: regulatoryStatus.trim() || null,
            regulatory_number: regulatoryNumber.trim() || null,
            jurisdiction: jurisdiction.trim() || null,
            contact_name: contactName.trim() || null,
            contact_email: contactEmail.trim() || null,
            contact_phone: contactPhone.trim() || null,
            country: country.trim() || null,
            city: city.trim() || null,
            payment_terms: paymentTerms.trim() || null,
            notes: notes.trim() || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[AddCommercialPartnerDialog] Failed to create commercial partner:', data)
          toast.error(data?.error ?? 'Failed to create commercial partner')
          return
        }

        toast.success('Commercial partner created successfully')
        onOpenChange(false)
        resetForm()
        router.refresh()
      } catch (err) {
        console.error('[AddCommercialPartnerDialog] Error:', err)
        toast.error('Failed to create commercial partner')
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value)
        if (!value) resetForm()
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Commercial Partner</DialogTitle>
          <DialogDescription>
            Register a new bank, insurance company, or other commercial partner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Partner Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. First National Bank"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input
              id="legalName"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Full legal entity name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Entity Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Partner Type</Label>
              <Select value={cpType} onValueChange={setCpType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cpTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Regulatory Information</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="regulatoryStatus">Regulatory Status</Label>
                  <Input
                    id="regulatoryStatus"
                    value={regulatoryStatus}
                    onChange={(e) => setRegulatoryStatus(e.target.value)}
                    placeholder="e.g. Regulated"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="regulatoryNumber">Regulatory Number</Label>
                  <Input
                    id="regulatoryNumber"
                    value={regulatoryNumber}
                    onChange={(e) => setRegulatoryNumber(e.target.value)}
                    placeholder="e.g. FCA123456"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="e.g. United Kingdom"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Primary Contact</h4>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New York"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="e.g. Net 30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes about the partner..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Partner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
