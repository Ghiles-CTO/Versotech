'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Upload, Download, Trash2, CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

export type EntityType = 'investor' | 'introducer' | 'arranger' | 'lawyer' | 'partner' | 'commercial_partner'

interface RequiredDocument {
  label: string
  value: string
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

// Required documents by entity type
const REQUIRED_DOCUMENTS: Record<EntityType, RequiredDocument[]> = {
  investor: [
    { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
    { label: 'Memorandum & Articles of Association', value: 'memorandum_articles' },
    { label: 'Register of Members/Directors', value: 'register_members_directors' },
    { label: 'Passport/ID (Authorized Signatories)', value: 'signatory_id' },
    { label: 'Proof of Address (Signatories)', value: 'signatory_proof_of_address' },
    { label: 'Source of Funds Declaration', value: 'source_of_funds' },
    { label: 'Tax Forms (W-8BEN-E/W-9)', value: 'tax_forms' },
  ],
  introducer: [
    { label: 'Introducer Agreement', value: 'introducer_agreement' },
    { label: 'Company Registration', value: 'company_registration' },
    { label: 'Proof of Address', value: 'proof_of_address' },
  ],
  arranger: [
    { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
    { label: 'FCA Authorization Letter / SEC Form ADV', value: 'regulatory_license' },
    { label: 'Professional Indemnity Insurance', value: 'insurance_certificate' },
    { label: 'AML/CTF Policy Document', value: 'aml_policy' },
    { label: 'Latest Financial Statements', value: 'financial_statements' },
    { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
    { label: 'Proof of Registered Address', value: 'proof_of_address' },
  ],
  lawyer: [
    { label: 'Bar Registration Certificate', value: 'bar_registration' },
    { label: 'Professional Indemnity Insurance', value: 'professional_insurance' },
    { label: 'Firm Registration', value: 'firm_registration' },
    { label: 'Practice License', value: 'practice_license' },
  ],
  partner: [
    { label: 'Accreditation Certificate', value: 'accreditation_certificate' },
    { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
    { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
    { label: 'Source of Funds Declaration', value: 'source_of_funds' },
    { label: 'Tax Forms', value: 'tax_forms' },
  ],
  commercial_partner: [
    { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
    { label: 'Regulatory License', value: 'regulatory_license' },
    { label: 'Professional Indemnity Insurance', value: 'insurance_certificate' },
    { label: 'AML/CTF Policy Document', value: 'aml_policy' },
    { label: 'Partnership Agreement', value: 'partnership_agreement' },
  ],
}

interface KYCDocumentsTabProps {
  entityType: EntityType
  entityId: string
  entityName?: string
  readOnly?: boolean
}

export function KYCDocumentsTab({ entityType, entityId, entityName, readOnly = false }: KYCDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const requiredDocuments = REQUIRED_DOCUMENTS[entityType] || []

  const fetchDocuments = useCallback(async () => {
    if (!entityId) return

    setLoading(true)
    try {
      // Build the query parameter based on entity type
      // Map entity types to their correct API parameter names
      const paramMapping: Record<string, string> = {
        investor: 'owner_investor_id',
        arranger: 'arranger_entity_id',
        introducer: 'introducer_id',
        lawyer: 'lawyer_id',
        partner: 'partner_id',
        commercial_partner: 'commercial_partner_id',
      }
      const paramName = paramMapping[entityType] || `${entityType}_id`
      const response = await fetch(`/api/documents?${paramName}=${entityId}&limit=100`)
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (file: File, documentType: string) => {
    if (!entityId) return

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

    setUploading(documentType)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('name', file.name.replace(/\.[^/.]+$/, '')) // Remove extension

      // Set the entity relationship based on type
      const paramName = entityType === 'arranger' ? 'arranger_entity_id' : `${entityType}_id`
      formData.append(paramName, entityId)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const docTypeLabel = requiredDocuments.find(d => d.value === documentType)?.label || documentType
      toast.success(`${docTypeLabel} uploaded successfully`)

      // Refresh document list
      await fetchDocuments()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(null)
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

  const uploadedCount = documents.filter(d => requiredDocuments.some(req => req.value === d.type)).length
  const completionPercentage = requiredDocuments.length > 0
    ? Math.round((uploadedCount / requiredDocuments.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>KYC Documents</CardTitle>
              <CardDescription>
                {entityName ? `Compliance documents for ${entityName}` : 'Required compliance and verification documents'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {uploadedCount}/{requiredDocuments.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {completionPercentage}% complete
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                completionPercentage === 100 ? 'bg-green-500' :
                completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Required Documents Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required Documents</CardTitle>
          <CardDescription>
            Upload all required documents to complete KYC verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {requiredDocuments.map((docType) => {
                const uploaded = documents.find(d => d.type === docType.value)
                const isUploading = uploading === docType.value

                return (
                  <div
                    key={docType.value}
                    className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
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
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(uploaded)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      ) : !readOnly && (
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
                            disabled={isUploading}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRefs.current[docType.value]?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
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
        </CardContent>
      </Card>

      {/* Other Documents */}
      {documents.filter(d => !requiredDocuments.some(req => req.value === d.type)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Documents</CardTitle>
            <CardDescription>
              Other documents uploaded for this entity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents
                .filter(d => !requiredDocuments.some(req => req.value === d.type))
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
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground space-y-1 border-t border-white/10 pt-4">
        <p>• Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT</p>
        <p>• Maximum file size: 50MB per file</p>
        <p>• Documents are stored securely and linked to this entity</p>
        <p>• Upload actions are logged for audit trail</p>
      </div>
    </div>
  )
}

// Export the required documents config for external use
export { REQUIRED_DOCUMENTS }
