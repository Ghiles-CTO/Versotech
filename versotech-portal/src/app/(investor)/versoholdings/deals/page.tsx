import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReservationModal } from '@/components/deals/reservation-modal'
import { DealDetailsModal } from '@/components/deals/deal-details-modal'
import { CommitmentModal } from '@/components/deals/commitment-modal'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Building2,
  Handshake,
  FileText,
  CheckCircle2,
  CircleDollarSign,
  Users,
  AlertTriangle,
  Timer
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

interface InvestorDeal {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  created_at: string
  description?: string | null
  investment_thesis?: string | null
  minimum_investment?: number | null
  maximum_investment?: number | null
  target_amount?: number | null
  raised_amount?: number | null
  company_name?: string | null
  company_logo_url?: string | null
  sector?: string | null
  stage?: string | null
  location?: string | null
  vehicles?: {
    id: string
    name: string
    type: string
  }
  deal_memberships: Array<{
    role: string
    accepted_at: string | null
  }>
  fee_plans: Array<{
    id: string
    name: string
    description: string | null
    is_default: boolean
  }>
}

const dealTypeLabels = {
  equity_secondary: 'Secondary Equity',
  equity_primary: 'Primary Equity',
  credit_trade_finance: 'Credit & Trade Finance',
  other: 'Other'
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  allocation_pending: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusDescriptions = {
  open: 'Accepting commitments',
  allocation_pending: 'Processing allocations',
  closed: 'Deal completed',
  draft: 'In preparation',
  cancelled: 'No longer available'
}

export default async function InvestorDealsPage() {
  const supabase = await createClient()

  // Get current user - AppLayout already handles auth checks
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    throw new Error('Authentication required')
  }

  const supabaseUser = {
    id: user.id,
    email: user.email
  }

  // Get investor IDs linked to this user
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', supabaseUser.id)

  if (!investorLinks || investorLinks.length === 0) {
    return (
      <AppLayout brand="versoholdings">
        <div className="p-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investor profile found</h3>
            <p className="text-gray-500">Please contact VERSO staff to set up your investor profile.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  console.log('🔍 DEBUG: Starting deals page load for user:', supabaseUser.id)

  const investorIds = investorLinks.map(link => link.investor_id)

  // Simplified approach - get deals directly
  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type
      ),
      deal_memberships!inner (
        role,
        accepted_at
      ),
      fee_plans (
        id,
        name,
        description,
        is_default
      )
    `)
    .eq('deal_memberships.user_id', supabaseUser.id)
    .order('created_at', { ascending: false })

  console.log('🔍 DEBUG: Simplified deals query result:', {
    deals,
    error,
    dealCount: deals?.length || 0
  })

  const dealsData: InvestorDeal[] = deals || []

  // Get deal commitments for this investor
  const { data: commitments } = await supabase
    .from('deal_commitments')
    .select(`
      id,
      deal_id,
      requested_units,
      requested_amount,
      status,
      created_at
    `)
    .in('investor_id', investorIds)

  // Get reservations for this investor
  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      id,
      deal_id,
      requested_units,
      proposed_unit_price,
      status,
      expires_at,
      created_at
    `)
    .in('investor_id', investorIds)

  // Calculate summary stats
  const summary = {
    totalDeals: dealsData.length,
    activeDeals: dealsData.filter(d => d.status === 'open').length,
    pendingCommitments: commitments?.filter(c => c.status === 'submitted').length || 0,
    activeReservations: reservations?.filter(r => r.status === 'pending').length || 0
  }

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600 mt-1">
            Explore and participate in exclusive VERSO investment deals
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Deals
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalDeals}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{summary.activeDeals}</span> currently open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Commitments
              </CardTitle>
              <Timer className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingCommitments}</div>
              <p className="text-xs text-muted-foreground">
                Under review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Reservations
              </CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeReservations}</div>
              <p className="text-xs text-muted-foreground">
                Units reserved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deal Access
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Invited opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Investment Opportunities</CardTitle>
                <CardDescription>
                  Deals you've been invited to participate in
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dealsData.length === 0 ? (
              <div className="text-center py-12">
                <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals available</h3>
                <p className="text-gray-500 mb-4">
                  You haven't been invited to any deals yet. VERSO will notify you when new opportunities become available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dealsData.map((deal) => {
                  const myMembership = deal.deal_memberships[0] // Since we filtered by user
                  const hasAccepted = myMembership?.accepted_at !== null
                  const defaultFeePlan = deal.fee_plans.find(fp => fp.is_default)
                  
                  // Calculate progress percentage
                  const progressPercentage = deal.target_amount && deal.raised_amount 
                    ? Math.min((deal.raised_amount / deal.target_amount) * 100, 100)
                    : 0

                  // Calculate days until close
                  const daysUntilClose = deal.close_at 
                    ? Math.ceil((new Date(deal.close_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null

                  // Determine if deal is effectively closed (past close date or status)
                  const isEffectivelyClosed = deal.status === 'closed' || deal.status === 'cancelled' || 
                    (deal.close_at && new Date(deal.close_at) < new Date())

                  return (
                    <div key={deal.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Header with company info */}
                          <div className="flex items-start gap-4 mb-3">
                            {deal.company_logo_url ? (
                              <img 
                                src={deal.company_logo_url} 
                                alt={deal.company_name || deal.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {deal.company_name || deal.name}
                                </h3>
                                <Badge className={
                                  isEffectivelyClosed 
                                    ? 'bg-red-100 text-red-800' 
                                    : statusColors[deal.status as keyof typeof statusColors]
                                }>
                                  {isEffectivelyClosed 
                                    ? 'Closed' 
                                    : statusDescriptions[deal.status as keyof typeof statusDescriptions]
                                  }
                                </Badge>
                                <Badge variant="outline">
                                  {dealTypeLabels[deal.deal_type as keyof typeof dealTypeLabels]}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                {deal.sector && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    {deal.sector}
                                  </span>
                                )}
                                {deal.stage && (
                                  <span>{deal.stage}</span>
                                )}
                                {deal.location && (
                                  <span>{deal.location}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Deal description */}
                          {deal.description && (
                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {deal.description}
                            </p>
                          )}

                          {/* Investment details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {deal.target_amount && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700">Target Amount</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {deal.currency} {(deal.target_amount / 1000000).toFixed(1)}M
                                  </span>
                                </div>
                                {deal.raised_amount !== undefined && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                  </div>
                                )}
                                {deal.raised_amount !== undefined && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {deal.currency} {(deal.raised_amount / 1000000).toFixed(1)}M raised ({progressPercentage.toFixed(0)}%)
                                  </div>
                                )}
                              </div>
                            )}

                            {deal.minimum_investment && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-1">Minimum Investment</div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {deal.currency} {(deal.minimum_investment / 1000).toFixed(0)}K
                                </div>
                                {deal.maximum_investment && (
                                  <div className="text-xs text-gray-500">
                                    Max: {deal.currency} {(deal.maximum_investment / 1000000).toFixed(1)}M
                                  </div>
                                )}
                              </div>
                            )}

                            {deal.offer_unit_price && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-1">Unit Price</div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {deal.currency} {deal.offer_unit_price.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">per unit</div>
                              </div>
                            )}
                          </div>

                          {/* Timeline and urgency */}
                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Role: {myMembership?.role.replace('_', ' ').toLowerCase()}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {hasAccepted ? 'Accepted' : 'Invitation pending'}
                              {hasAccepted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
                              ) : (
                                <Timer className="h-4 w-4 text-amber-500 ml-1" />
                              )}
                            </div>

                            {daysUntilClose !== null && (
                              <div className={`flex items-center gap-1 ${
                                isEffectivelyClosed ? 'text-red-600' :
                                daysUntilClose <= 7 ? 'text-red-600' : 
                                daysUntilClose <= 30 ? 'text-amber-600' : 'text-gray-500'
                              }`}>
                                <AlertTriangle className="h-4 w-4" />
                                {isEffectivelyClosed ? 'Closed' : 
                                 daysUntilClose > 0 ? `${daysUntilClose} days left` : 'Closed'}
                              </div>
                            )}
                          </div>

                          {/* Fee plan info */}
                          {defaultFeePlan && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <p className="text-sm font-medium text-blue-900">Default Fee Structure</p>
                              <p className="text-sm text-blue-700">{defaultFeePlan.name}</p>
                              {defaultFeePlan.description && (
                                <p className="text-xs text-blue-600 mt-1">{defaultFeePlan.description}</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {deal.status === 'open' && hasAccepted && !isEffectivelyClosed ? (
                            <>
                              <CommitmentModal 
                                deal={deal} 
                                investorId={investorIds[0]}
                              >
                                <Button>
                                  <Handshake className="mr-2 h-4 w-4" />
                                  Submit Commitment
                                </Button>
                              </CommitmentModal>
                              
                              <ReservationModal 
                                deal={deal} 
                                investorId={investorIds[0]}
                              >
                                <Button variant="outline" size="sm">
                                  <Package className="mr-2 h-4 w-4" />
                                  Reserve Units
                                </Button>
                              </ReservationModal>
                              
                              <DealDetailsModal deal={deal} investorId={investorIds[0]}>
                                <Button variant="outline" size="sm">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </Button>
                              </DealDetailsModal>

                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/versoholdings/deals/${deal.id}/documents`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Documents
                                </Link>
                              </Button>

                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/versoholdings/deals/${deal.id}/reports`}>
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  Request Report
                                </Link>
                              </Button>
                            </>
                          ) : deal.status === 'open' && !hasAccepted && !isEffectivelyClosed ? (
                            <>
                              <Button asChild>
                                <Link href={`/versoholdings/deals/${deal.id}/accept`}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Accept Invitation
                                </Link>
                              </Button>
                              <DealDetailsModal deal={deal} investorId={investorIds[0]}>
                                <Button variant="outline" size="sm">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </Button>
                              </DealDetailsModal>
                            </>
                          ) : isEffectivelyClosed ? (
                            <div className="text-center py-4">
                              <div className="text-red-600 font-medium mb-2">Deal Closed</div>
                              <p className="text-sm text-gray-500">
                                This deal is no longer accepting commitments
                              </p>
                              <DealDetailsModal deal={deal} investorId={investorIds[0]}>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </Button>
                              </DealDetailsModal>
                            </div>
                          ) : (
                            <DealDetailsModal deal={deal} investorId={investorIds[0]}>
                              <Button variant="outline">
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </Button>
                            </DealDetailsModal>
                          )}
                        </div>
                      </div>

                      {/* Deal Timeline */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created: {new Date(deal.created_at).toLocaleDateString()}
                        </div>
                        {deal.open_at && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Opens: {new Date(deal.open_at).toLocaleDateString()}
                          </div>
                        )}
                        {deal.close_at && (
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            Closes: {new Date(deal.close_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        {dealsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ready to Invest?
              </CardTitle>
              <CardDescription>
                Get started with your first investment commitment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Review the available opportunities above and click "Participate" on any deal that interests you. 
                Our team will guide you through the commitment and allocation process.
              </p>
              <div className="flex gap-3">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Deal Guide
                </Button>
                <Button variant="outline">
                  Contact VERSO Team
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}







