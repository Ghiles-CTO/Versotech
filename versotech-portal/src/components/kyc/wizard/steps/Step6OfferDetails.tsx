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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import { step6Schema, Step6Data, getStepDefaults } from '../../schemas/kyc-questionnaire-schema'
import { FileText, CheckCircle2, DollarSign, Briefcase, Building2, HelpCircle } from 'lucide-react'

const accreditationOptions = [
  { value: 'income', label: 'Annual income over $200K (or $300K joint)', icon: DollarSign },
  { value: 'net_worth', label: 'Net worth over $1M (excluding primary residence)', icon: Building2 },
  { value: 'professional', label: 'Licensed professional (Series 7, 65, or 82)', icon: Briefcase },
  { value: 'entity', label: 'Entity with $5M+ in assets', icon: Building2 },
  { value: 'other', label: 'Other qualifying criteria', icon: HelpCircle },
] as const

function YesNoQuestion({
  control,
  name,
  label,
  description,
}: {
  control: any
  name: string
  label: string
  description?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <FormLabel className="text-base font-medium">{label}</FormLabel>
              {description && (
                <FormDescription className="mt-1">{description}</FormDescription>
              )}
            </div>
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
                      'px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all capitalize',
                      field.value === value
                        ? value === 'yes'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    )}
                  >
                    <RadioGroupItem value={value} className="sr-only" />
                    {value}
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function Step6OfferDetails() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step6')

  const form = useForm<Step6Data>({
    resolver: zodResolver(step6Schema),
    defaultValues: existingData || (getStepDefaults(6) as Step6Data),
  })

  const watchedValues = form.watch()

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step6', values as Step6Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          Offer Details
        </h2>
        <p className="text-muted-foreground mt-1">
          Accreditation and offering acknowledgments
        </p>
      </div>

      <Alert className="bg-blue-500/10 border-blue-500/30">
        <FileText className="h-4 w-4" />
        <AlertTitle>US Investor Requirements</AlertTitle>
        <AlertDescription>
          Under Regulation D, we need to verify your accredited investor status before you can participate in this offering.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="space-y-6">
          <YesNoQuestion
            control={form.control}
            name="isAccreditedInvestor"
            label="Are you an accredited investor?"
            description="Under SEC Regulation D, accredited investors meet specific income or net worth thresholds"
          />

          {watchedValues.isAccreditedInvestor === 'yes' && (
            <FormField
              control={form.control}
              name="accreditationBasis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>On what basis do you qualify?</FormLabel>
                  <FormDescription>
                    Select the criteria that best describes your accredited investor status
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-3 mt-3"
                    >
                      {accreditationOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                              field.value === option.value
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-slate-700 hover:border-slate-600'
                            )}
                          >
                            <RadioGroupItem value={option.value} className="sr-only" />
                            <div
                              className={cn(
                                'p-2 rounded-lg',
                                field.value === option.value
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{option.label}</span>
                            {field.value === option.value && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />
                            )}
                          </label>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <YesNoQuestion
            control={form.control}
            name="hasReceivedOfferingMaterials"
            label="Have you received and reviewed the offering materials?"
            description="Including the Private Placement Memorandum (PPM) and related documents"
          />

          <YesNoQuestion
            control={form.control}
            name="understandsRestrictions"
            label="Do you understand the restrictions on transfer and resale?"
            description="Securities offered under Regulation D cannot be freely resold and are subject to holding periods"
          />

          {watchedValues.hasReceivedOfferingMaterials === 'yes' &&
            watchedValues.understandsRestrictions === 'yes' && (
              <Alert className="bg-emerald-500/10 border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription>
                  Great! You've confirmed receipt of materials and understanding of restrictions.
                </AlertDescription>
              </Alert>
            )}
        </div>
      </Form>
    </div>
  )
}
