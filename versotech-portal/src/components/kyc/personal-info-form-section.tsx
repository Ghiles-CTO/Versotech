'use client'

import * as React from 'react'
import { User } from 'lucide-react'
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
import { CountrySelect, NationalitySelect } from './country-select'

// Clamp date input year to 4 digits max
function clampDateYear(e: React.FormEvent<HTMLInputElement>) {
  const input = e.currentTarget
  if (input.value && input.value.length > 10) {
    input.value = input.value.slice(0, 10)
  }
}

interface PersonalInfoFormSectionProps<T extends FieldValues> {
  control: Control<T>
  disabled?: boolean
  showHeader?: boolean
  prefix?: string // For nested form fields like "member."
}

export function PersonalInfoFormSection<T extends FieldValues>({
  control,
  disabled = false,
  showHeader = true,
  prefix = '',
}: PersonalInfoFormSectionProps<T>) {
  // Helper to create field name with prefix
  const fieldName = (name: string): Path<T> => {
    return (prefix ? `${prefix}${name}` : name) as Path<T>
  }

  const content = (
    <div className="space-y-3">
      {/* Name Row 1: First + Last */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={fieldName('first_name')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="John"
                  disabled={disabled}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('last_name')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Smith"
                  disabled={disabled}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Name Row 2: Middle + M.I. + Suffix */}
      <div className="grid grid-cols-3 md:grid-cols-[2fr_1fr_1fr] gap-4">
        <FormField
          control={control}
          name={fieldName('middle_name')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="William"
                  disabled={disabled}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('middle_initial')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>M.I.</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="W"
                  maxLength={5}
                  disabled={disabled}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('name_suffix')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suffix</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Jr., III"
                  disabled={disabled}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Birth Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
        <FormField
          control={control}
          name={fieldName('date_of_birth')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                  disabled={disabled}
                  className="h-10"
                  onInput={clampDateYear}
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('country_of_birth')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Birth *</FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('nationality')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality *</FormLabel>
              <FormControl>
                <NationalitySelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
        <FormField
          control={control}
          name={fieldName('email')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  value={field.value || ''}
                  placeholder="john@example.com"
                  disabled={disabled}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('phone_mobile')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Phone *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  value={field.value || ''}
                  placeholder="+1 (555) 123-4567"
                  disabled={disabled}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('phone_office')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  value={field.value || ''}
                  placeholder="+1 (555) 987-6543"
                  disabled={disabled}
                  className="h-10"
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
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Basic personal details required for KYC compliance
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
