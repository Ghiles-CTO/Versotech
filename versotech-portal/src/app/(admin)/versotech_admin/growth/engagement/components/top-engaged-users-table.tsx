'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trophy, Medal, Award, User } from 'lucide-react'
import Link from 'next/link'

interface EngagedUser {
  id: string
  name: string
  actions: number
  sessions: number
}

interface TopEngagedUsersTableProps {
  days: string
}

// Get rank icon component based on position
function RankIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-yellow-500" />
    case 2:
      return <Medal className="h-4 w-4 text-gray-400 dark:text-gray-300" />
    case 3:
      return <Award className="h-4 w-4 text-amber-600" />
    default:
      return <span className="text-muted-foreground text-sm font-medium w-4 text-center">{rank}</span>
  }
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-44" />
        </div>
        <Skeleton className="h-3 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 py-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TopEngagedUsersTable({ days }: TopEngagedUsersTableProps) {
  const [data, setData] = useState<EngagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 15

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/engagement?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch engagement data')
        }
        const result = await response.json()
        if (result.success && result.data?.topEngagedUsers) {
          setData(result.data.topEngagedUsers)
        } else {
          throw new Error(result.error || 'No engagement data available')
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load engagement data'
        )
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
    return <TableSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Top Engaged Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Top Engaged Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground">
            No user engagement data available for this period
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalRows = data.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalRows)
  const pagedData = data.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Top Engaged Users</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Most active users over the last {days} days
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Avg Actions/Session</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((user, index) => {
              const rank = startIndex + index + 1
              const avgActionsPerSession = user.sessions > 0
                ? (user.actions / user.sessions).toFixed(1)
                : '-'

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RankIcon rank={rank} />
                      {rank <= 3 && (
                        <Badge
                          variant={rank === 1 ? 'default' : 'secondary'}
                          className={
                            rank === 1 ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600' :
                            rank === 2 ? 'bg-gray-400 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600' :
                            'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700'
                          }
                        >
                          #{rank}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/versotech_admin/users/${user.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
                    >
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {user.actions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {user.sessions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell tabular-nums">
                    {avgActionsPerSession}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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
