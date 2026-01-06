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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, User, MapPin, FileText, IdCard, Briefcase } from 'lucide-react'

// Import KYC form sections
import { PersonalInfoFormSection } from '@/components/kyc/personal-info-form-section'
import { AddressFormSection } from '@/components/kyc/address-form-section'
import { TaxInfoFormSection } from '@/components/kyc/tax-info-form-section'
import { IdentificationFormSection } from '@/components/kyc/identification-form-section'

// Entity types that have members
type EntityType = 'investor' | 'partner' | 'introducer' | 'lawyer' | 'arranger' | 'commercial_partner'

// Member roles
const MEMBER_ROLES = [
  { value: 'director', label: 'Director' },
  { value: 'ubo', label: 'Ultimate Beneficial Owner (UBO)' },
  { value: 'signatory', label: 'Authorized Signatory' },
  { value: 'authorized_representative', label: 'Authorized Representative' },
  { value: 'beneficiary', label: 'Beneficiary' },
] as const

// Member KYC schema
const memberKycEditSchema = z.object({
  // Member role
  role: z.enum(['director', 'ubo', 'signatory', 'authorized_representative', 'beneficiary']),

  // Personal Info
  first_name: z.string().min(1, 'First name is required').max(100),
  middle_name: z.string().max(100).optional().nullable(),
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
  is_us_citizen: z.boolean().default(false),
  is_us_taxpayer: z.boolean().default(false),
  us_taxpayer_id: z.string().optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // Identification Document
  id_type: z.string().optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // UBO-specific
  ownership_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
})

type MemberKycEditForm = z.infer<typeof memberKycEditSchema>

interface MemberKYCEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: EntityType
  entityId: string
  memberId?: string // Null for new member
  memberName?: string
  initialData?: Partial<MemberKycEditForm>
  apiEndpoint: string // e.g., '/api/admin/investors/{id}/members'
  onSuccess?: () => void
  mode?: 'create' | 'edit'
}

export function MemberKYCEditDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  memberId,
  memberName,
  initialData,
  apiEndpoint,
  onSuccess,
  mode = 'edit',
}: MemberKYCEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('role')

  const form = useForm<MemberKycEditForm>({
    resolver: zodResolver(memberKycEditSchema),
    defaultValues: {
      role: initialData?.role || 'director',
      first_name: initialData?.first_name || '',
      middle_name: initialData?.middle_name || '',
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
      ownership_percentage: initialData?.ownership_percentage || undefined,
    },
  })

  const selectedRole = form.watch('role')
  const isUBO = selectedRole === 'ubo'

  const handleSubmit = async (data: MemberKycEditForm) => {
    setIsSaving(true)
    try {
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const url = mode === 'create' ? apiEndpoint : `${apiEndpoint}/${memberId}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          member_id: memberId,
          ...data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${mode} member`)
      }

      toast.success(mode === 'create' ? 'Member added successfully' : 'Member updated successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error(`Error ${mode}ing member:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} member`)
    } finally {
      setIsSaving(false)
    }
  }

  const getEntityTypeLabel = () => {
    const labels: Record<EntityType, string> = {
      investor: 'investor',
      partner: 'partner',
      introducer: 'introducer',
      lawyer: 'law firm',
      arranger: 'arranger',
      commercial_partner: 'commercial partner',
    }
    return labels[entityType]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Member' : 'Edit Member KYC'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? `Add a new member to this ${getEntityTypeLabel()}`
              : memberName
                ? `Update KYC details for ${memberName}`
                : 'Update member KYC and compliance information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="role" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Role
                </TabsTrigger>
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </TabsTrigger>
                <TabsTrigger value="tax" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tax
                </TabsTrigger>
                <TabsTrigger value="id" className="flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  ID
                </TabsTrigger>
              </TabsList>

              {/* Role Tab */}
              <TabsContent value="role" className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member Role *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MEMBER_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isUBO && (
                  <FormField
                    control={form.control}
                    name="ownership_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ownership Percentage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            placeholder="e.g., 25.5"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="mt-4">
                <PersonalInfoFormSection
                  control={form.control}
                  showHeader={false}
                />
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address" className="mt-4">
                <AddressFormSection
                  control={form.control}
                  showHeader={false}
                  prefix="residential_"
                  title="Residential Address"
                  description="Member's permanent residence address"
                />
              </TabsContent>

              {/* Tax Info Tab */}
              <TabsContent value="tax" className="mt-4">
                <TaxInfoFormSection
                  control={form.control}
                  showHeader={false}
                />
              </TabsContent>

              {/* ID Tab */}
              <TabsContent value="id" className="mt-4">
                <IdentificationFormSection
                  control={form.control}
                  showHeader={false}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === 'create' ? 'Add Member' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Export for use elsewhere
export { memberKycEditSchema, MEMBER_ROLES }
export type { MemberKycEditForm }
