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
import { PhoneInput } from '@/components/ui/phone-input'
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

interface AddPartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const entityTypes = [
  { label: 'Entity', value: 'entity' },
  { label: 'Individual', value: 'individual' },
]

const partnerTypes = [
  { label: 'Co-Investor', value: 'co-investor' },
  { label: 'Syndicate Lead', value: 'syndicate-lead' },
  { label: 'Family Office', value: 'family-office' },
  { label: 'Other', value: 'other' },
]

const sectorOptions = [
  'Technology',
  'Healthcare',
  'Real Estate',
  'Energy',
  'Finance',
  'Consumer',
  'Industrial',
  'Infrastructure',
]

export function AddPartnerDialog({ open, onOpenChange }: AddPartnerDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [type, setType] = useState('entity')
  const [partnerType, setPartnerType] = useState('co-investor')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [typicalInvestmentMin, setTypicalInvestmentMin] = useState<number | ''>('')
  const [typicalInvestmentMax, setTypicalInvestmentMax] = useState<number | ''>('')
  const [preferredSectors, setPreferredSectors] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setName('')
    setLegalName('')
    setType('entity')
    setPartnerType('co-investor')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setCountry('')
    setCity('')
    setTypicalInvestmentMin('')
    setTypicalInvestmentMax('')
    setPreferredSectors([])
    setNotes('')
  }

  const toggleSector = (sector: string) => {
    setPreferredSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    )
  }

  const handleCreate = () => {
    startTransition(async () => {
      if (!name.trim()) {
        toast.error('Partner name is required')
        return
      }

      try {
        const response = await fetch('/api/admin/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            legal_name: legalName.trim() || null,
            type,
            partner_type: partnerType,
            status: 'active',
            contact_name: contactName.trim() || null,
            contact_email: contactEmail.trim() || null,
            contact_phone: contactPhone.trim() || null,
            country: country.trim() || null,
            city: city.trim() || null,
            typical_investment_min: typicalInvestmentMin === '' ? null : Number(typicalInvestmentMin),
            typical_investment_max: typicalInvestmentMax === '' ? null : Number(typicalInvestmentMax),
            preferred_sectors: preferredSectors.length > 0 ? preferredSectors : null,
            notes: notes.trim() || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[AddPartnerDialog] Failed to create partner:', data)
          toast.error(data?.error ?? 'Failed to create partner')
          return
        }

        toast.success('Partner created successfully')
        onOpenChange(false)
        resetForm()
        router.refresh()
      } catch (err) {
        console.error('[AddPartnerDialog] Error:', err)
        toast.error('Failed to create partner')
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
          <DialogTitle>Add Partner</DialogTitle>
          <DialogDescription>
            Register a new investment partner, co-investor, or family office
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Partner Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meridian Capital Partners"
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
              <Select value={partnerType} onValueChange={setPartnerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {partnerTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <PhoneInput
                    value={contactPhone}
                    onChange={(val) => setContactPhone(val || '')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Investment Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="investmentMin">Min Investment ($)</Label>
                <Input
                  id="investmentMin"
                  type="number"
                  min={0}
                  value={typicalInvestmentMin}
                  onChange={(e) => setTypicalInvestmentMin(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="100000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="investmentMax">Max Investment ($)</Label>
                <Input
                  id="investmentMax"
                  type="number"
                  min={0}
                  value={typicalInvestmentMax}
                  onChange={(e) => setTypicalInvestmentMax(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="5000000"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-3 block">Preferred Sectors</Label>
            <div className="flex flex-wrap gap-2">
              {sectorOptions.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => toggleSector(sector)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    preferredSectors.includes(sector)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-white/20 hover:border-white/40'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
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
