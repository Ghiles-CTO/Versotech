import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  DollarSign,
  Percent,
  TrendingUp,
  Calculator,
  Settings,
  Users,
  Calendar,
  Target,
  PieChart,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock data - in production this would come from the database
const feePlans = [
  {
    id: '1',
    name: 'Standard Investor Plan',
    description: 'Default fee structure for individual investors',
    deal_name: 'Tech Growth Opportunity',
    is_default: true,
    created_at: '2024-01-15',
    components: [
      { kind: 'subscription', calc_method: 'percent_of_investment', rate_bps: 200, frequency: 'one_time' },
      { kind: 'management', calc_method: 'percent_per_annum', rate_bps: 200, frequency: 'annual' },
      { kind: 'performance', calc_method: 'percent_of_profit', rate_bps: 2000, frequency: 'on_exit', hurdle_rate_bps: 800 }
    ]
  },
  {
    id: '2',
    name: 'Institutional Premium',
    description: 'Reduced fees for large institutional commitments',
    deal_name: 'Real Estate Secondary',
    is_default: false,
    created_at: '2024-02-20',
    components: [
      { kind: 'subscription', calc_method: 'percent_of_investment', rate_bps: 150, frequency: 'one_time' },
      { kind: 'management', calc_method: 'percent_per_annum', rate_bps: 150, frequency: 'annual' },
      { kind: 'performance', calc_method: 'percent_of_profit', rate_bps: 1500, frequency: 'on_exit', hurdle_rate_bps: 600 }
    ]
  },
  {
    id: '3',
    name: 'Credit Trade Finance',
    description: 'Special fee structure for credit opportunities',
    deal_name: 'Credit Trade Finance',
    is_default: true,
    created_at: '2024-03-01',
    components: [
      { kind: 'subscription', calc_method: 'percent_of_investment', rate_bps: 100, frequency: 'one_time' },
      { kind: 'spread_markup', calc_method: 'per_unit_spread', rate_bps: 300, frequency: 'one_time' },
      { kind: 'management', calc_method: 'percent_per_annum', rate_bps: 100, frequency: 'quarterly' }
    ]
  }
]

const investorTerms = [
  {
    id: '1',
    investor_name: 'Goldman Sachs Private Wealth',
    deal_name: 'Tech Growth Opportunity',
    selected_plan: 'Institutional Premium',
    overrides: {
      performance_rate: 1200,
      management_rate: 100
    },
    status: 'active',
    created_at: '2024-03-05'
  },
  {
    id: '2',
    investor_name: 'Family Office Network',
    deal_name: 'Real Estate Secondary',
    selected_plan: 'Standard Investor Plan',
    overrides: null,
    status: 'active',
    created_at: '2024-03-08'
  }
]

const feeEvents = [
  {
    id: '1',
    investor_name: 'Goldman Sachs Private Wealth',
    deal_name: 'Tech Growth Opportunity',
    fee_type: 'subscription',
    event_date: '2024-03-10',
    base_amount: 100000.00,
    computed_amount: 1500.00,
    status: 'invoiced'
  },
  {
    id: '2',
    investor_name: 'Family Office Network',
    deal_name: 'Real Estate Secondary',
    fee_type: 'management',
    event_date: '2024-03-01',
    base_amount: 250000.00,
    computed_amount: 1250.00,
    status: 'accrued'
  }
]

export default async function FeesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/versotech/login')
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600 mt-1">
              Configure fee plans, manage investor-specific terms, and track fee events
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Fee Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Fee Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan_name">Plan Name</Label>
                    <Input id="plan_name" placeholder="e.g. Premium Institutional" />
                  </div>
                  <div>
                    <Label htmlFor="deal">Associated Deal</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech-growth">Tech Growth Opportunity</SelectItem>
                        <SelectItem value="real-estate">Real Estate Secondary</SelectItem>
                        <SelectItem value="credit">Credit Trade Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Brief description of this fee plan" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="default_plan" />
                  <Label htmlFor="default_plan">Set as default plan for this deal</Label>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Fee Components</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="subscription">Subscription</SelectItem>
                            <SelectItem value="management">Management</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="spread_markup">Spread</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Rate (bps)</Label>
                        <Input type="number" placeholder="200" />
                      </div>
                      <div>
                        <Label>Method</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent_of_investment">% of Investment</SelectItem>
                            <SelectItem value="percent_per_annum">% per Annum</SelectItem>
                            <SelectItem value="percent_of_profit">% of Profit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Frequency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one_time">One Time</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="on_exit">On Exit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Component
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Plan</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Active Fee Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feePlans.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                {feePlans.filter(p => p.is_default).length} default
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Investor Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investorTerms.length}</div>
              <div className="text-sm text-gray-500 mt-1">Active configurations</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Fee Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feeEvents.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                {feeEvents.filter(e => e.status === 'accrued').length} pending
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Accrued
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${feeEvents.reduce((sum, e) => sum + e.computed_amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">This period</div>
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
                  {feePlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <div className="text-sm text-gray-600">{plan.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {plan.deal_name} • Created {new Date(plan.created_at).toLocaleDateString()}
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
                        {plan.components.map((component, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {component.kind === 'subscription' && <Target className="h-4 w-4 text-blue-600" />}
                              {component.kind === 'management' && <Calendar className="h-4 w-4 text-green-600" />}
                              {component.kind === 'performance' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                              {component.kind === 'spread_markup' && <BarChart3 className="h-4 w-4 text-orange-600" />}
                              <span className="font-medium capitalize">{component.kind.replace('_', ' ')}</span>
                            </div>
                            <div className="text-sm">
                              <div>{component.rate_bps} bps</div>
                              <div className="text-gray-600">{component.calc_method.replace('_', ' ')}</div>
                              <div className="text-gray-500">{component.frequency.replace('_', ' ')}</div>
                              {component.hurdle_rate_bps && (
                                <div className="text-gray-500">Hurdle: {component.hurdle_rate_bps} bps</div>
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
                  {investorTerms.map((terms) => (
                    <div key={terms.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{terms.investor_name}</h3>
                          <div className="text-sm text-gray-600">{terms.deal_name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Plan: {terms.selected_plan} • {new Date(terms.created_at).toLocaleDateString()}
                          </div>
                          {terms.overrides && (
                            <div className="flex gap-4 mt-2">
                              {Object.entries(terms.overrides).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key.replace('_', ' ')}: {value} bps
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={terms.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
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
                  {feeEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            event.status === 'invoiced' ? 'bg-green-500' :
                            event.status === 'accrued' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-medium">{event.investor_name}</h3>
                            <div className="text-sm text-gray-600">{event.deal_name}</div>
                            <div className="text-sm text-gray-500">
                              {event.fee_type.charAt(0).toUpperCase() + event.fee_type.slice(1)} fee • {event.event_date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${event.computed_amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">
                            on ${event.base_amount.toLocaleString()}
                          </div>
                          <Badge className={
                            event.status === 'invoiced' ? 'bg-green-100 text-green-800' :
                            event.status === 'accrued' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
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
                          {feePlans.map(plan => (
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
                      <div className="flex justify-between text-sm text-gray-600">
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
    </AppLayout>
  )
}