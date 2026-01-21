'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Clock, FileCheck, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Commission summary type - shared between partners and introducers
 */
export type CommissionSummary = {
  accrued: number
  invoice_requested: number
  invoice_submitted?: number
  invoiced: number
  paid: number
  cancelled: number
  rejected?: number
  total_owed: number
  currency: string
}

interface CommissionSummaryProps {
  summary: CommissionSummary
  variant?: 'card' | 'compact' | 'inline'
  className?: string
  /** Optional title override (default: "Commission Summary") */
  title?: string
}

/**
 * Displays commission summary for a partner or introducer
 * Shows breakdown by status: accrued, invoiced, paid
 *
 * Variants:
 * - 'card': Full card with header, grid layout, and progress bar
 * - 'compact': Horizontal badges for smaller displays
 * - 'inline': Minimal text for table cells
 */
export function CommissionSummary({
  summary,
  variant = 'card',
  className,
  title = 'Commission Summary',
}: CommissionSummaryProps) {
  const invoiceSubmitted = summary.invoice_submitted ?? 0
  const { accrued, invoice_requested, invoiced, paid, total_owed, currency } = summary
  const invoicedTotal = invoice_requested + invoiceSubmitted + invoiced

  // Inline variant - for table cells
  if (variant === 'inline') {
    return (
      <div className={cn('space-y-1', className)}>
        {paid > 0 && (
          <div className="text-sm">
            <span className="text-green-600 font-medium">
              {formatCurrency(paid, currency)}
            </span>
            <span className="text-muted-foreground text-xs ml-1">paid</span>
          </div>
        )}
        {total_owed > 0 && (
          <div className="text-xs text-yellow-600">
            {formatCurrency(total_owed, currency)} pending
          </div>
        )}
        {paid === 0 && total_owed === 0 && (
          <span className="text-muted-foreground text-xs">No commissions</span>
        )}
      </div>
    )
  }

  // Compact variant - for smaller displays
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {accrued > 0 && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            {formatCurrency(accrued, currency)} accrued
          </Badge>
        )}
        {invoicedTotal > 0 && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
            <FileCheck className="h-3 w-3 mr-1" />
            {formatCurrency(invoicedTotal, currency)} invoiced
          </Badge>
        )}
        {paid > 0 && (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {formatCurrency(paid, currency)} paid
          </Badge>
        )}
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Accrued */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-blue-500" />
              Accrued
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(accrued, currency)}
            </div>
          </div>

          {/* Invoiced */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileCheck className="h-3 w-3 text-yellow-500" />
              Invoiced
            </div>
            <div className="text-lg font-semibold text-yellow-600">
            {formatCurrency(invoicedTotal, currency)}
            </div>
          </div>

          {/* Paid */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Paid
            </div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(paid, currency)}
            </div>
          </div>

          {/* Total Owed */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 text-purple-500" />
              Total Owed
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {formatCurrency(total_owed, currency)}
            </div>
          </div>
        </div>

        {/* Progress bar showing paid vs owed */}
        {(paid + total_owed) > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Payment Progress</span>
              <span>
                {Math.round((paid / (paid + total_owed)) * 100)}% paid
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(paid / (paid + total_owed)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Displays a simple badge showing payment status
 */
export function PaymentStatusBadge({
  summary,
  className,
}: {
  summary: CommissionSummary
  className?: string
}) {
  const { paid, total_owed } = summary

  if (paid === 0 && total_owed === 0) {
    return (
      <Badge variant="outline" className={cn('text-muted-foreground', className)}>
        No commissions
      </Badge>
    )
  }

  if (total_owed === 0 && paid > 0) {
    return (
      <Badge variant="outline" className={cn('bg-green-500/10 text-green-600 border-green-200', className)}>
        <CheckCircle2 className="h-3 w-3 mr-1" />
        All paid
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={cn('bg-yellow-500/10 text-yellow-600 border-yellow-200', className)}>
      <Clock className="h-3 w-3 mr-1" />
      {formatCurrency(total_owed, summary.currency)} pending
    </Badge>
  )
}

// Re-export with old names for backwards compatibility during migration
export { CommissionSummary as PartnerCommissionSummary }
export { PaymentStatusBadge as PartnerPaymentBadge }
