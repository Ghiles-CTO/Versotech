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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Landmark, User, Mail, Phone, Globe, MapPin, Shield } from 'lucide-react'
import { toast } from 'sonner'

const commercialPartnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legal_name: z.string().optional(),
  type: z.enum(['entity', 'individual']),
  cp_type: z.enum(['bank', 'insurance', 'wealth-manager', 'broker', 'custodian', 'other']),
  status: z.enum(['active', 'pending', 'inactive']),
  regulatory_status: z.string().optional(),
  regulatory_number: z.string().optional(),
  jurisdiction: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  website: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
})

type CommercialPartnerFormData = z.infer<typeof commercialPartnerSchema>

interface AddCommercialPartnerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const TYPE_OPTIONS = [
  { value: 'entity', label: 'Entity' },
  { value: 'individual', label: 'Individual' },
]

const CP_TYPE_OPTIONS = [
  { value: 'bank', label: 'Bank' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'wealth-manager', label: 'Wealth Manager' },
  { value: 'broker', label: 'Broker' },
  { value: 'custodian', label: 'Custodian' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
]

export function AddCommercialPartnerModal({
  open,
  onOpenChange,
  onSuccess,
}: AddCommercialPartnerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CommercialPartnerFormData>({
    resolver: zodResolver(commercialPartnerSchema),
    defaultValues: {
      name: '',
      legal_name: '',
      type: 'entity',
      cp_type: 'bank',
      status: 'active',
      regulatory_status: '',
      regulatory_number: '',
      jurisdiction: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      city: '',
      country: '',
      payment_terms: '',
      notes: '',
    },
  })

  const type = watch('type')
  const cpType = watch('cp_type')
  const status = watch('status')

  const onSubmit = async (data: CommercialPartnerFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/commercial-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create commercial partner')
      }

      toast.success(result.message || 'Commercial partner created successfully')
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Commercial partner creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create commercial partner')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Add Commercial Partner
          </DialogTitle>
          <DialogDescription>
            Create a new commercial partner (bank, insurance, wealth manager, etc.). You can invite users after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Organization Name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_name">Legal Name</Label>
                <Input
                  id="legal_name"
                  placeholder="Legal Entity Name"
                  {...register('legal_name')}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setValue('type', value as 'entity' | 'individual')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cp_type">Business Type *</Label>
                <Select
                  value={cpType}
                  onValueChange={(value) => setValue('cp_type', value as 'bank' | 'insurance' | 'wealth-manager' | 'broker' | 'custodian' | 'other')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CP_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setValue('status', value as 'active' | 'pending' | 'inactive')}
                >
                  <SelectTrigger>
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
            </div>
          </div>

          {/* Regulatory Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Regulatory Information</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regulatory_status">Regulatory Status</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="regulatory_status"
                    placeholder="Licensed"
                    className="pl-10"
                    {...register('regulatory_status')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regulatory_number">License Number</Label>
                <Input
                  id="regulatory_number"
                  placeholder="REG-12345"
                  {...register('regulatory_number')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  placeholder="United States"
                  {...register('jurisdiction')}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contact_name"
                    placeholder="John Smith"
                    className="pl-10"
                    {...register('contact_name')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="contact@company.com"
                    className="pl-10"
                    {...register('contact_email')}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contact_phone"
                    placeholder="+1 234 567 8900"
                    className="pl-10"
                    {...register('contact_phone')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="https://company.com"
                    className="pl-10"
                    {...register('website')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="city"
                    placeholder="New York"
                    className="pl-10"
                    {...register('city')}
                  />
                </div>
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

          {/* Payment & Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                placeholder="Net 30"
                {...register('payment_terms')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                rows={3}
                {...register('notes')}
              />
            </div>
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
                  <Landmark className="mr-2 h-4 w-4" />
                  Create Commercial Partner
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
