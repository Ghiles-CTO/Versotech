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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import { step10Schema, Step10Data, getStepDefaults } from '../../schemas/kyc-questionnaire-schema'
import { PenTool, CheckCircle2, User, Briefcase, Shield, FileText, TrendingUp, AlertTriangle, Calendar } from 'lucide-react'

const certificationItems = [
  {
    name: 'certifiesAccuracy',
    title: 'Accuracy Certification',
    description:
      'I certify that all information provided in this questionnaire is true, complete, and accurate to the best of my knowledge.',
  },
  {
    name: 'certifiesNoOmissions',
    title: 'No Material Omissions',
    description:
      'I certify that I have not omitted any material information that could affect the evaluation of my suitability for this investment.',
  },
  {
    name: 'agreesToUpdates',
    title: 'Update Obligation',
    description:
      'I agree to promptly notify V E R S O of any material changes to the information provided herein.',
  },
  {
    name: 'consentToProcessing',
    title: 'Data Processing Consent',
    description:
      'I consent to the collection, processing, and storage of my personal information for compliance and regulatory purposes.',
  },
] as const

function SummarySection({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: { label: string; value: string | undefined }[]
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </h4>
      <div className="grid gap-1 pl-6">
        {items
          .filter((item) => item.value)
          .map((item, idx) => (
            <div key={idx} className="text-sm">
              <span className="text-muted-foreground">{item.label}:</span>{' '}
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export function Step10ReviewSign() {
  const { getStepData, updateStepData, formData } = useWizard()
  const existingData = getStepData('step10')

  const form = useForm<Step10Data>({
    resolver: zodResolver(step10Schema),
    defaultValues: existingData || (getStepDefaults(10) as Step10Data),
  })

  const watchedValues = form.watch()
  const allCertified = certificationItems.every(
    (item) => watchedValues[item.name as keyof Step10Data] === true
  )

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step10', values as Step10Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  // Extract summary data
  const step1 = formData.step1
  const step2 = formData.step2
  const step4 = formData.step4
  const step8 = formData.step8

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <PenTool className="h-6 w-6 text-emerald-500" />
          Review & Sign
        </h2>
        <p className="text-muted-foreground mt-1">
          Final review and certification
        </p>
      </div>

      {/* Summary Section */}
      <div className="bg-muted p-6 rounded-lg space-y-6 border border-border">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Application Summary
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <SummarySection
            icon={User}
            title="Personal Information"
            items={[
              { label: 'Name', value: step1?.fullName },
              { label: 'Email', value: step1?.email },
              { label: 'Nationality', value: step1?.nationality },
              { label: 'Country', value: step1?.countryOfResidence },
            ]}
          />

          <SummarySection
            icon={Briefcase}
            title="Investment Details"
            items={[
              {
                label: 'Type',
                value:
                  step2?.investmentType === 'other'
                    ? step2?.investmentTypeOther
                    : step2?.investmentType,
              },
            ]}
          />

          <SummarySection
            icon={Shield}
            title="Compliance Status"
            items={[
              { label: 'PEP Status', value: step4?.isPEP === 'yes' ? 'Yes' : 'No' },
              { label: 'US Person', value: step4?.isUSPerson === 'yes' ? 'Yes' : 'No' },
            ]}
          />

          <SummarySection
            icon={TrendingUp}
            title="Investment Profile"
            items={[
              { label: 'Risk Tolerance', value: step8?.riskTolerance },
              { label: 'Time Horizon', value: step8?.investmentHorizon },
              { label: 'Objective', value: step8?.investmentObjective },
            ]}
          />
        </div>
      </div>

      <Separator />

      {/* Certifications */}
      <Form {...form}>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Certifications</h3>
            <div className="space-y-3">
              {certificationItems.map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name as keyof Step10Data}
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all bg-card',
                        field.value
                          ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-border hover:border-muted-foreground/50'
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
                            {item.title}
                            {field.value && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                            )}
                          </FormLabel>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Signature Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PenTool className="h-5 w-5 text-emerald-500" />
              Electronic Signature
            </h3>

            <Alert className="bg-blue-500/10 border-blue-500/30">
              <FileText className="h-4 w-4" />
              <AlertTitle>Electronic Signature Notice</AlertTitle>
              <AlertDescription>
                By typing your name below, you are providing an electronic signature that is legally
                equivalent to a handwritten signature under applicable law.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="signatureName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type your full legal name</FormLabel>
                    <FormDescription>
                      This serves as your electronic signature
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="John Smith"
                        className="font-serif text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signatureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Signature Date
                    </FormLabel>
                    <FormDescription>Today&apos;s date</FormDescription>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Signature Preview */}
            {watchedValues.signatureName && (
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">Signature Preview</p>
                <p className="font-serif text-2xl italic text-emerald-600 dark:text-emerald-400">
                  {watchedValues.signatureName}
                </p>
              </div>
            )}
          </div>
        </div>
      </Form>

      {allCertified && watchedValues.signatureName && (
        <Alert className="bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <AlertTitle>Ready to Submit</AlertTitle>
          <AlertDescription>
            All certifications completed and signature provided. Click &quot;Submit&quot; below to
            finalize your application.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
