'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, UserPlus, Building2, User } from 'lucide-react'
import { toast } from 'sonner'
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
import { Switch } from '@/components/ui/switch'

type StaffMember = {
  id: string
  display_name: string
  email: string
  role: string
}

// Helper to check if type is individual
const isIndividualType = (type: string) => type === 'individual'

// Helper to check if type is entity-like (entity, institutional, family_office, fund)
const isEntityType = (type: string) => ['entity', 'institutional', 'family_office', 'fund'].includes(type)

export function AddInvestorModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [inviteUser, setInviteUser] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    display_name: '',
    title: '',
    role: 'member',
    is_primary: true,
    is_signatory: true,
  })
  const [formData, setFormData] = useState({
    // Common fields
    type: 'individual',
    email: '',
    phone: '',
    country: '',
    tax_residency: '',
    primary_rm: '',
    // Individual-specific fields
    first_name: '',
    middle_name: '',
    last_name: '',
    // Entity-specific fields
    legal_name: '',
    display_name: '',
    country_of_incorporation: '',
    representative_name: '',
    representative_title: '',
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

    const inviteEmail = inviteData.email.trim().toLowerCase()
    const inviteName = inviteData.display_name.trim()
    const inviteTitle = inviteData.title.trim()
    const inviteRole = inviteData.role
    const inviteIsPrimary = inviteData.is_primary
    const inviteIsSignatory = inviteData.is_signatory

    if (inviteUser) {
      if (!inviteEmail || !inviteEmail.includes('@')) {
        toast.error('Valid invite email is required')
        return
      }
      if (inviteName.length < 2) {
        toast.error('Invite display name is required')
        return
      }
      if (!inviteRole) {
        toast.error('Invite role is required')
        return
      }
    }

    setLoading(true)

    try {
      // Prepare data for API - compute legal_name for individuals
      const submitData = { ...formData }

      if (isIndividualType(formData.type)) {
        // Compute legal_name from structured name fields
        const nameParts = [
          formData.first_name.trim(),
          formData.middle_name.trim(),
          formData.last_name.trim(),
        ].filter(Boolean)
        submitData.legal_name = nameParts.join(' ')
        // Also set display_name if not provided
        if (!submitData.display_name.trim()) {
          submitData.display_name = submitData.legal_name
        }
      }

      console.log('[AddInvestor] Submitting:', submitData)

      const response = await fetch('/api/staff/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      console.log('[AddInvestor] Response status:', response.status)

      const data = await response.json()
      console.log('[AddInvestor] Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create investor')
      }

      const createdInvestorId = data?.investor?.id || data?.id

      if (inviteUser && createdInvestorId) {
        const inviteResponse = await fetch('/api/admin/entity-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_type: 'investor',
            entity_id: createdInvestorId,
            email: inviteEmail,
            display_name: inviteName,
            title: inviteTitle || null,
            role: inviteRole,
            is_primary: inviteIsPrimary,
            is_signatory: inviteIsSignatory,
            can_sign: inviteIsSignatory,
          }),
        })

        if (!inviteResponse.ok) {
          const inviteResult = await inviteResponse.json().catch(() => ({}))
          toast.warning(inviteResult.error || 'Investor created, but invitation failed to send')
        } else {
          const inviteResult = await inviteResponse.json().catch(() => ({}))
          if (inviteResult.email_sent === false) {
            toast.warning('Investor created, but invitation email failed to send')
          } else {
            toast.success(inviteResult.message || 'Investor created and invitation sent')
          }
        }
      } else {
        toast.success('Investor created successfully')
      }
      
      // Reset form
      setFormData({
        type: 'individual',
        email: '',
        phone: '',
        country: '',
        tax_residency: '',
        primary_rm: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        legal_name: '',
        display_name: '',
        country_of_incorporation: '',
        representative_name: '',
        representative_title: '',
      })
      setInviteUser(false)
      setInviteData({
        email: '',
        display_name: '',
        title: '',
        role: 'member',
        is_primary: true,
        is_signatory: true,
      })
      
      setOpen(false)
      
      // Force a hard navigation to refresh server component
      window.location.href = '/versotech_main/investors'
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
          <DialogTitle>Add New Investor</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new investor profile. Onboarding tasks will be created automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Investor Type - FIRST FIELD */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Investor Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                setFormData({ ...formData, type: value })
                if (inviteUser) {
                  setInviteData((prev) => ({
                    ...prev,
                    is_signatory: isIndividualType(value),
                  }))
                }
              }}
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
            <p className="text-xs text-muted-foreground">
              {isIndividualType(formData.type)
                ? 'A natural person investing in their own name'
                : 'A company, fund, or institutional entity'}
            </p>
          </div>

          {/* INDIVIDUAL-SPECIFIC FIELDS */}
          {isIndividualType(formData.type) && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Personal Information
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="John"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    placeholder="Michael"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Smith"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Preview computed legal name */}
              {(formData.first_name || formData.last_name) && (
                <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
                  Legal name will be: <span className="text-foreground font-medium">
                    {[formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ENTITY-SPECIFIC FIELDS */}
          {isEntityType(formData.type) && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Entity Information
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_name">
                  Legal Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="legal_name"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  placeholder="Acme Investment Holdings LP"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Acme Holdings (optional short name)"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country_of_incorporation">Country of Incorporation</Label>
                <Input
                  id="country_of_incorporation"
                  value={formData.country_of_incorporation}
                  onChange={(e) => setFormData({ ...formData, country_of_incorporation: e.target.value })}
                  placeholder="Cayman Islands"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="representative_name">Representative Name</Label>
                  <Input
                    id="representative_name"
                    value={formData.representative_name}
                    onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                    placeholder="Jane Doe"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representative_title">Representative Title</Label>
                  <Input
                    id="representative_title"
                    value={formData.representative_title}
                    onChange={(e) => setFormData({ ...formData, representative_title: e.target.value })}
                    placeholder="Managing Director"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMMON FIELDS - Contact Information */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">Contact Information</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="investor@email.com"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">
                  {isIndividualType(formData.type) ? 'Country of Residence' : 'Country'}
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_residency">Tax Residency</Label>
                <Input
                  id="tax_residency"
                  value={formData.tax_residency}
                  onChange={(e) => setFormData({ ...formData, tax_residency: e.target.value })}
                  placeholder="United States"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Relationship Manager */}
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

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm text-foreground">Invite Portal User</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send an invitation to join this investor's portal
                </p>
              </div>
              <Switch
                checked={inviteUser}
                onCheckedChange={(checked) => {
                  setInviteUser(checked)
                  if (checked) {
                    setInviteData((prev) => ({
                      ...prev,
                      role: prev.role || 'member',
                      is_primary: true,
                      is_signatory: isIndividualType(formData.type),
                    }))
                  }
                }}
              />
            </div>

            {inviteUser && (
              <div className="space-y-3 pl-4 border-l border-border">
                <div className="space-y-2">
                  <Label htmlFor="invite_role">
                    Member Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={inviteData.role}
                    onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                  >
                    <SelectTrigger id="invite_role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite_email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="invite_email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="user@email.com"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite_display_name">
                    Display Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="invite_display_name"
                    value={inviteData.display_name}
                    onChange={(e) => setInviteData({ ...inviteData, display_name: e.target.value })}
                    placeholder="John Smith"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite_title">Title (Optional)</Label>
                  <Input
                    id="invite_title"
                    value={inviteData.title}
                    onChange={(e) => setInviteData({ ...inviteData, title: e.target.value })}
                    placeholder="Managing Director"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="invite_is_primary" className="text-sm font-medium">
                      Primary Contact
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Main contact for this investor
                    </p>
                  </div>
                  <Switch
                    id="invite_is_primary"
                    checked={inviteData.is_primary}
                    onCheckedChange={(checked) =>
                      setInviteData({ ...inviteData, is_primary: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="invite_is_signatory" className="text-sm font-medium">
                      Can Sign Documents
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isIndividualType(formData.type)
                        ? 'Enabled by default for individual investors'
                        : 'Enable if this user can sign on behalf of this investor'}
                    </p>
                  </div>
                  <Switch
                    id="invite_is_signatory"
                    checked={inviteData.is_signatory}
                    onCheckedChange={(checked) =>
                      setInviteData({ ...inviteData, is_signatory: checked })
                    }
                  />
                </div>
              </div>
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
              {inviteUser ? 'Create Investor & Send Invite' : 'Create Investor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
