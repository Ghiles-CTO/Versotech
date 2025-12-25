'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Building2,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  FileSignature,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  DollarSign as SellIcon
} from 'lucide-react'
import { usePersona } from '@/contexts/persona-context'
import { SellPositionForm } from '@/components/investor/sell-position-form'
import { SaleStatusTracker } from '@/components/investor/sale-status-tracker'

interface Investment {
  id: string
  vehicle_id: string
  vehicle_name: string
  vehicle_type: string
  deal_id: string | null
  deal_name: string | null
  status: string
  commitment: number | null
  funded_amount: number | null
  current_nav: number | null
  currency: string
  pack_generated_at: string | null
  pack_sent_at: string | null
  signed_at: string | null
  funded_at: string | null
  activated_at: string | null
  subscription_date: string | null
  company_logo_url: string | null
}

interface SaleRequest {
  id: string
  subscription_id: string  // Direct field for reliable matching
  status: string
  amount_to_sell: number
  asking_price_per_unit?: number
  notes?: string
  status_notes?: string
  rejection_reason?: string
  created_at: string
  approved_at?: string
  matched_at?: string
  transfer_completed_at?: string
  subscription?: {
    id: string
    commitment: number
    funded_amount: number
    currency: string
    vehicle?: {
      id: string
      name: string
      type: string
    }
  }
  matched_buyer?: {
    id: string
    legal_name: string
  }
}

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getInvestmentStatus(investment: Investment) {
  if (investment.activated_at) {
    return { label: 'Active', color: 'bg-emerald-500', icon: CheckCircle2 }
  }
  if (investment.funded_at) {
    return { label: 'Funded', color: 'bg-blue-500', icon: DollarSign }
  }
  if (investment.signed_at) {
    return { label: 'Signed', color: 'bg-purple-500', icon: FileSignature }
  }
  if (investment.pack_sent_at) {
    return { label: 'Awaiting Signature', color: 'bg-amber-500', icon: Clock }
  }
  return { label: 'Pending', color: 'bg-gray-500', icon: AlertCircle }
}

function InvestmentCard({
  investment,
  showFundedOnly = false,
  onSell,
  hasPendingSale = false
}: {
  investment: Investment
  showFundedOnly?: boolean
  onSell?: (investment: Investment) => void
  hasPendingSale?: boolean
}) {
  const router = useRouter()
  const status = getInvestmentStatus(investment)
  const StatusIcon = status.icon

  // If showFundedOnly, only show funded or active investments
  if (showFundedOnly && !investment.funded_at) {
    return null
  }

  const fundedPercentage = investment.commitment
    ? ((investment.funded_amount || 0) / investment.commitment) * 100
    : 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {investment.company_logo_url ? (
              <Image
                src={investment.company_logo_url}
                alt={investment.vehicle_name}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{investment.vehicle_name}</CardTitle>
              {investment.deal_name && (
                <CardDescription>{investment.deal_name}</CardDescription>
              )}
            </div>
          </div>
          <Badge className={status.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investment amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Commitment</div>
            <div className="text-lg font-semibold">
              {formatCurrency(investment.commitment, investment.currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Funded</div>
            <div className="text-lg font-semibold">
              {formatCurrency(investment.funded_amount, investment.currency)}
            </div>
          </div>
        </div>

        {/* Funding progress */}
        {investment.commitment && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Funding Progress</span>
              <span>{fundedPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={fundedPercentage} className="h-2" />
          </div>
        )}

        {/* Current NAV (only for active) */}
        {investment.activated_at && investment.current_nav && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Current NAV</div>
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(investment.current_nav, investment.currency)}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-2 border-t space-y-2 text-sm">
          {investment.subscription_date && (
            <div className="flex justify-between text-muted-foreground">
              <span>Subscribed</span>
              <span>{formatDate(investment.subscription_date)}</span>
            </div>
          )}
          {investment.signed_at && (
            <div className="flex justify-between text-muted-foreground">
              <span>Signed</span>
              <span>{formatDate(investment.signed_at)}</span>
            </div>
          )}
          {investment.funded_at && (
            <div className="flex justify-between text-muted-foreground">
              <span>Funded</span>
              <span>{formatDate(investment.funded_at)}</span>
            </div>
          )}
          {investment.activated_at && (
            <div className="flex justify-between text-emerald-600">
              <span>Activated</span>
              <span>{formatDate(investment.activated_at)}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {investment.deal_id && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/versotech_main/opportunities/${investment.deal_id}`)}
            >
              View Details
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {/* Sell button for active investments */}
          {investment.activated_at && investment.funded_amount && onSell && (
            <Button
              variant="outline"
              className={`flex-1 ${hasPendingSale ? 'opacity-50 cursor-not-allowed' : 'border-amber-300 text-amber-700 hover:bg-amber-50'}`}
              onClick={() => !hasPendingSale && onSell(investment)}
              disabled={hasPendingSale}
              title={hasPendingSale ? 'You have a pending sale request for this position' : 'Request to sell this position'}
            >
              <SellIcon className="w-4 h-4 mr-2" />
              {hasPendingSale ? 'Sale Pending' : 'Sell Position'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function InvestmentSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  )
}

export default function PortfolioPage() {
  const router = useRouter()
  const { isInvestor } = usePersona()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sale request state
  const [saleRequests, setSaleRequests] = useState<SaleRequest[]>([])
  const [saleRequestsLoading, setSaleRequestsLoading] = useState(true)
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)

  // Fetch sale requests - memoized to prevent unnecessary re-renders
  const fetchSaleRequests = useCallback(async () => {
    try {
      setSaleRequestsLoading(true)
      const response = await fetch('/api/investor/sell-request')
      if (response.ok) {
        const data = await response.json()
        setSaleRequests(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching sale requests:', err)
    } finally {
      setSaleRequestsLoading(false)
    }
  }, [])

  // Fetch portfolio data
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true)
        const response = await fetch('/api/investors/me/portfolio')
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio')
        }
        const data = await response.json()
        setInvestments(data.investments || [])
      } catch (err) {
        console.error('Error fetching portfolio:', err)
        setError('Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }

    if (isInvestor) {
      fetchPortfolio()
      fetchSaleRequests()
    }
  }, [isInvestor, fetchSaleRequests])

  // Handle sell button click
  const handleSellClick = (investment: Investment) => {
    setSelectedInvestment(investment)
    setSellDialogOpen(true)
  }

  // Handle sell form success
  const handleSellSuccess = () => {
    setSellDialogOpen(false)
    setSelectedInvestment(null)
    fetchSaleRequests()
  }

  // Handle dialog close - reset selected investment
  const handleDialogChange = (open: boolean) => {
    setSellDialogOpen(open)
    if (!open) {
      setSelectedInvestment(null)
    }
  }

  // Check if investment has pending sale - use direct subscription_id field
  const hasPendingSale = useCallback((subscriptionId: string) => {
    return saleRequests.some(
      r => r.subscription_id === subscriptionId &&
           ['pending', 'approved', 'matched', 'in_progress'].includes(r.status)
    )
  }, [saleRequests])

  // Filter investments by status
  const activeInvestments = investments.filter(i => i.activated_at)
  const fundedInvestments = investments.filter(i => i.funded_at && !i.activated_at)
  const pendingInvestments = investments.filter(i => !i.funded_at)

  // Calculate totals (only for active investments per Phase 3 rules)
  const totalCommitment = activeInvestments.reduce((sum, i) => sum + (i.commitment || 0), 0)
  const totalFunded = activeInvestments.reduce((sum, i) => sum + (i.funded_amount || 0), 0)
  const totalNAV = activeInvestments.reduce((sum, i) => sum + (i.current_nav || 0), 0)

  if (!isInvestor) {
    return (
      <div className="p-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Investor Access Required</CardTitle>
            <CardDescription>
              Please switch to an investor persona to view your portfolio.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Active Portfolio</h1>
        <p className="text-muted-foreground">
          Your activated investments with live NAV tracking
        </p>
      </div>

      {/* Portfolio Summary (Active investments only) */}
      {!loading && activeInvestments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Commitment</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalCommitment)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Funded</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalFunded)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current NAV</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalNAV)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="py-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <InvestmentSkeleton key={i} />
          ))}
        </div>
      )}

      {/* In-Progress Banner - Direct to Opportunities for Stages 1-9 */}
      {!loading && (fundedInvestments.length > 0 || pendingInvestments.length > 0) && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {fundedInvestments.length + pendingInvestments.length} subscription(s) in progress
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-300">
                    View your pending and funded subscriptions in Investment Opportunities
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => router.push('/versotech_main/opportunities')}
              >
                View Subscriptions
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Investments Only (Stage 10) */}
      {!loading && !error && (
        <div className="space-y-4">
          {activeInvestments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Investments</h3>
                <p className="text-muted-foreground mb-4">
                  Active investments will appear here once they are fully funded and activated.
                </p>
                <Button onClick={() => router.push('/versotech_main/opportunities')}>
                  Browse Opportunities
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeInvestments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onSell={handleSellClick}
                  hasPendingSale={hasPendingSale(investment.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sale Requests Tracker */}
      {!loading && saleRequests.length > 0 && (
        <SaleStatusTracker
          requests={saleRequests}
          onRequestCancelled={fetchSaleRequests}
        />
      )}

      {/* Sell Position Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sell Position</DialogTitle>
          </DialogHeader>
          {selectedInvestment && (
            <SellPositionForm
              subscriptionId={selectedInvestment.id}
              vehicleName={selectedInvestment.vehicle_name}
              fundedAmount={selectedInvestment.funded_amount || 0}
              currency={selectedInvestment.currency}
              onSuccess={handleSellSuccess}
              onCancel={() => handleDialogChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
