import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { getUserById } from '@/lib/simple-auth'
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
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('demo_session')!
  const session = JSON.parse(sessionCookie.value)
  const user = getUserById(session.id)!

  // Map simple auth user to Supabase user format for the rest of the code
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

  const investorIds = investorLinks.map(link => link.investor_id)

  // Fetch deals where user is a member
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
    .in('deal_memberships.user_id', [supabaseUser.id])
    .or(`deal_memberships.investor_id.in.(${investorIds.join(',')})`)
    .order('created_at', { ascending: false })

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
            <CardTitle>Your Investment Opportunities</CardTitle>
            <CardDescription>
              Deals you've been invited to participate in
            </CardDescription>
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

                  return (
                    <div key={deal.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{deal.name}</h3>
                            <Badge className={statusColors[deal.status as keyof typeof statusColors]}>
                              {statusDescriptions[deal.status as keyof typeof statusDescriptions]}
                            </Badge>
                            <Badge variant="outline">
                              {dealTypeLabels[deal.deal_type as keyof typeof dealTypeLabels]}
                            </Badge>
                          </div>
                          
                          {deal.vehicles && (
                            <p className="text-gray-600 mb-2">
                              <Building2 className="inline h-4 w-4 mr-1" />
                              {deal.vehicles.name} ({deal.vehicles.type})
                            </p>
                          )}

                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Role: {myMembership?.role.replace('_', ' ').toLowerCase()}
                            </div>
                            
                            {deal.offer_unit_price && (
                              <div className="flex items-center gap-1">
                                <CircleDollarSign className="h-4 w-4" />
                                {deal.currency} {deal.offer_unit_price.toFixed(2)} per unit
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {hasAccepted ? 'Accepted' : 'Invitation pending'}
                              {hasAccepted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
                              ) : (
                                <Timer className="h-4 w-4 text-amber-500 ml-1" />
                              )}
                            </div>
                          </div>

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
                          {deal.status === 'open' && hasAccepted ? (
                            <>
                              <Button asChild>
                                <Link href={`/versoholdings/deals/${deal.id}`}>
                                  <Handshake className="mr-2 h-4 w-4" />
                                  Participate
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/versoholdings/deals/${deal.id}/details`}>
                                  View Details
                                </Link>
                              </Button>
                            </>
                          ) : deal.status === 'open' && !hasAccepted ? (
                            <>
                              <Button asChild>
                                <Link href={`/versoholdings/deals/${deal.id}/accept`}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Accept Invitation
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/versoholdings/deals/${deal.id}/details`}>
                                  View Details
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" asChild>
                              <Link href={`/versoholdings/deals/${deal.id}/details`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </Button>
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



