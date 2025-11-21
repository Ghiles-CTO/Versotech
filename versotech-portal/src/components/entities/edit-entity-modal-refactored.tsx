'use client'

import { useEffect, useState } from 'react'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Upload, Trash2, Loader2, Edit, AlertCircle } from 'lucide-react'
import { useEntityForm } from '@/hooks/use-entity-form'
import { toast } from 'sonner'
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog'

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

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD']

interface EditEntityModalProps {
  entity: {
    id: string
    name: string
    entity_code: string | null
    platform: string | null
    investment_name: string | null
    former_entity: string | null
    status: string | null
    type: string
    domicile: string | null
    currency: string
    formation_date: string | null
    legal_jurisdiction: string | null
    registration_number: string | null
    reporting_type: string | null
    requires_reporting: boolean | null
    notes: string | null
    logo_url: string | null
    website_url: string | null
  }
  open: boolean
  onClose: () => void
  onSuccess: (entity: any) => void
}

export function EditEntityModalRefactored({
  entity,
  open,
  onClose,
  onSuccess
}: EditEntityModalProps) {
  const [logoUrl, setLogoUrl] = useState(entity.logo_url || '')
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const { confirm, ConfirmationDialog } = useConfirmationDialog()

  const { form, onSubmit, isSubmitting } = useEntityForm({
    entityId: entity.id,
    mode: 'edit',
    defaultValues: {
      name: entity.name || '',
      entity_code: entity.entity_code || '',
      platform: entity.platform || '',
      investment_name: entity.investment_name || '',
      former_entity: entity.former_entity || '',
      status: (entity.status as any) || 'LIVE',
      type: (entity.type as any) || 'fund',
      domicile: entity.domicile || '',
      currency: entity.currency || 'USD',
      formation_date: entity.formation_date ? entity.formation_date.slice(0, 10) : null,
      legal_jurisdiction: entity.legal_jurisdiction || '',
      registration_number: entity.registration_number || '',
      reporting_type: (entity.reporting_type as any) || 'Not Required',
      requires_reporting: entity.requires_reporting ?? false,
      notes: entity.notes || '',
      logo_url: entity.logo_url || null,
      website_url: entity.website_url || ''
    },
    onSuccess: (data) => {
      onSuccess(data.entity)
      onClose()
    }
  })

  // Reset logo URL when modal opens
  useEffect(() => {
    if (open) {
      setLogoUrl(entity.logo_url || '')
      setLogoError(null)
      form.reset({
        name: entity.name || '',
        entity_code: entity.entity_code || '',
        platform: entity.platform || '',
        investment_name: entity.investment_name || '',
        former_entity: entity.former_entity || '',
        status: (entity.status as any) || 'LIVE',
        type: (entity.type as any) || 'fund',
        domicile: entity.domicile || '',
        currency: entity.currency || 'USD',
        formation_date: entity.formation_date ? entity.formation_date.slice(0, 10) : null,
        legal_jurisdiction: entity.legal_jurisdiction || '',
        registration_number: entity.registration_number || '',
        reporting_type: (entity.reporting_type as any) || 'Not Required',
        requires_reporting: entity.requires_reporting ?? false,
        notes: entity.notes || '',
        logo_url: entity.logo_url || null,
        website_url: entity.website_url || ''
      })
    }
  }, [entity, open, form])

  const handleLogoUpload = async (file: File) => {
    setLogoError(null)
    setLogoUploading(true)

    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('vehicle_id', entity.id)

      const response = await fetch('/api/entities/logo-upload', {
        method: 'POST',
        body: payload
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload logo')
      }

      setLogoUrl(data.url)
      form.setValue('logo_url', data.url)
      toast.success('Logo uploaded successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload logo'
      setLogoError(message)
      toast.error(message)
    } finally {
      setLogoUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    confirm(
      {
        title: 'Remove Logo',
        description: 'Are you sure you want to remove this logo?',
        confirmText: 'Remove',
        variant: 'destructive'
      },
      () => {
        setLogoUrl('')
        form.setValue('logo_url', null)
        toast.success('Logo removed')
      }
    )
  }

  const handleSubmitWithConfirmation = (data: any) => {
    confirm(
      {
        title: 'Confirm Changes',
        description: 'Are you sure you want to save these changes to the entity?',
        confirmText: 'Save Changes',
        variant: 'default'
      },
      () => {
        onSubmit()
      }
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Edit className="h-5 w-5 text-emerald-400" />
              Edit Entity
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update entity information and metadata
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitWithConfirmation)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-white">Entity Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Enter entity name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entity_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Entity Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white font-mono"
                            placeholder="e.g., ENT001"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-400">
                          Unique identifier for this entity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Platform</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="e.g., Fund Admin Platform"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Entity Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-950 border-white/10">
                            {ENTITY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value} className="text-white">
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-950 border-white/10">
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                                className="text-white"
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="investment_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Investment Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Investment vehicle name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="former_entity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Former Entity Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Previous name if renamed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Legal & Compliance */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                  Legal & Compliance
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="domicile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Domicile</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="e.g., Cayman Islands"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="legal_jurisdiction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Legal Jurisdiction</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="e.g., Delaware"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Registration Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white font-mono"
                            placeholder="Registration ID"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Currency *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-950 border-white/10">
                            {CURRENCIES.map((curr) => (
                              <SelectItem key={curr} value={curr} className="text-white">
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="formation_date"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-white">Formation Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ''}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Reporting */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                  Reporting
                </h3>

                <FormField
                  control={form.control}
                  name="requires_reporting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white">Requires Reporting</FormLabel>
                        <FormDescription className="text-xs text-gray-400">
                          Enable if this entity has reporting obligations
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('requires_reporting') && (
                  <FormField
                    control={form.control}
                    name="reporting_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Reporting Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || 'Not Required'}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-950 border-white/10">
                            {REPORTING_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-white"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Logo & Branding */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                  Branding
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Entity Logo</Label>
                    {logoUrl ? (
                      <div className="flex items-start gap-4">

                        <Image
                          src={logoUrl}
                          alt="Entity logo"
                          width={96}
                          height={96}
                          className="w-24 h-24 object-contain bg-white/5 rounded border border-white/10"
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveLogo}
                            className="text-red-400 hover:text-red-200 border-red-400/40 hover:bg-red-500/10"
                            disabled={logoUploading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Logo
                          </Button>
                          <p className="text-xs text-gray-400">Click to remove current logo</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleLogoUpload(file)
                          }}
                          className="hidden"
                          id="logo-upload"
                          disabled={logoUploading}
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={logoUploading}
                            className="cursor-pointer border-white/10 text-white hover:bg-white/10 bg-white/5"
                            onClick={(e) => {
                              e.preventDefault()
                              document.getElementById('logo-upload')?.click()
                            }}
                          >
                            {logoUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
                              </>
                            )}
                          </Button>
                        </label>
                        {logoError && (
                          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {logoError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Website URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            type="url"
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Add any internal notes or comments about this entity..."
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      These notes are for internal use only and not visible to investors
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSubmitting || logoUploading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog />
    </>
  )
}
