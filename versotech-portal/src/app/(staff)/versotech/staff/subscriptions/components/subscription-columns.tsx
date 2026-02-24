'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Eye, CheckCircle2, Clock, Loader2, XCircle, Archive } from 'lucide-react'
import Link from 'next/link'
import { getCountryName } from '@/components/kyc/country-select'

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
  acknowledgement_notes: string | null

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
  introducer?: {
    id: string
    legal_name: string
  } | null
  deal?: {
    id: string
    name: string
  } | null
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

function formatCurrencyPrecise(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
            href={`/versotech_main/investors/${investor.id}`}
            className="font-semibold hover:underline"
          >
            {investor.legal_name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs capitalize">
              {investor.type}
            </Badge>
            <span className="text-xs text-muted-foreground">{getCountryName(investor.country)}</span>
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
    accessorKey: 'num_shares',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Num Shares
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const shares = row.original.num_shares
      if (shares == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {shares.toLocaleString()}
        </div>
      )
    },
  },
  {
    accessorKey: 'price_per_share',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Price/Share
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const price = row.original.price_per_share
      const currency = row.original.currency
      if (price == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrencyPrecise(price, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'cost_per_share',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Cost/Share
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const cost = row.original.cost_per_share
      const currency = row.original.currency
      if (cost == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrencyPrecise(cost, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'spread_per_share',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Spread/Share
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const spread = row.original.spread_per_share
      const currency = row.original.currency
      if (spread == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm text-green-400">
          {formatCurrencyPrecise(spread, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'spread_fee_amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Spread Fee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const fee = row.original.spread_fee_amount
      const currency = row.original.currency
      if (fee == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(fee, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'subscription_fee_percent',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Sub Fee %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const percent = row.original.subscription_fee_percent
      if (percent == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {percent.toFixed(2)}%
        </div>
      )
    },
  },
  {
    accessorKey: 'subscription_fee_amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Sub Fee $
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.original.subscription_fee_amount
      const currency = row.original.currency
      if (amount == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(amount, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'bd_fee_percent',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          BD Fee %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const percent = row.original.bd_fee_percent
      if (percent == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {percent.toFixed(2)}%
        </div>
      )
    },
  },
  {
    accessorKey: 'bd_fee_amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          BD Fee $
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.original.bd_fee_amount
      const currency = row.original.currency
      if (amount == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(amount, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'finra_fee_amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          FINRA Fee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.original.finra_fee_amount
      const currency = row.original.currency
      if (amount == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(amount, currency)}
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
          Funded Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const funded = parseFloat(row.getValue('funded_amount'))
      const currency = row.original.currency

      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(funded, currency)}
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
      const currency = row.original.currency

      if (nav == null) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(nav, currency)}
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
      // Investment name from vehicle (always populated)
      const investmentName = (row.original.vehicle as any)?.investment_name
      if (!investmentName) return <span className="text-muted-foreground text-sm">-</span>

      return (
        <div className="max-w-[200px]">
          <div className="text-sm font-medium truncate" title={investmentName}>
            {investmentName}
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
    accessorKey: 'sourcing_contract_ref',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Sourcing Ref
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const ref = row.original.sourcing_contract_ref
      if (!ref) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-sm font-mono max-w-[150px] truncate" title={ref}>
          {ref}
        </div>
      )
    },
  },
  {
    id: 'introducer',
    header: () => <div>Introducer</div>,
    cell: ({ row }) => {
      const introducer = row.original.introducer
      if (!introducer) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-sm font-medium max-w-[150px] truncate" title={introducer.legal_name}>
          {introducer.legal_name}
        </div>
      )
    },
  },
  {
    id: 'introduction',
    header: () => <div>Introduction</div>,
    cell: ({ row }) => {
      const introductionId = row.original.introduction_id
      if (!introductionId) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-xs font-mono text-muted-foreground max-w-[100px] truncate" title={introductionId}>
          {introductionId.substring(0, 8)}...
        </div>
      )
    },
  },
  {
    id: 'notes',
    header: () => <div>Notes</div>,
    cell: ({ row }) => {
      const notes = row.original.acknowledgement_notes
      if (!notes) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-sm max-w-[200px] truncate" title={notes}>
          {notes}
        </div>
      )
    },
  },
  {
    accessorKey: 'performance_fee_tier1_percent',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Perf Tier 1 %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const percent = row.original.performance_fee_tier1_percent
      if (percent == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm text-purple-400">
          {percent}%
        </div>
      )
    },
  },
  {
    accessorKey: 'performance_fee_tier1_threshold',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Perf Tier 1 Threshold
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const threshold = row.original.performance_fee_tier1_threshold
      const currency = row.original.currency
      if (threshold == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(threshold, currency)}
        </div>
      )
    },
  },
  {
    accessorKey: 'performance_fee_tier2_percent',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Perf Tier 2 %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const percent = row.original.performance_fee_tier2_percent
      if (percent == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm text-purple-300">
          {percent}%
        </div>
      )
    },
  },
  {
    accessorKey: 'performance_fee_tier2_threshold',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-mr-4"
        >
          Perf Tier 2 Threshold
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const threshold = row.original.performance_fee_tier2_threshold
      const currency = row.original.currency
      if (threshold == null) return <span className="text-muted-foreground text-sm">-</span>
      return (
        <div className="text-right font-semibold text-sm">
          {formatCurrency(threshold, currency)}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const subscription = row.original

      return (
        <div className="flex justify-center">
          <Link href={`/versotech_main/subscriptions/${subscription.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-white text-black border-white hover:bg-gray-200"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
  },
]
