'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

export type CommissionType = 'partner' | 'introducer' | 'commercial-partner'

interface Commission {
  id: string
  accrual_amount: number
  currency: string
  deal?: {
    name: string
  }
  arranger?: {
    legal_name: string
  }
}

interface SubmitInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: Commission | null
  commissionType: CommissionType
  onSuccess: () => void
}

const ENTITY_LABELS: Record<CommissionType, string> = {
  'partner': 'Partner',
  'introducer': 'Introducer',
  'commercial-partner': 'Commercial Partner',
}

/**
 * Generic Submit Invoice Dialog
 * Works for all commission types: partner, introducer, commercial-partner
 * Uploads invoice to storage and updates commission status via unified API
 */
export function SubmitInvoiceDialog({
  open,
  onOpenChange,
  commission,
  commissionType,
  onSuccess,
}: SubmitInvoiceDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, JPEG, or PNG file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!commission || !selectedFile) return

    setSubmitting(true)
    setError(null)

    try {
      // Build API URL using unified invoice endpoint
      const apiUrl = `/api/commissions/${commissionType}/${commission.id}/invoice`

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload invoice')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('[SubmitInvoiceDialog] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset form state
      setSelectedFile(null)
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    onOpenChange(open)
  }

  if (!commission) return null

  const entityLabel = ENTITY_LABELS[commissionType]
  const formattedAmount = formatCurrency(
    commission.accrual_amount,
    commission.currency || 'USD'
  )

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Invoice
          </DialogTitle>
          <DialogDescription>
            Upload your invoice for this commission payment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Commission Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            {commission.arranger && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Arranger:</span>
                <span className="font-medium">{commission.arranger.legal_name}</span>
              </div>
            )}
            {commission.deal && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deal:</span>
                <span className="font-medium">{commission.deal.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-primary">{formattedAmount}</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Document *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800 flex-1 truncate">
                  {selectedFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Invoice (PDF, JPEG, PNG)
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Maximum file size: 10MB
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              Once submitted, your invoice will be sent to the arranger and the commission
              status will be updated to "Invoiced".
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedFile}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
