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
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, User, MapPin, FileText, IdCard } from 'lucide-react'

// Import KYC form sections
import { PersonalInfoFormSection } from '@/components/kyc/personal-info-form-section'
import { AddressFormSection } from '@/components/kyc/address-form-section'
import { TaxInfoFormSection } from '@/components/kyc/tax-info-form-section'
import { IdentificationFormSection } from '@/components/kyc/identification-form-section'

// Entity types supported
type EntityType = 'investor' | 'partner' | 'introducer' | 'lawyer' | 'arranger' | 'commercial_partner'

// Individual KYC schema for editing
const individualKycEditSchema = z.object({
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
})

type IndividualKycEditForm = z.infer<typeof individualKycEditSchema>

interface EntityKYCEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: EntityType
  entityId: string
  entityName?: string
  initialData?: Partial<IndividualKycEditForm>
  apiEndpoint: string // e.g., '/api/investors/me/kyc'
  onSuccess?: () => void
  // Control which sections to show
  showPersonalInfo?: boolean
  showAddress?: boolean
  showTaxInfo?: boolean
  showIdentification?: boolean
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
  showIdentification = true,
}: EntityKYCEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')

  const form = useForm<IndividualKycEditForm>({
    resolver: zodResolver(individualKycEditSchema),
    defaultValues: {
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
    },
  })

  const handleSubmit = async (data: IndividualKycEditForm) => {
    setIsSaving(true)
    try {
      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          ...data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save KYC data')
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

  // Build tabs based on what sections are shown
  const tabs = []
  if (showPersonalInfo) tabs.push({ id: 'personal', label: 'Personal', icon: User })
  if (showAddress) tabs.push({ id: 'address', label: 'Address', icon: MapPin })
  if (showTaxInfo) tabs.push({ id: 'tax', label: 'Tax Info', icon: FileText })
  if (showIdentification) tabs.push({ id: 'id', label: 'ID Document', icon: IdCard })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {getEntityTypeLabel()} KYC Information
          </DialogTitle>
          <DialogDescription>
            {entityName
              ? `Update KYC details for ${entityName}`
              : 'Update your KYC and compliance information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {showPersonalInfo && (
                <TabsContent value="personal" className="mt-4">
                  <PersonalInfoFormSection
                    control={form.control}
                    showHeader={false}
                  />
                </TabsContent>
              )}

              {showAddress && (
                <TabsContent value="address" className="mt-4">
                  <AddressFormSection
                    control={form.control}
                    showHeader={false}
                    prefix="residential_"
                    title="Residential Address"
                    description="Your permanent residence address"
                  />
                </TabsContent>
              )}

              {showTaxInfo && (
                <TabsContent value="tax" className="mt-4">
                  <TaxInfoFormSection
                    control={form.control}
                    showHeader={false}
                  />
                </TabsContent>
              )}

              {showIdentification && (
                <TabsContent value="id" className="mt-4">
                  <IdentificationFormSection
                    control={form.control}
                    showHeader={false}
                  />
                </TabsContent>
              )}
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
