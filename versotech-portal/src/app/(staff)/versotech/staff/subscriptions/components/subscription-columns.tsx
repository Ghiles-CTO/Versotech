'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Eye, CheckCircle2, Clock, Loader2, XCircle, Archive } from 'lucide-react'
import Link from 'next/link'

export type SubscriptionRow = {
  id: string
  subscription_number: number
  investor_id: string
  vehicle_id: string
  commitment: number
  currency: string
  status: string
  committed_at: string | null
  created_at: string

  // Share/Unit fields
  price_per_share: number | null
  cost_per_share: number | null
  num_shares: number | null
  spread_per_share: number | null
  units: number | null

  // Fee fields
  subscription_fee_percent: number | null
  subscription_fee_amount: number | null
  bd_fee_percent: number | null
  bd_fee_amount: number | null
  finra_fee_amount: number | null
  spread_fee_amount: number | null
  performance_fee_tier1_percent: number | null
  performance_fee_tier1_threshold: number | null
  performance_fee_tier2_percent: number | null
  performance_fee_tier2_threshold: number | null

  // Financial tracking
  funded_amount: number
  outstanding_amount: number | null
  capital_calls_total: number
  distributions_total: number
  current_nav: number | null

  // Business context
  opportunity_name: string | null
  contract_date: string | null
  sourcing_contract_ref: string | null
  introducer_id: string | null
  introduction_id: string | null

  investor?: {
    id: string
    legal_name: string
    type: string
    country: string
    kyc_status: string
  }
  vehicle?: {
    id: string
    name: string
    type: string
    currency: string
    status: string
    entity_code: string | null
  }
}

function getStatusColor(status: string) {
  const colors = {
    active: 'bg-green-900/30 text-green-300 border-green-700',
    committed: 'bg-blue-900/30 text-blue-300 border-blue-700',
    pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
    closed: 'bg-gray-800/50 text-gray-300 border-gray-700',
    cancelled: 'bg-red-900/30 text-red-300 border-red-700',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-800/50 text-gray-300 border-gray-700'
}

function getStatusIcon(status: string) {
  const icons = {
    active: CheckCircle2,
    committed: Loader2,
    pending: Clock,
    closed: Archive,
    cancelled: XCircle,
  }
  return icons[status as keyof typeof icons] || Clock
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const subscriptionColumns: ColumnDef<SubscriptionRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'subscription_number',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Sub #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const number = row.getValue('subscription_number') as number
      return (
        <div className="font-mono font-semibold">
          #{number}
        </div>
      )
    },
  },
  {
    accessorKey: 'investor.legal_name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Investor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const investor = row.original.investor
      if (!investor) return <span className="text-muted-foreground">-</span>

      return (
        <div className="flex flex-col">
          <Link
            href={`/versotech/staff/investors/${investor.id}`}
            className="font-semibold hover:underline"
          >
            {investor.legal_name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs capitalize">
              {investor.type}
            </Badge>
            <span className="text-xs text-muted-foreground">{investor.country}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'vehicle.name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Vehicle
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const vehicle = row.original.vehicle
      if (!vehicle) return <span className="text-muted-foreground">-</span>

      return (
        <div className="flex flex-col">
          <span className="font-semibold">{vehicle.name}</span>
          {vehicle.type && (
            <span className="text-xs text-muted-foreground capitalize">
              {vehicle.type}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'commitment',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Commitment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('commitment'))
      const currency = row.original.currency

      return (
        <div className="text-right font-semibold">
          {formatCurrency(amount, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const StatusIcon = getStatusIcon(status)
      return (
        <Badge className={`${getStatusColor(status)} flex items-center gap-1.5 w-fit`} variant="outline">
          <StatusIcon className="h-3.5 w-3.5" />
          <span className="capitalize">{status}</span>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'committed_at',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Committed Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('committed_at') as string | null
      return <div className="text-sm">{formatDate(date)}</div>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Created Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null
      return <div className="text-sm">{formatDate(date)}</div>
    },
  },
  {
    id: 'share_structure',
    header: () => <div className="text-right">Share Structure</div>,
    cell: ({ row }) => {
      const subscription = row.original
      const hasShareData = subscription.num_shares != null || subscription.price_per_share != null

      if (!hasShareData) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      return (
        <div className="text-right">
          {subscription.num_shares != null && (
            <div className="text-sm font-semibold">
              {subscription.num_shares.toLocaleString()} shares
            </div>
          )}
          {subscription.price_per_share != null && (
            <div className="text-xs text-muted-foreground">
              @ {formatCurrency(subscription.price_per_share, subscription.currency)}
            </div>
          )}
          {subscription.spread_per_share != null && subscription.spread_per_share > 0 && (
            <div className="text-xs text-green-600">
              Spread: {formatCurrency(subscription.spread_per_share, subscription.currency)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'fees',
    header: () => <div className="text-right">Fees</div>,
    cell: ({ row }) => {
      const subscription = row.original
      const hasFees = subscription.subscription_fee_amount != null ||
                      subscription.bd_fee_amount != null ||
                      subscription.spread_fee_amount != null ||
                      subscription.finra_fee_amount != null

      if (!hasFees) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      const totalFees = [
        subscription.subscription_fee_amount,
        subscription.bd_fee_amount,
        subscription.spread_fee_amount,
        subscription.finra_fee_amount
      ].reduce((sum: number, fee) => sum + (fee || 0), 0)

      return (
        <div className="text-right">
          <div className="text-sm font-semibold">
            {formatCurrency(totalFees, subscription.currency)}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {subscription.subscription_fee_percent != null && (
              <div>Sub: {subscription.subscription_fee_percent.toFixed(2)}%</div>
            )}
            {subscription.bd_fee_percent != null && (
              <div>BD: {subscription.bd_fee_percent.toFixed(2)}%</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'funded_amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Funded
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const funded = parseFloat(row.getValue('funded_amount'))
      const commitment = row.original.commitment
      const currency = row.original.currency
      const percentFunded = commitment > 0 ? (funded / commitment) * 100 : 0

      return (
        <div className="text-right">
          <div className="font-semibold text-sm">
            {formatCurrency(funded, currency)}
          </div>
          <div className="text-xs text-muted-foreground">
            {percentFunded.toFixed(0)}% of commitment
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'outstanding_amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Outstanding
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const outstanding = row.original.outstanding_amount
      const currency = row.original.currency

      if (outstanding == null || outstanding === 0) {
        return (
          <div className="text-right text-muted-foreground text-sm">
            Fully funded
          </div>
        )
      }

      return (
        <div className="text-right">
          <div className="font-semibold text-sm text-yellow-600">
            {formatCurrency(outstanding, currency)}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'current_nav',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Current NAV
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const nav = row.original.current_nav
      const funded = row.original.funded_amount
      const currency = row.original.currency

      if (nav == null) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      const multiple = funded > 0 ? nav / funded : 0
      const isPositive = multiple >= 1

      return (
        <div className="text-right">
          <div className={`font-semibold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(nav, currency)}
          </div>
          <div className="text-xs text-muted-foreground">
            {multiple.toFixed(2)}x MOIC
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'opportunity_name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Opportunity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const opportunityName = row.getValue('opportunity_name') as string | null

      if (!opportunityName) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      return (
        <div className="max-w-[200px]">
          <div className="text-sm font-medium truncate" title={opportunityName}>
            {opportunityName}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'contract_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Contract Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.contract_date
      return <div className="text-sm">{formatDate(date)}</div>
    },
  },
  {
    id: 'performance_fees',
    header: () => <div className="text-right">Performance Fees</div>,
    cell: ({ row }) => {
      const subscription = row.original
      const hasPerformanceFees = subscription.performance_fee_tier1_percent != null ||
                                 subscription.performance_fee_tier2_percent != null

      if (!hasPerformanceFees) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      return (
        <div className="text-right text-xs">
          {subscription.performance_fee_tier1_percent != null && (
            <div className="text-purple-400">
              Tier 1: {subscription.performance_fee_tier1_percent}%
            </div>
          )}
          {subscription.performance_fee_tier2_percent != null && (
            <div className="text-purple-300">
              Tier 2: {subscription.performance_fee_tier2_percent}%
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const subscription = row.original

      return (
        <div className="text-right">
          <Link href={`/versotech/staff/subscriptions/${subscription.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-black border-white hover:bg-gray-200"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>
      )
    },
  },
]
