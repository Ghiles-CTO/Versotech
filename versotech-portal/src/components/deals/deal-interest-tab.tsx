'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'

interface DealInterestTabProps {
  dealId: string
  interests: Array<Record<string, any>>
  subscriptions: Array<Record<string, any>>
}

const interestStatusStyles: Record<string, string> = {
  pending_review: 'bg-amber-500/20 text-amber-100',
  approved: 'bg-emerald-500/20 text-emerald-100',
  rejected: 'bg-rose-500/20 text-rose-100',
  withdrawn: 'bg-muted text-muted-foreground',
  signal: 'bg-purple-500/20 text-purple-100'
}

const subscriptionStatusStyles: Record<string, string> = {
  pending_review: 'bg-amber-500/20 text-amber-100',
  approved: 'bg-emerald-500/20 text-emerald-100',
  rejected: 'bg-rose-500/20 text-rose-100',
  cancelled: 'bg-muted text-muted-foreground'
}

export function DealInterestTab({ dealId, interests, subscriptions }: DealInterestTabProps) {
  const groupedInterests = useMemo(() => {
    // Separate post-close signals from regular interests
    const signals = interests?.filter(item => item.is_post_close) ?? []
    const pending = interests?.filter(item => !item.is_post_close && item.status === 'pending_review') ?? []
    const approved = interests?.filter(item => !item.is_post_close && item.status === 'approved') ?? []
    const other = interests?.filter(item => !item.is_post_close && !['pending_review', 'approved'].includes(item.status)) ?? []
    return { signals, pending, approved, other }
  }, [interests])

  return (
    <div className="space-y-6">
      <Card className="border-border bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-foreground">Interest Pipeline</CardTitle>
            <CardDescription>
              Track investor signals and align approvals with NDA and data-room workflows.
            </CardDescription>
          </div>
          <Link
            href={`/versotech_main/approvals?entity=deal_interest&deal=${dealId}`}
            className="text-sm font-medium text-sky-300 hover:text-sky-200"
          >
            View related approvals ➜
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedInterests.signals.length > 0 && (
            <InterestTable title="Future Interest Signals (Closed Deal)" interests={groupedInterests.signals} emptyLabel="" />
          )}
          <InterestTable title="Pending Review" interests={groupedInterests.pending} emptyLabel="No pending interests." />
          <InterestTable title="Approved" interests={groupedInterests.approved} emptyLabel="No approved interests yet." />
          {groupedInterests.other.length > 0 && (
            <InterestTable title="Completed" interests={groupedInterests.other} emptyLabel="" />
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-foreground">Subscription Submissions</CardTitle>
            <CardDescription>
              Monitor definitive commitments flowing in from the investor data room.
            </CardDescription>
          </div>
          <Link
            href={`/versotech_main/approvals?entity=deal_subscription&deal=${dealId}`}
            className="text-sm font-medium text-sky-300 hover:text-sky-200"
          >
            View related approvals ➜
          </Link>
        </CardHeader>
        <CardContent>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Amount (derived)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions?.length ? (
                subscriptions.map(subscription => {
                  const rawAmount = subscription.payload_json?.amount ??
                    subscription.payload_json?.subscription_amount ??
                    subscription.payload_json?.commitment_amount
                  const numericAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount ?? '')
                  const formattedAmount = Number.isFinite(numericAmount)
                    ? numericAmount.toLocaleString()
                    : undefined
                  return (
                    <TableRow key={subscription.id}>
                      <TableCell>{subscription.investors?.legal_name || 'Unknown investor'}</TableCell>
                      <TableCell>
                        <Badge className={subscriptionStatusStyles[subscription.status] ?? 'bg-muted'}>
                          {subscription.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.submitted_at
                          ? format(new Date(subscription.submitted_at), 'dd MMM yyyy HH:mm')
                          : '—'}
                      </TableCell>
                      <TableCell>{formattedAmount ?? '—'}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No subscription submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

interface InterestTableProps {
  title: string
  interests: Array<Record<string, any>>
  emptyLabel: string
}

function InterestTable({ title, interests, emptyLabel }: InterestTableProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Investor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Indicative Amount</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interests.length ? (
            interests.map(interest => {
              // Determine display status for post-close interests
              const displayStatus = interest.is_post_close ? 'signal' : interest.status
              const statusLabel = interest.is_post_close
                ? 'SIGNAL'
                : interest.status.replace('_', ' ').toUpperCase()

              return (
                <TableRow key={interest.id}>
                  <TableCell>{interest.investors?.legal_name || 'Unknown investor'}</TableCell>
                  <TableCell>
                    {interest.is_post_close ? (
                      <Badge className="bg-purple-500/20 text-purple-100">
                        Notify Me About Similar
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/20 text-blue-100">
                        I'm Interested
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={interestStatusStyles[displayStatus] ?? 'bg-muted'}>
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {interest.indicative_amount
                      ? `${interest.indicative_currency ?? ''} ${interest.indicative_amount.toLocaleString()}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {interest.submitted_at
                      ? format(new Date(interest.submitted_at), 'dd MMM yyyy HH:mm')
                      : '—'}
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                {emptyLabel}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
