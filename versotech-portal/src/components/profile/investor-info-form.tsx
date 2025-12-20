'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Save, CheckCircle2, MapPin, Phone } from 'lucide-react'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const investorInfoSchema = z.object({
  // Residential Address
  residential_street: z.string().optional(),
  residential_city: z.string().optional(),
  residential_state: z.string().optional(),
  residential_postal_code: z.string().optional(),
  residential_country: z.string().min(1, 'Country is required'),
  // Phone numbers
  phone_mobile: z.string().optional(),
  phone_office: z.string().optional(),
})

type InvestorInfoValues = z.infer<typeof investorInfoSchema>

interface InvestorInfoFormProps {
  onComplete?: () => void
}

export function InvestorInfoForm({ onComplete }: InvestorInfoFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const form = useForm<InvestorInfoValues>({
    resolver: zodResolver(investorInfoSchema),
    defaultValues: {
      residential_street: '',
      residential_city: '',
      residential_state: '',
      residential_postal_code: '',
      residential_country: '',
      phone_mobile: '',
      phone_office: '',
    },
  })

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/investors/me')
        if (response.ok) {
          const data = await response.json()
          if (data.investor) {
            form.reset({
              residential_street: data.investor.residential_street || '',
              residential_city: data.investor.residential_city || '',
              residential_state: data.investor.residential_state || '',
              residential_postal_code: data.investor.residential_postal_code || '',
              residential_country: data.investor.residential_country || '',
              phone_mobile: data.investor.phone_mobile || '',
              phone_office: data.investor.phone_office || '',
            })
            if (data.investor.updated_at) {
              setLastSaved(new Date(data.investor.updated_at))
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
      const response = await fetch('/api/investors/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save information')
      }

      setLastSaved(new Date())
      toast.success('Information saved successfully')
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Contact Information
        </CardTitle>
        <CardDescription>
          Provide your residential address and contact numbers for verification purposes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Residential Address Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Residential Address
              </h3>
              <Separator />

              <FormField
                control={form.control}
                name="residential_street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street, Apt 4B" {...field} />
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
                        <Input placeholder="New York" {...field} />
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
                        <Input placeholder="NY" {...field} />
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
                        <Input placeholder="10001" {...field} />
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
                      <FormLabel>Country <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Phone Numbers Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Numbers
              </h3>
              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Primary contact number
                      </FormDescription>
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
                          type="tel"
                          placeholder="+1 (555) 987-6543"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Business contact number (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {lastSaved && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Information
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
