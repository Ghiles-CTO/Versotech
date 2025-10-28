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
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              holdingType === 'deal'
                ? "bg-gradient-to-br from-purple-100 to-purple-200"
                : "bg-gradient-to-br from-blue-100 to-blue-200"
            )}>
              {holdingType === 'deal' ? (
                <Target className="h-6 w-6 text-purple-700" />
              ) : (
                <Building className="h-6 w-6 text-blue-700" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">{holdingName}</DialogTitle>
              <DialogDescription className="mt-1 text-gray-600">
                {holdingType === 'deal'
                  ? 'View your allocation details, fees, and documents'
                  : 'Your position details, cash flows, fees, and documents'}
              </DialogDescription>
            </div>
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
            <Tabs defaultValue="cashflows" className="h-full flex flex-col">
              <div className="flex-shrink-0 px-6 py-3 border-b bg-white">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
                  <TabsTrigger value="cashflows" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Cash Flows</span>
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{cashflows.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="fees" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                    <Receipt className="h-4 w-4" />
                    <span className="hidden sm:inline">Fees</span>
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{fees.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="position" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                    <Layers className="h-4 w-4" />
                    <span className="hidden sm:inline">Position</span>
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{lots.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Documents</span>
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{documents.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {/* Cash Flows Tab - Now First (PRD priority) */}
                <TabsContent value="cashflows" className="space-y-4 mt-0 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cash Flow History</h3>
                    {cashflows.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Last 20 transactions
                      </Badge>
                    )}
                  </div>
                  {cashflows.length > 0 ? (
                    <div className="space-y-3">
                      {cashflows.map((cf) => (
                        <Card key={cf.id} className="border hover:border-gray-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  cf.type === 'call' ? 'bg-red-50' : 'bg-green-50'
                                )}>
                                  <div className={`w-4 h-4 rounded-full ${
                                    cf.type === 'call' ? 'bg-red-500' : 'bg-green-500'
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{cf.description}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(cf.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                    {cf.reference && (
                                      <span className="text-xs text-gray-400">• Ref: {cf.reference}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className={cn(
                                  "font-semibold text-lg tabular-nums",
                                  cf.type === 'call' ? 'text-red-600' : 'text-green-600'
                                )}>
                                  {cf.type === 'call' ? '-' : '+'}
                                  {formatCurrency(Math.abs(cf.amount))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium">No cash flows yet</p>
                      <p className="text-sm text-gray-400 mt-1">Capital calls and distributions will appear here</p>
                    </div>
                  )}
                </TabsContent>

                {/* Fees Tab */}
                <TabsContent value="fees" className="space-y-4 mt-0 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Fee Schedule & Accruals</h3>
                  </div>
                  {fees.length > 0 ? (
                    <div className="space-y-3">
                      {fees.map((fee) => (
                        <Card key={fee.id} className="border hover:border-gray-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                  <Receipt className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900">{fee.description}</div>
                                  <div className="text-sm text-gray-500 capitalize mt-0.5">
                                    {fee.type} • {fee.frequency}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-semibold text-lg">{formatCurrency(fee.amount)}</div>
                                <Badge
                                  variant={fee.status === 'paid' ? 'default' : fee.status === 'accrued' ? 'secondary' : 'outline'}
                                  className="mt-1"
                                >
                                  {fee.status}
                                </Badge>
                              </div>
                            </div>
                            {fee.nextDue && fee.status !== 'paid' && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>Next due: {new Date(fee.nextDue).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Receipt className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium">No fees recorded</p>
                      <p className="text-sm text-gray-400 mt-1">Fee information will appear here when available</p>
                    </div>
                  )}
                </TabsContent>

                {/* Position/Lots Tab */}
                <TabsContent value="position" className="space-y-4 mt-0 animate-in fade-in-50 duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Position Details</h3>
                    <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 tabular-nums">{totalUnits.toLocaleString()}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Units</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(totalLotValue)}</div>
                        <div className="text-sm text-gray-600 mt-1">Current Value</div>
                      </div>
                      <div>
                        <div className={cn(
                          "text-2xl font-bold tabular-nums flex items-center gap-1",
                          totalUnrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {totalUnrealizedGain >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                          {totalUnrealizedGain >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedGain)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Unrealized Gain/Loss</div>
                      </div>
                    </div>
                  </div>

                  {lots.length > 0 ? (
                    <div className="space-y-3">
                      {lots.map((lot, index) => (
                        <Card key={lot.id} className="border hover:border-gray-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                  <span className="text-sm font-bold text-blue-700">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900">{lot.source}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(lot.acquisitionDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-semibold text-lg tabular-nums">{formatCurrency(lot.currentValue)}</div>
                                <div className={cn(
                                  "text-sm font-medium",
                                  lot.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                  {lot.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(lot.unrealizedGain)}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-sm">
                              <div>
                                <div className="text-xs text-gray-500 mb-0.5">Units</div>
                                <div className="font-medium tabular-nums">{lot.units.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-0.5">Cost/Unit</div>
                                <div className="font-medium tabular-nums">${lot.unitCost.toFixed(3)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-0.5">Total Cost</div>
                                <div className="font-medium tabular-nums">{formatCurrency(lot.units * lot.unitCost)}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Layers className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium">No position data available</p>
                      <p className="text-sm text-gray-400 mt-1">Position details will appear once investments are recorded</p>
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4 mt-0 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Related Documents</h3>
                    {documents.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                      </Badge>
                    )}
                  </div>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="border hover:border-gray-300 transition-colors group">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{doc.type}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(doc.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                    <span className="text-gray-400">•</span>
                                    <span>{doc.size}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4 flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium">No documents yet</p>
                      <p className="text-sm text-gray-400 mt-1">Subscription agreements, statements, and reports will appear here</p>
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
