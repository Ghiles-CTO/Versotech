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
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 opacity-50" />
        <p className="text-sm font-medium text-gray-700">No reports generated yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Click a quick report above to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const reportConfig = REPORT_TYPES[report.report_type]
        const canDownload = report.status === 'ready' && report.result_doc_id

        return (
          <div
            key={report.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">
                  {reportConfig?.label || report.report_type}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
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
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
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
                  className="gap-2 border-gray-300"
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
  )
}
