'use client'

import { Badge } from '@/components/ui/badge'
import { Loader2, Clock, CheckCircle, AlertCircle, CircleDot, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportStatus, RequestStatus } from '@/types/reports'

interface ReportStatusBadgeProps {
  status: ReportStatus | RequestStatus
  type?: 'report' | 'request'
}

const reportStatusConfig = {
  queued: {
    label: 'Queued',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse'
  },
  ready: {
    label: 'Ready',
    icon: CheckCircle,
    variant: 'default' as const,
    className: 'bg-green-100 text-green-700 border-green-200'
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-700 border-red-200'
  }
}

const requestStatusConfig = {
  open: {
    label: 'Open',
    icon: CircleDot,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  assigned: {
    label: 'Assigned',
    icon: UserCheck,
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  in_progress: {
    label: 'In Progress',
    icon: Loader2,
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  ready: {
    label: 'Ready',
    icon: CheckCircle,
    variant: 'default' as const,
    className: 'bg-green-100 text-green-700 border-green-200'
  },
  closed: {
    label: 'Completed',
    icon: CheckCircle,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function ReportStatusBadge({ status, type = 'report' }: ReportStatusBadgeProps) {
  const config = type === 'report'
    ? reportStatusConfig[status as ReportStatus]
    : requestStatusConfig[status as RequestStatus]

  if (!config) return null

  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 font-medium',
        config.className
      )}
    >
      <Icon className={cn(
        'h-3.5 w-3.5',
        status === 'processing' && 'animate-spin'
      )} />
      <span>{config.label}</span>
    </Badge>
  )
}
