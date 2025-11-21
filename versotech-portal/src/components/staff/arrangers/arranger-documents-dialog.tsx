'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Upload, Download, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import type { ArrangersDashboardProps } from './arrangers-dashboard'

interface ArrangerDocumentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  arranger: ArrangersDashboardProps['arrangers'][number] | null
}

interface Document {
  id: string
  name: string
  type: string
  file_name: string
  file_key: string
  created_at: string
  file_size_bytes?: number
  created_by?: {
    display_name?: string
    email?: string
  }
}

const REQUIRED_DOCUMENTS = [
  { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
  { label: 'FCA Authorization Letter / SEC Form ADV', value: 'regulatory_license' },
  { label: 'Professional Indemnity Insurance', value: 'insurance_certificate' },
  { label: 'AML/CTF Policy Document', value: 'aml_policy' },
  { label: 'Latest Financial Statements', value: 'financial_statements' },
  { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
  { label: 'Proof of Registered Address', value: 'proof_of_address' },
]

export function ArrangerDocumentsDialog({ open, onOpenChange, arranger }: ArrangerDocumentsDialogProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const fetchDocuments = useCallback(async () => {
    if (!arranger?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/documents?arranger_entity_id=${arranger.id}&limit=100`)
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [arranger?.id])

  useEffect(() => {
    if (open && arranger?.id) {
      fetchDocuments()
    }
  }, [open, arranger?.id, fetchDocuments])

  const handleUpload = async (file: File, documentType: string) => {
    if (!arranger?.id) return

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 50MB limit')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, PNG, or TXT files')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('arranger_entity_id', arranger.id)
      formData.append('name', file.name.replace(/\.[^/.]+$/, '')) // Remove extension

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const docTypeLabel = REQUIRED_DOCUMENTS.find(d => d.value === documentType)?.label || documentType
      toast.success(`${docTypeLabel} uploaded successfully`)

      // Refresh document list
      await fetchDocuments()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRefs.current[documentType]) {
        fileInputRefs.current[documentType]!.value = ''
      }
    }
  }

  const handleDelete = async (document: Document) => {
    if (!confirm(`Delete "${document.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/staff/documents/${document.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      toast.success('Document deleted successfully')

      // Refresh document list
      await fetchDocuments()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete document')
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`)

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name || doc.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Document downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!arranger) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Documents - {arranger.legalName}</DialogTitle>
          <DialogDescription>
            Manage KYC documents, licenses, and certificates for this arranger entity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Required Documents Checklist with Upload */}
          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Required Documents</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {REQUIRED_DOCUMENTS.map((docType) => {
                  const uploaded = documents.find(d => d.type === docType.value)

                  return (
                    <div
                      key={docType.value}
                      className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {uploaded ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{docType.label}</p>
                          {uploaded && (
                            <p className="text-xs text-muted-foreground truncate">
                              {uploaded.file_name} • {formatFileSize(uploaded.file_size_bytes)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {uploaded ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(uploaded)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(uploaded)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Input
                              ref={(el) => { fileInputRefs.current[docType.value] = el }}
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleUpload(file, docType.value)
                              }}
                              disabled={uploading}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[docType.value]?.click()}
                              disabled={uploading}
                            >
                              {uploading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              Upload
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Other Documents */}
          {documents.filter(d => !REQUIRED_DOCUMENTS.some(req => req.value === d.type)).length > 0 && (
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Other Documents</h3>
              <div className="space-y-2">
                {documents
                  .filter(d => !REQUIRED_DOCUMENTS.some(req => req.value === d.type))
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.file_name} • {formatFileSize(doc.file_size_bytes)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Document Count Summary */}
          <div className="flex items-center justify-between border border-white/10 rounded-lg p-4 bg-white/5">
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold text-foreground">{documents.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Required Uploaded</p>
              <p className="text-2xl font-bold text-foreground">
                {documents.filter(d => REQUIRED_DOCUMENTS.some(req => req.value === d.type)).length} / {REQUIRED_DOCUMENTS.length}
              </p>
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-xs text-muted-foreground space-y-1 border-t border-white/10 pt-4">
            <p>• Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT</p>
            <p>• Maximum file size: 50MB per file</p>
            <p>• Documents are stored securely and linked to this arranger entity</p>
            <p>• Upload actions are logged for audit trail</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
