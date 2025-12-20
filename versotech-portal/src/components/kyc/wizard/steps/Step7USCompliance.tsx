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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import { step7Schema, Step7Data, getStepDefaults } from '../../schemas/kyc-questionnaire-schema'
import { FileCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'

const complianceItems = [
  {
    name: 'acknowledgesFATCA',
    title: 'FATCA Acknowledgment',
    description:
      'I acknowledge that as a US Person, I am subject to the Foreign Account Tax Compliance Act (FATCA) and may be required to provide additional documentation.',
    icon: '🏛️',
  },
  {
    name: 'willProvideW9',
    title: 'Form W-9 Requirement',
    description:
      'I agree to provide a completed Form W-9 (Request for Taxpayer Identification Number and Certification) if required.',
    icon: '📋',
  },
  {
    name: 'understandsWithholding',
    title: 'Withholding Requirements',
    description:
      'I understand that backup withholding may apply at a rate of 24% if I fail to provide a valid TIN or fail to certify my status.',
    icon: '💰',
  },
  {
    name: 'certifiesTaxCompliance',
    title: 'Tax Compliance Certification',
    description:
      'I certify that I am in compliance with my US federal and state tax obligations, or I am working with a tax advisor to resolve any outstanding issues.',
    icon: '✅',
  },
  {
    name: 'acknowledgesReportingObligations',
    title: 'Reporting Obligations',
    description:
      'I acknowledge that the fund may be required to report my investment information to the IRS and/or relevant tax authorities under FATCA and other applicable laws.',
    icon: '📊',
  },
] as const

export function Step7USCompliance() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step7')

  const form = useForm<Step7Data>({
    resolver: zodResolver(step7Schema),
    defaultValues: existingData || (getStepDefaults(7) as Step7Data),
  })

  const watchedValues = form.watch()
  const allChecked = complianceItems.every(
    (item) => watchedValues[item.name as keyof Step7Data] === true
  )

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step7', values as Step7Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileCheck className="h-6 w-6" />
          US Tax Compliance
        </h2>
        <p className="text-muted-foreground mt-1">FATCA and reporting requirements</p>
      </div>

      <Alert className="bg-amber-500/10 border-amber-500/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Tax Information</AlertTitle>
        <AlertDescription>
          As a US Person, you are subject to specific tax reporting requirements. Please review and
          acknowledge each item below.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="space-y-4">
          {complianceItems.map((item) => (
            <FormField
              key={item.name}
              control={form.control}
              name={item.name as keyof Step7Data}
              render={({ field }) => (
                <FormItem
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all',
                    field.value
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-slate-600'
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
                        <span>{item.icon}</span>
                        {item.title}
                        {field.value && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                        )}
                      </FormLabel>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </Form>

      {allChecked && (
        <Alert className="bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <AlertDescription>
            All US tax compliance acknowledgments completed. You may proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
