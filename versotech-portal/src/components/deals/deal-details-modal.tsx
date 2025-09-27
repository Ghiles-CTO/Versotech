'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Building2, DollarSign, Clock, Users, FileText, TrendingUp, Package, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DealDetailsModalProps {
  deal: {
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
      description: string
      is_default: boolean
    }>
  }
  investorId: string
  children: React.ReactNode
}

interface DealStats {
  totalUnits: number
  availableUnits: number
  reservedUnits: number
  allocatedUnits: number
  totalCommitments: number
  totalAmount: number
}

interface FeeComponent {
  id: string
  kind: string
  calc_method: string
  rate_bps: number
  flat_amount: number
  frequency: string
  hurdle_rate_bps: number
  high_watermark: boolean
  notes: string
}

export function DealDetailsModal({ deal, investorId, children }: DealDetailsModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DealStats | null>(null)
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([])
  const [myCommitments, setMyCommitments] = useState<any[]>([])
  const [myReservations, setMyReservations] = useState<any[]>([])

  const supabase = createClient()

  const loadDealData = async () => {
    setLoading(true)
    try {
      // Load deal statistics
      const { data: lots } = await supabase
        .from('share_lots')
        .select('units_total, units_remaining, status')
        .eq('deal_id', deal.id)

      const { data: reservations } = await supabase
        .from('reservations')
        .select('requested_units, status')
        .eq('deal_id', deal.id)

      const { data: allocations } = await supabase
        .from('allocations')
        .select('units, status')
        .eq('deal_id', deal.id)

      const { data: commitments } = await supabase
        .from('deal_commitments')
        .select('requested_units, requested_amount, status')
        .eq('deal_id', deal.id)

      // Calculate stats
      const totalUnits = lots?.reduce((sum, lot) => sum + lot.units_total, 0) || 0
      const availableUnits = lots?.reduce((sum, lot) => sum + lot.units_remaining, 0) || 0
      const reservedUnits = reservations?.reduce((sum, res) => sum + res.requested_units, 0) || 0
      const allocatedUnits = allocations?.reduce((sum, alloc) => sum + alloc.units, 0) || 0
      const totalCommitments = commitments?.length || 0
      const totalAmount = commitments?.reduce((sum, comm) => sum + comm.requested_amount, 0) || 0

      setStats({
        totalUnits,
        availableUnits,
        reservedUnits,
        allocatedUnits,
        totalCommitments,
        totalAmount
      })

      // Load fee components for default fee plan
      const defaultFeePlan = deal.fee_plans.find(fp => fp.is_default)
      if (defaultFeePlan) {
        const { data: components } = await supabase
          .from('fee_components')
          .select('*')
          .eq('fee_plan_id', defaultFeePlan.id)
          .order('created_at', 'asc')

        setFeeComponents(components || [])
      }

      // Load my commitments and reservations
      const { data: myCommits } = await supabase
        .from('deal_commitments')
        .select('*')
        .eq('deal_id', deal.id)
        .eq('investor_id', investorId)
        .order('created_at', 'desc')

      const { data: myRes } = await supabase
        .from('reservations')
        .select('*')
        .eq('deal_id', deal.id)
        .eq('investor_id', investorId)
        .order('created_at', 'desc')

      setMyCommitments(myCommits || [])
      setMyReservations(myRes || [])

    } catch (error) {
      console.error('Error loading deal data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadDealData()
    }
  }, [open])

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-green-100 text-green-800',
    allocation_pending: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const dealTypeLabels = {
    equity_secondary: 'Secondary Equity',
    equity_primary: 'Primary Equity',
    credit_trade_finance: 'Credit & Trade Finance',
    other: 'Other'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {deal.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information about this investment opportunity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading deal details...</span>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="fees">Fee Structure</TabsTrigger>
              <TabsTrigger value="activity">My Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Deal Status and Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Deal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge variant="outline">
                        {dealTypeLabels[deal.deal_type as keyof typeof dealTypeLabels]}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={statusColors[deal.status as keyof typeof statusColors]}>
                        {deal.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Currency:</span>
                      <span className="text-sm font-medium">{deal.currency}</span>
                    </div>
                    {deal.offer_unit_price && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Offer Price:</span>
                        <span className="text-sm font-medium">
                          {deal.currency} {deal.offer_unit_price.toFixed(2)} per unit
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm font-medium">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {deal.open_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Opens:</span>
                        <span className="text-sm font-medium">
                          {new Date(deal.open_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {deal.close_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Closes:</span>
                        <span className="text-sm font-medium">
                          {new Date(deal.close_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Vehicle Information */}
              {deal.vehicles && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Investment Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{deal.vehicles.name}</span>
                      <Badge variant="outline">{deal.vehicles.type.toUpperCase()}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Default Fee Plan */}
              {deal.fee_plans.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Default Fee Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {deal.fee_plans.map((plan) => (
                      <div key={plan.id} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-900">{plan.name}</span>
                          {plan.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-blue-700 mt-1">{plan.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Inventory Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Units:</span>
                        <span className="font-medium">{stats.totalUnits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Available:</span>
                        <span className="font-medium text-green-600">{stats.availableUnits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reserved:</span>
                        <span className="font-medium text-yellow-600">{stats.reservedUnits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Allocated:</span>
                        <span className="font-medium text-blue-600">{stats.allocatedUnits.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Deal Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Commitments:</span>
                        <span className="font-medium">{stats.totalCommitments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="font-medium text-green-600">
                          {deal.currency} {stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No inventory data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              {feeComponents.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fee Components</h3>
                  {feeComponents.map((component) => (
                    <Card key={component.id}>
                      <CardHeader>
                        <CardTitle className="text-sm capitalize">
                          {component.kind.replace('_', ' ')} Fee
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Calculation Method:</span>
                          <span className="text-sm font-medium capitalize">
                            {component.calc_method.replace('_', ' ')}
                          </span>
                        </div>
                        {component.rate_bps && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rate:</span>
                            <span className="text-sm font-medium">
                              {(component.rate_bps / 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                        {component.flat_amount && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Flat Amount:</span>
                            <span className="text-sm font-medium">
                              {deal.currency} {component.flat_amount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Frequency:</span>
                          <span className="text-sm font-medium capitalize">
                            {component.frequency.replace('_', ' ')}
                          </span>
                        </div>
                        {component.hurdle_rate_bps && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Hurdle Rate:</span>
                            <span className="text-sm font-medium">
                              {(component.hurdle_rate_bps / 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                        {component.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                            {component.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No fee structure details available
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="space-y-4">
                {/* My Reservations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">My Reservations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myReservations.length > 0 ? (
                      <div className="space-y-3">
                        {myReservations.map((reservation) => (
                          <div key={reservation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{reservation.requested_units.toLocaleString()} units</span>
                              <span className="text-sm text-gray-600 ml-2">
                                @ {deal.currency} {reservation.proposed_unit_price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                reservation.status === 'pending' ? 'default' :
                                reservation.status === 'approved' ? 'secondary' :
                                reservation.status === 'expired' ? 'destructive' : 'outline'
                              }>
                                {reservation.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Expires: {new Date(reservation.expires_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No reservations found
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* My Commitments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">My Commitments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myCommitments.length > 0 ? (
                      <div className="space-y-3">
                        {myCommitments.map((commitment) => (
                          <div key={commitment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{commitment.requested_units.toLocaleString()} units</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {deal.currency} {commitment.requested_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                commitment.status === 'submitted' ? 'default' :
                                commitment.status === 'approved' ? 'secondary' :
                                commitment.status === 'rejected' ? 'destructive' : 'outline'
                              }>
                                {commitment.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(commitment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No commitments found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
