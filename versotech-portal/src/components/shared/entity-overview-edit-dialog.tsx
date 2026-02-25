'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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
import { PhoneInput } from '@/components/ui/phone-input'
import { CountrySelect } from '@/components/kyc/country-select'
import { getMobilePhoneValidationError } from '@/lib/validation/phone-number'

const entityOverviewSchema = z.object({
  display_name: z.string().max(200).optional().nullable(),
  legal_name: z.string().max(200).optional().nullable(),
  country_of_incorporation: z.string().optional().nullable(),

  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  phone_mobile: z.string().max(30).optional().nullable(),
  phone_office: z.string().max(30).optional().nullable(),
  website: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),

  address: z.string().max(200).optional().nullable(),
  address_2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state_province: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  const mobileError = getMobilePhoneValidationError(data.phone_mobile, true)
  if (mobileError) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['phone_mobile'],
      message: mobileError,
    })
  }
})

type EntityOverviewForm = z.infer<typeof entityOverviewSchema>

interface EntityOverviewEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName?: string
  initialData?: Partial<EntityOverviewForm> & {
    address_line_1?: string | null
    address_line_2?: string | null
  }
  apiEndpoint: string
  onSuccess?: () => void
}

const toNullable = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function EntityOverviewEditDialog({
  open,
  onOpenChange,
  entityName,
  initialData,
  apiEndpoint,
  onSuccess,
}: EntityOverviewEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<EntityOverviewForm>({
    resolver: zodResolver(entityOverviewSchema),
    defaultValues: {
      display_name: initialData?.display_name || '',
      legal_name: initialData?.legal_name || '',
      country_of_incorporation: initialData?.country_of_incorporation || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      phone_mobile: initialData?.phone_mobile || '',
      phone_office: initialData?.phone_office || '',
      website: initialData?.website || '',
      address: initialData?.address || initialData?.address_line_1 || '',
      address_2: initialData?.address_2 || initialData?.address_line_2 || '',
      city: initialData?.city || '',
      state_province: initialData?.state_province || '',
      postal_code: initialData?.postal_code || '',
      country: initialData?.country || '',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      display_name: initialData?.display_name || '',
      legal_name: initialData?.legal_name || '',
      country_of_incorporation: initialData?.country_of_incorporation || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      phone_mobile: initialData?.phone_mobile || '',
      phone_office: initialData?.phone_office || '',
      website: initialData?.website || '',
      address: initialData?.address || initialData?.address_line_1 || '',
      address_2: initialData?.address_2 || initialData?.address_line_2 || '',
      city: initialData?.city || '',
      state_province: initialData?.state_province || '',
      postal_code: initialData?.postal_code || '',
      country: initialData?.country || '',
    })
  }, [open, initialData, form])

  const handleSubmit = async (data: EntityOverviewForm) => {
    setIsSaving(true)
    try {
      const payload = {
        display_name: toNullable(data.display_name),
        legal_name: toNullable(data.legal_name),
        country_of_incorporation: toNullable(data.country_of_incorporation),
        email: toNullable(data.email),
        phone: toNullable(data.phone),
        phone_mobile: toNullable(data.phone_mobile),
        phone_office: toNullable(data.phone_office),
        website: toNullable(data.website),
        address: toNullable(data.address),
        address_2: toNullable(data.address_2),
        city: toNullable(data.city),
        state_province: toNullable(data.state_province),
        postal_code: toNullable(data.postal_code),
        country: toNullable(data.country),
      }

      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update entity information')
      }

      toast.success('Entity overview updated')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving entity overview:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Entity Overview</DialogTitle>
          <DialogDescription>
            {entityName
              ? `Update legal details, contact information, and registered address for ${entityName}`
              : 'Update legal details, contact information, and registered address'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Entity Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Entity short name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Full legal name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country_of_incorporation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country of Incorporation</FormLabel>
                    <FormControl>
                      <CountrySelect value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" value={field.value || ''} placeholder="contact@company.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
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
                      <FormLabel>Mobile Phone <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
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
                        <PhoneInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" value={field.value || ''} placeholder="https://www.company.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-medium text-foreground">Registered Address</h3>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="123 Main Street" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Suite, Floor, Unit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="City" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state_province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="State / Province" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Postal code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <CountrySelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
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

export { entityOverviewSchema }
export type { EntityOverviewForm }
