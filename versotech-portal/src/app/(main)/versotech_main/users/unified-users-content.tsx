'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Loader2,
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  UserPlus,
  Users,
  Briefcase,
  Building2,
  Scale,
  HandshakeIcon,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Download
} from 'lucide-react'
import type { UnifiedUser, UnifiedUsersResponse } from '@/app/api/admin/unified-users/route'
import { BatchInviteDialog, type EntityType } from '@/components/users/batch-invite-dialog'

const ENTITY_TYPE_CONFIG = {
  investor: { label: 'Investor', icon: Users, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  lawyer: { label: 'Lawyer', icon: Scale, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  partner: { label: 'Partner', icon: HandshakeIcon, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  commercial_partner: { label: 'Commercial Partner', icon: Building2, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  introducer: { label: 'Introducer', icon: Briefcase, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  arranger: { label: 'Arranger', icon: Building2, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
    case 'inactive':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
    default:
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
  }
}

function getKycStatusIcon(status: string | null) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    case 'pending':
    case 'review':
      return <Clock className="h-4 w-4 text-yellow-400" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <span className="text-muted-foreground">-</span>
  }
}

export default function UnifiedUsersContent() {
  const [users, setUsers] = useState<UnifiedUser[]>([])
  const [stats, setStats] = useState<UnifiedUsersResponse['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [batchInviteOpen, setBatchInviteOpen] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/unified-users')
      const data: UnifiedUsersResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.data || [])
      setStats(data.stats || null)
    } catch (err: any) {
      console.error('[UnifiedUsersContent] Error:', err)
      setError(err?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          user.entityName.toLowerCase().includes(query) ||
          user.userName.toLowerCase().includes(query) ||
          user.userEmail.toLowerCase().includes(query) ||
          user.country?.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Type filter
      if (typeFilter !== 'all' && user.entityType !== typeFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [users, searchQuery, typeFilter, statusFilter])

  // Export to CSV
  const handleExport = () => {
    const headers = ['Entity Type', 'Entity Name', 'User Name', 'Email', 'Role', 'Status', 'KYC Status', 'Country', 'Created']
    const rows = filteredUsers.map(u => [
      ENTITY_TYPE_CONFIG[u.entityType].label,
      u.entityName,
      u.userName,
      u.userEmail,
      u.userRole,
      u.status,
      u.kycStatus || '-',
      u.country || '-',
      new Date(u.createdAt).toLocaleDateString()
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading all users...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Users</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchUsers} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{stats?.total || 0}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-400">{stats?.active || 0}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-400">{stats?.investors || 0}</div>
            <div className="text-xs text-muted-foreground">Investors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-400">{stats?.lawyers || 0}</div>
            <div className="text-xs text-muted-foreground">Lawyers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats?.partners || 0}</div>
            <div className="text-xs text-muted-foreground">Partners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-400">{stats?.commercialPartners || 0}</div>
            <div className="text-xs text-muted-foreground">Commercial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-cyan-400">{stats?.introducers || 0}</div>
            <div className="text-xs text-muted-foreground">Introducers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-400">{stats?.arrangers || 0}</div>
            <div className="text-xs text-muted-foreground">Arrangers</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="investor">Investors</SelectItem>
                  <SelectItem value="lawyer">Lawyers</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                  <SelectItem value="commercial_partner">Commercial Partners</SelectItem>
                  <SelectItem value="introducer">Introducers</SelectItem>
                  <SelectItem value="arranger">Arrangers</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button onClick={() => setBatchInviteOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Batch Invite
              </Button>

              <Button variant="outline" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            Complete directory of all platform users across all entity types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Entity Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const config = ENTITY_TYPE_CONFIG[user.entityType]
                  const Icon = config.icon
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Badge variant="outline" className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{user.entityName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={user.userName === 'No users assigned' ? 'text-muted-foreground italic' : ''}>
                            {user.userName}
                          </span>
                          {user.isPrimary && (
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={user.userEmail === '-' ? 'text-muted-foreground' : ''}>
                          {user.userEmail}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">{user.userRole}</span>
                      </TableCell>
                      <TableCell>
                        <span className={!user.country ? 'text-muted-foreground' : ''}>
                          {user.country || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getKycStatusIcon(user.kycStatus)}
                          {user.kycStatus && (
                            <span className="text-xs capitalize">{user.kycStatus}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              const typeRoutes: Record<string, string> = {
                                investor: 'investors',
                                lawyer: 'lawyers',
                                partner: 'partners',
                                commercial_partner: 'commercial-partners',
                                introducer: 'introducers',
                                arranger: 'arrangers'
                              }
                              window.location.href = `/versotech_main/${typeRoutes[user.entityType]}/${user.entityId}`
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {user.userEmail && user.userEmail !== '-' && (
                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.userEmail}`}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Invite User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Batch Invite Dialog */}
      <BatchInviteDialog
        open={batchInviteOpen}
        onOpenChange={setBatchInviteOpen}
        onSuccess={fetchUsers}
      />
    </div>
  )
}
