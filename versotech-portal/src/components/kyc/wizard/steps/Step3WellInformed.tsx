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
  FormDescription,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import {
  step3Schema,
  Step3Data,
  wellInformedBasisOptions,
  getStepDefaults,
} from '../../schemas/kyc-questionnaire-schema'
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react'

export function Step3WellInformed() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step3')

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: existingData || (getStepDefaults(3) as Step3Data),
  })

  const selectedStatus = form.watch('isWellInformed')

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step3', values as Step3Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Investor Status</h2>
        <p className="text-muted-foreground mt-1">
          Are you a well-informed or professional investor?
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="isWellInformed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you qualify as a well-informed investor?</FormLabel>
                <FormDescription>
                  A well-informed investor typically has significant investment experience,
                  a net worth exceeding €1,250,000, or is advised by a regulated professional.
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid gap-3 md:grid-cols-3 mt-4"
                  >
                    {[
                      { value: 'yes', label: 'Yes', icon: CheckCircle2, color: 'emerald' },
                      { value: 'no', label: 'No', icon: XCircle, color: 'red' },
                      { value: 'unsure', label: "I'm not sure", icon: HelpCircle, color: 'amber' },
                    ].map((option) => {
                      const Icon = option.icon
                      const isSelected = field.value === option.value
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                            isSelected
                              ? `border-${option.color}-500 bg-${option.color}-500/10`
                              : 'border-slate-700 hover:border-slate-600',
                            isSelected && option.value === 'yes' && 'border-emerald-500 bg-emerald-500/10',
                            isSelected && option.value === 'no' && 'border-red-500 bg-red-500/10',
                            isSelected && option.value === 'unsure' && 'border-amber-500 bg-amber-500/10'
                          )}
                        >
                          <RadioGroupItem value={option.value} className="sr-only" />
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              isSelected && option.value === 'yes' && 'text-emerald-500',
                              isSelected && option.value === 'no' && 'text-red-500',
                              isSelected && option.value === 'unsure' && 'text-amber-500',
                              !isSelected && 'text-slate-500'
                            )}
                          />
                          <span className="font-medium">{option.label}</span>
                        </label>
                      )
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(selectedStatus === 'yes' || selectedStatus === 'unsure') && (
            <FormField
              control={form.control}
              name="wellInformedBasis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>On what basis? (Select all that apply)</FormLabel>
                  <div className="grid gap-3 mt-3">
                    {wellInformedBasisOptions.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                          field.value?.includes(option.value)
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        )}
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const current = field.value || []
                            if (checked) {
                              field.onChange([...current, option.value])
                            } else {
                              field.onChange(current.filter((v: string) => v !== option.value))
                            }
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedStatus === 'yes' && (
            <FormField
              control={form.control}
              name="wellInformedEvidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional details (Optional)</FormLabel>
                  <FormDescription>
                    Provide any additional information supporting your investor status
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Years of experience, relevant certifications, regulated advisor details..."
                      className="min-h-[100px]"
                      {...field}
                    />
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
