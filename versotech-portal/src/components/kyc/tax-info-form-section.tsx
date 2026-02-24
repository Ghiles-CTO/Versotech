'use client'

import { FileText, AlertTriangle } from 'lucide-react'
import { Control, FieldValues, Path, useWatch } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CountrySelect } from './country-select'

interface TaxInfoFormSectionProps<T extends FieldValues> {
  control: Control<T>
  disabled?: boolean
  showHeader?: boolean
  prefix?: string // For nested form fields
}

export function TaxInfoFormSection<T extends FieldValues>({
  control,
  disabled = false,
  showHeader = true,
  prefix = '',
}: TaxInfoFormSectionProps<T>) {
  // Helper to create field name with prefix
  const fieldName = (name: string): Path<T> => {
    return (prefix ? `${prefix}${name}` : name) as Path<T>
  }

  // Watch US citizen and US taxpayer fields to show conditional fields
  const isUSCitizen = useWatch({
    control,
    name: fieldName('is_us_citizen'),
  })

  const isUSTaxpayer = useWatch({
    control,
    name: fieldName('is_us_taxpayer'),
  })

  const showUSFields = isUSCitizen || isUSTaxpayer

  const content = (
    <div className="space-y-6">
      {/* US Status Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name={fieldName('is_us_citizen')}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>US Citizen</FormLabel>
                  <FormDescription>
                    Are you a citizen or national of the United States?
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={fieldName('is_us_taxpayer')}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>US Tax Person</FormLabel>
                  <FormDescription>
                    Are you subject to US tax (e.g., green card holder, substantial presence)?
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Conditional US Taxpayer ID Field */}
        {showUSFields && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              As a US person, you must provide your US Taxpayer Identification Number (TIN/SSN) for
              FATCA compliance.
            </AlertDescription>
          </Alert>
        )}

        {showUSFields && (
          <FormField
            control={control}
            name={fieldName('us_taxpayer_id')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>US Taxpayer ID (SSN/TIN) <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="XXX-XX-XXXX or XX-XXXXXXX"
                    disabled={disabled}
                    maxLength={11}
                  />
                </FormControl>
                <FormDescription>
                  Enter your Social Security Number (SSN) or Tax Identification Number (TIN)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Tax Residency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={fieldName('country_of_tax_residency')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Tax Residency <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  required
                  placeholder="Select tax residency country..."
                />
              </FormControl>
              <FormDescription>
                Your primary country of tax residency
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('tax_id_number')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Tax identification number"
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>
                Local tax identification number (non-US)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )

  if (!showHeader) {
    return content
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Tax Information
        </CardTitle>
        <CardDescription>
          Tax residency and US person status for regulatory compliance (FATCA/CRS)
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
