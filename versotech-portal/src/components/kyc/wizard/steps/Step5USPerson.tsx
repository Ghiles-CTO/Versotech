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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import { step5Schema, Step5Data, getStepDefaults } from '../../schemas/kyc-questionnaire-schema'
import { Flag, Info } from 'lucide-react'

function YesNoQuestion({
  control,
  name,
  label,
}: {
  control: any
  name: string
  label: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-4 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <FormLabel className="flex-1 cursor-pointer font-normal">
            {label}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex gap-2"
            >
              {['yes', 'no'].map((value) => (
                <label
                  key={value}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm font-medium cursor-pointer transition-all capitalize',
                    field.value === value
                      ? value === 'yes'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  <RadioGroupItem value={value} className="sr-only" />
                  {value}
                </label>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function Step5USPerson() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step5')

  const form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: existingData || (getStepDefaults(5) as Step5Data),
  })

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step5', values as Step5Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Flag className="h-6 w-6" />
          US Person Definition
        </h2>
        <p className="text-muted-foreground mt-1">
          Detailed US tax residency questions
        </p>
      </div>

      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Info className="h-4 w-4" />
        <AlertTitle>Why we ask these questions</AlertTitle>
        <AlertDescription>
          Under Regulation S and FATCA, we need to determine your US Person status for tax and regulatory compliance purposes.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="space-y-3">
          <YesNoQuestion
            control={form.control}
            name="isUSCitizen"
            label="Are you a US citizen?"
          />

          <YesNoQuestion
            control={form.control}
            name="isUSResident"
            label="Are you a US resident alien (permanent resident)?"
          />

          <YesNoQuestion
            control={form.control}
            name="hasUSGreenCard"
            label="Do you hold a US Green Card?"
          />

          <YesNoQuestion
            control={form.control}
            name="hasSubstantialUSPresence"
            label="Have you spent 183+ days in the US in the past 3 years?"
          />

          <YesNoQuestion
            control={form.control}
            name="hasUSMailingAddress"
            label="Do you have a US mailing address?"
          />

          <YesNoQuestion
            control={form.control}
            name="hasUSPhoneNumber"
            label="Do you have a US phone number?"
          />

          <YesNoQuestion
            control={form.control}
            name="hasUSBankAccount"
            label="Do you have a US bank account?"
          />

          <YesNoQuestion
            control={form.control}
            name="hasUSPowerOfAttorney"
            label="Have you granted power of attorney to someone in the US?"
          />

          <FormField
            control={form.control}
            name="usConnectionDetails"
            render={({ field }) => (
              <FormItem className="pt-4">
                <FormLabel>Additional US Connection Details (Optional)</FormLabel>
                <FormDescription>
                  Provide any additional context about your US connections
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Any other relevant information about your US connections..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  )
}
