import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowRight,
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Building
} from 'lucide-react'

export default async function InvestorHoldings() {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/versoholdings/login')
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'investor') {
    redirect('/versoholdings/login')
  }

  // Get investor entities linked to this user
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  let vehicles: any[] = []

  if (investorLinks && investorLinks.length > 0) {
    const investorIds = investorLinks.map(link => link.investor_id)
    
    // Get vehicles with related data
    const { data: vehiclesData, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        subscriptions!inner (
          id,
          commitment,
          currency,
          status,
          investor_id
        ),
        positions (
          units,
          cost_basis,
          last_nav,
          as_of_date
        ),
        valuations (
          nav_total,
          nav_per_unit,
          as_of_date
        )
      `)
      .in('subscriptions.investor_id', investorIds)

    if (!error && vehiclesData) {
      // Process and enhance vehicle data
      vehicles = vehiclesData.map(vehicle => {
        // Get the latest valuation
        const latestValuation = vehicle.valuations
          ?.sort((a: { as_of_date: string }, b: { as_of_date: string }) => 
            new Date(b.as_of_date).getTime() - new Date(a.as_of_date).getTime()
          )[0]

        // Calculate position data for investor
        let positionData = null
        if (vehicle.positions?.length > 0) {
          const position = vehicle.positions[0]
          const currentValue = position.units * (latestValuation?.nav_per_unit || position.last_nav || 0)
          const unrealizedGain = currentValue - (position.cost_basis || 0)
          const unrealizedGainPct = position.cost_basis > 0 ? (unrealizedGain / position.cost_basis) * 100 : 0

          positionData = {
            units: position.units,
            costBasis: position.cost_basis,
            currentValue: Math.round(currentValue),
            unrealizedGain: Math.round(unrealizedGain),
            unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
            lastUpdated: position.as_of_date
          }
        }

        // Get subscription data
        const subscription = vehicle.subscriptions?.[0]

        return {
          id: vehicle.id,
          name: vehicle.name,
          type: vehicle.type,
          domicile: vehicle.domicile,
          currency: vehicle.currency,
          created_at: vehicle.created_at,
          position: positionData,
          subscription: subscription ? {
            commitment: subscription.commitment,
            currency: subscription.currency,
            status: subscription.status
          } : null,
          valuation: latestValuation ? {
            navTotal: latestValuation.nav_total,
            navPerUnit: latestValuation.nav_per_unit,
            asOfDate: latestValuation.as_of_date
          } : null,
          performance: positionData ? {
            unrealizedGainPct: positionData.unrealizedGainPct
          } : null
        }
      })
    }
  }

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Investment Vehicles</h1>
            <p className="text-gray-600 mt-1">
              Overview of all your investment vehicles and current positions
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {vehicles.length} Active Investment{vehicles.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        {vehicle.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {vehicle.type?.toUpperCase() || 'FUND'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {vehicle.domicile}
                        </span>
                      </CardDescription>
                    </div>
                    
                    {vehicle.performance?.unrealizedGainPct && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.performance.unrealizedGainPct > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.performance.unrealizedGainPct > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {vehicle.performance.unrealizedGainPct > 0 ? '+' : ''}{vehicle.performance.unrealizedGainPct.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {vehicle.position?.currentValue 
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: vehicle.currency || 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(vehicle.position.currentValue)
                          : 'N/A'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Current Value</div>
                    </div>
                    
                    <div>
                      <div className="text-lg font-semibold">
                        {vehicle.subscription?.commitment
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: vehicle.currency || 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(vehicle.subscription.commitment)
                          : 'N/A'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Commitment</div>
                    </div>
                  </div>

                  {/* Position Details */}
                  {vehicle.position && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Units Held</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-US').format(vehicle.position.units)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost Basis</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: vehicle.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(vehicle.position.costBasis)}
                        </span>
                      </div>
                      {vehicle.valuation && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">NAV per Unit</span>
                          <span className="font-medium">
                            ${vehicle.valuation.navPerUnit?.toFixed(3)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Latest Valuation Date */}
                  {vehicle.valuation?.asOfDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        As of {new Date(vehicle.valuation.asOfDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2">
                    <Link href={`/versoholdings/vehicle/${vehicle.id}`}>
                      <Button className="w-full" variant="outline">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Investment Vehicles Found</h3>
              <p className="text-muted-foreground mb-6">
                You don&apos;t have access to any investment vehicles yet.
              </p>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Contact Investment Team
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

