'use client'

import { useEffect, useState } from 'react'
import { QuickReportCard } from './quick-report-card'
import { CustomRequestModal } from './custom-request-modal'
import { RecentReportsList } from './recent-reports-list'
import { ActiveRequestsList } from './active-requests-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, FileText } from 'lucide-react'
import { REPORT_TYPES } from '@/lib/reports/constants'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type {
  ReportRequest,
  RequestTicket,
  ReportRequestWithRelations,
  RequestTicketWithRelations,
  ReportType
} from '@/types/reports'

interface ReportsPageClientProps {
  initialReports: ReportRequestWithRelations[]
  initialRequests: RequestTicketWithRelations[]
}

export function ReportsPageClient({ initialReports, initialRequests }: ReportsPageClientProps) {
  const [reports, setReports] = useState<ReportRequestWithRelations[]>(initialReports)
  const [requests, setRequests] = useState<RequestTicketWithRelations[]>(initialRequests)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const supabase = createClient()

  // Subscribe to real-time updates
  useEffect(() => {
    subscribeToUpdates()
  }, [])

  async function fetchReportsAndRequests() {
    try {
      const [reportsResponse, requestsResponse] = await Promise.all([
        fetch('/api/report-requests'),
        fetch('/api/requests')
      ])

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports || [])
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData.requests || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  function subscribeToUpdates() {
    // Subscribe to report_requests updates
    const reportsChannel = supabase
      .channel('report_requests_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'report_requests'
      }, (payload) => {
        console.log('Report request updated:', payload)

        if (payload.eventType === 'UPDATE' && payload.new) {
          const updated = payload.new as ReportRequest

          // Show toast for status changes
          if (updated.status === 'ready') {
            toast.success(`Your ${REPORT_TYPES[updated.report_type]?.label || 'report'} is ready to download!`)
          } else if (updated.status === 'failed') {
            toast.error(updated.error_message || 'Report generation failed')
          }

          fetchReportsAndRequests()
        } else if (payload.eventType === 'INSERT') {
          fetchReportsAndRequests()
        }
      })
      .subscribe()

    // Subscribe to request_tickets updates
    const requestsChannel = supabase
      .channel('request_tickets_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'request_tickets'
      }, (payload) => {
        console.log('Request ticket updated:', payload)

        if (payload.eventType === 'UPDATE' && payload.new) {
          const updated = payload.new as RequestTicket

          if (updated.status === 'ready') {
            toast.success('Your custom request has been completed!')
          } else if (updated.status === 'closed') {
            toast.success('Your custom request has been closed')
          }

          fetchReportsAndRequests()
        } else if (payload.eventType === 'INSERT') {
          fetchReportsAndRequests()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(reportsChannel)
      supabase.removeChannel(requestsChannel)
    }
  }

  async function handleGenerateReport(reportType: ReportType) {
    try {
      const response = await fetch('/api/report-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const result = await response.json()

      toast.success(result.message || 'Your report is being generated...')

      fetchReportsAndRequests()
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate report')
    }
  }

  async function handleDownloadReport(requestId: string, documentId: string) {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)

      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const data = await response.json()

      // Open download URL in new tab
      if (data.download_url) {
        window.open(data.download_url, '_blank')
        toast.success('Download started')
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to download report')
    }
  }

  async function handleSubmitRequest(requestData: any) {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit request')
      }

      toast.success('Your custom request has been sent to the team at biz@realest.com')

      setRequestModalOpen(false)
      fetchReportsAndRequests()
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit request')
    }
  }

  const showEmptyState = reports.length === 0 && requests.length === 0

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Ask Center</h1>
          <p className="text-muted-foreground mt-1">
            Generate instant reports or submit custom requests to the team
          </p>
        </div>
        <Button onClick={() => setRequestModalOpen(true)} className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Submit Custom Request
        </Button>
      </div>

      {/* Quick Reports Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(REPORT_TYPES)
            .filter(([type]) => type !== 'custom')
            .map(([type, config]) => (
              <QuickReportCard
                key={type}
                reportType={type as ReportType}
                label={config.label}
                description={config.description}
                estimatedTime={config.estimatedTime}
                icon={config.icon}
                onGenerate={handleGenerateReport}
              />
            ))}
        </div>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <RecentReportsList
          reports={reports}
          onDownload={handleDownloadReport}
        />
      )}

      {/* Active Custom Requests */}
      {requests.length > 0 && (
        <ActiveRequestsList
          requests={requests}
          onDownload={handleDownloadReport}
        />
      )}

      {/* Empty State */}
      {showEmptyState && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Generate your first report or submit a custom request
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Click on a quick report above to generate it instantly, or submit a custom request for bespoke analysis.
            </p>
            <Button onClick={() => setRequestModalOpen(true)} variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Custom Request
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Custom Request Modal */}
      <CustomRequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
