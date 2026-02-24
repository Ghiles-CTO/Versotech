'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Loader2, Save, CheckCircle2, MapPin, Phone, User,
  FileText, Building, Shield, Calendar
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const investorInfoSchema = z.object({
  // Personal Info (for individuals)
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),

  // Residential Address
  residential_street: z.string().optional().nullable(),
  residential_line_2: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),

  // Phone numbers
  phone_mobile: z.string().optional().nullable(),
  phone_office: z.string().optional().nullable(),

  // US Tax compliance (FATCA)
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // ID Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other_government_id']).optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().optional().nullable(),

  // Representative info (for entity-type investors)
  representative_name: z.string().optional().nullable(),
  representative_title: z.string().optional().nullable(),
})

type InvestorInfoValues = z.infer<typeof investorInfoSchema>

interface InvestorInfoFormProps {
  onComplete?: () => void
}

export function InvestorInfoForm({ onComplete }: InvestorInfoFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [investorType, setInvestorType] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)

  const form = useForm<InvestorInfoValues>({
    resolver: zodResolver(investorInfoSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      name_suffix: '',
      date_of_birth: '',
      country_of_birth: '',
      nationality: '',
      residential_street: '',
      residential_line_2: '',
      residential_city: '',
      residential_state: '',
      residential_postal_code: '',
      residential_country: '',
      phone_mobile: '',
      phone_office: '',
      is_us_citizen: false,
      is_us_taxpayer: false,
      us_taxpayer_id: '',
      country_of_tax_residency: '',
      tax_id_number: '',
      id_type: undefined,
      id_number: '',
      id_issue_date: '',
      id_expiry_date: '',
      id_issuing_country: '',
      representative_name: '',
      representative_title: '',
    },
  })

  const watchIsUsTaxpayer = form.watch('is_us_taxpayer')

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/investors/me')
        if (response.ok) {
          const data = await response.json()
          if (data.investor) {
            const inv = data.investor
            setInvestorType(inv.type)
            setKycStatus(inv.kyc_status)
            form.reset({
              first_name: inv.first_name || '',
              middle_name: inv.middle_name || '',
              last_name: inv.last_name || '',
              name_suffix: inv.name_suffix || '',
              date_of_birth: inv.date_of_birth || '',
              country_of_birth: inv.country_of_birth || '',
              nationality: inv.nationality || '',
              residential_street: inv.residential_street || '',
              residential_line_2: inv.residential_line_2 || '',
              residential_city: inv.residential_city || '',
              residential_state: inv.residential_state || '',
              residential_postal_code: inv.residential_postal_code || '',
              residential_country: inv.residential_country || '',
              phone_mobile: inv.phone_mobile || '',
              phone_office: inv.phone_office || '',
              is_us_citizen: inv.is_us_citizen || false,
              is_us_taxpayer: inv.is_us_taxpayer || false,
              us_taxpayer_id: inv.us_taxpayer_id || '',
              country_of_tax_residency: inv.tax_residency || '',
              tax_id_number: inv.tax_id_number || '',
              id_type: inv.id_type || undefined,
              id_number: inv.id_number || '',
              id_issue_date: inv.id_issue_date || '',
              id_expiry_date: inv.id_expiry_date || '',
              id_issuing_country: inv.id_issuing_country || '',
              representative_name: inv.representative_name || '',
              representative_title: inv.representative_title || '',
            })
            if (inv.updated_at) {
              setLastSaved(new Date(inv.updated_at))
            }
          }
        }
      } catch (error) {
        console.error('Failed to load investor data', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingData()
  }, [form])

  async function onSubmit(data: InvestorInfoValues) {
    setIsSaving(true)
    try {
      // Clean up empty strings to null
      const cleanedData: Record<string, any> = {}
      for (const [key, value] of Object.entries(data)) {
        if (value === '') {
          cleanedData[key] = null
        } else {
          cleanedData[key] = value
        }
      }

      const response = await fetch('/api/investors/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || 'Failed to save information')
      }

      setLastSaved(new Date())
      toast.success('Profile updated successfully')
      onComplete?.()
    } catch (error) {
      console.error('Error saving investor info:', error)
      toast.error('Failed to save information')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const isIndividual = investorType === 'individual'
  const isEntity = investorType && investorType !== 'individual'

  return (
    <div className="space-y-6">
      {/* Read-only info badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Account Information
          </CardTitle>
          <CardDescription>
            These fields are set by V E R S O and cannot be modified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge variant="secondary" className="capitalize">
                {investorType || 'Not Set'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">KYC Status:</span>
              <Badge
                variant={kycStatus === 'approved' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {kycStatus || 'Pending'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information (for individuals) */}
          {isIndividual && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your legal name and personal details as they appear on official documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="William" {...field} value={field.value || ''} />
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} value={field.value || ''} />
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
                          <Input placeholder="Jr., III" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
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
                          <Input placeholder="United States" {...field} value={field.value || ''} />
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
                          <Input placeholder="American" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Representative Info (for entities) */}
          {isEntity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Authorized Representative
                </CardTitle>
                <CardDescription>
                  The person authorized to act on behalf of the entity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="representative_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="representative_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title / Position</FormLabel>
                        <FormControl>
                          <Input placeholder="CEO, Managing Director" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Residential Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {isEntity ? 'Registered Address' : 'Residential Address'}
              </CardTitle>
              <CardDescription>
                {isEntity
                  ? 'The registered business address of the entity.'
                  : 'Your current residential address for verification purposes.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="residential_street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residential_line_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 4B, Suite 200" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="residential_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} value={field.value || ''} />
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
                        <Input placeholder="NY" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="residential_postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal / ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} value={field.value || ''} />
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
                        <Input placeholder="United States" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Phone Numbers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Numbers
              </CardTitle>
              <CardDescription>
                Phone numbers for account verification and important communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>Primary contact number</FormDescription>
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
                      <FormDescription>Business contact (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Compliance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tax Compliance
              </CardTitle>
              <CardDescription>
                Required for regulatory compliance (FATCA/CRS).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_us_citizen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">US Citizen or Resident</FormLabel>
                        <FormDescription>
                          Are you a citizen or permanent resident of the United States?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_us_taxpayer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">US Taxpayer</FormLabel>
                        <FormDescription>
                          Are you subject to US tax reporting requirements?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchIsUsTaxpayer && (
                  <FormField
                    control={form.control}
                    name="us_taxpayer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>US Taxpayer ID (SSN/ITIN/EIN)</FormLabel>
                        <FormControl>
                          <Input placeholder="XXX-XX-XXXX" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          Social Security Number, Individual Taxpayer ID, or Employer ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country_of_tax_residency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Tax Residency</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} value={field.value || ''} />
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
                      <FormLabel>Tax ID Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Tax identification number" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>For non-US tax jurisdictions</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ID Document Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Identity Document
              </CardTitle>
              <CardDescription>
                Government-issued ID for identity verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="id_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="national_id">National ID Card</SelectItem>
                          <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                          <SelectItem value="residence_permit">Residence Permit</SelectItem>
                          <SelectItem value="other_government_id">Other Government ID</SelectItem>
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
                        <Input placeholder="AB1234567" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="id_issuing_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
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
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {lastSaved && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <Button type="submit" disabled={isSaving} size="lg">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save All Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
