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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload, FileText, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface Commission {
  id: string
  accrual_amount: number
  currency: string
  deal?: {
    name: string
  }
}

interface SubmitInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: Commission | null
  onSuccess: () => void
}

export function SubmitInvoiceDialog({
  open,
  onOpenChange,
  commission,
  onSuccess,
}: SubmitInvoiceDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [uploadedDocument, setUploadedDocument] = useState<{ id: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true)
    setError(null)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'invoice')
      formData.append('description', `Invoice for commission ${commission?.id}`)

      // Upload to documents API
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload file')
      }

      const data = await response.json()
      setUploadedDocument({
        id: data.document.id,
        name: file.name,
      })
    } catch (err) {
      console.error('[SubmitInvoiceDialog] Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!commission) return

    if (!uploadedDocument) {
      setError('Please upload an invoice document')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        invoice_document_id: uploadedDocument.id,
        invoice_number: invoiceNumber || undefined,
        notes: notes || undefined,
      }

      const response = await fetch(
        `/api/introducers/me/commissions/${commission.id}/submit-invoice`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit invoice')
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
      setInvoiceNumber('')
      setNotes('')
      setUploadedDocument(null)
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    onOpenChange(open)
  }

  if (!commission) return null

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
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
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
            <Label>Invoice Document *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadedDocument ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800 flex-1 truncate">
                  {uploadedDocument.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedDocument(null)
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
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Invoice (PDF, JPEG, PNG)
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Invoice Number */}
          <div className="space-y-2">
            <Label>Invoice Number (Optional)</Label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g., INV-2024-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for the arranger..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={submitting || uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || uploading || !uploadedDocument}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Invoice'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
