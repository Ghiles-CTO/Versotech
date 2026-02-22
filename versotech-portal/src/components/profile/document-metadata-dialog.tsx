'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { getDocumentTypeLabel } from '@/constants/kyc-document-types'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

export type UploadMetadataFields = {
  documentNumber: string
  documentIssueDate: string
  documentExpiryDate: string
  documentIssuingCountry: string
  documentDate: string
}

const EMPTY_METADATA: UploadMetadataFields = {
  documentNumber: '',
  documentIssueDate: '',
  documentExpiryDate: '',
  documentIssuingCountry: '',
  documentDate: '',
}

interface DocumentMetadataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentType: string | null
  onConfirm: (metadata: UploadMetadataFields) => void
  isSubmitting?: boolean
}

export function DocumentMetadataDialog({
  open,
  onOpenChange,
  documentType,
  onConfirm,
  isSubmitting = false,
}: DocumentMetadataDialogProps) {
  const [metadata, setMetadata] = useState<UploadMetadataFields>(EMPTY_METADATA)

  const requiresIdFields = useMemo(
    () => !!documentType && isIdDocument(documentType),
    [documentType]
  )
  const requiresAddressDate = useMemo(
    () => !!documentType && isProofOfAddress(documentType),
    [documentType]
  )

  useEffect(() => {
    if (!open) {
      setMetadata(EMPTY_METADATA)
    }
  }, [open, documentType])

  const isValid = useMemo(() => {
    if (requiresIdFields) {
      return Boolean(metadata.documentExpiryDate)
    }
    if (requiresAddressDate) {
      return Boolean(metadata.documentDate)
    }
    return true
  }, [metadata, requiresAddressDate, requiresIdFields])

  if (!documentType || (!requiresIdFields && !requiresAddressDate)) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Document Details Required</DialogTitle>
          <DialogDescription>
            Add metadata for {getDocumentTypeLabel(documentType).toLowerCase()} before upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {requiresIdFields && (
            <>
              <p className="text-xs text-muted-foreground">
                Expiry date is required. Other fields are optional.
              </p>
              <div className="space-y-2">
                <Label htmlFor="documentNumber">
                  Document Number <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="documentNumber"
                  value={metadata.documentNumber}
                  onChange={(event) => setMetadata(prev => ({ ...prev, documentNumber: event.target.value }))}
                  placeholder="Enter document number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="documentIssueDate">
                    Issue Date <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="documentIssueDate"
                    type="date"
                    value={metadata.documentIssueDate}
                    onChange={(event) => setMetadata(prev => ({ ...prev, documentIssueDate: event.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentExpiryDate">Expiry Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="documentExpiryDate"
                    type="date"
                    value={metadata.documentExpiryDate}
                    onChange={(event) => setMetadata(prev => ({ ...prev, documentExpiryDate: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentIssuingCountry">
                  Issuing Country <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="documentIssuingCountry"
                  value={metadata.documentIssuingCountry}
                  onChange={(event) => setMetadata(prev => ({ ...prev, documentIssuingCountry: event.target.value }))}
                  placeholder="e.g. United Kingdom"
                />
              </div>
            </>
          )}

          {requiresAddressDate && (
            <div className="space-y-2">
              <Label htmlFor="documentDate">Document Date <span className="text-red-500">*</span></Label>
              <Input
                id="documentDate"
                type="date"
                value={metadata.documentDate}
                onChange={(event) => setMetadata(prev => ({ ...prev, documentDate: event.target.value }))}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(metadata)}
            disabled={isSubmitting || !isValid}
          >
            Continue Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
