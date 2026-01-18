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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Scale, User, Mail, Phone, MapPin, Building } from 'lucide-react'
import { toast } from 'sonner'

const lawyerSchema = z.object({
  firm_name: z.string().min(2, 'Firm name must be at least 2 characters'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  legal_entity_type: z.string().optional(),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  primary_contact_name: z.string().optional(),
  primary_contact_email: z.string().email().optional().or(z.literal('')),
  primary_contact_phone: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  is_active: z.boolean(),
})

type LawyerFormData = z.infer<typeof lawyerSchema>

interface AddLawyerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const LEGAL_ENTITY_OPTIONS = [
  { value: 'llp', label: 'LLP (Limited Liability Partnership)' },
  { value: 'llc', label: 'LLC (Limited Liability Company)' },
  { value: 'pc', label: 'PC (Professional Corporation)' },
  { value: 'pllc', label: 'PLLC (Professional Limited Liability Company)' },
  { value: 'partnership', label: 'General Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'other', label: 'Other' },
]

const SPECIALIZATION_OPTIONS = [
  'Corporate & Commercial',
  'Mergers & Acquisitions',
  'Private Equity',
  'Venture Capital',
  'Fund Formation',
  'Securities',
  'Tax',
  'Real Estate',
  'Regulatory',
  'Litigation',
  'Employment',
  'Intellectual Property',
  'Banking & Finance',
  'Restructuring',
  'Other',
]

export function AddLawyerModal({
  open,
  onOpenChange,
  onSuccess,
}: AddLawyerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LawyerFormData>({
    resolver: zodResolver(lawyerSchema),
    defaultValues: {
      firm_name: '',
      display_name: '',
      legal_entity_type: '',
      registration_number: '',
      tax_id: '',
      primary_contact_name: '',
      primary_contact_email: '',
      primary_contact_phone: '',
      street_address: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: '',
      specializations: [],
      is_active: true,
    },
  })

  const legalEntityType = watch('legal_entity_type')
  const isActive = watch('is_active')

  const handleSpecializationChange = (spec: string, checked: boolean) => {
    setSelectedSpecializations(prev => {
      const updated = checked
        ? [...prev, spec]
        : prev.filter(s => s !== spec)
      setValue('specializations', updated)
      return updated
    })
  }

  const onSubmit = async (data: LawyerFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/lawyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          specializations: selectedSpecializations,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create law firm')
      }

      toast.success(result.message || 'Law firm created successfully')
      reset()
      setSelectedSpecializations([])
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Law firm creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create law firm')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedSpecializations([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Add New Law Firm
          </DialogTitle>
          <DialogDescription>
            Create a new legal counsel firm. You can invite users to this firm after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Firm Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firm_name">Firm Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firm_name"
                    placeholder="Smith & Associates LLP"
                    className="pl-10"
                    {...register('firm_name')}
                  />
                </div>
                {errors.firm_name && (
                  <p className="text-sm text-destructive">{errors.firm_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  placeholder="Smith & Associates"
                  {...register('display_name')}
                />
                {errors.display_name && (
                  <p className="text-sm text-destructive">{errors.display_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legal_entity_type">Entity Type</Label>
                <Select
                  value={legalEntityType || ''}
                  onValueChange={(value) => setValue('legal_entity_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEGAL_ENTITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  placeholder="REG-12345"
                  {...register('registration_number')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input
                  id="tax_id"
                  placeholder="XX-XXXXXXX"
                  {...register('tax_id')}
                />
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Primary Contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_contact_name">Contact Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="primary_contact_name"
                    placeholder="John Smith"
                    className="pl-10"
                    {...register('primary_contact_name')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_contact_email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="primary_contact_email"
                    type="email"
                    placeholder="contact@lawfirm.com"
                    className="pl-10"
                    {...register('primary_contact_email')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_contact_phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="primary_contact_phone"
                  placeholder="+1 234 567 8900"
                  className="pl-10"
                  {...register('primary_contact_phone')}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>

            <div className="space-y-2">
              <Label htmlFor="street_address">Street Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="street_address"
                  placeholder="123 Law Street, Suite 100"
                  className="pl-10"
                  {...register('street_address')}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  {...register('city')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state_province">State/Province</Label>
                <Input
                  id="state_province"
                  placeholder="NY"
                  {...register('state_province')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  placeholder="10001"
                  {...register('postal_code')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  {...register('country')}
                />
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Practice Areas</h3>
            <div className="grid grid-cols-3 gap-2">
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox
                    id={`spec-${spec}`}
                    checked={selectedSpecializations.includes(spec)}
                    onCheckedChange={(checked) => handleSpecializationChange(spec, checked as boolean)}
                  />
                  <label
                    htmlFor={`spec-${spec}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {spec}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2 rounded-lg border p-3">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active (firm is currently engaged and available for work)
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Scale className="mr-2 h-4 w-4" />
                  Create Law Firm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
