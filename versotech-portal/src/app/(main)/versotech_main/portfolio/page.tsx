'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
  Wallet
} from 'lucide-react'
import { usePersona } from '@/contexts/persona-context'

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

function InvestmentCard({ investment, showFundedOnly = false }: { investment: Investment; showFundedOnly?: boolean }) {
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

        {/* View details */}
        {investment.deal_id && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/versotech_main/opportunities/${investment.deal_id}`)}
          >
            View Details
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        )}
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
  const { isInvestor } = usePersona()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    }
  }, [isInvestor])

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
        <h1 className="text-2xl font-bold">Investment Portfolio</h1>
        <p className="text-muted-foreground">
          View and manage your active investments
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

      {/* Investments */}
      {!loading && !error && (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeInvestments.length})
            </TabsTrigger>
            <TabsTrigger value="funded">
              Funded ({fundedInvestments.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingInvestments.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({investments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeInvestments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Investments</h3>
                  <p className="text-muted-foreground mb-4">
                    Active investments will appear here once they are fully funded and activated.
                  </p>
                  <Button onClick={() => window.location.href = '/versotech_main/opportunities'}>
                    Browse Opportunities
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeInvestments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="funded" className="space-y-4">
            {fundedInvestments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Funded Investments</h3>
                  <p className="text-muted-foreground">
                    Investments awaiting activation will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {fundedInvestments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingInvestments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Investments</h3>
                  <p className="text-muted-foreground">
                    Investments awaiting signature or funding will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingInvestments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {investments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Investments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your portfolio by subscribing to investment opportunities.
                  </p>
                  <Button onClick={() => window.location.href = '/versotech_main/opportunities'}>
                    Browse Opportunities
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {investments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
