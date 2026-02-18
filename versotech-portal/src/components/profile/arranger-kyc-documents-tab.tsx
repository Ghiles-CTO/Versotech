'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Shield,
  AlertCircle,
  User
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ENTITY_REQUIRED_DOCS } from '@/constants/kyc-document-types'

interface Document {
  id: string
  name: string
  type: string
  file_name: string
  file_key: string
  created_at: string
  file_size_bytes?: number
  arranger_user_id?: string | null
  arranger_member_id?: string | null
  created_by?: {
    display_name?: string
    email?: string
  }
}

interface ArrangerMember {
  id: string
  full_name: string
  role: string
  is_signatory?: boolean
  linked_user_id?: string | null
}

const REQUIRED_DOCUMENTS = ENTITY_REQUIRED_DOCS.map(doc => ({
  label: doc.label,
  value: doc.value,
}))

// Required KYC documents for members (individual-level)
const MEMBER_DOCUMENTS = [
  { label: 'Passport / Government ID', value: 'passport' },
  { label: 'Proof of Address (Utility Bill)', value: 'utility_bill' },
]

interface ArrangerKYCDocumentsTabProps {
  arrangerId: string
  arrangerName?: string
  kycStatus?: string
}

export function ArrangerKYCDocumentsTab({
  arrangerId,
  arrangerName,
  kycStatus
}: ArrangerKYCDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [members, setMembers] = useState<ArrangerMember[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const currentKycStatus = kycStatus
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const fetchDocuments = useCallback(async () => {
    if (!arrangerId) return

    setLoading(true)
    try {
      const response = await fetch('/api/arrangers/me/documents')
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setDocuments(data.documents || [])
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [arrangerId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (file: File, documentType: string, memberId?: string) => {
    if (!arrangerId) return

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
      'image/webp',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, PNG, or TXT files')
      return
    }

    const uploadKey = memberId ? `${documentType}_${memberId}` : documentType
    setUploading(uploadKey)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
      if (memberId && memberId !== 'entity-level') {
        formData.append('arranger_member_id', memberId)
      }

      const response = await fetch('/api/arrangers/me/documents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const docTypeLabel = [...REQUIRED_DOCUMENTS, ...MEMBER_DOCUMENTS].find(d => d.value === documentType)?.label || documentType
      toast.success(`${docTypeLabel} uploaded successfully`)

      await fetchDocuments()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(null)
      const inputKey = memberId ? `${documentType}_${memberId}` : documentType
      if (fileInputRefs.current[inputKey]) {
        fileInputRefs.current[inputKey]!.value = ''
      }
    }
  }

  const handleDelete = async (document: Document) => {
    if (!confirm(`Delete "${document.name}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(document.id)

    try {
      const response = await fetch(`/api/arrangers/me/documents/${document.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      toast.success('Document deleted successfully')
      await fetchDocuments()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete document')
    } finally {
      setDeleting(null)
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const uploadedCount = documents.filter(d =>
    REQUIRED_DOCUMENTS.some(req => req.value === d.type)
  ).length
  const completionPercentage = Math.round((uploadedCount / REQUIRED_DOCUMENTS.length) * 100)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* KYC Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                completionPercentage === 100 ? "bg-green-100" : "bg-blue-100"
              )}>
                <Shield className={cn(
                  "h-5 w-5",
                  completionPercentage === 100 ? "text-green-600" : "text-blue-600"
                )} />
              </div>
              <div>
                <CardTitle>KYC Documents</CardTitle>
                <CardDescription>
                  {arrangerName ? `Compliance documents for ${arrangerName}` : 'Upload required compliance documents'}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Entity: <span className="font-medium text-foreground">{arrangerName || 'Current arranger entity'}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {uploadedCount}/{REQUIRED_DOCUMENTS.length}
                </span>
                {currentKycStatus && (
                  <Badge variant="outline" className={cn('capitalize', getStatusColor(currentKycStatus))}>
                    KYC: {currentKycStatus.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {completionPercentage}% complete
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={cn(
                "h-2.5 rounded-full transition-all duration-500",
                completionPercentage === 100 ? 'bg-green-500' :
                completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {completionPercentage < 100 && (
            <p className="text-xs text-muted-foreground mt-2">
              Upload all required documents to complete KYC verification
            </p>
          )}
        </CardContent>
      </Card>

      {/* Required Documents Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required Documents</CardTitle>
          <CardDescription>
            These documents are required for regulatory compliance and KYC verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {REQUIRED_DOCUMENTS.map((docType) => {
                const uploaded = documents.find(d => d.type === docType.value)
                const isUploading = uploading === docType.value
                const isDeleting = deleting === uploaded?.id

                return (
                  <div
                    key={docType.value}
                    className={cn(
                      "flex items-center justify-between gap-4 py-3 px-4 rounded-lg border transition-colors",
                      uploaded ? "border-green-200 bg-green-50/50" : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {uploaded ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {docType.label}
                        </p>
                        {uploaded && (
                          <p className="text-xs text-muted-foreground truncate">
                            {uploaded.file_name} • {formatFileSize(uploaded.file_size_bytes)} • {formatDate(uploaded.created_at)}
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
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(uploaded)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Input
                            ref={(el) => { fileInputRefs.current[docType.value] = el }}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
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

      {/* Member KYC Documents Section */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Member KYC Documents
            </CardTitle>
            <CardDescription>
              Upload ID and Proof of Address for each member/director. Required for full KYC compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {members.map((member) => {
              const memberDocs = documents.filter(d => d.arranger_member_id === member.id)

              return (
                <div key={member.id} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{member.full_name}</span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {member.role}
                    </Badge>
                    {member.is_signatory && (
                      <Badge variant="secondary" className="text-xs">Signatory</Badge>
                    )}
                  </div>

                  {MEMBER_DOCUMENTS.map((docType) => {
                    const uploaded = memberDocs.find(d => d.type === docType.value)
                    const uploadKey = `${docType.value}_${member.id}`
                    const isUploading = uploading === uploadKey
                    const isDeleting = deleting === uploaded?.id

                    return (
                      <div
                        key={uploadKey}
                        className={cn(
                          "flex items-center justify-between gap-4 py-2 px-3 rounded-lg border transition-colors ml-6",
                          uploaded ? "border-green-200 bg-green-50/50" : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {uploaded ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {docType.label}
                            </p>
                            {uploaded && (
                              <p className="text-xs text-muted-foreground truncate">
                                {uploaded.file_name} • {formatFileSize(uploaded.file_size_bytes)} • {formatDate(uploaded.created_at)}
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
                                className="h-7 w-7 p-0"
                                title="Download"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(uploaded)}
                                disabled={isDeleting}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Input
                                ref={(el) => { fileInputRefs.current[uploadKey] = el }}
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleUpload(file, docType.value, member.id)
                                }}
                                disabled={isUploading}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRefs.current[uploadKey]?.click()}
                                disabled={isUploading}
                                className="h-7 text-xs"
                              >
                                {isUploading ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                  <Upload className="h-3.5 w-3.5 mr-1" />
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
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Additional Documents Section */}
      {documents.filter(d => !REQUIRED_DOCUMENTS.some(req => req.value === d.type) && !MEMBER_DOCUMENTS.some(m => m.value === d.type)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Documents</CardTitle>
            <CardDescription>
              Other documents uploaded for compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents
                .filter(d => !REQUIRED_DOCUMENTS.some(req => req.value === d.type))
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.type} • {formatFileSize(doc.file_size_bytes)} • {formatDate(doc.created_at)}
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
                        disabled={deleting === doc.id}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">Document Requirements</p>
              <ul className="text-blue-700 space-y-0.5">
                <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT</li>
                <li>• Maximum file size: 50MB per file</li>
                <li>• Documents must be current and valid</li>
                <li>• VERSO staff will review your documents for KYC approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
