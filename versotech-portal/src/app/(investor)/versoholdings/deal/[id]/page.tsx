import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DealParticipationForm } from '@/components/deals/deal-participation-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Package,
  Timer,
  DollarSign,
  CheckCircle2,
  Clock,
  Building2,
  Handshake,
  FileText,
  AlertTriangle,
  TrendingUp,
  Shield,
  Calculator,
  Target
} from 'lucide-react'


export default async function DealParticipationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const dealId = params.id
  
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/versoholdings/login')
  }

  // Get user profile and investor links
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'investor') {
    redirect('/versoholdings/login')
  }

  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  if (!investorLinks || investorLinks.length === 0) {
    redirect('/versoholdings/dashboard')
  }

  const investorIds = investorLinks.map(link => link.investor_id)

  // Get deal details with membership check
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type,
        currency
      ),
      deal_memberships!inner (
        role,
        accepted_at,
        investor_id
      ),
      fee_plans (
        id,
        name,
        description,
        is_default,
        fee_components (
          kind,
          calc_method,
          rate_bps,
          flat_amount,
          frequency,
          notes
        )
      )
    `)
    .eq('id', dealId)
    .or(`deal_memberships.user_id.eq.${user.id},deal_memberships.investor_id.in.(${investorIds.join(',')})`)
    .single()

  if (error || !deal) {
    redirect('/versoholdings/deals')
  }

  // Get inventory summary
  const { data: inventorySummary } = await supabase
    .rpc('fn_deal_inventory_summary', { p_deal_id: dealId })
    .single()

  // Get my existing commitment if any
  const { data: existingCommitment } = await supabase
    .from('deal_commitments')
    .select(`
      *,
      term_sheets:term_sheet_id (
        id,
        status,
        doc_id
      )
    `)
    .eq('deal_id', dealId)
    .in('investor_id', investorIds)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get my active reservation if any
  const { data: activeReservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('deal_id', dealId)
    .in('investor_id', investorIds)
    .eq('status', 'pending')
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get my allocation if any
  const { data: allocation } = await supabase
    .from('allocations')
    .select('*')
    .eq('deal_id', dealId)
    .in('investor_id', investorIds)
    .order('approved_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const membership = deal.deal_memberships[0]
  const hasAccepted = membership?.accepted_at !== null
  const myInvestorId = membership?.investor_id || investorIds[0]

  // Calculate deal progress
  const totalUnits = inventorySummary?.total_units || 0
  const availableUnits = inventorySummary?.available_units || 0
  const allocationProgress = totalUnits > 0 ? ((totalUnits - availableUnits) / totalUnits) * 100 : 0

  // Determine current step in the process
  let currentStep = 'invite'
  if (allocation) currentStep = 'allocated'
  else if (existingCommitment?.status === 'approved') currentStep = 'approved'
  else if (existingCommitment) currentStep = 'committed'
  else if (activeReservation) currentStep = 'reserved'
  else if (hasAccepted) currentStep = 'accepted'

  const isOpen = deal.status === 'open'
  const isExpired = deal.close_at && new Date(deal.close_at) < new Date()

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versoholdings/deals">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Deals
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
                <Badge className={
                  deal.status === 'open' ? 'bg-green-100 text-green-800' :
                  deal.status === 'allocation_pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {deal.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-gray-600">
                {deal.vehicles ? 
                  `${deal.vehicles.name} (${deal.vehicles.type})` : 
                  'Direct investment opportunity'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Deal Status & Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Investment Opportunity Status
            </CardTitle>
            <CardDescription>
              Track your participation in this deal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Indicators */}
              <div className="flex items-center justify-between text-sm">
                <span>Allocation Progress</span>
                <span>{allocationProgress.toFixed(1)}% allocated</span>
              </div>
              <Progress value={allocationProgress} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {availableUnits.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Units Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {deal.offer_unit_price ? 
                      `${deal.currency} ${deal.offer_unit_price.toFixed(2)}` : 
                      'TBD'
                    }
                  </div>
                  <div className="text-sm text-gray-500">Price per Unit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {deal.deal_memberships.length}
                  </div>
                  <div className="text-sm text-gray-500">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {deal.close_at ? 
                      `${Math.ceil((new Date(deal.close_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}` :
                      '∞'
                    }
                  </div>
                  <div className="text-sm text-gray-500">Days Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Based on Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Deal Participation */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Your Participation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasAccepted ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-blue-900">Deal Invitation</h4>
                          <p className="text-sm text-blue-700">
                            You've been invited to participate as: <strong>{membership.role.replace('_', ' ')}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" size="lg">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Accept Invitation to Participate
                    </Button>
                  </div>
                ) : currentStep === 'accepted' ? (
                  <DealParticipationForm
                    dealId={dealId}
                    investorId={myInvestorId}
                    feePlans={deal.fee_plans}
                    offerPrice={deal.offer_unit_price}
                    currency={deal.currency}
                    availableUnits={availableUnits}
                    isOpen={isOpen}
                  />
                ) : currentStep === 'reserved' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Timer className="h-6 w-6 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Inventory Reserved</h4>
                          <p className="text-sm text-yellow-700">
                            {activeReservation?.requested_units.toLocaleString()} units reserved until{' '}
                            {new Date(activeReservation?.expires_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" size="lg">
                      <FileText className="mr-2 h-5 w-5" />
                      Finalize Commitment & Generate Term Sheet
                    </Button>
                  </div>
                ) : currentStep === 'committed' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-blue-900">Under Review</h4>
                          <p className="text-sm text-blue-700">
                            Your commitment is being reviewed by VERSO team
                          </p>
                        </div>
                      </div>
                    </div>
                    {existingCommitment?.term_sheets && (
                      <Button className="w-full" variant="outline">
                        <FileText className="mr-2 h-5 w-5" />
                        View Term Sheet
                      </Button>
                    )}
                  </div>
                ) : currentStep === 'approved' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">Commitment Approved</h4>
                          <p className="text-sm text-green-700">
                            Ready for subscription pack signing
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" size="lg">
                      <FileText className="mr-2 h-5 w-5" />
                      Sign Subscription Pack
                    </Button>
                  </div>
                ) : currentStep === 'allocated' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">Allocation Complete</h4>
                          <p className="text-sm text-green-700">
                            {allocation?.units.toLocaleString()} units allocated at {deal.currency} {allocation?.unit_price}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <FileText className="mr-2 h-5 w-5" />
                        Download Documents
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/versoholdings/vehicle/${deal.vehicle_id}`}>
                          <Building2 className="mr-2 h-5 w-5" />
                          View in Portfolio
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deal Terms & Information */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Deal Type</div>
                      <div className="text-lg">{deal.deal_type.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Currency</div>
                      <div className="text-lg">{deal.currency}</div>
                    </div>
                    {deal.open_at && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Opens</div>
                        <div className="text-lg">{new Date(deal.open_at).toLocaleDateString()}</div>
                      </div>
                    )}
                    {deal.close_at && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Closes</div>
                        <div className="text-lg">{new Date(deal.close_at).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>

                  {deal.terms_schema && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Deal Terms</div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-gray-600">
                          {JSON.stringify(deal.terms_schema, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Deal Stats & Participants */}
          <div className="space-y-6">
            
            {/* Inventory Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Units</span>
                    <span className="font-medium">{totalUnits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available</span>
                    <span className="font-medium text-green-600">{availableUnits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reserved</span>
                    <span className="font-medium text-yellow-600">
                      {inventorySummary?.reserved_units?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Allocated</span>
                    <span className="font-medium text-blue-600">
                      {inventorySummary?.allocated_units?.toLocaleString() || 0}
                    </span>
                  </div>
                  
                  {availableUnits < totalUnits * 0.2 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Limited availability - only {availableUnits.toLocaleString()} units left
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deal Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deal.deal_memberships.map((member: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {member.role.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.accepted_at ? 'Participating' : 'Invited'}
                        </div>
                      </div>
                      {member.accepted_at ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk & Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Professional Investor Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>KYC/AML Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>BVI FSC Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>GDPR Protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deal Not Open Warning */}
        {!isOpen && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <div>
                  <h4 className="font-medium text-amber-900">
                    {isExpired ? 'Deal Closed' : 'Deal Not Open'}
                  </h4>
                  <p className="text-sm text-amber-700">
                    {isExpired 
                      ? 'This deal has closed and is no longer accepting new commitments.'
                      : 'This deal is not currently open for new commitments.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
