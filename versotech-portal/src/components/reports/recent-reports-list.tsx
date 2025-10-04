'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { ReportStatusBadge } from './report-status-badge'
import { formatDistanceToNow } from 'date-fns'
import type { ReportRequestWithRelations } from '@/types/reports'
import { REPORT_TYPES } from '@/lib/reports/constants'

interface RecentReportsListProps {
  reports: ReportRequestWithRelations[]
  onDownload: (reportId: string, documentId: string) => Promise<void>
}

export function RecentReportsList({ reports, onDownload }: RecentReportsListProps) {
  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your generated reports will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No reports generated yet. Click a quick report above to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>
          Track generation status and download your reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => {
            const reportConfig = REPORT_TYPES[report.report_type]
            const canDownload = report.status === 'ready' && report.result_doc_id

            return (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">
                      {reportConfig?.label || report.report_type}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </span>
                      {report.vehicles && (
                        <>
                          <span>•</span>
                          <span className="truncate">{report.vehicles.name}</span>
                        </>
                      )}
                    </div>
                    {report.status === 'failed' && report.error_message && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span>{report.error_message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <ReportStatusBadge status={report.status} type="report" />
                  {canDownload && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(report.id, report.result_doc_id!)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
