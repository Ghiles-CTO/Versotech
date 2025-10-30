'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Eye, CheckCircle2, AlertCircle, XCircle, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export type BankTransactionRow = {
  id: string
  value_date: string
  amount: number
  currency: string
  counterparty: string
  memo: string | null
  account_ref: string
  bank_reference: string | null
  status: string
  matched_subscription_id: string | null
  match_confidence: number | null
  discrepancy_amount: number | null
  resolution_notes: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string

  subscriptions?: {
    id: string
    commitment: number
    funded_amount: number
    currency: string
    status: string
    investors: {
      id: string
      legal_name: string
    }
    vehicles: {
      id: string
      name: string
      vehicle_type: string
    }
  }

  suggested_matches?: Array<{
    id: string
    subscription_id: string
    confidence: number
    match_reason: string
    amount_difference: number
    subscriptions: {
      id: string
      commitment: number
      funded_amount: number
      currency: string
      investors: {
        id: string
        legal_name: string
      }
      vehicles: {
        id: string
        name: string
      }
    }
  }>
}

function getStatusBadge(status: string) {
  const variants = {
    matched: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', icon: CheckCircle2, label: 'Matched' },
    unmatched: { color: 'bg-slate-800/50 text-slate-300 border-slate-700', icon: HelpCircle, label: 'Unmatched' },
    resolved: { color: 'bg-blue-900/30 text-blue-300 border-blue-700', icon: CheckCircle2, label: 'Resolved' },
    partially_matched: { color: 'bg-amber-900/30 text-amber-300 border-amber-700', icon: AlertCircle, label: 'Partial' },
  }
  const variant = variants[status as keyof typeof variants] || variants.unmatched
  const Icon = variant.icon

  return (
    <Badge className={`${variant.color} gap-1.5`}>
      <Icon className="h-3 w-3" />
      {variant.label}
    </Badge>
  )
}

function getConfidenceBadge(confidence: number | null) {
  if (confidence === null) return null

  const color = confidence >= 80
    ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
    : confidence >= 60
    ? 'bg-amber-900/30 text-amber-300 border-amber-700'
    : 'bg-rose-900/30 text-rose-300 border-rose-700'

  return (
    <Badge className={color}>
      {confidence}% match
    </Badge>
  )
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const transactionColumns: ColumnDef<BankTransactionRow>[] = [
  {
    id: 'value_date',
    accessorKey: 'value_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium text-foreground">
          {formatDate(row.original.value_date)}
        </div>
      )
    },
  },
  {
    id: 'counterparty',
    accessorKey: 'counterparty',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Counterparty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const transaction = row.original
      const matchedInvestor = transaction.subscriptions?.investors?.legal_name
      const suggestedCount = transaction.suggested_matches?.length || 0

      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{transaction.counterparty}</div>
          {matchedInvestor && (
            <div className="text-xs text-emerald-400">→ {matchedInvestor}</div>
          )}
          {suggestedCount > 0 && !matchedInvestor && (
            <div className="text-xs text-amber-400">{suggestedCount} suggestion{suggestedCount > 1 ? 's' : ''}</div>
          )}
          {transaction.memo && (
            <div className="text-xs text-muted-foreground truncate max-w-xs">{transaction.memo}</div>
          )}
        </div>
      )
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const transaction = row.original
      const isNegative = transaction.amount < 0

      return (
        <div className="space-y-1">
          <div className={`font-semibold ${isNegative ? 'text-rose-400' : 'text-foreground'}`}>
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
          {transaction.discrepancy_amount && transaction.discrepancy_amount !== 0 && (
            <div className="text-xs text-amber-400">
              Δ {formatCurrency(Math.abs(transaction.discrepancy_amount), transaction.currency)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'matched_to',
    header: 'Matched To',
    cell: ({ row }) => {
      const transaction = row.original
      const subscription = transaction.subscriptions

      if (!subscription) {
        return <span className="text-muted-foreground text-sm">—</span>
      }

      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">
            {subscription.vehicles?.name || 'Unknown Vehicle'}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(subscription.commitment, subscription.currency)} commitment
          </div>
        </div>
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const transaction = row.original

      return (
        <div className="space-y-1.5">
          {getStatusBadge(transaction.status)}
          {transaction.match_confidence && getConfidenceBadge(transaction.match_confidence)}
          {transaction.resolved_at && (
            <div className="text-xs text-blue-400">
              Resolved {formatDate(transaction.resolved_at)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'reference',
    header: 'Reference',
    cell: ({ row }) => {
      const transaction = row.original

      return (
        <div className="space-y-1">
          {transaction.bank_reference && (
            <div className="text-xs font-mono text-muted-foreground">
              {transaction.bank_reference}
            </div>
          )}
          {transaction.account_ref && (
            <div className="text-xs text-muted-foreground">
              {transaction.account_ref}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const transaction = row.original

      return (
        <Link href={`/versotech/staff/reconciliation/${transaction.id}`}>
          <Button variant="ghost" size="sm" className="hover:bg-white/5">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </Link>
      )
    },
  },
]
