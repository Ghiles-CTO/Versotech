'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface CounterpartyEntity {
  id: string
  entity_type: string
  legal_name: string
  registration_number?: string
  jurisdiction?: string
  tax_id?: string
  formation_date?: string
  registered_address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  representative_name?: string
  representative_title?: string
  representative_email?: string
  representative_phone?: string
  notes?: string
}

interface EntityFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  entity?: CounterpartyEntity | null
}

export function EntityFormDialog({ open, onClose, onSuccess, entity }: EntityFormDialogProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    entity_type: '',
    legal_name: '',
    registration_number: '',
    jurisdiction: '',
    tax_id: '',
    formation_date: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country: '',
    representative_name: '',
    representative_title: '',
    representative_email: '',
    representative_phone: '',
    notes: ''
  })

  useEffect(() => {
    if (entity) {
      setFormData({
        entity_type: entity.entity_type || '',
        legal_name: entity.legal_name || '',
        registration_number: entity.registration_number || '',
        jurisdiction: entity.jurisdiction || '',
        tax_id: entity.tax_id || '',
        formation_date: entity.formation_date || '',
        address_street: entity.registered_address?.street || '',
        address_city: entity.registered_address?.city || '',
        address_state: entity.registered_address?.state || '',
        address_postal_code: entity.registered_address?.postal_code || '',
        address_country: entity.registered_address?.country || '',
        representative_name: entity.representative_name || '',
        representative_title: entity.representative_title || '',
        representative_email: entity.representative_email || '',
        representative_phone: entity.representative_phone || '',
        notes: entity.notes || ''
      })
    } else {
      setFormData({
        entity_type: '',
        legal_name: '',
        registration_number: '',
        jurisdiction: '',
        tax_id: '',
        formation_date: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_postal_code: '',
        address_country: '',
        representative_name: '',
        representative_title: '',
        representative_email: '',
        representative_phone: '',
        notes: ''
      })
    }
  }, [entity, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.entity_type || !formData.legal_name) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)

    try {
      const payload = {
        entity_type: formData.entity_type,
        legal_name: formData.legal_name,
        registration_number: formData.registration_number || null,
        jurisdiction: formData.jurisdiction || null,
        tax_id: formData.tax_id || null,
        formation_date: formData.formation_date || null,
        registered_address: {
          street: formData.address_street || undefined,
          city: formData.address_city || undefined,
          state: formData.address_state || undefined,
          postal_code: formData.address_postal_code || undefined,
          country: formData.address_country || undefined
        },
        representative_name: formData.representative_name || null,
        representative_title: formData.representative_title || null,
        representative_email: formData.representative_email || null,
        representative_phone: formData.representative_phone || null,
        notes: formData.notes || null
      }

      const url = entity
        ? `/api/investors/me/counterparty-entities/${entity.id}`
        : '/api/investors/me/counterparty-entities'

      const method = entity ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save entity')
      }

      toast.success(entity ? 'Entity updated successfully' : 'Entity created successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save entity')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entity ? 'Edit Entity' : 'Add New Entity'}</DialogTitle>
          <DialogDescription>
            {entity
              ? 'Update the details of this legal entity'
              : 'Add a legal entity that you invest through'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Entity Type & Legal Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity_type">
                Entity Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.entity_type}
                onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="family_office">Family Office</SelectItem>
                  <SelectItem value="law_firm">Law Firm</SelectItem>
                  <SelectItem value="investment_bank">Investment Bank</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal_name">
                Legal Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                placeholder="Full legal name"
                required
              />
            </div>
          </div>

          {/* Registration & Tax Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                placeholder="Company registration number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID / EIN</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder="Tax ID or EIN"
              />
            </div>
          </div>

          {/* Jurisdiction & Formation Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                placeholder="State or country of formation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formation_date">Formation Date</Label>
              <Input
                id="formation_date"
                type="date"
                value={formData.formation_date}
                onChange={(e) => setFormData({ ...formData, formation_date: e.target.value })}
              />
            </div>
          </div>

          {/* Registered Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Registered Address</h3>
            <div className="space-y-2">
              <Label htmlFor="address_street">Street Address</Label>
              <Input
                id="address_street"
                value={formData.address_street}
                onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_city">City</Label>
                <Input
                  id="address_city"
                  value={formData.address_city}
                  onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_state">State/Province</Label>
                <Input
                  id="address_state"
                  value={formData.address_state}
                  onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                  placeholder="State or province"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_postal_code">Postal Code</Label>
                <Input
                  id="address_postal_code"
                  value={formData.address_postal_code}
                  onChange={(e) => setFormData({ ...formData, address_postal_code: e.target.value })}
                  placeholder="Postal code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_country">Country</Label>
                <Input
                  id="address_country"
                  value={formData.address_country}
                  onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Representative Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Authorized Representative</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="representative_name">Name</Label>
                <Input
                  id="representative_name"
                  value={formData.representative_name}
                  onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                  placeholder="Representative's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_title">Title</Label>
                <Input
                  id="representative_title"
                  value={formData.representative_title}
                  onChange={(e) => setFormData({ ...formData, representative_title: e.target.value })}
                  placeholder="Title or role"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="representative_email">Email</Label>
                <Input
                  id="representative_email"
                  type="email"
                  value={formData.representative_email}
                  onChange={(e) => setFormData({ ...formData, representative_email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_phone">Phone</Label>
                <Input
                  id="representative_phone"
                  value={formData.representative_phone}
                  onChange={(e) => setFormData({ ...formData, representative_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this entity"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : entity ? 'Update Entity' : 'Create Entity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
