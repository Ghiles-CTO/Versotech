import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Copy,
  DollarSign,
  TrendingUp,
  Calculator,
  Settings,
  Users,
  Calendar,
  Target,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireStaffAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

export default async function FeesPage() {
  const profile = await requireStaffAuth()
  if (!profile) {
    redirect('/versotech/login')
  }

  const supabase = await createClient()

  const { data: feePlans = [], error: feePlansError } = await supabase
    .from('fee_plans')
    .select(`
      id,
      name,
      description,
      deals:deals!fee_plans_deal_id_fkey ( name ),
      is_default,
      created_at,
      fee_components (
        id,
        kind,
        calc_method,
        rate_bps,
        frequency,
        hurdle_rate_bps
      )
    `)
    .order('created_at', { ascending: false })

  const { data: investorTerms = [], error: investorTermsError } = await supabase
    .from('investor_terms')
    .select(`
      id,
      status,
      created_at,
      justification,
      investors:investors!investor_terms_investor_id_fkey ( legal_name ),
      deals:deals!investor_terms_deal_id_fkey ( name ),
      fee_plans:fee_plans!investor_terms_selected_fee_plan_id_fkey ( name ),
      overrides
    `)
    .order('created_at', { ascending: false })

  const { data: feeEvents = [], error: feeEventsError } = await supabase
    .from('fee_events')
    .select(`
      id,
      investor_id,
      deals:deals!fee_events_deal_id_fkey ( name ),
      investors:investors!fee_events_investor_id_fkey ( legal_name ),
      fee_type,
      event_date,
      base_amount,
      computed_amount,
      status
    `)
    .order('event_date', { ascending: false })
    .limit(50)

  if (feePlansError || investorTermsError || feeEventsError) {
    console.error('Failed to load fee data', {
      feePlansError,
      investorTermsError,
      feeEventsError
    })
  }

  return (
    <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
            <p className="text-muted-foreground mt-1">
              Configure fee plans, manage investor-specific terms, and track fee events
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Fee Plan
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Active Fee Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feePlans?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {feePlans?.filter(p => p.is_default).length ?? 0} default
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Investor Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investorTerms?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Active configurations</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Fee Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feeEvents?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {feeEvents?.filter(e => e.status === 'accrued').length ?? 0} pending
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Accrued
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(feeEvents ?? []).reduce((sum, e) => sum + e.computed_amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">This period</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Fee Plans</TabsTrigger>
            <TabsTrigger value="terms">Investor Terms</TabsTrigger>
            <TabsTrigger value="events">Fee Events</TabsTrigger>
            <TabsTrigger value="calculator">Fee Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Plans</CardTitle>
                <CardDescription>
                  Manage fee plan templates for different deals and investor types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {(feePlans ?? []).map((plan) => (
                    <div key={plan.id} className="border border-gray-800 rounded-lg p-4 bg-gray-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{plan.name}</h3>
                            <div className="text-sm text-muted-foreground">{plan.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {(plan.deals as any)?.[0]?.name ?? 'Unassigned'} • Created {new Date(plan.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {plan.is_default && (
                            <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plan.fee_components?.map((component, idx) => (
                          <div key={component.id ?? idx} className="bg-black/40 border border-gray-800 rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {component.kind === 'subscription' && <Target className="h-4 w-4 text-blue-400" />}
                              {component.kind === 'management' && <Calendar className="h-4 w-4 text-green-400" />}
                              {component.kind === 'performance' && <TrendingUp className="h-4 w-4 text-purple-400" />}
                              {component.kind === 'spread_markup' && <BarChart3 className="h-4 w-4 text-orange-400" />}
                              <span className="font-medium capitalize text-foreground">{component.kind.replace('_', ' ')}</span>
                            </div>
                            <div className="text-sm">
                              <div className="text-foreground">{component.rate_bps} bps</div>
                              <div className="text-muted-foreground">{component.calc_method.replace('_', ' ')}</div>
                              <div className="text-muted-foreground">{component.frequency.replace('_', ' ')}</div>
                              {component.hurdle_rate_bps && (
                                <div className="text-muted-foreground">Hurdle: {component.hurdle_rate_bps} bps</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investor-Specific Terms</CardTitle>
                <CardDescription>
                  Custom fee arrangements and overrides for individual investors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {(investorTerms ?? []).map((terms) => (
                    <div key={terms.id} className="border border-gray-800 rounded-lg p-4 bg-gray-900/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{(terms.investors as any)?.[0]?.legal_name ?? 'Unknown investor'}</h3>
                          <div className="text-sm text-muted-foreground">{(terms.deals as any)?.[0]?.name ?? 'Unassigned deal'}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Plan: {(terms.fee_plans as any)?.[0]?.name ?? 'Custom'} • {new Date(terms.created_at).toLocaleDateString()}
                          </div>
                          {terms.overrides && Object.keys(terms.overrides).length > 0 && (
                            <div className="flex gap-4 mt-2">
                              {Object.entries(terms.overrides).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key.replace('_', ' ')}: {String(value)} bps
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={terms.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-foreground'}>
                            {terms.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Events</CardTitle>
                <CardDescription>
                  Track fee accruals, computations, and invoicing status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {(feeEvents ?? []).map((event) => (
                    <div key={event.id} className="border border-gray-800 rounded-lg p-4 bg-gray-900/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            event.status === 'invoiced' ? 'bg-green-500' :
                            event.status === 'accrued' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-medium text-foreground">{(event.investors as any)?.[0]?.legal_name ?? 'Unknown investor'}</h3>
                            <div className="text-sm text-muted-foreground">{(event.deals as any)?.[0]?.name ?? 'Unassigned deal'}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.fee_type ? event.fee_type.charAt(0).toUpperCase() + event.fee_type.slice(1) : 'Fee'} fee • {event.event_date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">${event.computed_amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            on ${event.base_amount.toLocaleString()}
                          </div>
                          <Badge className={
                            event.status === 'invoiced' ? 'bg-green-100 text-green-800' :
                            event.status === 'accrued' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-foreground'
                          }>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Calculator</CardTitle>
                <CardDescription>
                  Calculate fees for different scenarios and investment amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="investment_amount">Investment Amount</Label>
                      <Input id="investment_amount" type="number" placeholder="100000" />
                    </div>
                    <div>
                      <Label htmlFor="calc_fee_plan">Fee Plan</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {(feePlans ?? []).map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="holding_period">Holding Period (years)</Label>
                      <Input id="holding_period" type="number" placeholder="3" />
                    </div>
                    <div>
                      <Label htmlFor="exit_multiple">Expected Exit Multiple</Label>
                      <Input id="exit_multiple" type="number" step="0.1" placeholder="2.0" />
                    </div>
                    <Button className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Fees
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-4">Fee Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subscription Fee (2.0%)</span>
                        <span className="font-medium">$2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Management Fee (2.0% p.a. × 3 years)</span>
                        <span className="font-medium">$6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance Fee (20% of profit)</span>
                        <span className="font-medium">$20,000</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>Total Fees</span>
                        <span>$28,000</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Effective Fee Rate</span>
                        <span>14.0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
}