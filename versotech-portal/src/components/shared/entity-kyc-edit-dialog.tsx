'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, User, MapPin, FileText, IdCard, LucideIcon } from 'lucide-react'
import { CountrySelect, NationalitySelect } from '@/components/kyc/country-select'
import { normalizeKycEditPayload } from '@/lib/kyc/normalize-edit-payload'

// Clamp date input year to 4 digits max
function clampDateYear(e: React.FormEvent<HTMLInputElement>) {
  const input = e.currentTarget
  if (input.value && input.value.length > 10) {
    input.value = input.value.slice(0, 10)
  }
}

// Entity types supported
type EntityType = 'investor' | 'partner' | 'introducer' | 'lawyer' | 'arranger' | 'commercial_partner'

// Individual KYC schema for editing
const individualKycEditSchema = z.object({
  // Personal Info
  first_name: z.string().min(1, 'First name is required').max(100),
  middle_name: z.string().max(100).optional().nullable(),
  middle_initial: z.string().max(5).optional().nullable(),
  last_name: z.string().min(1, 'Last name is required').max(100),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),

  // Residential Address
  residential_street: z.string().max(200).optional().nullable(),
  residential_line_2: z.string().max(200).optional().nullable(),
  residential_city: z.string().max(100).optional().nullable(),
  residential_state: z.string().max(100).optional().nullable(),
  residential_postal_code: z.string().max(20).optional().nullable(),
  residential_country: z.string().optional().nullable(),

  // Tax Information
  is_us_citizen: z.boolean(),
  is_us_taxpayer: z.boolean(),
  us_taxpayer_id: z.string().optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // Identification Document
  id_type: z.string().optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // Proof of Address Document Dates
  proof_of_address_date: z.string().optional().nullable(),
})

type IndividualKycEditForm = z.infer<typeof individualKycEditSchema>

// ID types for the select dropdown
const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'residence_permit', label: 'Residence Permit' },
  { value: 'other', label: 'Other Government ID' },
]

interface EntityKYCEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: EntityType
  entityId: string
  entityName?: string
  initialData?: Partial<IndividualKycEditForm>
  apiEndpoint: string
  onSuccess?: () => void
  showPersonalInfo?: boolean
  showAddress?: boolean
  showTaxInfo?: boolean
  showIdentification?: boolean
}

// Compact section header
function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

export function EntityKYCEditDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  initialData,
  apiEndpoint,
  onSuccess,
  showPersonalInfo = true,
  showAddress = true,
  showTaxInfo = true,
  showIdentification = false,
}: EntityKYCEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<IndividualKycEditForm>({
    resolver: zodResolver(individualKycEditSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      middle_name: initialData?.middle_name || '',
      middle_initial: initialData?.middle_initial || '',
      last_name: initialData?.last_name || '',
      name_suffix: initialData?.name_suffix || '',
      date_of_birth: initialData?.date_of_birth || '',
      country_of_birth: initialData?.country_of_birth || '',
      nationality: initialData?.nationality || '',
      email: initialData?.email || '',
      phone_mobile: initialData?.phone_mobile || '',
      phone_office: initialData?.phone_office || '',
      residential_street: initialData?.residential_street || '',
      residential_line_2: initialData?.residential_line_2 || '',
      residential_city: initialData?.residential_city || '',
      residential_state: initialData?.residential_state || '',
      residential_postal_code: initialData?.residential_postal_code || '',
      residential_country: initialData?.residential_country || '',
      is_us_citizen: initialData?.is_us_citizen || false,
      is_us_taxpayer: initialData?.is_us_taxpayer || false,
      us_taxpayer_id: initialData?.us_taxpayer_id || '',
      country_of_tax_residency: initialData?.country_of_tax_residency || '',
      tax_id_number: initialData?.tax_id_number || '',
      id_type: initialData?.id_type || '',
      id_number: initialData?.id_number || '',
      id_issue_date: initialData?.id_issue_date || '',
      id_expiry_date: initialData?.id_expiry_date || '',
      id_issuing_country: initialData?.id_issuing_country || '',
      proof_of_address_date: initialData?.proof_of_address_date || '',
    },
  })

  const watchIsUsTaxpayer = form.watch('is_us_taxpayer')

  const handleSubmit = async (data: IndividualKycEditForm) => {
    setIsSaving(true)
    try {
      const normalizedPayload = normalizeKycEditPayload(data, {
        showPersonalInfo,
        showAddress,
        showTaxInfo,
        showIdentification,
      })

      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          ...normalizedPayload,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const fieldErrors = errorData?.details?.fieldErrors as Record<string, string[] | undefined> | undefined
        const firstFieldError = fieldErrors
          ? Object.values(fieldErrors).flat().find((message): message is string => Boolean(message))
          : null
        throw new Error(firstFieldError || errorData.error || 'Failed to save KYC data')
      }

      toast.success('KYC information updated successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving KYC data:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save KYC data')
    } finally {
      setIsSaving(false)
    }
  }

  const getEntityTypeLabel = () => {
    const labels: Record<EntityType, string> = {
      investor: 'Investor',
      partner: 'Partner',
      introducer: 'Introducer',
      lawyer: 'Lawyer',
      arranger: 'Arranger',
      commercial_partner: 'Commercial Partner',
    }
    return labels[entityType]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl">
            Edit {getEntityTypeLabel()} KYC Information
          </DialogTitle>
          <DialogDescription>
            {entityName
              ? `Update KYC details for ${entityName}`
              : 'Update your KYC and compliance information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6">

              {/* Personal Information Section */}
              {showPersonalInfo && (
                <FormSection
                  icon={User}
                  title="Personal Information"
                  description="Your legal name and personal details"
                >
                  {/* Name Row 1: First + Last */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="John"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Smith"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Name Row 2: Middle + M.I. + Suffix */}
                  <div className="grid grid-cols-3 sm:grid-cols-[2fr_1fr_1fr] gap-4">
                    <FormField
                      control={form.control}
                      name="middle_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="William"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middle_initial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>M.I.</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="W"
                              maxLength={5}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name_suffix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suffix</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Jr., III"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Birth Info Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              value={field.value || ''}
                              className="h-10"
                              onInput={clampDateYear}
                              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)
                                .toISOString()
                                .split('T')[0]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country of Birth</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <NationalitySelect
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact Info Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              value={field.value || ''}
                              placeholder="john@example.com"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone_mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Phone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              value={field.value || ''}
                              placeholder="+1 (555) 123-4567"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone_office"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Phone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              value={field.value || ''}
                              placeholder="+1 (555) 987-6543"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>
              )}

              {/* Residential Address Section */}
              {showAddress && (
                <FormSection
                  icon={MapPin}
                  title="Residential Address"
                  description="Your current permanent residence"
                >
                  {/* Street Address - full width */}
                  <FormField
                    control={form.control}
                    name="residential_street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            placeholder="123 Main Street"
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Apt/Suite - full width */}
                  <FormField
                    control={form.control}
                    name="residential_line_2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment / Suite / Unit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            placeholder="Apt 4B"
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City, State, Postal, Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="residential_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="New York"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="residential_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="NY"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="residential_postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="10001"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="residential_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>
              )}

              {/* Tax Information Section */}
              {showTaxInfo && (
                <FormSection
                  icon={FileText}
                  title="Tax Information"
                  description="Tax residency and compliance details"
                >
                  {/* US Person Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_us_citizen"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              US Citizen / Permanent Resident
                            </FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">
                              I am a US citizen or hold a green card
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_us_taxpayer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              US Taxpayer
                            </FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">
                              I am subject to US tax obligations
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* US Taxpayer ID (conditional) */}
                  {watchIsUsTaxpayer && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="us_taxpayer_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>US Taxpayer ID (SSN/ITIN) *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ''}
                                placeholder="XXX-XX-XXXX"
                                className="h-10"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Required for US tax reporting
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Tax Residency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country_of_tax_residency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country of Tax Residency</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tax_id_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID Number (TIN)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Enter your tax ID"
                              className="h-10"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Your local tax identification number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>
              )}

              {/* Identification Document Section */}
              {showIdentification && (
                <FormSection
                  icon={IdCard}
                  title="Identification Document"
                  description="Government-issued ID for verification"
                >
                  {/* ID Type and Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="id_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select ID type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ID_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
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
                      name="id_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Enter document number"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Issue and Expiry Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="id_issue_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              value={field.value || ''}
                              className="h-10"
                              onInput={clampDateYear}
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="id_expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              value={field.value || ''}
                              className="h-10"
                              onInput={clampDateYear}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Must be valid for at least 6 months
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="id_issuing_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Country</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Proof of Address Date */}
                  <FormField
                    control={form.control}
                    name="proof_of_address_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proof of Address Date</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            value={field.value || ''}
                            className="h-10"
                            onInput={clampDateYear}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Date on utility bill or address proof
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>
              )}
            </div>

            {/* Fixed footer */}
            <DialogFooter className="shrink-0 border-t pt-4 mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="min-w-[140px]">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Export the schema for use elsewhere
export { individualKycEditSchema }
export type { IndividualKycEditForm, EntityType }
