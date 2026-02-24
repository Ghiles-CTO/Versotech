'use client'

import * as React from 'react'
import PhoneInputPrimitive, {
  type Country,
  type Value,
  getCountryCallingCode,
} from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

// Re-export for validation in schemas
export { isValidPhoneNumber } from 'react-phone-number-input'
export type { Value as PhoneValue }

interface PhoneInputProps {
  value?: string | null
  onChange?: (value: string | undefined) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  defaultCountry?: Country
  name?: string
}

const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder = '+33 6 12 34 56 78',
      disabled = false,
      className,
      defaultCountry = 'FR',
      name,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('phone-input-wrapper', className)}>
        <PhoneInputPrimitive
          international
          countryCallingCodeEditable={false}
          defaultCountry={defaultCountry}
          value={(value as Value) || ''}
          onChange={(val) => onChange?.(val || undefined)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          flags={flags}
          countrySelectComponent={CountrySelectButton}
          inputComponent={PhoneNumberInput}
          name={name}
        />
      </div>
    )
  }
)
PhoneInput.displayName = 'PhoneInput'

// Custom country select button styled to match shadcn
const CountrySelectButton = React.forwardRef<
  HTMLButtonElement,
  {
    value?: Country
    onChange?: (value: Country) => void
    options?: { value?: Country; label: string; divider?: boolean }[]
    disabled?: boolean
    iconComponent?: React.ComponentType<{ country: Country; label: string }>
  }
>(({ value, onChange, options, disabled, iconComponent: Icon, ...rest }, ref) => {
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value as Country)
    },
    [onChange]
  )

  return (
    <div className="relative inline-flex items-center self-stretch shrink-0">
      <div className="flex items-center gap-1 px-2 pointer-events-none">
        {Icon && value && <Icon country={value} label={value} />}
        <span className="text-xs text-muted-foreground font-medium">
          +{value ? getCountryCallingCode(value) : ''}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60" />
      </div>
      <select
        ref={ref as React.Ref<HTMLSelectElement>}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Select country"
        {...rest}
      >
        {options
          ?.filter((o) => o.value)
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} (+{option.value ? getCountryCallingCode(option.value) : ''})
            </option>
          ))}
      </select>
    </div>
  )
})
CountrySelectButton.displayName = 'CountrySelectButton'

// Custom input styled to match the existing shadcn Input component exactly
const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      type="tel"
      className={cn(
        'flex-1 min-w-0 bg-transparent outline-none text-base md:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed',
        props.className
      )}
    />
  )
})
PhoneNumberInput.displayName = 'PhoneNumberInput'

export { PhoneInput }
