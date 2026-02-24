'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Building2, User } from 'lucide-react'
import { toast } from 'sonner'

type StaffMember = {
  id: string
  display_name: string
  email: string
  role: string
}

// Helper to check if type is individual
const isIndividualType = (type: string) => type === 'individual'

// Helper to check if type is entity-like
const isEntityType = (type: string) => ['entity', 'institutional', 'family_office', 'fund'].includes(type)

type EditInvestorModalProps = {
  investor: {
    id: string
    legal_name: string
    display_name?: string | null
    type: string
    email?: string | null
    phone?: string | null
    country?: string | null
    country_of_incorporation?: string | null
    tax_residency?: string | null
    primary_rm?: string | null
    // Individual-specific fields
    first_name?: string | null
    middle_name?: string | null
    last_name?: string | null
    // Entity-specific fields
    representative_name?: string | null
    representative_title?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditInvestorModal({ investor, open, onOpenChange }: EditInvestorModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [formData, setFormData] = useState({
    type: investor.type || 'individual',
    email: investor.email || '',
    phone: investor.phone || '',
    country: investor.country || '',
    tax_residency: investor.tax_residency || '',
    primary_rm: investor.primary_rm || '',
    // Individual fields
    first_name: investor.first_name || '',
    middle_name: investor.middle_name || '',
    last_name: investor.last_name || '',
    // Entity fields
    legal_name: investor.legal_name || '',
    display_name: investor.display_name || '',
    country_of_incorporation: investor.country_of_incorporation || '',
    representative_name: investor.representative_name || '',
    representative_title: investor.representative_title || '',
  })

  useEffect(() => {
    if (open) {
      fetchStaffMembers()
      // Reset form data when modal opens
      setFormData({
        type: investor.type || 'individual',
        email: investor.email || '',
        phone: investor.phone || '',
        country: investor.country || '',
        tax_residency: investor.tax_residency || '',
        primary_rm: investor.primary_rm || '',
        first_name: investor.first_name || '',
        middle_name: investor.middle_name || '',
        last_name: investor.last_name || '',
        legal_name: investor.legal_name || '',
        display_name: investor.display_name || '',
        country_of_incorporation: investor.country_of_incorporation || '',
        representative_name: investor.representative_name || '',
        representative_title: investor.representative_title || '',
      })
    }
  }, [open, investor])

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('/api/staff/available')
      if (response.ok) {
        const data = await response.json()
        setStaffMembers(data.staff || [])
      }
    } catch (error) {
      console.error('Failed to fetch staff members:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation based on type
    if (isIndividualType(formData.type)) {
      if (!formData.first_name.trim()) {
        toast.error('First name is required for individuals')
        return
      }
    } else {
      if (!formData.legal_name.trim()) {
        toast.error('Legal name is required')
        return
      }
    }

    setLoading(true)

    try {
      // Prepare data for API
      const submitData = { ...formData }

      if (isIndividualType(formData.type)) {
        // Compute legal_name from structured name fields
        const nameParts = [
          formData.first_name.trim(),
          formData.middle_name.trim(),
          formData.last_name.trim(),
        ].filter(Boolean)
        submitData.legal_name = nameParts.join(' ')
        if (!submitData.display_name.trim()) {
          submitData.display_name = submitData.legal_name
        }
      }

      const response = await fetch(`/api/staff/investors/${investor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update investor')
      }

      toast.success('Investor updated successfully')
      onOpenChange(false)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update investor'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Investor</DialogTitle>
          <DialogDescription className="text-gray-300">
            Update investor profile information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Investor Type - FIRST FIELD */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-white">
              Investor Type <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Individual
                  </div>
                </SelectItem>
                <SelectItem value="entity">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Entity
                  </div>
                </SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
                <SelectItem value="family_office">Family Office</SelectItem>
                <SelectItem value="fund">Fund</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              {isIndividualType(formData.type)
                ? 'A natural person investing in their own name'
                : 'A company, fund, or institutional entity'}
            </p>
          </div>

          {/* INDIVIDUAL-SPECIFIC FIELDS */}
          {isIndividualType(formData.type) && (
            <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <User className="h-4 w-4" />
                Personal Information
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-white">
                    First Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="John"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_name" className="text-white">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    placeholder="Michael"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-white">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Smith"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Preview computed legal name */}
              {(formData.first_name || formData.last_name) && (
                <div className="text-xs text-gray-400 bg-zinc-800/50 px-3 py-2 rounded">
                  Legal name will be: <span className="text-white font-medium">
                    {[formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ENTITY-SPECIFIC FIELDS */}
          {isEntityType(formData.type) && (
            <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Building2 className="h-4 w-4" />
                Entity Information
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_name" className="text-white">
                  Legal Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="legal_name"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  placeholder="Acme Investment Holdings LP"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-white">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Acme Holdings (optional short name)"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country_of_incorporation" className="text-white">Country of Incorporation</Label>
                <Input
                  id="country_of_incorporation"
                  value={formData.country_of_incorporation}
                  onChange={(e) => setFormData({ ...formData, country_of_incorporation: e.target.value })}
                  placeholder="Cayman Islands"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="representative_name" className="text-white">Representative Name</Label>
                  <Input
                    id="representative_name"
                    value={formData.representative_name}
                    onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                    placeholder="Jane Doe"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representative_title" className="text-white">Representative Title</Label>
                  <Input
                    id="representative_title"
                    value={formData.representative_title}
                    onChange={(e) => setFormData({ ...formData, representative_title: e.target.value })}
                    placeholder="Managing Director"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMMON FIELDS - Contact Information */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-300">Contact Information</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="investor@email.com"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone</Label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val || '' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">
                  {isIndividualType(formData.type) ? 'Country of Residence' : 'Country'}
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_residency" className="text-white">Tax Residency</Label>
                <Input
                  id="tax_residency"
                  value={formData.tax_residency}
                  onChange={(e) => setFormData({ ...formData, tax_residency: e.target.value })}
                  placeholder="United States"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Relationship Manager */}
          <div className="space-y-2">
            <Label htmlFor="primary_rm" className="text-white">Relationship Manager</Label>
            <Select
              value={formData.primary_rm || undefined}
              onValueChange={(value) => setFormData({ ...formData, primary_rm: value || '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a relationship manager (optional)" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.length > 0 ? (
                  staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.display_name} ({staff.role})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading staff...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {formData.primary_rm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, primary_rm: '' })}
                className="text-xs"
              >
                Clear selection
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
