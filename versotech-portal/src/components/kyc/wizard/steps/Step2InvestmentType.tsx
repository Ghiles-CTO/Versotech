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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import {
  step2Schema,
  Step2Data,
  investmentTypeOptions,
  getStepDefaults,
} from '../../schemas/kyc-questionnaire-schema'
import { User, Users, Building2, Briefcase, HelpCircle, Landmark } from 'lucide-react'

const icons: Record<string, React.ReactNode> = {
  individual: <User className="h-5 w-5" />,
  joint: <Users className="h-5 w-5" />,
  trust: <Landmark className="h-5 w-5" />,
  corporation: <Building2 className="h-5 w-5" />,
  partnership: <Briefcase className="h-5 w-5" />,
  other: <HelpCircle className="h-5 w-5" />,
}

export function Step2InvestmentType() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step2')

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: existingData || (getStepDefaults(2) as Step2Data),
  })

  const selectedType = form.watch('investmentType')

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step2', values as Step2Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">How will you be investing?</h2>
        <p className="text-muted-foreground mt-1">
          Select the type of investment account
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="investmentType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {investmentTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                          field.value === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        )}
                      >
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            field.value === option.value
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          {icons[option.value]}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedType === 'other' && (
            <FormField
              control={form.control}
              name="investmentTypeOther"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please specify</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe your investment type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </Form>
    </div>
  )
}
