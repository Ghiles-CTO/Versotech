'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Download, FileText, ExternalLink, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

export type CommissionType = 'partner' | 'introducer' | 'commercial-partner'

interface Commission {
  id: string
  accrual_amount: number
  currency: string | null
  entity_name: string
  invoice_id: string | null
  deal?: {
    name: string
  }
}

interface ViewInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: Commission | null
  commissionType: CommissionType
}

const ENTITY_LABELS: Record<CommissionType, string> = {
  'partner': 'Partner',
  'introducer': 'Introducer',
  'commercial-partner': 'Commercial Partner',
}

/**
 * View Invoice Dialog
 * Displays uploaded invoice PDF/image for a commission
 * Fetches signed URL from API and renders in iframe or img
 */
export function ViewInvoiceDialog({
  open,
  onOpenChange,
  commission,
  commissionType,
}: ViewInvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [invoicePath, setInvoicePath] = useState<string | null>(null)

  // Fetch signed URL when dialog opens
  useEffect(() => {
    const fetchInvoiceUrl = async () => {
      if (!open || !commission?.invoice_id) {
        setInvoiceUrl(null)
        setInvoicePath(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const apiUrl = `/api/commissions/${commissionType}/${commission.id}/invoice`
        const response = await fetch(apiUrl)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch invoice')
        }

        const result = await response.json()
        setInvoiceUrl(result.data.url)
        setInvoicePath(result.data.path)
      } catch (err) {
        console.error('[ViewInvoiceDialog] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoiceUrl()
  }, [open, commission?.id, commission?.invoice_id, commissionType])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setInvoiceUrl(null)
      setInvoicePath(null)
      setError(null)
    }
  }, [open])

  const handleDownload = () => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank')
    }
  }

  const handleOpenNewTab = () => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank')
    }
  }

  if (!commission) return null

  const entityLabel = ENTITY_LABELS[commissionType]
  const currencyCode = (commission.currency || '').trim().toUpperCase()
  const formattedAmount = currencyCode
    ? formatCurrency(commission.accrual_amount, currencyCode)
    : Number(commission.accrual_amount || 0).toLocaleString()

  // Determine if it's a PDF or image based on file extension
  const isPdf = invoicePath?.toLowerCase().endsWith('.pdf')
  const isImage = invoicePath?.match(/\.(png|jpg|jpeg)$/i)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice from {commission.entity_name}
          </DialogTitle>
          <DialogDescription>
            {entityLabel} commission invoice for {formattedAmount}
            {commission.deal && ` - ${commission.deal.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading invoice...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center p-6">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-destructive font-medium">Failed to load invoice</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && invoiceUrl && (
            <>
              {isPdf && (
                <iframe
                  src={invoiceUrl}
                  className="w-full h-full min-h-[500px] rounded-lg border"
                  title="Invoice PDF"
                />
              )}

              {isImage && (
                <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/30 rounded-lg border overflow-auto p-4">
                  <img
                    src={invoiceUrl}
                    alt="Invoice"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {!isPdf && !isImage && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Preview not available for this file type.
                    </p>
                    <Button className="mt-4" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && !invoiceUrl && !commission.invoice_id && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center p-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No invoice has been uploaded yet.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {invoiceUrl && (
            <>
              <Button variant="outline" onClick={handleOpenNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
