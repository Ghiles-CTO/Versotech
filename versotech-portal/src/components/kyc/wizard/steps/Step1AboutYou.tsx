'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useWizard } from '../WizardContext'
import { step1Schema, Step1Data, getStepDefaults } from '../../schemas/kyc-questionnaire-schema'

export function Step1AboutYou() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step1')

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: existingData || (getStepDefaults(1) as Step1Data),
  })

  // Sync form changes to wizard context
  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step1', values as Step1Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground mt-1">
          We need some basic information to get started
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Name & DOB */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Legal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nationality & Residence */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. British" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="countryOfResidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Residence</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. United Kingdom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address */}
          <FormField
            control={form.control}
            name="residentialAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residential Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="London" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SW1A 1AA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+44 20 1234 5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tax Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="taxResidencyCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Residency Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. United Kingdom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxIdNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="National Insurance / SSN / TIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </div>
  )
}
