'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  X,
  Layers,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  Receipt,
  AlertCircle,
  Building,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PositionLot {
  id: string
  units: number
  unitCost: number
  acquisitionDate: string
  unrealizedGain: number
  currentValue: number
  source: string
}

interface FeeSchedule {
  id: string
  type: string
  amount: number
  frequency: string
  nextDue: string
  status: string
  description: string
}

interface CashflowRecord {
  id: string
  type: 'call' | 'distribution'
  amount: number
  date: string
  reference?: string
  description: string
}

interface PositionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  holdingId: string
  holdingName: string
  holdingType: 'vehicle' | 'deal'
}

// Simple Skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
)

export function PositionDetailModal({
  isOpen,
  onClose,
  holdingId,
  holdingName,
  holdingType
}: PositionDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lots, setLots] = useState<PositionLot[]>([])
  const [fees, setFees] = useState<FeeSchedule[]>([])
  const [cashflows, setCashflows] = useState<CashflowRecord[]>([])
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && holdingId) {
      fetchPositionDetails()
    }
  }, [isOpen, holdingId])

  const fetchPositionDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log(`Fetching position details for ${holdingType} ${holdingId}`)

      // Fetch data in parallel
      const [lotsResponse, feesResponse, cashflowsResponse, documentsResponse] = await Promise.allSettled([
        // FIFO lots data (mock for now since actual lot tracking may not be implemented in DB)
        // TODO: Replace with real API when position_lots table is implemented
        Promise.resolve([
          {
            id: '1',
            units: 1000,
            unitCost: 95.50,
            acquisitionDate: '2023-01-15',
            unrealizedGain: 4500,
            currentValue: 100000,
            source: 'Initial Subscription'
          },
          {
            id: '2',
            units: 500,
            unitCost: 102.00,
            acquisitionDate: '2023-06-15',
            unrealizedGain: -1000,
            currentValue: 50000,
            source: 'Additional Investment'
          }
        ]),

        // Fees data - now using real API
        fetch(`/api/fees?${holdingType === 'vehicle' ? 'vehicle_id' : 'deal_id'}=${holdingId}`, {
          headers: { 'Content-Type': 'application/json' }
        }).then(r => {
          if (!r.ok) throw new Error(`Fees API returned ${r.status}`)
          return r.json()
        }),

        // Cashflows data - now using real API
        fetch(`/api/cashflows?${holdingType === 'vehicle' ? 'vehicle_id' : 'deal_id'}=${holdingId}&limit=20`, {
          headers: { 'Content-Type': 'application/json' }
        }).then(r => {
          if (!r.ok) throw new Error(`Cashflows API returned ${r.status}`)
          return r.json()
        }),

        // Documents data (mock for now - will be replaced when documents API is implemented)
        // TODO: Replace with real /api/documents endpoint
        Promise.resolve([
          {
            id: '1',
            type: 'Subscription Agreement',
            createdAt: '2023-01-15',
            size: '2.1 MB'
          },
          {
            id: '2',
            type: 'Quarterly Statement',
            createdAt: '2024-03-31',
            size: '890 KB'
          }
        ])
      ])

      // Process results
      if (lotsResponse.status === 'fulfilled') {
        setLots(lotsResponse.value)
      }

      // Process fees data - handle both vehicle and deal fees
      if (feesResponse.status === 'fulfilled') {
        const feesData = feesResponse.value
        let relevantFees: any[] = []

        if (holdingType === 'vehicle' && feesData.feesByVehicle) {
          const vehicleEntry = feesData.feesByVehicle.find((v: any) => v.vehicleId === holdingId)
          relevantFees = vehicleEntry?.fees || []
        } else if (holdingType === 'deal' && feesData.feesByDeal) {
          const dealEntry = feesData.feesByDeal.find((d: any) => d.dealId === holdingId)
          relevantFees = dealEntry?.fees || []
        }

        setFees(relevantFees.map((fee: any) => ({
          id: fee.id,
          type: fee.type,
          amount: fee.amount,
          frequency: fee.frequency || 'one_time',
          nextDue: fee.eventDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: fee.status || 'accrued',
          description: fee.description || `${fee.type} fee`
        })))
      } else if (feesResponse.status === 'rejected') {
        console.warn('Fees API failed:', feesResponse.reason)
      }

      // Process cashflows data
      if (cashflowsResponse.status === 'fulfilled' && cashflowsResponse.value.cashflows) {
        setCashflows(cashflowsResponse.value.cashflows.map((cf: any) => ({
          id: cf.id,
          type: cf.type,
          amount: Math.abs(cf.amount || 0),
          date: cf.date,
          reference: cf.reference || cf.ref_id,
          description: cf.description || `${cf.type === 'call' ? 'Capital Call' : 'Distribution'} - ${cf.vehicleName || ''}`
        })))
      } else if (cashflowsResponse.status === 'rejected') {
        console.warn('Cashflows API failed:', cashflowsResponse.reason)
      }

      // Process documents data
      if (documentsResponse.status === 'fulfilled') {
        setDocuments(documentsResponse.value)
      }

    } catch (err) {
      console.error('Error fetching position details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load position details')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)

  const totalLotValue = lots.reduce((sum, lot) => sum + lot.currentValue, 0)
  const totalUnits = lots.reduce((sum, lot) => sum + lot.units, 0)
  const totalUnrealizedGain = lots.reduce((sum, lot) => sum + lot.unrealizedGain, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                {holdingType === 'deal' ? (
                  <Target className="h-6 w-6 text-purple-600" />
                ) : (
                  <Building className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">{holdingName}</DialogTitle>
                <DialogDescription className="mt-1 text-gray-600">
                  Detailed position breakdown and FIFO lot tracking
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <div className="text-red-600 font-medium mb-2">Failed to load position details</div>
                <div className="text-gray-500 text-sm mb-4">{error}</div>
                <Button onClick={fetchPositionDetails} size="sm">
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <Tabs defaultValue="lots" className="h-full flex flex-col">
              <div className="flex-shrink-0 px-6 py-4 border-b">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="lots" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Lots ({lots.length})
                  </TabsTrigger>
                  <TabsTrigger value="fees" className="gap-2">
                    <Receipt className="h-4 w-4" />
                    Fees ({fees.length})
                  </TabsTrigger>
                  <TabsTrigger value="cashflows" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cash Flows ({cashflows.length})
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Documents ({documents.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {/* FIFO Lots Tab */}
                <TabsContent value="lots" className="space-y-4 mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Position Breakdown (FIFO)</h3>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="text-xl font-bold">{totalUnits.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Units</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{formatCurrency(totalLotValue)}</div>
                        <div className="text-sm text-gray-600">Current Value</div>
                      </div>
                      <div>
                        <div className={`text-xl font-bold ${totalUnrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalUnrealizedGain >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedGain)}
                        </div>
                        <div className="text-sm text-gray-600">Unrealized P&L</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {lots.map((lot, index) => (
                      <Card key={lot.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                              </div>
                              <div>
                                <div className="font-medium">{lot.source}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(lot.acquisitionDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(lot.currentValue)}</div>
                              <div className={`text-sm ${lot.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {lot.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(lot.unrealizedGain)}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">Units:</span>
                              <span className="ml-1 font-medium">{lot.units.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Cost/Unit:</span>
                              <span className="ml-1 font-medium">${lot.unitCost.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Cost:</span>
                              <span className="ml-1 font-medium">{formatCurrency(lot.units * lot.unitCost)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Fees Tab */}
                <TabsContent value="fees" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold mb-4">Fee Schedule & Accruals</h3>
                  {fees.length > 0 ? (
                    <div className="space-y-3">
                      {fees.map((fee) => (
                        <Card key={fee.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Receipt className="h-5 w-5 text-purple-600" />
                                <div>
                                  <div className="font-medium">{fee.description}</div>
                                  <div className="text-sm text-gray-500 capitalize">
                                    {fee.type} • {fee.frequency}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(fee.amount)}</div>
                                <Badge variant={fee.status === 'paid' ? 'default' : 'secondary'}>
                                  {fee.status}
                                </Badge>
                              </div>
                            </div>
                            {fee.nextDue && (
                              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                Next due: {new Date(fee.nextDue).toLocaleDateString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No fee information available</p>
                    </div>
                  )}
                </TabsContent>

                {/* Cash Flows Tab */}
                <TabsContent value="cashflows" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold mb-4">Cash Flow History</h3>
                  {cashflows.length > 0 ? (
                    <div className="space-y-3">
                      {cashflows.map((cf) => (
                        <Card key={cf.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${
                                  cf.type === 'call' ? 'bg-red-500' : 'bg-green-500'
                                }`} />
                                <div>
                                  <div className="font-medium">{cf.description}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(cf.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold text-lg ${
                                  cf.type === 'call' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {cf.type === 'call' ? '-' : '+'}
                                  {formatCurrency(Math.abs(cf.amount))}
                                </div>
                                {cf.reference && (
                                  <div className="text-xs text-gray-400">
                                    Ref: {cf.reference}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No cash flow history available</p>
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold mb-4">Related Documents</h3>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="font-medium">{doc.type}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(doc.createdAt).toLocaleDateString()} • {doc.size}
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No documents available</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
