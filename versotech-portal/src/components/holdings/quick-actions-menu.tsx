'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  MoreHorizontal,
  FileText,
  Download,
  MessageSquare,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface QuickActionsMenuProps {
  holdingId: string
  holdingName: string
  holdingType: 'vehicle' | 'deal'
  className?: string
}

interface ReportRequest {
  id: string
  type: string
  status: string
  created_at: string
  vehicleName?: string
}

export function QuickActionsMenu({ holdingId, holdingName, holdingType, className }: QuickActionsMenuProps) {
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<ReportRequest[]>([])
  const [isRequestingReport, setIsRequestingReport] = useState(false)

  const handleRequestReport = async (reportType: string) => {
    setIsRequestingReport(true)
    
    try {
      const response = await fetch('/api/report-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          vehicleId: holdingType === 'vehicle' ? holdingId : null,
          dealId: holdingType === 'deal' ? holdingId : null,
          filters: {
            includeCashflows: true,
            includePerformance: true,
            includeDocuments: false
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to request report')
      }

      const result = await response.json()
      
      toast.success('Report requested successfully', {
        description: `Your ${reportType} for ${holdingName} has been queued for generation.`,
        duration: 5000
      })

      // Add to pending requests (mock for now)
      setPendingRequests(prev => [...prev, {
        id: result.id,
        type: reportType,
        status: 'queued',
        created_at: new Date().toISOString(),
        vehicleName: holdingName
      }])

      setShowReportDialog(false)
    } catch (error) {
      console.error('Failed to request report:', error)
      toast.error('Failed to request report', {
        description: 'Please try again or contact support if the issue persists.'
      })
    } finally {
      setIsRequestingReport(false)
    }
  }

  const handleDownloadDocuments = async () => {
    try {
      // TODO: Implement document download functionality
      toast.info('Document download', {
        description: 'Document download functionality will be available soon.'
      })
    } catch (error) {
      toast.error('Failed to download documents')
    }
  }

  const handleStartMessage = async () => {
    try {
      // TODO: Implement messaging functionality
      toast.info('Messaging', {
        description: 'Messaging functionality will be available soon.'
      })
    } catch (error) {
      toast.error('Failed to start conversation')
    }
  }

  const handleScheduleCall = async () => {
    try {
      // TODO: Implement call scheduling
      toast.info('Call scheduling', {
        description: 'Call scheduling functionality will be available soon.'
      })
    } catch (error) {
      toast.error('Failed to schedule call')
    }
  }

  const actions = [
    {
      id: 'position_statement',
      label: 'Request Position Statement',
      icon: FileText,
      description: 'Generate detailed position statement',
      action: () => handleRequestReport('position_statement')
    },
    {
      id: 'performance_report',
      label: 'Request Performance Report',
      icon: BarChart3,
      description: 'Generate performance analysis',
      action: () => handleRequestReport('performance_report')
    },
    {
      id: 'cashflow_report',
      label: 'Request Cashflow Report',
      icon: Clock,
      description: 'Generate cashflow history',
      action: () => handleRequestReport('cashflow_report')
    },
    {
      id: 'download_docs',
      label: 'Download Documents',
      icon: Download,
      description: 'Access available documents',
      action: handleDownloadDocuments
    },
    {
      id: 'start_message',
      label: 'Send Message',
      icon: MessageSquare,
      description: 'Start conversation about this holding',
      action: handleStartMessage
    },
    {
      id: 'schedule_call',
      label: 'Schedule Call',
      icon: Calendar,
      description: 'Schedule investor call',
      action: handleScheduleCall
    }
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-semibold">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {actions.slice(0, 3).map(action => (
            <DropdownMenuItem key={action.id} onClick={action.action} className="gap-2">
              <action.icon className="h-4 w-4" />
              <div>
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {actions.slice(3).map(action => (
            <DropdownMenuItem key={action.id} onClick={action.action} className="gap-2">
              <action.icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report Request Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Requests</DialogTitle>
            <DialogDescription>
              Track your pending report requests for {holdingName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-medium text-sm">{request.type.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No pending report requests</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
