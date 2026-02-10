'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, Mail, ExternalLink, UserX } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { currencyTotalsEntries } from '@/lib/currency-totals'
import { formatCurrency } from '@/lib/format'

interface AtRiskUser {
  id: string
  name: string
  email: string
  lastActive: string
  totalInvested: number
  totalInvestedByCurrency?: Record<string, number>
}

interface RetentionData {
  atRiskUsers: AtRiskUser[]
}

interface AtRiskUsersTableProps {
  days: string
}

function formatInvestmentDisplay(user: AtRiskUser): string {
  const entries = currencyTotalsEntries(user.totalInvestedByCurrency || {})
  if (entries.length === 0) {
    return user.totalInvested > 0 ? user.totalInvested.toLocaleString() : '-'
  }
  if (entries.length === 1) {
    const [currency, amount] = entries[0]
    return formatCurrency(amount, currency)
  }
  return entries
    .map(([currency, amount]) => `${currency} ${formatCurrency(amount, currency)}`)
    .join(' / ')
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AtRiskUsersTable({ days }: AtRiskUsersTableProps) {
  const [users, setUsers] = useState<AtRiskUser[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 15

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/retention?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch retention data')
        }
        const result = await response.json()
        if (result.success && result.data) {
          setUsers(result.data.atRiskUsers)
        } else {
          throw new Error(result.error || 'No data available')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days])

  useEffect(() => {
    setPage(1)
  }, [days])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-3 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">At-Risk Users</CardTitle>
          </div>
          <CardDescription>
            Users who haven&apos;t been active in 30+ days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">Failed to load at-risk users data</p>
        </CardContent>
      </Card>
    )
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">At-Risk Users</CardTitle>
          </div>
          <CardDescription>
            Users who haven&apos;t been active in 30+ days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
              <UserX className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold">No At-Risk Users</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              Great news! All users have been active within the last 30 days.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalRows = users.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalRows)
  const pagedUsers = users.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">At-Risk Users</CardTitle>
            </div>
            <CardDescription>
              Users who haven&apos;t been active in 30+ days, sorted by investment amount
            </CardDescription>
          </div>
          <span className="text-sm text-muted-foreground">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">User</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Total Invested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedUsers.map((user) => (
                <TableRow key={user.id}>
                  {/* User Column */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/versotech_admin/users/${user.id}`}
                          className="font-medium hover:underline flex items-center gap-1"
                        >
                          {user.name}
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </Link>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Last Active Column */}
                  <TableCell>
                    <span className="text-amber-600 dark:text-amber-400">
                      {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                    </span>
                  </TableCell>

                  {/* Total Invested Column */}
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {formatInvestmentDisplay(user)}
                    </span>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`mailto:${user.email}?subject=We miss you at VERSO!&body=Hi ${user.name.split(' ')[0]},%0D%0A%0D%0AWe noticed you haven't logged in recently and wanted to check in. Is there anything we can help you with?%0D%0A%0D%0ABest regards,%0D%0AThe VERSO Team`}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing {totalRows === 0 ? 0 : startIndex + 1}-{endIndex} of {totalRows}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </Button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
