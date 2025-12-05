'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Search,
  MoreHorizontal,
  User,
  Shield,
  KeyRound,
  Ban,
  CheckCircle,
  Activity,
  RefreshCw,
  Mail,
  Calendar,
  AlertTriangle,
} from 'lucide-react'

interface UserAccount {
  id: string
  email: string
  display_name: string | null
  role: string
  status: string
  created_at: string
  last_sign_in_at: string | null
  failed_login_attempts: number
  is_locked: boolean
  investor_id?: string
  staff_id?: string
}

interface UserActivityLog {
  id: string
  action: string
  timestamp: string
  ip_address?: string
  user_agent?: string
}

export function UserAccountManagement() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data?.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleResetPassword = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
      })
      if (response.ok) {
        toast.success('Password reset email sent successfully')
        setResetPasswordDialogOpen(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send reset email')
      }
    } catch (error) {
      toast.error('Failed to send password reset email')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleLock = async (user: UserAccount) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-lock`, {
        method: 'PATCH',
      })
      if (response.ok) {
        toast.success(user.is_locked ? 'User unlocked' : 'User locked')
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update user')
      }
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleDeactivate = async (user: UserAccount) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return
    try {
      const response = await fetch(`/api/admin/users/${user.id}/deactivate`, {
        method: 'PATCH',
      })
      if (response.ok) {
        toast.success('User deactivated')
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to deactivate user')
      }
    } catch (error) {
      toast.error('Failed to deactivate user')
    }
  }

  const handleViewActivity = async (user: UserAccount) => {
    setSelectedUser(user)
    setActivityDialogOpen(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/activity`)
      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.data?.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'investor':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Investor</Badge>
      case 'staff_admin':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Staff Admin</Badge>
      case 'staff_ops':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Staff Ops</Badge>
      case 'staff_rm':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Staff RM</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (user: UserAccount) => {
    if (user.is_locked) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Locked</Badge>
    }
    if (user.status === 'active') {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
    }
    return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">{user.status}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-zinc-900/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="staff_admin">Staff Admin</SelectItem>
                <SelectItem value="staff_ops">Staff Ops</SelectItem>
                <SelectItem value="staff_rm">Staff RM</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchUsers}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-zinc-900/50 border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700 hover:bg-transparent">
                <TableHead className="text-zinc-400">User</TableHead>
                <TableHead className="text-zinc-400">Role</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Last Sign In</TableHead>
                <TableHead className="text-zinc-400">Failed Logins</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-700">
                    <TableCell>
                      <div className="h-10 bg-zinc-800 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 bg-zinc-800 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-8 bg-zinc-800 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 bg-zinc-800 rounded animate-pulse ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow className="border-zinc-700">
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-400">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-zinc-700 hover:bg-zinc-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center">
                          <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.display_name || 'N/A'}
                          </p>
                          <p className="text-sm text-zinc-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {user.failed_login_attempts > 0 ? (
                        <Badge
                          variant="outline"
                          className={`${user.failed_login_attempts >= 5
                            ? 'border-red-500/50 text-red-400'
                            : 'border-amber-500/50 text-amber-400'
                            }`}
                        >
                          {user.failed_login_attempts}
                        </Badge>
                      ) : (
                        <span className="text-zinc-500">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                          <DropdownMenuLabel className="text-zinc-400">Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewActivity(user)}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-700"
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setResetPasswordDialogOpen(true)
                            }}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-700"
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-700" />
                          {user.is_locked ? (
                            <DropdownMenuItem
                              onClick={() => handleToggleLock(user)}
                              className="text-emerald-400 focus:text-emerald-300 focus:bg-zinc-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Unlock Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleToggleLock(user)}
                              className="text-amber-400 focus:text-amber-300 focus:bg-zinc-700"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Lock Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeactivate(user)}
                            className="text-red-400 focus:text-red-300 focus:bg-zinc-700"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-zinc-400">Total Users</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {users.filter((u) => u.status === 'active' && !u.is_locked).length}
            </p>
            <p className="text-xs text-zinc-400">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {users.filter((u) => u.is_locked).length}
            </p>
            <p className="text-xs text-zinc-400">Locked</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {users.filter((u) => u.failed_login_attempts > 0).length}
            </p>
            <p className="text-xs text-zinc-400">Failed Logins</p>
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reset Password</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Send a password reset email to {selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800">
              <Mail className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-white font-medium">{selectedUser?.display_name || 'User'}</p>
                <p className="text-sm text-zinc-400">{selectedUser?.email}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-4">
              An email with password reset instructions will be sent to this address.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordDialogOpen(false)}
              className="border-zinc-700 text-zinc-400"
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={actionLoading}>
              {actionLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">User Activity</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Recent activity for {selectedUser?.display_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>No activity logs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800"
                  >
                    <Calendar className="h-4 w-4 text-zinc-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white text-sm">{log.action}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.ip_address && (
                        <p className="text-xs text-zinc-500 mt-1">IP: {log.ip_address}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActivityDialogOpen(false)}
              className="border-zinc-700 text-zinc-400"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
