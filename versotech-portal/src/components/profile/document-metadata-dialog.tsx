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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDocumentTypeLabel } from '@/constants/kyc-document-types'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

export type UploadDocumentTypeOption = {
  value: string
  label: string
}

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
  documentTypeOptions?: UploadDocumentTypeOption[]
  defaultDocumentType?: string | null
  onConfirm: (metadata: UploadMetadataFields, documentType?: string) => void
  isSubmitting?: boolean
}

export function DocumentMetadataDialog({
  open,
  onOpenChange,
  documentType,
  documentTypeOptions,
  defaultDocumentType,
  onConfirm,
  isSubmitting = false,
}: DocumentMetadataDialogProps) {
  const [metadata, setMetadata] = useState<UploadMetadataFields>(EMPTY_METADATA)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('')

  const resolvedDocumentType = useMemo(
    () =>
      selectedDocumentType ||
      defaultDocumentType ||
      documentTypeOptions?.[0]?.value ||
      documentType ||
      '',
    [defaultDocumentType, documentType, documentTypeOptions, selectedDocumentType]
  )

  const showsDocumentTypeSelect = (documentTypeOptions?.length || 0) > 1

  const requiresIdFields = useMemo(
    () => !!resolvedDocumentType && isIdDocument(resolvedDocumentType),
    [resolvedDocumentType]
  )
  const requiresAddressDate = useMemo(
    () => !!resolvedDocumentType && isProofOfAddress(resolvedDocumentType),
    [resolvedDocumentType]
  )

  useEffect(() => {
    if (!open) {
      setMetadata(EMPTY_METADATA)
      setSelectedDocumentType('')
      return
    }

    setSelectedDocumentType(defaultDocumentType || documentTypeOptions?.[0]?.value || documentType || '')
  }, [defaultDocumentType, documentType, documentTypeOptions, open])

  const isValid = useMemo(() => {
    if (showsDocumentTypeSelect && !resolvedDocumentType) {
      return false
    }
    if (requiresIdFields) {
      return Boolean(metadata.documentExpiryDate)
    }
    if (requiresAddressDate) {
      return Boolean(metadata.documentDate)
    }
    return true
  }, [metadata, requiresAddressDate, requiresIdFields])

  if (!resolvedDocumentType || (!showsDocumentTypeSelect && !requiresIdFields && !requiresAddressDate)) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Document Details Required</DialogTitle>
          <DialogDescription>
            Add the required document details before upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showsDocumentTypeSelect && (
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={resolvedDocumentType} onValueChange={setSelectedDocumentType}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypeOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This upload will count toward {getDocumentTypeLabel(resolvedDocumentType).toLowerCase()}.
              </p>
            </div>
          )}

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
            onClick={() => onConfirm(metadata, resolvedDocumentType)}
            disabled={isSubmitting || !isValid}
          >
            Continue Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
