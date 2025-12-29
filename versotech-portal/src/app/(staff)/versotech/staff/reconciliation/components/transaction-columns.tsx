'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Eye, CheckCircle2, AlertCircle, HelpCircle, FileText, Users } from 'lucide-react'
import Link from 'next/link'

export type InvoiceSummary = {
  id: string
  invoice_number: string | null
  total: number | null
  paid_amount: number | null
  balance_due: number | null
  status: string
  match_status: string | null
  currency: string | null
  investor?: {
    id: string
    legal_name: string | null
  }
  deal?: {
    id: string
    name: string | null
  }
}

export type TransactionMatchRow = {
  id: string
  invoice_id: string
  match_type: string
  matched_amount: number
  match_confidence: number | null
  match_reason: string | null
  status: string
  approved_at: string | null
  invoices?: InvoiceSummary
}

export type TransactionSuggestionRow = {
  id: string
  invoice_id: string
  confidence: number | null
  match_reason: string | null
  amount_difference: number | null
  created_at: string
  invoices?: InvoiceSummary
}

export type BankTransactionRow = {
  id: string
  value_date: string
  amount: number
  currency: string
  counterparty: string
  memo: string | null
  account_ref: string | null
  bank_reference: string | null
  status: 'matched' | 'partially_matched' | 'unmatched'
  match_confidence: number | null
  match_notes: string | null
  matched_invoice_ids: string[] | null
  matched_amount_total?: number
  remaining_amount?: number
  created_at: string
  updated_at: string
  matches?: TransactionMatchRow[]
  suggestions?: TransactionSuggestionRow[]
}

const getStatusBadge = (status: string) => {
  const variants = {
    matched: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', icon: CheckCircle2, label: 'Matched' },
    partially_matched: { color: 'bg-amber-900/30 text-amber-300 border-amber-700', icon: AlertCircle, label: 'Partial' },
    unmatched: { color: 'bg-slate-800/50 text-slate-300 border-slate-700', icon: HelpCircle, label: 'Unmatched' }
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

const getConfidenceBadge = (confidence: number | null) => {
  if (confidence === null || confidence === undefined) return null

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

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const buildInvoiceLabel = (invoice?: InvoiceSummary | null) => {
  if (!invoice) return 'Invoice'
  if (invoice.invoice_number) return invoice.invoice_number
  return `Invoice ${invoice.id.slice(0, 8)}`
}

const renderInvoiceLine = (match: TransactionMatchRow) => {
  const invoice = match.invoices
  const label = buildInvoiceLabel(invoice)
  const investor = invoice?.investor?.legal_name
  const deal = invoice?.deal?.name

  return (
    <div key={match.id} className="space-y-0.5">
      <div className="text-sm font-medium text-foreground flex items-center gap-2">
        <FileText className="h-3.5 w-3.5" /> {label}
        <Badge variant="outline" className="border-white/10 text-xs capitalize">
          {match.match_type.replace('_', ' ')}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <span>{formatCurrency(match.matched_amount, invoice?.currency || 'USD')}</span>
        {match.match_reason && <span className="text-muted-foreground/70">• {match.match_reason}</span>}
      </div>
      {(investor || deal) && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Users className="h-3 w-3" />
          <span>{[investor, deal].filter(Boolean).join(' • ')}</span>
        </div>
      )}
    </div>
  )
}

const renderSuggestionSummary = (transaction: BankTransactionRow) => {
  const suggestions = transaction.suggestions || []
  if (!suggestions.length) {
    return <span className="text-muted-foreground text-sm">—</span>
  }

  const topSuggestion = suggestions[0]
  const invoice = topSuggestion.invoices
  const label = buildInvoiceLabel(invoice)
  const investor = invoice?.investor?.legal_name

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-amber-300">
        {label}
        {suggestions.length > 1 && (
          <span className="text-xs text-muted-foreground ml-2">
            +{suggestions.length - 1} more
          </span>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {investor || 'Potential match'}
      </div>
      {getConfidenceBadge(topSuggestion.confidence)}
    </div>
  )
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
      const firstMatch = transaction.matches?.[0]
      const invoice = firstMatch?.invoices
      const investor = invoice?.investor?.legal_name

      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{transaction.counterparty}</div>
          {investor && (
            <div className="text-xs text-emerald-300">→ {investor}</div>
          )}
          {!investor && (transaction.suggestions?.length || 0) > 0 && (
            <div className="text-xs text-amber-400">{transaction.suggestions?.length} suggestion{(transaction.suggestions?.length || 0) > 1 ? 's' : ''}</div>
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
          {typeof transaction.matched_amount_total === 'number' && transaction.matched_amount_total > 0 && (
            <div className="text-xs text-emerald-300">
              Matched {formatCurrency(transaction.matched_amount_total, transaction.currency)}
            </div>
          )}
          {typeof transaction.remaining_amount === 'number' && transaction.remaining_amount > 0 && (
            <div className="text-xs text-amber-400">
              Remaining {formatCurrency(transaction.remaining_amount, transaction.currency)}
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

      if (transaction.matches && transaction.matches.length > 0) {
        return (
          <div className="space-y-2">
            {transaction.matches.slice(0, 2).map(renderInvoiceLine)}
            {transaction.matches.length > 2 && (
              <div className="text-xs text-muted-foreground">+{transaction.matches.length - 2} more matches</div>
            )}
          </div>
        )
      }

      return renderSuggestionSummary(transaction)
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
          {transaction.match_notes && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {transaction.match_notes}
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
        <Link href={`/versotech_main/reconciliation/${transaction.id}`}>
          <Button variant="ghost" size="sm" className="hover:bg-white/5">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </Link>
      )
    },
  },
]
