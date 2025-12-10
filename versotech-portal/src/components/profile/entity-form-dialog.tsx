'use client'

import { useState, useEffect } from 'react'
import { Building2, MapPin, User, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {entity ? 'Edit Entity' : 'Add New Entity'}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1">
                {entity
                  ? 'Update the details of this legal entity'
                  : 'Add a legal entity that you invest through'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 space-y-10">

            {/* Section 1: Basic Information */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-medium text-slate-900">Entity Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="entity_type" className="text-sm font-medium text-slate-700">
                    Entity Type <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.entity_type}
                    onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
                  >
                    <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20">
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
                  <Label htmlFor="legal_name" className="text-sm font-medium text-slate-700">
                    Legal Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="legal_name"
                    value={formData.legal_name}
                    onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                    placeholder="Full legal name"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="registration_number" className="text-sm font-medium text-slate-700">
                    Registration Number
                  </Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    placeholder="Company registration number"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id" className="text-sm font-medium text-slate-700">
                    Tax ID / EIN
                  </Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    placeholder="Tax ID or EIN"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction" className="text-sm font-medium text-slate-700">
                    Jurisdiction
                  </Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    placeholder="State or country of formation"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formation_date" className="text-sm font-medium text-slate-700">
                    Formation Date
                  </Label>
                  <Input
                    id="formation_date"
                    type="date"
                    value={formData.formation_date}
                    onChange={(e) => setFormData({ ...formData, formation_date: e.target.value })}
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Registered Address */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-medium text-slate-900">Registered Address</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="address_street" className="text-sm font-medium text-slate-700">
                    Street Address
                  </Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                    placeholder="123 Main Street, Suite 100"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="address_city" className="text-sm font-medium text-slate-700">
                      City
                    </Label>
                    <Input
                      id="address_city"
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                      placeholder="City"
                      className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_state" className="text-sm font-medium text-slate-700">
                      State / Province
                    </Label>
                    <Input
                      id="address_state"
                      value={formData.address_state}
                      onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                      placeholder="State or province"
                      className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="address_postal_code" className="text-sm font-medium text-slate-700">
                      Postal Code
                    </Label>
                    <Input
                      id="address_postal_code"
                      value={formData.address_postal_code}
                      onChange={(e) => setFormData({ ...formData, address_postal_code: e.target.value })}
                      placeholder="Postal code"
                      className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_country" className="text-sm font-medium text-slate-700">
                      Country
                    </Label>
                    <Input
                      id="address_country"
                      value={formData.address_country}
                      onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
                      placeholder="Country"
                      className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Authorized Representative */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-medium text-slate-900">Authorized Representative</h3>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="representative_name" className="text-sm font-medium text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="representative_name"
                    value={formData.representative_name}
                    onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                    placeholder="Representative's full name"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representative_title" className="text-sm font-medium text-slate-700">
                    Title / Role
                  </Label>
                  <Input
                    id="representative_title"
                    value={formData.representative_title}
                    onChange={(e) => setFormData({ ...formData, representative_title: e.target.value })}
                    placeholder="e.g., Managing Director"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="representative_email" className="text-sm font-medium text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="representative_email"
                    type="email"
                    value={formData.representative_email}
                    onChange={(e) => setFormData({ ...formData, representative_email: e.target.value })}
                    placeholder="email@example.com"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representative_phone" className="text-sm font-medium text-slate-700">
                    Phone
                  </Label>
                  <Input
                    id="representative_phone"
                    value={formData.representative_phone}
                    onChange={(e) => setFormData({ ...formData, representative_phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Notes */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-medium text-slate-900">Additional Notes</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                  Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this entity..."
                  rows={4}
                  className="bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-8 py-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="px-5 border-slate-200 hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : entity ? (
                'Update Entity'
              ) : (
                'Create Entity'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
