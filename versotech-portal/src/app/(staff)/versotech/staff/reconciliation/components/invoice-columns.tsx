'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, FileText, CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react'

export type ReconciliationInvoiceRow = {
  id: string
  invoice_number: string | null
  total: number
  paid_amount: number
  balance_due: number
  status: string
  match_status: string | null
  currency: string | null
  created_at: string
  paid_at: string | null
  investor?: {
    id: string
    legal_name: string | null
  }
  deal?: {
    id: string
    name: string | null
  }
  match_count?: number
  transaction_count?: number
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { color: string; icon: any; label: string }> = {
    paid: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', icon: CheckCircle2, label: 'Paid' },
    partially_paid: { color: 'bg-amber-900/30 text-amber-300 border-amber-700', icon: Clock, label: 'Partial' },
    sent: { color: 'bg-blue-900/30 text-blue-300 border-blue-700', icon: FileText, label: 'Sent' },
    overdue: { color: 'bg-rose-900/30 text-rose-300 border-rose-700', icon: AlertCircle, label: 'Overdue' },
    draft: { color: 'bg-slate-800/50 text-slate-300 border-slate-700', icon: Clock, label: 'Draft' },
  }
  const variant = variants[status] || variants.draft
  const Icon = variant.icon
  return (
    <Badge className={`${variant.color} gap-1.5`}>
      <Icon className="h-3 w-3" />
      {variant.label}
    </Badge>
  )
}

const getMatchStatusBadge = (matchStatus: string | null) => {
  if (!matchStatus) return null
  const variants: Record<string, { color: string; label: string }> = {
    matched: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', label: 'Matched' },
    partially_matched: { color: 'bg-amber-900/30 text-amber-300 border-amber-700', label: 'Partial Match' },
    unmatched: { color: 'bg-slate-800/50 text-slate-300 border-slate-700', label: 'Unmatched' },
  }
  const variant = variants[matchStatus] || variants.unmatched
  return (
    <Badge className={variant.color}>
      {variant.label}
    </Badge>
  )
}

const formatCurrency = (amount: number, currency: string | null) => {
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

export const invoiceColumns: ColumnDef<ReconciliationInvoiceRow>[] = [
  {
    id: 'invoice_number',
    accessorKey: 'invoice_number',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Invoice #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const invoice = row.original
      const invoiceNumber = invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`
      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            {invoiceNumber}
          </div>
          {invoice.deal?.name && (
            <div className="text-xs text-muted-foreground">{invoice.deal.name}</div>
          )}
        </div>
      )
    },
  },
  {
    id: 'investor',
    header: 'Investor',
    cell: ({ row }) => {
      const investor = row.original.investor
      return (
        <div className="font-medium text-foreground">
          {investor?.legal_name || '—'}
        </div>
      )
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </div>
      )
    },
  },
  {
    id: 'total',
    accessorKey: 'total',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <div className="font-semibold text-foreground">
          {formatCurrency(invoice.total, invoice.currency)}
        </div>
      )
    },
  },
  {
    id: 'paid_amount',
    accessorKey: 'paid_amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Paid
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const invoice = row.original
      const paidPct = invoice.total > 0 ? (invoice.paid_amount / invoice.total) * 100 : 0
      return (
        <div className="space-y-1">
          <div className={`text-sm font-medium ${invoice.paid_amount > 0 ? 'text-emerald-300' : 'text-muted-foreground'}`}>
            {formatCurrency(invoice.paid_amount, invoice.currency)}
          </div>
          {paidPct > 0 && (
            <div className="text-xs text-muted-foreground">
              {paidPct.toFixed(0)}% paid
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'balance_due',
    accessorKey: 'balance_due',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-white/5 -ml-4"
        >
          Balance Due
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <div className={`font-medium ${invoice.balance_due > 0 ? 'text-amber-300' : 'text-muted-foreground'}`}>
          {formatCurrency(invoice.balance_due, invoice.currency)}
        </div>
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <div className="space-y-1.5">
          {getStatusBadge(invoice.status)}
          {invoice.paid_at && (
            <div className="text-xs text-muted-foreground">
              Paid {formatDate(invoice.paid_at)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'match_status',
    header: 'Match Status',
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <div className="space-y-1">
          {getMatchStatusBadge(invoice.match_status)}
          {(invoice.match_count || 0) > 0 && (
            <div className="text-xs text-muted-foreground">
              {invoice.match_count} match{invoice.match_count === 1 ? '' : 'es'}
            </div>
          )}
        </div>
      )
    },
  },
]
