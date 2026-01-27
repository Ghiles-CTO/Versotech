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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useWizard } from '../WizardContext'
import {
  step8Schema,
  Step8Data,
  getStepDefaults,
  educationLevelOptions,
  employmentStatusOptions,
  incomeRangeOptions,
  netWorthRangeOptions,
  investmentObjectiveOptions,
  riskToleranceOptions,
  timeHorizonOptions,
} from '../../schemas/kyc-questionnaire-schema'
import { TrendingUp, GraduationCap, Briefcase, DollarSign, Target, Clock } from 'lucide-react'

const alternativeInvestmentOptions = [
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'venture_capital', label: 'Venture Capital' },
  { value: 'hedge_funds', label: 'Hedge Funds' },
  { value: 'real_estate', label: 'Real Estate (non-REIT)' },
  { value: 'commodities', label: 'Commodities' },
  { value: 'structured_products', label: 'Structured Products' },
  { value: 'cryptocurrency', label: 'Cryptocurrency' },
]

function RadioOptionGroup({
  field,
  options,
  columns = 2,
}: {
  field: any
  options: readonly { value: string; label: string }[]
  columns?: number
}) {
  return (
    <RadioGroup
      onValueChange={field.onChange}
      value={field.value}
      className={cn('grid gap-3 mt-2', columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
            field.value === option.value
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-border hover:border-muted-foreground/50'
          )}
        >
          <RadioGroupItem value={option.value} className="sr-only" />
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              field.value === option.value ? 'border-emerald-500' : 'border-slate-500'
            )}
          >
            {field.value === option.value && (
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  )
}

export function Step8Suitability() {
  const { getStepData, updateStepData } = useWizard()
  const existingData = getStepData('step8')

  const form = useForm<Step8Data>({
    resolver: zodResolver(step8Schema),
    defaultValues: existingData || (getStepDefaults(8) as Step8Data),
  })

  const watchedValues = form.watch()

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateStepData('step8', values as Step8Data)
    })
    return () => subscription.unsubscribe()
  }, [form, updateStepData])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Investment Suitability
        </h2>
        <p className="text-muted-foreground mt-1">Help us understand your financial profile</p>
      </div>

      <Form {...form}>
        <div className="space-y-8">
          {/* Education & Employment */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              Education & Employment
            </h3>

            <FormField
              control={form.control}
              name="educationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest level of education</FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={educationLevelOptions} columns={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment status</FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={employmentStatusOptions} columns={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchedValues.employmentStatus === 'employed' ||
              watchedValues.employmentStatus === 'self_employed') && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchedValues.employmentStatus === 'self_employed'
                          ? 'Business Name'
                          : 'Employer'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="yearsInvestingExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of investment experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="60"
                      placeholder="e.g., 10"
                      {...field}
                      className="max-w-[150px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Financial Profile */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Financial Profile
            </h3>

            <FormField
              control={form.control}
              name="annualIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual income</FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={incomeRangeOptions} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="netWorth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total net worth (excluding primary residence)</FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={netWorthRangeOptions} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="liquidNetWorth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liquid net worth (cash and readily convertible assets)</FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={netWorthRangeOptions} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Investment Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Investment Preferences
            </h3>

            <FormField
              control={form.control}
              name="investmentObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary investment objective</FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={investmentObjectiveOptions} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riskTolerance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk tolerance</FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={riskToleranceOptions} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investmentHorizon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Investment time horizon
                  </FormLabel>
                  <FormControl>
                    <RadioOptionGroup field={field} options={timeHorizonOptions} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Alternative Investment Experience */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-500" />
              Alternative Investment Experience
            </h3>

            <FormField
              control={form.control}
              name="percentageOfNetWorthToInvest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage of net worth you plan to invest in this offering</FormLabel>
                  <FormDescription>
                    Enter a percentage between 1 and 100
                  </FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-2 max-w-[150px]">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="e.g., 5"
                        {...field}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasAlternativeInvestmentExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Do you have prior experience with alternative investments?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4 mt-2"
                    >
                      {['yes', 'no'].map((value) => (
                        <label
                          key={value}
                          className={cn(
                            'px-6 py-2 rounded-lg border cursor-pointer transition-all capitalize',
                            field.value === value
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-border hover:border-muted-foreground/50'
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

            {watchedValues.hasAlternativeInvestmentExperience === 'yes' && (
              <FormField
                control={form.control}
                name="alternativeInvestmentTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Which types of alternative investments? (Select all that apply)</FormLabel>
                    <div className="grid gap-2 mt-2 md:grid-cols-2">
                      {alternativeInvestmentOptions.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                            field.value?.includes(option.value)
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-border hover:border-muted-foreground/50'
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
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </Form>
    </div>
  )
}
