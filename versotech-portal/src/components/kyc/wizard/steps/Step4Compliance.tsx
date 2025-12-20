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
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import { step4Schema, Step4Data, getStepDefaults } from '../../schemas/kyc-questionnaire-schema'
import { AlertTriangle, Flag } from 'lucide-react'

function YesNoField({
  control,
  name,
  label,
  description,
  detailsName,
  detailsLabel,
  showDetails,
}: {
  control: any
  name: string
  label: string
  description?: string
  detailsName?: string
  detailsLabel?: string
  showDetails?: boolean
}) {
  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <FormLabel className="text-base">{label}</FormLabel>
                {description && (
                  <FormDescription className="mt-1">{description}</FormDescription>
                )}
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
                >
                  {['yes', 'no'].map((value) => (
                    <label
                      key={value}
                      className={cn(
                        'px-4 py-2 rounded-lg border cursor-pointer transition-all capitalize',
                        field.value === value
                          ? value === 'yes'
                            ? 'border-amber-500 bg-amber-50 text-amber-600'
                            : 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
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

      {showDetails && detailsName && (
        <FormField
          control={control}
          name={detailsName}
          render={({ field }) => (
            <FormItem className="pl-4 border-l-2 border-gray-200">
              <FormLabel>{detailsLabel || 'Please provide details'}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide relevant details..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

export function Step4Compliance() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step4')

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: existingData || (getStepDefaults(4) as Step4Data),
  })

  const watchedValues = form.watch()

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step4', values as Step4Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Compliance Declarations</h2>
        <p className="text-muted-foreground mt-1">
          Required regulatory questions
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-8">
          {/* PEP Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Political Exposure
            </h3>

            <YesNoField
              control={form.control}
              name="isPEP"
              label="Are you a Politically Exposed Person (PEP)?"
              description="A PEP is someone entrusted with a prominent public function"
              detailsName="pepDetails"
              detailsLabel="Please provide details about your role"
              showDetails={watchedValues.isPEP === 'yes'}
            />

            <YesNoField
              control={form.control}
              name="isRelatedToPEP"
              label="Are you related to or closely associated with a PEP?"
              detailsName="relatedPEPDetails"
              detailsLabel="Please describe the relationship"
              showDetails={watchedValues.isRelatedToPEP === 'yes'}
            />
          </div>

          <Separator />

          {/* Sanctions & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Legal & Regulatory Status</h3>

            <YesNoField
              control={form.control}
              name="isSanctioned"
              label="Are you subject to any sanctions or restrictions?"
              detailsName="sanctionedDetails"
              showDetails={watchedValues.isSanctioned === 'yes'}
            />

            <YesNoField
              control={form.control}
              name="hasCriminalRecord"
              label="Do you have any criminal convictions related to financial matters?"
              detailsName="criminalDetails"
              showDetails={watchedValues.hasCriminalRecord === 'yes'}
            />

            <YesNoField
              control={form.control}
              name="isUnderInvestigation"
              label="Are you currently under any regulatory investigation?"
              detailsName="investigationDetails"
              showDetails={watchedValues.isUnderInvestigation === 'yes'}
            />

            <YesNoField
              control={form.control}
              name="hasBankruptcy"
              label="Have you been declared bankrupt or insolvent?"
              detailsName="bankruptcyDetails"
              showDetails={watchedValues.hasBankruptcy === 'yes'}
            />
          </div>

          <Separator />

          {/* US Person */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Flag className="h-5 w-5" />
              US Person Status
            </h3>

            <Alert className="bg-blue-500/10 border-blue-500/30">
              <AlertDescription>
                Your answer here determines if additional US-specific compliance steps are required.
              </AlertDescription>
            </Alert>

            <YesNoField
              control={form.control}
              name="isUSPerson"
              label="Are you a US Person for tax purposes?"
              description="Includes US citizens, green card holders, and those with substantial US presence"
            />

            {watchedValues.isUSPerson === 'yes' && (
              <Alert className="bg-amber-500/10 border-amber-500/30">
                <AlertDescription>
                  Additional US compliance steps will be shown next.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Source of Funds & Wealth */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Source of Funds</h3>

            <FormField
              control={form.control}
              name="sourceOfFunds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the source of funds for this investment?</FormLabel>
                  <FormDescription>
                    Describe the origin of funds (e.g., salary, business income, inheritance)
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Savings from employment income over the past 10 years..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceOfWealth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your overall source of wealth?</FormLabel>
                  <FormDescription>
                    Describe how you accumulated your wealth
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Built and sold a technology company, professional career..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </div>
  )
}
