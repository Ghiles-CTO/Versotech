'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Eye
} from 'lucide-react'

type SortField = 'vehicle_name' | 'total_commitment' | 'total_funded' | 'total_nav' | 'subscription_count' | 'investor_count' | 'moic' | 'total_fees' | 'total_capital_calls' | 'total_distributions' | 'total_outstanding' | 'total_shares'
type SortDirection = 'asc' | 'desc'

interface VehicleSummary {
  vehicle_id: string
  vehicle_name: string
  vehicle_type: string
  vehicle_code: string
  vehicle_status: string
  total_commitment: number
  total_funded: number
  total_outstanding: number
  total_nav: number
  total_units: number
  total_shares: number
  total_capital_calls: number
  total_distributions: number
  total_spread_fees: number
  total_subscription_fees: number
  total_bd_fees: number
  total_finra_fees: number
  subscription_count: number
  investor_count: number
  status_pending: number
  status_committed: number
  status_active: number
  status_closed: number
  status_cancelled: number
  currencies: Record<string, number>
  earliest_subscription: string | null
  latest_subscription: string | null
  has_performance_fees: boolean
  avg_commitment: number
  moic: number
  funding_rate: number
}

interface VehicleSummaryTableProps {
  summaries: VehicleSummary[]
}

export function VehicleSummaryTable({ summaries }: VehicleSummaryTableProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>('total_commitment')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const formatPercent = (num: number) => {
    return `${formatNumber(num, 1)}%`
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedSummaries = [...summaries].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1

    // Handle total_fees which is computed
    const aVal = sortField === 'total_fees'
      ? (a.total_subscription_fees + a.total_bd_fees + a.total_finra_fees + a.total_spread_fees)
      : a[sortField]
    const bVal = sortField === 'total_fees'
      ? (b.total_subscription_fees + b.total_bd_fees + b.total_finra_fees + b.total_spread_fees)
      : b[sortField]

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return multiplier * aVal.localeCompare(bVal)
    }

    return multiplier * ((aVal as number) - (bVal as number))
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const handleViewDetails = (vehicleId: string) => {
    // Navigate to subscriptions page filtered by this vehicle
    router.push(`/versotech/staff/subscriptions?vehicle=${vehicleId}`)
  }

  return (
    <Card className="bg-gray-900/70 border-gray-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-transparent">
                <TableHead className="text-white bg-gray-900">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('vehicle_name')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Vehicle
                    <SortIcon field="vehicle_name" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('subscription_count')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Subscriptions
                    <SortIcon field="subscription_count" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('investor_count')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Investors
                    <SortIcon field="investor_count" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_commitment')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Commitment
                    <SortIcon field="total_commitment" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_funded')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    Funded
                    <SortIcon field="total_funded" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_nav')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    NAV
                    <SortIcon field="total_nav" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('moic')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    MOIC
                    <SortIcon field="moic" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_fees')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    Total Fees
                    <SortIcon field="total_fees" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_capital_calls')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    Capital Calls
                    <SortIcon field="total_capital_calls" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_distributions')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    Distributions
                    <SortIcon field="total_distributions" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_outstanding')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    Outstanding
                    <SortIcon field="total_outstanding" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_shares')}
                    className="hover:bg-gray-800 text-white font-semibold"
                  >
                    Shares
                    <SortIcon field="total_shares" />
                  </Button>
                </TableHead>
                <TableHead className="text-white bg-gray-900">Period</TableHead>
                <TableHead className="text-white bg-gray-900">Status</TableHead>
                <TableHead className="text-white bg-gray-900 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSummaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="h-24 text-center text-gray-400">
                    No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                sortedSummaries.map((vehicle) => (
                  <TableRow
                    key={vehicle.vehicle_id}
                    className="hover:bg-gray-800/50 border-gray-700 cursor-pointer"
                    onClick={() => handleViewDetails(vehicle.vehicle_id)}
                  >
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{vehicle.vehicle_name}</div>
                        <div className="text-sm text-gray-400">
                          {vehicle.vehicle_code} • {vehicle.vehicle_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className="font-medium">{vehicle.subscription_count}</div>
                      <div className="text-xs text-gray-400">
                        Active: {vehicle.status_active} / Closed: {vehicle.status_closed}
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right font-medium">
                      {vehicle.investor_count}
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className="font-medium">
                        {formatCurrency(vehicle.total_commitment)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Avg: {formatCurrency(vehicle.avg_commitment)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className="font-medium text-green-400">
                        {formatCurrency(vehicle.total_funded)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatPercent(vehicle.funding_rate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className="font-medium text-blue-400">
                        {formatCurrency(vehicle.total_nav)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className={`font-medium ${vehicle.moic >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatNumber(vehicle.moic, 2)}x
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className="font-medium text-orange-400">
                        {formatCurrency(
                          vehicle.total_subscription_fees +
                          vehicle.total_bd_fees +
                          vehicle.total_finra_fees +
                          vehicle.total_spread_fees
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Sub: {formatCurrency(vehicle.total_subscription_fees)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className="font-medium text-red-400">
                        {formatCurrency(vehicle.total_capital_calls)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      <div className="font-medium text-green-400">
                        {formatCurrency(vehicle.total_distributions)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-right">
                      {vehicle.total_outstanding > 0 ? (
                        <div className="font-medium text-yellow-400">
                          {formatCurrency(vehicle.total_outstanding)}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white text-right">
                      {vehicle.total_shares > 0 ? (
                        <div className="font-medium">
                          {vehicle.total_shares.toLocaleString()}
                        </div>
                      ) : vehicle.total_units > 0 ? (
                        <div className="font-medium">
                          {vehicle.total_units.toLocaleString()} units
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {vehicle.earliest_subscription && vehicle.latest_subscription ? (
                        <div className="text-xs">
                          <div>{new Date(vehicle.earliest_subscription).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                          <div className="text-gray-500">to</div>
                          <div>{new Date(vehicle.latest_subscription).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {vehicle.status_active > 0 && (
                          <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                            {vehicle.status_active}
                          </Badge>
                        )}
                        {vehicle.status_committed > 0 && (
                          <Badge variant="secondary" className="bg-blue-900/30 text-blue-300">
                            {vehicle.status_committed}
                          </Badge>
                        )}
                        {vehicle.status_pending > 0 && (
                          <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-300">
                            {vehicle.status_pending}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(vehicle.vehicle_id)
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-gray-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
