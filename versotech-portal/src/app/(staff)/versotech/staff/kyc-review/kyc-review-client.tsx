'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, FileText, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { DocumentViewer } from '@/components/documents/document-viewer'
import { getDocumentTypeLabel } from '@/constants/kyc-document-types'

interface KYCSubmission {
  id: string
  investor_id: string
  counterparty_entity_id?: string | null
  document_type: string
  custom_label?: string | null
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired'
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
  metadata?: any
  investor?: {
    id: string
    legal_name: string
    display_name: string
    email: string
    type: string
    kyc_status: string
  }
  counterparty_entity?: {
    id: string
    legal_name: string
    entity_type: string
  } | null
  document?: {
    id: string
    name: string
    file_key: string
    file_size_bytes: number
    mime_type: string
  }
  reviewer?: {
    display_name: string
    email: string
  }
}

interface Statistics {
  total: number
  pending: number
  under_review: number
  approved: number
  rejected: number
  expired: number
}

export function KYCReviewClient() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [rejectionReason, setRejectionReason] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)

  // Document viewer state
  const [viewingDocument, setViewingDocument] = useState<{
    id: string
    name: string
    mimeType: string
  } | null>(null)

  // Questionnaire viewer state
  const [viewingQuestionnaire, setViewingQuestionnaire] = useState<KYCSubmission | null>(null)

  const loadSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (documentTypeFilter !== 'all') params.append('document_type', documentTypeFilter)

      const response = await fetch(`/api/staff/kyc-submissions?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error response:', errorData)
        throw new Error(errorData.error || 'Failed to load submissions')
      }

      const data = await response.json()
      setSubmissions(data.submissions || [])
      setStatistics(data.statistics || null)
    } catch (error: any) {
      console.error('Error loading submissions:', error)
      toast.error('Failed to load KYC submissions', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, documentTypeFilter])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const openReviewDialog = (submission: KYCSubmission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission)
    setReviewAction(action)
    setRejectionReason('')
    setReviewNotes('')
    setReviewDialogOpen(true)
  }

  const handleReview = async () => {
    if (!selectedSubmission) return

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setReviewing(true)

    try {
      const response = await fetch(`/api/staff/kyc-submissions/${selectedSubmission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          rejection_reason: reviewAction === 'reject' ? rejectionReason : undefined,
          notes: reviewNotes || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Review failed')
      }

      toast.success(
        reviewAction === 'approve'
          ? 'Document approved successfully'
          : 'Document rejected successfully'
      )

      setReviewDialogOpen(false)
      await loadSubmissions()
    } catch (error: any) {
      console.error('Review error:', error)
      toast.error(error.message || 'Failed to review document')
    } finally {
      setReviewing(false)
    }
  }

  const getStatusBadge = (status: string) => {
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

  // Get unique document types from submissions
  const uniqueDocumentTypes = Array.from(
    new Set(submissions.map(sub => sub.document_type))
  ).sort()

  const filteredSubmissions = submissions.filter(sub => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const documentTypeLabel = getDocumentTypeLabel(sub.document_type, sub.custom_label).toLowerCase()
      return (
        sub.investor?.display_name.toLowerCase().includes(query) ||
        sub.investor?.legal_name.toLowerCase().includes(query) ||
        sub.investor?.email.toLowerCase().includes(query) ||
        documentTypeLabel.includes(query) ||
        (sub.counterparty_entity?.legal_name.toLowerCase().includes(query))
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">KYC Document Review</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve investor KYC documents
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{statistics.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{statistics.under_review}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{statistics.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500">{statistics.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-400">{statistics.expired}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Document Type</Label>
              <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueDocumentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search investor name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
          <CardDescription>
            Review pending KYC documents and approve or reject them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {submission.counterparty_entity ? (
                            <>
                              {submission.counterparty_entity.legal_name}
                              <Badge variant="outline" className="ml-2 text-xs">Entity</Badge>
                            </>
                          ) : (
                            submission.investor?.display_name || submission.investor?.legal_name || 'Unknown'
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{submission.investor?.email || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDocumentTypeLabel(submission.document_type, submission.custom_label)}
                    </TableCell>
                    <TableCell>
                      {submission.document ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{submission.document.name}</span>
                        </div>
                      ) : submission.metadata ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-500 font-medium">Questionnaire Data</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No content</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.reviewer ? (
                        <div className="text-sm">
                          <div>{submission.reviewer.display_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(submission.reviewed_at!).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {submission.document && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingDocument({
                              id: submission.document!.id,
                              name: submission.document!.name,
                              mimeType: submission.document!.mime_type
                            })}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {submission.metadata && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingQuestionnaire(submission)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {['pending', 'under_review'].includes(submission.status) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-500 border-emerald-500 hover:bg-emerald-950 hover:text-emerald-400"
                              onClick={() => openReviewDialog(submission, 'approve')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-rose-500 border-rose-500 hover:bg-rose-950 hover:text-rose-400"
                              onClick={() => openReviewDialog(submission, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Document' : 'Reject Document'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <>
                  {getDocumentTypeLabel(selectedSubmission.document_type, selectedSubmission.custom_label)} for{' '}
                  {selectedSubmission.counterparty_entity
                    ? `${selectedSubmission.counterparty_entity.legal_name} (Entity of ${selectedSubmission.investor?.display_name || selectedSubmission.investor?.legal_name || 'Unknown'})`
                    : selectedSubmission.investor?.display_name || selectedSubmission.investor?.legal_name || 'Unknown'
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {reviewAction === 'reject' && (
              <div>
                <Label htmlFor="rejection-reason">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please explain why this document is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="review-notes">Notes (Optional)</Label>
              <Textarea
                id="review-notes"
                placeholder="Any additional notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewing}
              className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {reviewing ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          documentId={viewingDocument.id}
          documentName={viewingDocument.name}
          mimeType={viewingDocument.mimeType}
          open={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}

      {/* Questionnaire Viewer */}
      <Dialog open={!!viewingQuestionnaire} onOpenChange={(open) => !open && setViewingQuestionnaire(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Questionnaire Answers</DialogTitle>
            <DialogDescription>
              Submitted by {viewingQuestionnaire?.investor?.display_name} on {viewingQuestionnaire && new Date(viewingQuestionnaire.submitted_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {viewingQuestionnaire?.metadata && Object.entries(viewingQuestionnaire.metadata).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setViewingQuestionnaire(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
