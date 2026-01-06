'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  Circle,
  Loader2,
  Shield,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

// Required KYC documents for lawyers/law firms
const REQUIRED_DOCUMENTS = [
  { label: 'Certificate of Incorporation / Registration', value: 'certificate_of_incorporation' },
  { label: 'Proof of Registered Address', value: 'proof_of_address' },
  { label: 'Professional License / Bar Registration', value: 'professional_license' },
  { label: 'Professional Indemnity Insurance', value: 'professional_insurance' },
  { label: 'Partners/Directors List', value: 'directors_list' },
  { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
]

interface LawyerKYCDocumentsTabProps {
  lawyerId: string
  lawyerName?: string
  kycStatus?: string
}

export function LawyerKYCDocumentsTab({
  lawyerId,
  lawyerName,
  kycStatus
}: LawyerKYCDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [currentKycStatus, setCurrentKycStatus] = useState(kycStatus)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const fetchDocuments = useCallback(async () => {
    if (!lawyerId) return

    setLoading(true)
    try {
      const response = await fetch('/api/lawyers/me/documents')
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [lawyerId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (file: File, documentType: string) => {
    if (!lawyerId) return

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 50MB limit')
      return
    }

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

    setUploading(documentType)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))

      const response = await fetch('/api/lawyers/me/documents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const docTypeLabel = REQUIRED_DOCUMENTS.find(d => d.value === documentType)?.label || documentType
      toast.success(`${docTypeLabel} uploaded successfully`)

      await fetchDocuments()
    } catch (error: unknown) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload document')
    } finally {
      setUploading(null)
      if (fileInputRefs.current[documentType]) {
        fileInputRefs.current[documentType]!.value = ''
      }
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
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      case 'pending':
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
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
                completionPercentage === 100 ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <Shield className={cn(
                  "h-5 w-5",
                  completionPercentage === 100 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              <div>
                <CardTitle>KYC Documents</CardTitle>
                <CardDescription>
                  {lawyerName ? `Compliance documents for ${lawyerName}` : 'Upload required compliance documents'}
                </CardDescription>
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
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
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

                return (
                  <div
                    key={docType.value}
                    className={cn(
                      "flex items-center justify-between gap-4 py-3 px-4 rounded-lg border transition-colors",
                      uploaded
                        ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {uploaded ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(uploaded)}
                          className="h-8 w-8 p-0"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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

      {/* Info Card */}
      <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-200">Document Requirements</p>
              <ul className="text-blue-700 dark:text-blue-300 space-y-0.5">
                <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT</li>
                <li>• Maximum file size: 50MB per file</li>
                <li>• Documents must be current and valid</li>
                <li>• VERSO staff will review your documents for KYC approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Notice */}
      <Card className="bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-200">KYC is Optional for Lawyers</p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                As a law firm, KYC submission is optional unless you wish to invest in deals.
                You can complete KYC at any time if you decide to participate as an investor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
