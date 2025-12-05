'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Shield,
  AlertTriangle,
  Clock,
  FileWarning,
  UserX,
  RefreshCw,
  ChevronRight,
  Calendar,
  CheckCircle,
} from 'lucide-react'

interface ComplianceAlert {
  id: string
  type: 'kyc_expiry' | 'accreditation_expiry' | 'unsigned_doc' | 'aml_flag'
  severity: 'critical' | 'high' | 'medium' | 'low'
  investor_id: string
  investor_name: string
  details: string
  due_date?: string
  days_until_due?: number
  created_at: string
}

export function ComplianceAlertsPanel() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/compliance/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.data?.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch compliance alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'kyc_expiry':
        return Shield
      case 'accreditation_expiry':
        return UserX
      case 'unsigned_doc':
        return FileWarning
      case 'aml_flag':
        return AlertTriangle
      default:
        return AlertTriangle
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>
        )
      case 'high':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">High</Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Medium</Badge>
        )
      case 'low':
        return (
          <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">Low</Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'kyc_expiry':
        return 'KYC Expiring'
      case 'accreditation_expiry':
        return 'Accreditation Expiring'
      case 'unsigned_doc':
        return 'Unsigned Document'
      case 'aml_flag':
        return 'AML Flag'
      default:
        return type
    }
  }

  const getDaysColor = (days: number | undefined) => {
    if (days === undefined) return 'text-zinc-400'
    if (days <= 7) return 'text-red-400'
    if (days <= 30) return 'text-amber-400'
    return 'text-emerald-400'
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true
    return alert.type === filter
  })

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const highCount = alerts.filter((a) => a.severity === 'high').length
  const kycExpiryCount = alerts.filter((a) => a.type === 'kyc_expiry').length
  const amlFlagCount = alerts.filter((a) => a.type === 'aml_flag').length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-zinc-400">Critical</span>
            </div>
            <span
              className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-zinc-500'}`}
            >
              {criticalCount}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-zinc-400">High Priority</span>
            </div>
            <span
              className={`text-2xl font-bold ${highCount > 0 ? 'text-amber-400' : 'text-zinc-500'}`}
            >
              {highCount}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-zinc-400">KYC Expiring</span>
            </div>
            <span className="text-2xl font-bold text-blue-400">{kycExpiryCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserX className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-zinc-400">AML Flags</span>
            </div>
            <span
              className={`text-2xl font-bold ${amlFlagCount > 0 ? 'text-purple-400' : 'text-zinc-500'}`}
            >
              {amlFlagCount}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'kyc_expiry', 'accreditation_expiry', 'unsigned_doc', 'aml_flag'].map(
            (filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className={
                  filter !== filterType ? 'border-zinc-700 text-zinc-400 hover:text-white' : ''
                }
              >
                {filterType === 'all'
                  ? 'All'
                  : filterType === 'kyc_expiry'
                    ? 'KYC'
                    : filterType === 'accreditation_expiry'
                      ? 'Accreditation'
                      : filterType === 'unsigned_doc'
                        ? 'Documents'
                        : 'AML'}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAlerts}
          className="border-zinc-700 text-zinc-400"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts Table */}
      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700 hover:bg-transparent">
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Investor</TableHead>
                <TableHead className="text-zinc-400">Details</TableHead>
                <TableHead className="text-zinc-400">Due Date</TableHead>
                <TableHead className="text-zinc-400">Severity</TableHead>
                <TableHead className="text-zinc-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-700">
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-5 bg-zinc-800 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredAlerts.length === 0 ? (
                <TableRow className="border-zinc-700">
                  <TableCell colSpan={6} className="text-center py-8">
                    <CheckCircle className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
                    <p className="text-white font-medium">All Clear</p>
                    <p className="text-sm text-zinc-400">No compliance alerts at this time</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type)
                  return (
                    <TableRow key={alert.id} className="border-zinc-700 hover:bg-zinc-800/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`h-4 w-4 ${alert.severity === 'critical'
                                ? 'text-red-400'
                                : alert.severity === 'high'
                                  ? 'text-amber-400'
                                  : 'text-blue-400'
                              }`}
                          />
                          <span className="text-white text-sm">{getTypeLabel(alert.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/versotech/staff/investors/${alert.investor_id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {alert.investor_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-sm max-w-xs truncate">
                        {alert.details}
                      </TableCell>
                      <TableCell>
                        {alert.due_date ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-zinc-400" />
                            <span className="text-zinc-400 text-sm">
                              {new Date(alert.due_date).toLocaleDateString()}
                            </span>
                            {alert.days_until_due !== undefined && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${getDaysColor(alert.days_until_due)} border-current`}
                              >
                                {alert.days_until_due <= 0
                                  ? 'Overdue'
                                  : `${alert.days_until_due}d`}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-zinc-400 hover:text-white"
                        >
                          <Link href={`/versotech/staff/investors/${alert.investor_id}`}>
                            View
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* KYC Expiry Timeline */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            KYC Expiry Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm font-medium">Next 7 Days</p>
              <p className="text-2xl font-bold text-red-400">
                {alerts.filter((a) => a.type === 'kyc_expiry' && (a.days_until_due || 0) <= 7).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-amber-400 text-sm font-medium">Next 30 Days</p>
              <p className="text-2xl font-bold text-amber-400">
                {
                  alerts.filter(
                    (a) =>
                      a.type === 'kyc_expiry' &&
                      (a.days_until_due || 0) > 7 &&
                      (a.days_until_due || 0) <= 30
                  ).length
                }
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-blue-400 text-sm font-medium">Next 90 Days</p>
              <p className="text-2xl font-bold text-blue-400">
                {
                  alerts.filter(
                    (a) =>
                      a.type === 'kyc_expiry' &&
                      (a.days_until_due || 0) > 30 &&
                      (a.days_until_due || 0) <= 90
                  ).length
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
