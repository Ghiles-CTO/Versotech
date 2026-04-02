'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export { COUNTRIES, getCountryName, getCountryCode } from '@/lib/countries'
export type { CountryCode } from '@/lib/countries'

interface CountrySelectProps {
  value: string | null | undefined
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select country...',
  disabled = false,
  required = false,
  className,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCountry = COUNTRIES.find(
    (c) => c.code === value || c.name.toLowerCase() === value?.toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-required={required}
          disabled={disabled}
          className={cn('w-full h-11 justify-between font-normal', className)}
        >
          {selectedCountry ? selectedCountry.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.code)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedCountry?.code === country.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {country.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Nationality is often the same as country, but this provides a clearer label
export function NationalitySelect(props: CountrySelectProps) {
  return <CountrySelect {...props} placeholder={props.placeholder || 'Select nationality...'} />
}
