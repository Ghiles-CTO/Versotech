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
  DialogTrigger,
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
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type StaffMember = {
  id: string
  display_name: string
  email: string
  role: string
}

export function AddInvestorModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [formData, setFormData] = useState({
    legal_name: '',
    display_name: '',
    type: 'individual',
    email: '',
    phone: '',
    country: '',
    country_of_incorporation: '',
    tax_residency: '',
    primary_rm: '',
  })

  // Fetch staff members when modal opens
  useEffect(() => {
    if (open) {
      fetchStaffMembers()
    }
  }, [open])

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
      console.log('[AddInvestor] Submitting:', formData)
      
      const response = await fetch('/api/staff/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('[AddInvestor] Response status:', response.status)
      
      const data = await response.json()
      console.log('[AddInvestor] Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create investor')
      }

      toast.success('Investor created successfully')
      
      // Reset form
      setFormData({
        legal_name: '',
        display_name: '',
        type: 'individual',
        email: '',
        phone: '',
        country: '',
        country_of_incorporation: '',
        tax_residency: '',
        primary_rm: '',
      })
      
      setOpen(false)
      
      // Force a hard navigation to refresh server component
      window.location.href = '/versotech/staff/investors'
    } catch (error: any) {
      console.error('[AddInvestor] Error:', error)
      toast.error(error.message || 'Failed to create investor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Investor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Investor</DialogTitle>
          <DialogDescription className="text-gray-300">
            Create a new investor profile. Onboarding tasks will be created automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Legal Name */}
          <div className="space-y-2">
            <Label htmlFor="legal_name" className="text-white">
              Legal Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="legal_name"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              placeholder="John Smith / Acme Investment Fund LP"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-white">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="Optional short name"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Investor Type */}
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
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
                <SelectItem value="entity">Entity</SelectItem>
                <SelectItem value="family_office">Family Office</SelectItem>
                <SelectItem value="fund">Fund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
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

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-white">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United States"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Country of Incorporation */}
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
          </div>

          {/* Tax Residency */}
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Investor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
