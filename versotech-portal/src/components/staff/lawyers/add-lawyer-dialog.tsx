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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AddLawyerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const legalEntityTypes = [
  { label: 'Limited Liability Company', value: 'llc' },
  { label: 'Limited Liability Partnership', value: 'llp' },
  { label: 'Professional Corporation', value: 'pc' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Sole Proprietorship', value: 'sole_proprietor' },
]

const specializationOptions = [
  'M&A',
  'Securities',
  'Tax',
  'Fund Formation',
  'Private Equity',
  'Real Estate',
  'Corporate',
  'Regulatory',
  'Litigation',
  'Banking & Finance',
]

export function AddLawyerDialog({ open, onOpenChange }: AddLawyerDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [firmName, setFirmName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [legalEntityType, setLegalEntityType] = useState('llp')
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactEmail, setPrimaryContactEmail] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [specializations, setSpecializations] = useState<string[]>([])

  const resetForm = () => {
    setFirmName('')
    setDisplayName('')
    setLegalEntityType('llp')
    setPrimaryContactName('')
    setPrimaryContactEmail('')
    setPrimaryContactPhone('')
    setCountry('')
    setCity('')
    setSpecializations([])
  }

  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    )
  }

  const handleCreate = () => {
    startTransition(async () => {
      if (!firmName.trim()) {
        toast.error('Firm name is required')
        return
      }

      try {
        const response = await fetch('/api/admin/lawyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firm_name: firmName.trim(),
            display_name: displayName.trim() || firmName.trim(),
            legal_entity_type: legalEntityType,
            primary_contact_name: primaryContactName.trim() || null,
            primary_contact_email: primaryContactEmail.trim() || null,
            primary_contact_phone: primaryContactPhone.trim() || null,
            country: country.trim() || null,
            city: city.trim() || null,
            specializations: specializations.length > 0 ? specializations : null,
            is_active: true,
            kyc_status: 'draft',
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[AddLawyerDialog] Failed to create lawyer:', data)
          toast.error(data?.error ?? 'Failed to create lawyer')
          return
        }

        toast.success('Law firm created successfully')
        onOpenChange(false)
        resetForm()
        router.refresh()
      } catch (err) {
        console.error('[AddLawyerDialog] Error:', err)
        toast.error('Failed to create lawyer')
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
          <DialogTitle>Add Law Firm</DialogTitle>
          <DialogDescription>
            Register a new legal partner for deal documentation and compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firmName">Firm Name *</Label>
            <Input
              id="firmName"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="e.g. Smith & Associates LLP"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Short name (defaults to firm name)"
            />
          </div>

          <div className="grid gap-2">
            <Label>Entity Type</Label>
            <Select value={legalEntityType} onValueChange={setLegalEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {legalEntityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    placeholder="john@smithlaw.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <PhoneInput
                    value={primaryContactPhone}
                    onChange={(val) => setPrimaryContactPhone(val || '')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-3 block">Specializations</Label>
            <div className="flex flex-wrap gap-2">
              {specializationOptions.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    specializations.includes(spec)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-white/20 hover:border-white/40'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
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
            {isPending ? 'Creating...' : 'Create Law Firm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
