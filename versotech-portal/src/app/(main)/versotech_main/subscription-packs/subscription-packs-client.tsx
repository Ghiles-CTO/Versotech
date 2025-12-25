'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Search,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import Link from 'next/link'

type LawyerInfo = {
  id: string
  firm_name: string
  display_name: string
  specializations: string[] | null
  is_active: boolean
}

type SubscriptionSubmission = {
  id: string
  deal_id: string
  investor_id: string
  status: string
  submitted_at: string
  decided_at: string | null
  deal_name: string
  deal_currency: string | null
  investor_name: string
}

type SubscriptionPacksClientProps = {
  lawyerInfo: LawyerInfo | null
  submissions: SubscriptionSubmission[]
}

const STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  withdrawn: 'bg-slate-100 text-slate-800 border-slate-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  withdrawn: 'Withdrawn',
}

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Withdrawn', value: 'withdrawn' },
]

export function SubscriptionPacksClient({ lawyerInfo, submissions }: SubscriptionPacksClientProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const summary = useMemo(() => {
    const pending = submissions.filter(s => s.status === 'pending_review').length
    const approved = submissions.filter(s => s.status === 'approved').length
    const rejected = submissions.filter(s => s.status === 'rejected').length

    return {
      total: submissions.length,
      pending,
      approved,
      rejected,
    }
  }, [submissions])

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
      const matchesSearch = !search ||
        submission.deal_name.toLowerCase().includes(search.toLowerCase()) ||
        submission.investor_name.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter, submissions])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription Packs</h1>
          <p className="text-muted-foreground mt-1">
            {lawyerInfo
              ? `Review subscription packs as ${lawyerInfo.display_name}`
              : 'Review subscription packs for assigned deals'}
          </p>
        </div>
        {lawyerInfo?.specializations?.length ? (
          <div className="flex gap-1">
            {lawyerInfo.specializations.slice(0, 2).map((spec, idx) => (
              <Badge key={idx} variant="outline" className="capitalize">
                {spec}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Packs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Submissions received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summary.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for signing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{summary.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Declined submissions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by deal or investor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No submissions match your filters'
                  : 'No subscription packs assigned yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="font-medium">{submission.deal_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {submission.deal_currency || 'USD'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.investor_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_STYLES[submission.status] || STATUS_STYLES.cancelled)}
                        >
                          {STATUS_LABELS[submission.status] || submission.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.submitted_at ? (
                          <div className="text-sm">
                            {formatDate(submission.submitted_at)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/versotech_main/documents">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
