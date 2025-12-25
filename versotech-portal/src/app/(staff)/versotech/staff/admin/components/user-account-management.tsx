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
import { cn } from '@/lib/utils'

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

interface UserAccountManagementProps {
  isDark?: boolean
}

export function UserAccountManagement({ isDark = true }: UserAccountManagementProps) {
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
    return <Badge className={cn(
      'bg-zinc-500/20 border-zinc-500/30',
      isDark ? 'text-zinc-400' : 'text-zinc-600'
    )}>{user.status}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className={cn(
        isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4',
                isDark ? 'text-zinc-400' : 'text-gray-400'
              )} />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'pl-9',
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                )}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className={cn(
                'w-40',
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              )}>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className={cn(
                isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
              )}>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="staff_admin">Staff Admin</SelectItem>
                <SelectItem value="staff_ops">Staff Ops</SelectItem>
                <SelectItem value="staff_rm">Staff RM</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={cn(
                'w-40',
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              )}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className={cn(
                isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
              )}>
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
              className={cn(
                isDark
                  ? 'border-zinc-700 text-zinc-400 hover:text-white'
                  : 'border-gray-300 text-gray-500 hover:text-gray-900'
              )}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className={cn(
        isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className={cn(
                isDark ? 'border-zinc-700 hover:bg-transparent' : 'border-gray-200 hover:bg-transparent'
              )}>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>User</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Role</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Status</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Last Sign In</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Failed Logins</TableHead>
                <TableHead className={cn(
                  'text-right',
                  isDark ? 'text-zinc-400' : 'text-gray-500'
                )}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className={isDark ? 'border-zinc-700' : 'border-gray-200'}>
                    <TableCell>
                      <div className={cn(
                        'h-10 rounded animate-pulse',
                        isDark ? 'bg-zinc-800' : 'bg-gray-200'
                      )} />
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'h-6 w-20 rounded animate-pulse',
                        isDark ? 'bg-zinc-800' : 'bg-gray-200'
                      )} />
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'h-6 w-16 rounded animate-pulse',
                        isDark ? 'bg-zinc-800' : 'bg-gray-200'
                      )} />
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'h-4 w-24 rounded animate-pulse',
                        isDark ? 'bg-zinc-800' : 'bg-gray-200'
                      )} />
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'h-4 w-8 rounded animate-pulse',
                        isDark ? 'bg-zinc-800' : 'bg-gray-200'
                      )} />
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'h-8 w-8 rounded animate-pulse ml-auto',
                        isDark ? 'bg-zinc-800' : 'bg-gray-200'
                      )} />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow className={isDark ? 'border-zinc-700' : 'border-gray-200'}>
                  <TableCell colSpan={6} className={cn(
                    'text-center py-8',
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  )}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={cn(
                    isDark ? 'border-zinc-700 hover:bg-zinc-800/50' : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-9 w-9 rounded-full flex items-center justify-center',
                          isDark ? 'bg-zinc-800' : 'bg-gray-100'
                        )}>
                          <User className={cn(
                            'h-4 w-4',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )} />
                        </div>
                        <div>
                          <p className={cn(
                            'font-medium',
                            isDark ? 'text-white' : 'text-gray-900'
                          )}>
                            {user.display_name || 'N/A'}
                          </p>
                          <p className={cn(
                            'text-sm',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )}>{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className={cn(
                      'text-sm',
                      isDark ? 'text-zinc-400' : 'text-gray-500'
                    )}>
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
                        <span className={isDark ? 'text-zinc-500' : 'text-gray-400'}>0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8',
                              isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                            )}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn(
                          isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                        )}>
                          <DropdownMenuLabel className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewActivity(user)}
                            className={cn(
                              isDark
                                ? 'text-zinc-300 focus:text-white focus:bg-zinc-700'
                                : 'text-gray-700 focus:text-gray-900 focus:bg-gray-100'
                            )}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setResetPasswordDialogOpen(true)
                            }}
                            className={cn(
                              isDark
                                ? 'text-zinc-300 focus:text-white focus:bg-zinc-700'
                                : 'text-gray-700 focus:text-gray-900 focus:bg-gray-100'
                            )}
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className={isDark ? 'bg-zinc-700' : 'bg-gray-200'} />
                          {user.is_locked ? (
                            <DropdownMenuItem
                              onClick={() => handleToggleLock(user)}
                              className={cn(
                                'text-emerald-400',
                                isDark ? 'focus:text-emerald-300 focus:bg-zinc-700' : 'focus:text-emerald-500 focus:bg-gray-100'
                              )}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Unlock Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleToggleLock(user)}
                              className={cn(
                                'text-amber-400',
                                isDark ? 'focus:text-amber-300 focus:bg-zinc-700' : 'focus:text-amber-500 focus:bg-gray-100'
                              )}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Lock Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeactivate(user)}
                            className={cn(
                              'text-red-400',
                              isDark ? 'focus:text-red-300 focus:bg-zinc-700' : 'focus:text-red-500 focus:bg-gray-100'
                            )}
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
        <Card className={cn(
          isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4 text-center">
            <p className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>{users.length}</p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Total Users</p>
          </CardContent>
        </Card>
        <Card className={cn(
          isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {users.filter((u) => u.status === 'active' && !u.is_locked).length}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Active</p>
          </CardContent>
        </Card>
        <Card className={cn(
          isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {users.filter((u) => u.is_locked).length}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Locked</p>
          </CardContent>
        </Card>
        <Card className={cn(
          isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {users.filter((u) => u.failed_login_attempts > 0).length}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Failed Logins</p>
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className={cn(
          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Reset Password</DialogTitle>
            <DialogDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
              Send a password reset email to {selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg',
              isDark ? 'bg-zinc-800' : 'bg-gray-100'
            )}>
              <Mail className={cn(
                'h-5 w-5',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )} />
              <div>
                <p className={cn(
                  'font-medium',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>{selectedUser?.display_name || 'User'}</p>
                <p className={cn(
                  'text-sm',
                  isDark ? 'text-zinc-400' : 'text-gray-500'
                )}>{selectedUser?.email}</p>
              </div>
            </div>
            <p className={cn(
              'text-sm mt-4',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>
              An email with password reset instructions will be sent to this address.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordDialogOpen(false)}
              className={cn(
                isDark ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-600'
              )}
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
        <DialogContent className={cn(
          'max-w-2xl',
          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>User Activity</DialogTitle>
            <DialogDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
              Recent activity for {selectedUser?.display_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {activityLogs.length === 0 ? (
              <div className={cn(
                'text-center py-8',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )}>
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>No activity logs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg',
                      isDark ? 'bg-zinc-800' : 'bg-gray-100'
                    )}
                  >
                    <Calendar className={cn(
                      'h-4 w-4 mt-0.5',
                      isDark ? 'text-zinc-400' : 'text-gray-500'
                    )} />
                    <div className="flex-1">
                      <p className={cn(
                        'text-sm',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}>{log.action}</p>
                      <p className={cn(
                        'text-xs',
                        isDark ? 'text-zinc-400' : 'text-gray-500'
                      )}>
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.ip_address && (
                        <p className={cn(
                          'text-xs mt-1',
                          isDark ? 'text-zinc-500' : 'text-gray-400'
                        )}>IP: {log.ip_address}</p>
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
              className={cn(
                isDark ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-600'
              )}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
