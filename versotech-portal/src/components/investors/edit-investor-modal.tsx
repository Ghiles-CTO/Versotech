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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type StaffMember = {
  id: string
  display_name: string
  email: string
  role: string
}

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
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditInvestorModal({ investor, open, onOpenChange }: EditInvestorModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [formData, setFormData] = useState({
    legal_name: investor.legal_name,
    display_name: investor.display_name || '',
    type: investor.type,
    email: investor.email || '',
    phone: investor.phone || '',
    country: investor.country || '',
    country_of_incorporation: investor.country_of_incorporation || '',
    tax_residency: investor.tax_residency || '',
    primary_rm: investor.primary_rm || '',
  })

  useEffect(() => {
    if (open) {
      fetchStaffMembers()
      // Reset form data when modal opens
      setFormData({
        legal_name: investor.legal_name,
        display_name: investor.display_name || '',
        type: investor.type,
        email: investor.email || '',
        phone: investor.phone || '',
        country: investor.country || '',
        country_of_incorporation: investor.country_of_incorporation || '',
        tax_residency: investor.tax_residency || '',
        primary_rm: investor.primary_rm || '',
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
    
    if (!formData.legal_name) {
      toast.error('Legal name is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/staff/investors/${investor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update investor')
      }

      toast.success('Investor updated successfully')
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update investor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Investor</DialogTitle>
          <DialogDescription>
            Update investor profile information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legal_name">
              Legal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="legal_name"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Investor Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
                <SelectItem value="entity">Entity</SelectItem>
                <SelectItem value="family_office">Family Office</SelectItem>
                <SelectItem value="fund">Fund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country_of_incorporation">Country of Incorporation</Label>
              <Input
                id="country_of_incorporation"
                value={formData.country_of_incorporation}
                onChange={(e) => setFormData({ ...formData, country_of_incorporation: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_residency">Tax Residency</Label>
            <Input
              id="tax_residency"
              value={formData.tax_residency}
              onChange={(e) => setFormData({ ...formData, tax_residency: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_rm">Relationship Manager</Label>
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

