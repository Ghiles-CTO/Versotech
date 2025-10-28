'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Eye } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

export type InvestorRow = {
  id: string
  name: string
  type: string
  email: string
  kycStatus: string
  totalCommitment: number
  totalContributed: number
  vehicleCount: number
  relationshipManager: string
  country: string
  riskRating: string
}

function getKycStatusColor(status: string) {
  const colors = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    review: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function getRiskColor(risk: string) {
  const colors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const investorColumns: ColumnDef<InvestorRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Investor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const investor = row.original
      const initials = investor.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{investor.name}</span>
            <span className="text-xs text-muted-foreground">{investor.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue('type')}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'kycStatus',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        KYC
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue('kycStatus') as string
      return (
        <Badge className={getKycStatusColor(status)}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'totalCommitment',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Commitment
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalCommitment'))
      const contributed = row.original.totalContributed
      const percentage = amount > 0 ? Math.round((contributed / amount) * 100) : 0

      return (
        <div className="text-right">
          <div className="font-semibold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(amount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {percentage}% funded
          </div>
        </div>
      )
    },
    sortingFn: 'basic',
  },
  {
    accessorKey: 'vehicleCount',
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Vehicles
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('vehicleCount')}
      </div>
    ),
  },
  {
    accessorKey: 'relationshipManager',
    header: 'RM',
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue('relationshipManager')}</div>
    ),
  },
  {
    accessorKey: 'riskRating',
    header: 'Risk',
    cell: ({ row }) => {
      const risk = row.getValue('riskRating') as string
      return (
        <Badge className={getRiskColor(risk)} variant="outline">
          {risk}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue('country')}</div>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const investor = row.original

      return (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            <Link href={`/versotech/staff/investors/${investor.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
        </div>
      )
    },
  },
]
