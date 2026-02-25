'use client'

import { useState, useTransition, useEffect } from 'react'
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

type PartnerForEdit = {
  id: string
  name: string
  legal_name: string | null
  type: string
  partner_type: string
  status: string
  accreditation_status: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  typical_investment_min: number | null
  typical_investment_max: number | null
  preferred_sectors: string[] | null
  preferred_geographies: string[] | null
  notes: string | null
  kyc_status: string | null
  kyc_notes: string | null
}

interface EditPartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner: PartnerForEdit
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

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Inactive', value: 'inactive' },
]

const kycStatuses = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Expired', value: 'expired' },
  { label: 'Rejected', value: 'rejected' },
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

export function EditPartnerDialog({ open, onOpenChange, partner }: EditPartnerDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(partner.name)
  const [legalName, setLegalName] = useState(partner.legal_name || '')
  const [type, setType] = useState(partner.type)
  const [partnerType, setPartnerType] = useState(partner.partner_type)
  const [status, setStatus] = useState(partner.status)
  const [contactName, setContactName] = useState(partner.contact_name || '')
  const [contactEmail, setContactEmail] = useState(partner.contact_email || '')
  const [contactPhone, setContactPhone] = useState(partner.contact_phone || '')
  const [website, setWebsite] = useState(partner.website || '')
  const [addressLine1, setAddressLine1] = useState(partner.address_line_1 || '')
  const [addressLine2, setAddressLine2] = useState(partner.address_line_2 || '')
  const [city, setCity] = useState(partner.city || '')
  const [postalCode, setPostalCode] = useState(partner.postal_code || '')
  const [country, setCountry] = useState(partner.country || '')
  const [typicalInvestmentMin, setTypicalInvestmentMin] = useState<number | ''>(partner.typical_investment_min || '')
  const [typicalInvestmentMax, setTypicalInvestmentMax] = useState<number | ''>(partner.typical_investment_max || '')
  const [preferredSectors, setPreferredSectors] = useState<string[]>(partner.preferred_sectors || [])
  const [notes, setNotes] = useState(partner.notes || '')
  const [kycStatus, setKycStatus] = useState(partner.kyc_status || 'draft')
  const [kycNotes, setKycNotes] = useState(partner.kyc_notes || '')

  useEffect(() => {
    if (open) {
      setName(partner.name)
      setLegalName(partner.legal_name || '')
      setType(partner.type)
      setPartnerType(partner.partner_type)
      setStatus(partner.status)
      setContactName(partner.contact_name || '')
      setContactEmail(partner.contact_email || '')
      setContactPhone(partner.contact_phone || '')
      setWebsite(partner.website || '')
      setAddressLine1(partner.address_line_1 || '')
      setAddressLine2(partner.address_line_2 || '')
      setCity(partner.city || '')
      setPostalCode(partner.postal_code || '')
      setCountry(partner.country || '')
      setTypicalInvestmentMin(partner.typical_investment_min || '')
      setTypicalInvestmentMax(partner.typical_investment_max || '')
      setPreferredSectors(partner.preferred_sectors || [])
      setNotes(partner.notes || '')
      setKycStatus(partner.kyc_status || 'draft')
      setKycNotes(partner.kyc_notes || '')
    }
  }, [open, partner])

  const toggleSector = (sector: string) => {
    setPreferredSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    )
  }

  const handleSave = () => {
    startTransition(async () => {
      if (!name.trim()) {
        toast.error('Partner name is required')
        return
      }

      try {
        const response = await fetch(`/api/admin/partners/${partner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            legal_name: legalName.trim() || null,
            type,
            partner_type: partnerType,
            status,
            contact_name: contactName.trim() || null,
            contact_email: contactEmail.trim() || null,
            contact_phone: contactPhone.trim() || null,
            website: website.trim() || null,
            address: addressLine1.trim() || null,
            address_2: addressLine2.trim() || null,
            city: city.trim() || null,
            postal_code: postalCode.trim() || null,
            country: country.trim() || null,
            typical_investment_min: typicalInvestmentMin === '' ? null : Number(typicalInvestmentMin),
            typical_investment_max: typicalInvestmentMax === '' ? null : Number(typicalInvestmentMax),
            preferred_sectors: preferredSectors.length > 0 ? preferredSectors : null,
            notes: notes.trim() || null,
            kyc_status: kycStatus,
            kyc_notes: kycNotes.trim() || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[EditPartnerDialog] Failed to update partner:', data)
          toast.error(data?.error ?? 'Failed to update partner')
          return
        }

        toast.success('Partner updated successfully')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        console.error('[EditPartnerDialog] Error:', err)
        toast.error('Failed to update partner')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Partner</DialogTitle>
          <DialogDescription>
            Update information for {partner.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="legalName">Legal Name</Label>
                <Input
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Address</h4>
            <div className="grid gap-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addressLine2">Address (Optional)</Label>
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Investment Profile */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Investment Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="investmentMin">Min Investment ($)</Label>
                <Input
                  id="investmentMin"
                  type="number"
                  min={0}
                  value={typicalInvestmentMin}
                  onChange={(e) => setTypicalInvestmentMin(e.target.value === '' ? '' : Number(e.target.value))}
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
                />
              </div>
            </div>
            <div>
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
          </div>

          {/* Status & KYC */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">KYC Status</h4>
            <div className="grid gap-2">
              <Label>KYC Status</Label>
              <Select value={kycStatus} onValueChange={setKycStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kycStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kycNotes">KYC Notes</Label>
              <Textarea
                id="kycNotes"
                value={kycNotes}
                onChange={(e) => setKycNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
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
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
