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
  DollarSign,
  Download,
  FileText,
  Search,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'

type LawyerInfo = {
  id: string
  firm_name: string
  display_name: string
  specializations: string[] | null
  is_active: boolean
}

type SignedSubscription = {
  id: string
  deal_id: string
  investor_id: string
  status: string
  commitment: number
  currency: string
  funded_amount: number
  committed_at: string | null
  funded_at: string | null
  deal_name: string
  investor_name: string
  document_id: string | null
  document_file_key: string | null
  document_file_name: string | null
}

type SubscriptionPacksClientProps = {
  lawyerInfo: LawyerInfo | null
  subscriptions: SignedSubscription[]
}

const STATUS_STYLES: Record<string, string> = {
  committed: 'bg-blue-100 text-blue-800 border-blue-200',
  partially_funded: 'bg-amber-100 text-amber-800 border-amber-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const STATUS_LABELS: Record<string, string> = {
  committed: 'Signed',
  partially_funded: 'Partially Funded',
  active: 'Fully Funded',
}

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Signed (Awaiting Funding)', value: 'committed' },
  { label: 'Partially Funded', value: 'partially_funded' },
  { label: 'Fully Funded', value: 'active' },
]

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SubscriptionPacksClient({ lawyerInfo, subscriptions }: SubscriptionPacksClientProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const summary = useMemo(() => {
    const committed = subscriptions.filter(s => s.status === 'committed').length
    const partiallyFunded = subscriptions.filter(s => s.status === 'partially_funded').length
    const fullyFunded = subscriptions.filter(s => s.status === 'active').length

    const totalCommitment = subscriptions.reduce((sum, s) => sum + s.commitment, 0)
    const totalFunded = subscriptions.reduce((sum, s) => sum + s.funded_amount, 0)

    return {
      total: subscriptions.length,
      committed,
      partiallyFunded,
      fullyFunded,
      totalCommitment,
      totalFunded,
    }
  }, [subscriptions])

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(subscription => {
      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
      const matchesSearch = !search ||
        subscription.deal_name.toLowerCase().includes(search.toLowerCase()) ||
        subscription.investor_name.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter, subscriptions])

  const handleDownloadPdf = async (subscription: SignedSubscription) => {
    if (!subscription.document_file_key || !subscription.document_id) {
      toast.error('No signed document available for download')
      return
    }

    setDownloadingId(subscription.id)
    try {
      // First, get the signed URL from the API
      const response = await fetch(`/api/documents/${subscription.document_id}/download`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get download link')
      }

      // Fetch the actual file from the signed URL
      const fileResponse = await fetch(data.url)
      if (!fileResponse.ok) {
        throw new Error('Failed to download document file')
      }

      const blob = await fileResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = subscription.document_file_name || data.fileName || `subscription-pack-${subscription.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signed Subscription Packs</h1>
          <p className="text-muted-foreground mt-1">
            {lawyerInfo
              ? `View signed subscription packs as ${lawyerInfo.display_name}`
              : 'View signed subscription packs for assigned deals'}
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
              Total Signed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Subscription packs signed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Awaiting Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.committed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Signed, pending escrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Partially Funded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.partiallyFunded}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Partial escrow received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Fully Funded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summary.fullyFunded}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Complete funding received
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
              <SelectTrigger className="w-full md:w-56">
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
          <CardTitle>Signed Subscriptions</CardTitle>
          <CardDescription>
            {filteredSubscriptions.length} signed subscription{filteredSubscriptions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No subscriptions match your filters'
                  : 'No signed subscription packs yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Commitment</TableHead>
                    <TableHead>Funded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signed Date</TableHead>
                    <TableHead className="text-right">Document</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => {
                    const fundingPercentage = subscription.commitment > 0
                      ? Math.round((subscription.funded_amount / subscription.commitment) * 100)
                      : 0

                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="font-medium">{subscription.deal_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{subscription.investor_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(subscription.commitment, subscription.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatCurrency(subscription.funded_amount, subscription.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {fundingPercentage}% funded
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('capitalize', STATUS_STYLES[subscription.status] || 'bg-gray-100 text-gray-800 border-gray-200')}
                          >
                            {STATUS_LABELS[subscription.status] || subscription.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscription.committed_at ? (
                            <div className="text-sm">
                              {formatDate(subscription.committed_at)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {subscription.document_file_key ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPdf(subscription)}
                              disabled={downloadingId === subscription.id}
                            >
                              {downloadingId === subscription.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">No document</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
