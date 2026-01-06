'use client'

import { IdCard, AlertCircle, Upload } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CountrySelect } from './country-select'
import { differenceInDays } from 'date-fns'

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'residence_permit', label: 'Residence Permit' },
] as const

interface IdentificationFormSectionProps<T extends FieldValues> {
  control: Control<T>
  disabled?: boolean
  showHeader?: boolean
  showUploadButton?: boolean
  onUploadClick?: () => void
  prefix?: string
}

export function IdentificationFormSection<T extends FieldValues>({
  control,
  disabled = false,
  showHeader = true,
  showUploadButton = false,
  onUploadClick,
  prefix = '',
}: IdentificationFormSectionProps<T>) {
  // Helper to create field name with prefix
  const fieldName = (name: string): Path<T> => {
    return (prefix ? `${prefix}${name}` : name) as Path<T>
  }

  // Watch expiry date to show warning
  const idExpiryDate = useWatch({
    control,
    name: fieldName('id_expiry_date'),
  })

  // Calculate days until expiry
  const daysUntilExpiry = idExpiryDate
    ? differenceInDays(new Date(idExpiryDate), new Date())
    : null

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry > 0
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0

  const content = (
    <div className="space-y-6">
      {/* Expiry Warning */}
      {isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your ID document has expired. Please upload a valid document.
          </AlertDescription>
        </Alert>
      )}

      {isExpiringSoon && !isExpired && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Your ID document expires in {daysUntilExpiry} days. Please ensure you have a valid
            document before expiry.
          </AlertDescription>
        </Alert>
      )}

      {/* ID Type and Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={fieldName('id_type')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Document Type</FormLabel>
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ID_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('id_number')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Document number"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Issue and Expiry Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={fieldName('id_issue_date')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                  disabled={disabled}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={fieldName('id_expiry_date')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>
                Document must not be expired
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Issuing Country */}
      <FormField
        control={control}
        name={fieldName('id_issuing_country')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Issuing Country</FormLabel>
            <FormControl>
              <CountrySelect
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                placeholder="Select issuing country..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Upload Button */}
      {showUploadButton && (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onUploadClick}
            disabled={disabled}
            className="w-full md:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload ID Document
          </Button>
        </div>
      )}
    </div>
  )

  if (!showHeader) {
    return content
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IdCard className="h-5 w-5" />
          Identification Document
        </CardTitle>
        <CardDescription>
          Government-issued ID details for identity verification
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

// Export the ID types for use elsewhere
export { ID_TYPES }
