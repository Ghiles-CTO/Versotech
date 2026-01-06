'use client'

import { useEffect, useMemo, useState, useCallback, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Upload, Trash2, Loader2 } from 'lucide-react'
import type { Entity } from './entities-views'

interface DropdownOption {
  id: string
  name: string
  email?: string
  firm_name?: string
  display_name?: string
}

interface DropdownOptions {
  arrangers: DropdownOption[]
  lawyers: DropdownOption[]
  managingPartners: DropdownOption[]
}

const STATUS_OPTIONS = [
  { value: 'LIVE', label: 'Live' },
  { value: 'TBD', label: 'TBD' },
  { value: 'CLOSED', label: 'Closed' }
]

const ENTITY_TYPES = [
  { value: 'fund', label: 'Fund' },
  { value: 'spv', label: 'SPV' },
  { value: 'securitization', label: 'Securitization' },
  { value: 'note', label: 'Note' },
  { value: 'venture_capital', label: 'Venture Capital' },
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' }
]

const REPORTING_OPTIONS = [
  { value: 'Not Required', label: 'Not Required' },
  { value: 'Company Only', label: 'Company Only' },
  { value: 'Online only', label: 'Online Only' },
  { value: 'Company + Online', label: 'Company + Online' }
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF']

const defaultForm = {
  name: '',
  entity_code: '',
  platform: '',
  investment_name: '',
  former_entity: '',
  type: 'fund',
  status: 'LIVE',
  domicile: '',
  currency: 'USD',
  formation_date: '',
  legal_jurisdiction: '',
  registration_number: '',
  reporting_type: 'Not Required',
  requires_reporting: false,
  notes: '',
  website_url: '',
  address: '',
  arranger_entity_id: '',
  lawyer_id: '',
  managing_partner_id: ''
}

type FormState = typeof defaultForm

interface CreateEntityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (entity: Entity) => void
}

export function CreateEntityModal({ open, onOpenChange, onSuccess }: CreateEntityModalProps) {
  const [formData, setFormData] = useState<FormState>(defaultForm)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    arrangers: [],
    lawyers: [],
    managingPartners: []
  })
  const [dropdownsLoading, setDropdownsLoading] = useState(false)

  const fetchDropdownOptions = useCallback(async () => {
    setDropdownsLoading(true)
    try {
      const response = await fetch('/api/vehicles/dropdown-options')
      if (response.ok) {
        const data = await response.json()
        setDropdownOptions(data)
      }
    } catch (err) {
      console.error('Failed to fetch dropdown options:', err)
    } finally {
      setDropdownsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      void fetchDropdownOptions()
    }
  }, [open, fetchDropdownOptions])

  useEffect(() => {
    if (!open) {
      setFormData(defaultForm)
      setLogoUrl('')
      setLogoError(null)
      setError(null)
      setLoading(false)
      setLogoUploading(false)
    }
  }, [open])

  const reportingNeedsExplanation = useMemo(() => {
    if (!formData.requires_reporting) {
      return 'Enable to track follow-up obligations for this vehicle.'
    }

    if (formData.reporting_type === 'Not Required') {
      return 'Select a reporting channel so stakeholders know where updates are delivered.'
    }

    return 'This vehicle will appear in reporting queues and reminders.'
  }, [formData.requires_reporting, formData.reporting_type])

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = async (file: File) => {
    setLogoError(null)
    setLogoUploading(true)

    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('vehicle_id', 'new')

      const response = await fetch('/api/entities/logo-upload', {
        method: 'POST',
        body: payload
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to upload logo')
      }

      setLogoUrl(data.url)
    } catch (uploadError) {
      setLogoError(uploadError instanceof Error ? uploadError.message : 'Failed to upload logo')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Vehicle name is required')
      return
    }

    if (!formData.domicile.trim()) {
      setError('Domicile is required')
      return
    }

    if (formData.requires_reporting && formData.reporting_type === 'Not Required') {
      setError('Select a reporting channel when reporting is enabled')
      return
    }

    setLoading(true)

    try {
      const payload = {
        name: formData.name.trim(),
        entity_code: formData.entity_code.trim() || null,
        platform: formData.platform.trim() || null,
        investment_name: formData.investment_name.trim() || null,
        former_entity: formData.former_entity.trim() || null,
        type: formData.type,
        status: formData.status,
        domicile: formData.domicile.trim(),
        currency: formData.currency.trim().toUpperCase() || 'USD',
        formation_date: formData.formation_date || null,
        legal_jurisdiction: formData.legal_jurisdiction.trim() || null,
        registration_number: formData.registration_number.trim() || null,
        reporting_type: formData.reporting_type,
        requires_reporting: formData.requires_reporting,
        notes: formData.notes.trim() || null,
        logo_url: logoUrl || null,
        website_url: formData.website_url.trim() || null,
        address: formData.address.trim() || null,
        arranger_entity_id: formData.arranger_entity_id || null,
        lawyer_id: formData.lawyer_id || null,
        managing_partner_id: formData.managing_partner_id || null
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create vehicle')
      }

      onSuccess(data.vehicle as Entity)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while creating the vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl border border-white/10 bg-black/95 text-white shadow-[0_28px_80px_rgba(0,0,0,0.55)] backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl text-white">Create Vehicle</DialogTitle>
            <DialogDescription className="text-sm text-white/70">
              Complete the vehicle profile used when linking deals and investor reporting.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-name" className="text-white">
                  Vehicle Name *
                </Label>
                <Input
                  id="vehicle-name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="e.g., Verso Fund II"
                  className="bg-white text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-code" className="text-white">
                  Vehicle Code
                </Label>
                <Input
                  id="vehicle-code"
                  value={formData.entity_code}
                  onChange={handleInputChange('entity_code')}
                  placeholder="e.g., VC101"
                  className="bg-white text-black font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-white">
                  Platform
                </Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={handleInputChange('platform')}
                  placeholder="e.g., VC1SCSP"
                  className="bg-white text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investment_name" className="text-white">
                  Investment Name
                </Label>
                <Input
                  id="investment_name"
                  value={formData.investment_name}
                  onChange={handleInputChange('investment_name')}
                  placeholder="e.g., Revolut Secondary"
                  className="bg-white text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domicile" className="text-white">
                Domicile / Jurisdiction *
              </Label>
              <Input
                id="domicile"
                value={formData.domicile}
                onChange={handleInputChange('domicile')}
                placeholder="e.g., Luxembourg, BVI, Delaware"
                className="bg-white text-black"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formation_date" className="text-white">
                  Formation Date
                </Label>
                <Input
                  id="formation_date"
                  type="date"
                  value={formData.formation_date}
                  onChange={handleInputChange('formation_date')}
                  className="bg-white text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number" className="text-white">
                  Registration Number
                </Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange('registration_number')}
                  placeholder="Optional registration reference"
                  className="bg-white text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="former_entity" className="text-white">
                  Former Vehicle Name
                </Label>
                <Input
                  id="former_entity"
                  value={formData.former_entity}
                  onChange={handleInputChange('former_entity')}
                  placeholder="Previous name if renamed"
                  className="bg-white text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url" className="text-white">
                  Website
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={handleInputChange('website_url')}
                  placeholder="https://example.com"
                  className="bg-white text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-white">
                Address
              </Label>
              <Textarea
                id="address"
                rows={2}
                value={formData.address}
                onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Registered address of the vehicle"
                className="bg-white text-black"
              />
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <div className="space-y-1">
                <Label className="text-white font-medium">Service Providers</Label>
                <p className="text-xs text-white/60">Assign the arranger, lawyer, and managing partner for this vehicle.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Arranger</Label>
                  <Select
                    value={formData.arranger_entity_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, arranger_entity_id: value === 'none' ? '' : value }))}
                    disabled={dropdownsLoading}
                  >
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder={dropdownsLoading ? 'Loading...' : 'Select arranger'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {dropdownOptions.arrangers.map((arranger) => (
                        <SelectItem key={arranger.id} value={arranger.id}>
                          {arranger.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Lawyer</Label>
                  <Select
                    value={formData.lawyer_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, lawyer_id: value === 'none' ? '' : value }))}
                    disabled={dropdownsLoading}
                  >
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder={dropdownsLoading ? 'Loading...' : 'Select lawyer'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {dropdownOptions.lawyers.map((lawyer) => (
                        <SelectItem key={lawyer.id} value={lawyer.id}>
                          {lawyer.name} {lawyer.firm_name && lawyer.name !== lawyer.firm_name ? `(${lawyer.firm_name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Managing Partner</Label>
                  <Select
                    value={formData.managing_partner_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, managing_partner_id: value === 'none' ? '' : value }))}
                    disabled={dropdownsLoading}
                  >
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder={dropdownsLoading ? 'Loading...' : 'Select managing partner'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {dropdownOptions.managingPartners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.display_name || partner.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Vehicle Logo</Label>
              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg border border-white/10 bg-white/10 flex items-center justify-center">
                    {logoUrl ? (

                      <Image src={logoUrl} alt="Entity logo preview" width={64} height={64} className="h-full w-full rounded object-contain p-1" />
                    ) : (
                      <span className="text-xs text-white/60">Upload logo</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 rounded-md border border-dashed border-white/25 px-3 py-2 text-sm text-white cursor-pointer transition-colors hover:border-white/70 hover:bg-white/[0.04]">
                      <Upload className="h-4 w-4" />
                      <span>{logoUrl ? 'Replace Logo' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (!file) return
                          void handleLogoUpload(file)
                          event.target.value = ''
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-3">
                      {logoUploading && (
                        <span className="inline-flex items-center gap-1 text-xs text-white/70">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading…
                        </span>
                      )}
                      {logoUrl && !logoUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-0 text-xs text-rose-300 hover:text-rose-200"
                          onClick={() => {
                            setLogoUrl('')
                            setLogoError(null)
                          }}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove logo
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-white/60">PNG or JPG, recommended minimum 240×240.</p>
                    {logoError && <p className="text-xs text-rose-300">{logoError}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-white">Reporting Requirements</Label>
                  <p className="text-xs text-white/60">{reportingNeedsExplanation}</p>
                </div>
                <Switch
                  checked={formData.requires_reporting}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      requires_reporting: checked,
                      reporting_type:
                        checked && prev.reporting_type === 'Not Required' ? 'Company Only' : checked ? prev.reporting_type : 'Not Required'
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Reporting Channel</Label>
                  <Select
                    value={formData.reporting_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, reporting_type: value }))}
                    disabled={!formData.requires_reporting}
                  >
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Reporting channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORTING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">
                Notes
              </Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Add any additional context for this entity."
                className="bg-white text-black"
              />
            </div>

            {error && (
              <div className="rounded-md border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border border-white/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </span>
              ) : (
                'Create Vehicle'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
