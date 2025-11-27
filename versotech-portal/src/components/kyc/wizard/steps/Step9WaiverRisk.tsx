'use client'

import { useEffect, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import { step9Schema, Step9Data, getStepDefaults } from '../../schemas/kyc-questionnaire-schema'
import { AlertTriangle, CheckCircle2, Shield, Lock, FileText, DollarSign, Scale, Receipt, BookOpen, Users } from 'lucide-react'

const riskItems = [
  {
    name: 'acknowledgesIlliquidity',
    title: 'Illiquidity Risk',
    description:
      'I understand that interests in the Fund are illiquid and there is no public market for these securities. I may not be able to sell my investment or access my capital for an extended period.',
    icon: Lock,
  },
  {
    name: 'acknowledgesLossRisk',
    title: 'Capital Loss Risk',
    description:
      'I understand that investing in alternative investments involves significant risks, including the potential loss of my entire investment.',
    icon: DollarSign,
  },
  {
    name: 'acknowledgesNoGuarantees',
    title: 'No Guarantees',
    description:
      'I understand that there are no guarantees of returns or distributions, and past performance is not indicative of future results.',
    icon: AlertTriangle,
  },
  {
    name: 'acknowledgesLimitedInfo',
    title: 'Limited Information',
    description:
      'I understand that I may receive limited information about the underlying investments and that the Fund is not subject to the same disclosure requirements as public companies.',
    icon: FileText,
  },
  {
    name: 'acknowledgesNoRegulation',
    title: 'Limited Regulatory Protection',
    description:
      'I understand that alternative investment funds are generally not registered with the SEC and do not receive the same regulatory protections as registered investment companies.',
    icon: Shield,
  },
  {
    name: 'acknowledgesConflicts',
    title: 'Conflicts of Interest',
    description:
      'I understand that the Fund Manager and its affiliates may have conflicts of interest in managing the Fund, and I have reviewed the disclosure of potential conflicts.',
    icon: Users,
  },
  {
    name: 'acknowledgesTaxImplications',
    title: 'Tax Implications',
    description:
      'I understand that this investment may have complex tax implications and I should consult with my own tax advisor regarding my specific situation.',
    icon: Receipt,
  },
  {
    name: 'acknowledgesFees',
    title: 'Fees and Expenses',
    description:
      'I understand and accept the fee structure including management fees, performance fees, and other expenses that will reduce my returns.',
    icon: Scale,
  },
  {
    name: 'hasReadOfferingDocs',
    title: 'Offering Documents Review',
    description:
      'I confirm that I have received, read, and understand the Private Placement Memorandum (PPM), Limited Partnership Agreement, and other offering documents.',
    icon: BookOpen,
  },
  {
    name: 'hasSoughtIndependentAdvice',
    title: 'Independent Advice',
    description:
      'I confirm that I have had the opportunity to seek independent legal, tax, and financial advice regarding this investment.',
    icon: Scale,
  },
] as const

export function Step9WaiverRisk() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step9')

  const form = useForm<Step9Data>({
    resolver: zodResolver(step9Schema),
    defaultValues: existingData || (getStepDefaults(9) as Step9Data),
  })

  const watchedValues = form.watch()

  // Calculate progress
  const totalItems = riskItems.length
  const checkedItems = riskItems.filter(
    (item) => watchedValues[item.name as keyof Step9Data] === true
  ).length
  const progress = (checkedItems / totalItems) * 100

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step9', values as Step9Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Risk Acknowledgments
        </h2>
        <p className="text-muted-foreground mt-1">
          Please review and acknowledge each risk factor
        </p>
      </div>

      {/* Progress indicator */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Acknowledgment Progress</span>
          <span className="font-medium">
            {checkedItems} of {totalItems} completed
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Alert className="bg-amber-500/10 border-amber-500/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Please carefully read and acknowledge each item below. These acknowledgments confirm your
          understanding of the risks associated with this investment.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="space-y-3">
          {riskItems.map((item, index) => {
            const Icon = item.icon
            return (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name as keyof Step9Data}
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all bg-white',
                      field.value
                        ? 'border-emerald-500/50 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              field.value ? 'text-emerald-500' : 'text-gray-400'
                            )}
                          />
                          <span className="text-xs text-muted-foreground mr-2">
                            {index + 1}.
                          </span>
                          {item.title}
                          {field.value && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto flex-shrink-0" />
                          )}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          })}
        </div>
      </Form>

      {checkedItems === totalItems && (
        <Alert className="bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <AlertDescription>
            All risk acknowledgments completed. You may proceed to the final step to review and sign.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
