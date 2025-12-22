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

type LawyerForEdit = {
  id: string
  firm_name: string
  display_name: string
  legal_entity_type: string | null
  registration_number: string | null
  tax_id: string | null
  primary_contact_name: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  street_address: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  specializations: string[] | null
  is_active: boolean
  kyc_status: string | null
  kyc_notes: string | null
}

interface EditLawyerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lawyer: LawyerForEdit
}

const legalEntityTypes = [
  { label: 'Limited Liability Company', value: 'llc' },
  { label: 'Limited Liability Partnership', value: 'llp' },
  { label: 'Professional Corporation', value: 'pc' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Sole Proprietorship', value: 'sole_proprietor' },
]

const kycStatuses = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Expired', value: 'expired' },
  { label: 'Rejected', value: 'rejected' },
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

export function EditLawyerDialog({ open, onOpenChange, lawyer }: EditLawyerDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [firmName, setFirmName] = useState(lawyer.firm_name)
  const [displayName, setDisplayName] = useState(lawyer.display_name)
  const [legalEntityType, setLegalEntityType] = useState(lawyer.legal_entity_type || 'llp')
  const [registrationNumber, setRegistrationNumber] = useState(lawyer.registration_number || '')
  const [taxId, setTaxId] = useState(lawyer.tax_id || '')
  const [primaryContactName, setPrimaryContactName] = useState(lawyer.primary_contact_name || '')
  const [primaryContactEmail, setPrimaryContactEmail] = useState(lawyer.primary_contact_email || '')
  const [primaryContactPhone, setPrimaryContactPhone] = useState(lawyer.primary_contact_phone || '')
  const [streetAddress, setStreetAddress] = useState(lawyer.street_address || '')
  const [city, setCity] = useState(lawyer.city || '')
  const [stateProvince, setStateProvince] = useState(lawyer.state_province || '')
  const [postalCode, setPostalCode] = useState(lawyer.postal_code || '')
  const [country, setCountry] = useState(lawyer.country || '')
  const [specializations, setSpecializations] = useState<string[]>(lawyer.specializations || [])
  const [isActive, setIsActive] = useState(lawyer.is_active)
  const [kycStatus, setKycStatus] = useState(lawyer.kyc_status || 'draft')
  const [kycNotes, setKycNotes] = useState(lawyer.kyc_notes || '')

  useEffect(() => {
    if (open) {
      setFirmName(lawyer.firm_name)
      setDisplayName(lawyer.display_name)
      setLegalEntityType(lawyer.legal_entity_type || 'llp')
      setRegistrationNumber(lawyer.registration_number || '')
      setTaxId(lawyer.tax_id || '')
      setPrimaryContactName(lawyer.primary_contact_name || '')
      setPrimaryContactEmail(lawyer.primary_contact_email || '')
      setPrimaryContactPhone(lawyer.primary_contact_phone || '')
      setStreetAddress(lawyer.street_address || '')
      setCity(lawyer.city || '')
      setStateProvince(lawyer.state_province || '')
      setPostalCode(lawyer.postal_code || '')
      setCountry(lawyer.country || '')
      setSpecializations(lawyer.specializations || [])
      setIsActive(lawyer.is_active)
      setKycStatus(lawyer.kyc_status || 'draft')
      setKycNotes(lawyer.kyc_notes || '')
    }
  }, [open, lawyer])

  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    )
  }

  const handleSave = () => {
    startTransition(async () => {
      if (!firmName.trim()) {
        toast.error('Firm name is required')
        return
      }

      try {
        const response = await fetch(`/api/admin/lawyers/${lawyer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firm_name: firmName.trim(),
            display_name: displayName.trim() || firmName.trim(),
            legal_entity_type: legalEntityType,
            registration_number: registrationNumber.trim() || null,
            tax_id: taxId.trim() || null,
            primary_contact_name: primaryContactName.trim() || null,
            primary_contact_email: primaryContactEmail.trim() || null,
            primary_contact_phone: primaryContactPhone.trim() || null,
            street_address: streetAddress.trim() || null,
            city: city.trim() || null,
            state_province: stateProvince.trim() || null,
            postal_code: postalCode.trim() || null,
            country: country.trim() || null,
            specializations: specializations.length > 0 ? specializations : null,
            is_active: isActive,
            kyc_status: kycStatus,
            kyc_notes: kycNotes.trim() || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[EditLawyerDialog] Failed to update lawyer:', data)
          toast.error(data?.error ?? 'Failed to update lawyer')
          return
        }

        toast.success('Law firm updated successfully')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        console.error('[EditLawyerDialog] Error:', err)
        toast.error('Failed to update lawyer')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Law Firm</DialogTitle>
          <DialogDescription>
            Update information for {lawyer.firm_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firmName">Firm Name *</Label>
                <Input
                  id="firmName"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Entity Type</Label>
                <Select value={legalEntityType} onValueChange={setLegalEntityType}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber">Registration #</Label>
                <Input
                  id="registrationNumber"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Primary Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Name</Label>
                <Input
                  id="contactName"
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={primaryContactEmail}
                  onChange={(e) => setPrimaryContactEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={primaryContactPhone}
                  onChange={(e) => setPrimaryContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Address</h4>
            <div className="grid gap-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stateProvince">State/Province</Label>
                <Input
                  id="stateProvince"
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
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

          {/* Specializations */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Specializations</h4>
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

          {/* Status & KYC */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Status & KYC</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Active Status</Label>
                <Select
                  value={isActive ? 'active' : 'inactive'}
                  onValueChange={(v) => setIsActive(v === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>KYC Status</Label>
                <Select value={kycStatus} onValueChange={setKycStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kycStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kycNotes">KYC Notes</Label>
              <Textarea
                id="kycNotes"
                value={kycNotes}
                onChange={(e) => setKycNotes(e.target.value)}
                rows={3}
                placeholder="Notes about KYC status or requirements..."
              />
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
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
