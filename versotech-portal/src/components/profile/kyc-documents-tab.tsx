'use client'

import { useState, useEffect } from 'react'
import { Upload, CheckCircle, XCircle, Clock, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface KYCSubmission {
  id: string
  document_type: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired'
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
  document?: {
    id: string
    name: string
    file_key: string
    file_size_bytes: number
    mime_type: string
    created_at: string
  }
  reviewer?: {
    display_name: string
    email: string
  }
}

interface DocumentRequirement {
  type: string
  label: string
  description: string
  required: boolean
  submission: KYCSubmission | null
}

export function KYCDocumentsTab() {
  const [documents, setDocuments] = useState<DocumentRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/investors/me/kyc-submissions')
      if (!response.ok) throw new Error('Failed to load documents')

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load KYC documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (documentType: string, file: File) => {
    setUploading(documentType)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await fetch('/api/investors/me/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      toast.success('Document uploaded successfully and is pending review')

      // Reload documents
      await loadDocuments()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(null)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download document')
      }

      const data = await response.json()

      // Open signed URL in new tab to download
      const link = document.createElement('a')
      link.href = data.url
      link.download = fileName
      link.click()

      toast.success('Document download started')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error(error.message || 'Failed to download document')
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'under_review':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'expired':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please upload the required documents for KYC verification. All documents will be reviewed by our compliance team within 1-2 business days.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {documents.map((doc) => {
          const submission = doc.submission
          const isUploading = uploading === doc.type
          const canUpload = !submission || submission.status === 'rejected'

          return (
            <Card key={doc.type}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {doc.label}
                      {doc.required && <span className="text-red-500 text-sm">*</span>}
                    </CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </div>
                  {submission && getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent>
                {submission ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{submission.document?.name}</p>
                          <p className="text-xs text-gray-600">
                            Uploaded {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {submission.document && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(submission.document!.id, submission.document!.name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {submission.status === 'rejected' && submission.rejection_reason && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Rejection Reason:</strong> {submission.rejection_reason}
                        </AlertDescription>
                      </Alert>
                    )}

                    {canUpload && (
                      <div>
                        <input
                          type="file"
                          id={`file-${doc.type}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(doc.type, file)
                          }}
                          disabled={isUploading}
                        />
                        <label htmlFor={`file-${doc.type}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              {isUploading ? 'Uploading...' : 'Re-upload Document'}
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id={`file-${doc.type}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(doc.type, file)
                      }}
                      disabled={isUploading}
                    />
                    <label htmlFor={`file-${doc.type}`}>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? 'Uploading...' : 'Upload Document'}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-600 mt-2">
                      Accepted formats: PDF, JPG, PNG, HEIC, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
