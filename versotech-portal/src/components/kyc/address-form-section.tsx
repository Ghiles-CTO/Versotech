'use client'

import { MapPin } from 'lucide-react'
import { Control, FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CountrySelect } from './country-select'

interface AddressFormSectionProps<T extends FieldValues> {
  control: Control<T>
  disabled?: boolean
  showHeader?: boolean
  title?: string // "Residential Address" or "Registered Address"
  description?: string
  prefix?: string // "residential_" or "registered_" or custom
  showLine2?: boolean
  requireCountry?: boolean
}

export function AddressFormSection<T extends FieldValues>({
  control,
  disabled = false,
  showHeader = true,
  title = 'Residential Address',
  description = 'Permanent residence address',
  prefix = 'residential_',
  showLine2 = true,
  requireCountry = true,
}: AddressFormSectionProps<T>) {
  // Helper to create field name with prefix
  const fieldName = (name: string): Path<T> => {
    return `${prefix}${name}` as Path<T>
  }

  const content = (
    <div className="space-y-4">
      {/* Street Address Line 1 */}
      <FormField
        control={control}
        name={fieldName('street')}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Street Address <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ''}
                placeholder="123 Main Street"
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Street Address Line 2 (optional) */}
      {showLine2 && (
        <FormField
          control={control}
          name={fieldName('line_2')}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Apartment, suite, unit, etc."
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={fieldName('city')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="New York"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('state')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Province</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="NY"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={fieldName('postal_code')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal / ZIP Code <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="10001"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('country')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country {requireCountry && <span className="text-destructive">*</span>}</FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  required={requireCountry}
                />
              </FormControl>
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
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

// Convenience component for registered (company) address
export function RegisteredAddressFormSection<T extends FieldValues>(
  props: Omit<AddressFormSectionProps<T>, 'title' | 'description' | 'prefix'>
) {
  return (
    <AddressFormSection
      {...props}
      title="Registered Address"
      description="Company registered office address"
      prefix="registered_"
    />
  )
}
