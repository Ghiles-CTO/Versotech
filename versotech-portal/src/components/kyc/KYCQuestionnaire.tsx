'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const kycFormSchema = z.object({
  jurisdiction: z.string().min(2, 'Jurisdiction is required'),
  sourceOfFunds: z.string().min(5, 'Please provide details about source of funds'),
  annualIncome: z.string().min(1, 'Annual income range is required'),
  netWorth: z.string().min(1, 'Net worth range is required'),
  occupation: z.string().min(2, 'Occupation is required'),
  employer: z.string().optional(),
  pepStatus: z.enum(['yes', 'no'], {
    message: 'Please select your PEP status',
  }),
  pepDetails: z.string().optional(),
})

type KYCFormValues = z.infer<typeof kycFormSchema>

interface KYCQuestionnaireProps {
  onComplete?: () => void
}

export function KYCQuestionnaire({ onComplete }: KYCQuestionnaireProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const form = useForm<KYCFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      jurisdiction: '',
      sourceOfFunds: '',
      annualIncome: '',
      netWorth: '',
      occupation: '',
      employer: '',
      pepStatus: 'no',
      pepDetails: '',
    },
  })

  // TODO: Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/investors/me/kyc-submissions?type=questionnaire')
        if (response.ok) {
          const data = await response.json()
          // Find the latest questionnaire submission
          const questionnaire = data.submissions?.find((s: any) => s.document_type === 'questionnaire')
          
          if (questionnaire && questionnaire.metadata) {
            form.reset(questionnaire.metadata)
            setLastSaved(new Date(questionnaire.created_at))
          }
        }
      } catch (error) {
        console.error('Failed to load KYC data', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingData()
  }, [form])

  async function onSubmit(data: KYCFormValues) {
    setIsSaving(true)
    try {
      const response = await fetch('/api/investors/me/kyc-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: 'questionnaire',
          custom_label: 'KYC Questionnaire',
          metadata: data,
          status: 'pending', // Or 'draft' if we want to allow partial saves
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save questionnaire')
      }

      setLastSaved(new Date())
      toast.success('Questionnaire saved successfully')
      onComplete?.()
    } catch (error) {
      console.error('Error saving KYC questionnaire:', error)
      toast.error('Failed to save questionnaire')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Questionnaire</CardTitle>
        <CardDescription>
          Please complete the following information required for regulatory compliance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">General Information</h3>
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="jurisdiction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Jurisdiction / Country of Residence</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. United Kingdom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="employer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Profile</h3>
              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Annual Income (USD)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-50k">$0 - $50,000</SelectItem>
                          <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                          <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                          <SelectItem value="250k-1m">$250,000 - $1,000,000</SelectItem>
                          <SelectItem value="1m+">$1,000,000+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="netWorth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Net Worth (USD)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-250k">$0 - $250,000</SelectItem>
                          <SelectItem value="250k-1m">$250,000 - $1,000,000</SelectItem>
                          <SelectItem value="1m-5m">$1,000,000 - $5,000,000</SelectItem>
                          <SelectItem value="5m-20m">$5,000,000 - $20,000,000</SelectItem>
                          <SelectItem value="20m+">$20,000,000+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sourceOfFunds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source of Funds</FormLabel>
                    <FormDescription>
                      Please describe the origin of the funds you intend to invest (e.g., salary, inheritance, business profits).
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Accumulated savings from employment as a software engineer over the last 10 years." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Regulatory Declarations</h3>
              <Separator />

              <FormField
                control={form.control}
                name="pepStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you a Politically Exposed Person (PEP)?</FormLabel>
                    <FormDescription>
                      A PEP is an individual who is or has been entrusted with a prominent public function.
                    </FormDescription>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('pepStatus') === 'yes' && (
                <FormField
                  control={form.control}
                  name="pepDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PEP Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide details about your public function or association." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {lastSaved && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Questionnaire
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
