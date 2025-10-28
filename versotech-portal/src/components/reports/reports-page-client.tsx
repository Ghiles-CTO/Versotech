'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MessageSquare, FileText } from 'lucide-react'

import { QuickReportCard } from './quick-report-card'
import { CustomRequestModal } from './custom-request-modal'
import { QuickReportDialog } from './quick-report-dialog'
import { RecentReportsList } from './recent-reports-list'
import { ActiveRequestsList } from './active-requests-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategorizedDocumentsClient } from '@/components/documents/categorized-documents-client'
import { InvestorFoldersClient } from '@/components/documents/investor-folders-client'
import { REPORT_TYPES } from '@/lib/reports/constants'
import { createClient } from '@/lib/supabase/client'
import type {
  ReportRequest,
  RequestTicket,
  ReportRequestWithRelations,
  RequestTicketWithRelations,
  ReportType,
  CreateCustomRequest
} from '@/types/reports'
import type { Document, Vehicle } from '@/types/documents'

interface DocumentFolder {
  id: string
  name: string
  path: string
  folder_type: string
  vehicle?: {
    id: string
    name: string
  }
}

interface ReportsPageClientProps {
  initialReports: ReportRequestWithRelations[]
  initialRequests: RequestTicketWithRelations[]
  initialDocuments: Array<Document & { name?: string; folder?: { id: string; name: string; path: string } }>
  folders: DocumentFolder[]
  vehicles: Vehicle[]
  initialView: 'reports' | 'documents'
}

interface VehicleOption {
  id: string
  name: string
  type: string
}

interface DocumentsTabProps {
  documents: ReportsPageClientProps['initialDocuments']
  folders: DocumentFolder[]
  vehicles: Vehicle[]
}

export function ReportsPageClient({
  initialReports,
  initialRequests,
  initialDocuments,
  folders,
  vehicles,
  initialView
}: ReportsPageClientProps) {
  const [reports, setReports] = useState<ReportRequestWithRelations[]>(initialReports)
  const [requests, setRequests] = useState<RequestTicketWithRelations[]>(initialRequests)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
  const [reportDialog, setReportDialog] = useState<{ open: boolean; reportType: ReportType | null }>({ open: false, reportType: null })
  const [reportFormState, setReportFormState] = useState<Record<string, unknown>>({})
  const [isSubmittingQuickReport, setIsSubmittingQuickReport] = useState(false)
  const [activeView, setActiveView] = useState<'reports' | 'documents'>(initialView)
  const supabase = createClient()

  const documentsForFolders = useMemo(() => {
    return initialDocuments.map((doc): Document => ({
      id: doc.id,
      type: doc.type,
      file_name: doc.name ?? doc.file_key,
      file_key: doc.file_key,
      file_size_bytes: doc.file_size_bytes ?? 0,
      created_at: doc.created_at,
      created_by: doc.created_by,
      scope: doc.scope,
      watermark: doc.watermark,
      metadata: doc.metadata
    }))
  }, [initialDocuments])

  const fetchReportsAndRequests = useCallback(async () => {
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
  }, [])

  const subscribeToUpdates = useCallback(() => {
    const reportsChannel = supabase
      .channel('report_requests_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'report_requests'
      }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          const updated = payload.new as ReportRequest

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

    const requestsChannel = supabase
      .channel('request_tickets_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'request_tickets'
      }, (payload) => {
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
  }, [fetchReportsAndRequests, supabase])

  async function fetchVehicleOptions() {
    try {
      const response = await fetch('/api/vehicles?related=true&includeDeals=false')
      if (!response.ok) return
      const data = await response.json()
      const vehicles = Array.isArray(data.vehicles) ? data.vehicles : []
      setVehicleOptions(vehicles)
    } catch (error) {
      console.error('Error fetching vehicles for reports:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = subscribeToUpdates()
    fetchVehicleOptions()
    return () => {
      unsubscribe?.()
    }
  }, [subscribeToUpdates])

  const handleGenerateReportClick = (reportType: ReportType) => {
    setReportFormState({})
    setReportDialog({ open: true, reportType })
  }

  const reportFormConfig = useMemo(() => {
    if (!reportDialog.reportType) return { fields: [] as string[], config: null }
    const config = REPORT_TYPES[reportDialog.reportType]
    return {
      fields: config?.formFields || [],
      config,
      supportedScopes: config?.supportedScopes || ['all']
    }
  }, [reportDialog.reportType])

  async function submitQuickReport() {
    const reportType = reportDialog.reportType
    if (!reportType) return

    setIsSubmittingQuickReport(true)
    try {
      const payload: Record<string, unknown> = { reportType }

      if (reportFormState.scope) payload.scope = reportFormState.scope
      if (reportFormState.vehicleId) payload.vehicleId = reportFormState.vehicleId
      if (reportFormState.fromDate) payload.fromDate = reportFormState.fromDate
      if (reportFormState.toDate) payload.toDate = reportFormState.toDate
      if (reportFormState.year) payload.year = Number(reportFormState.year)
      if (reportFormState.currency) payload.currency = reportFormState.currency
      if (reportFormState.includeExcel !== undefined) payload.includeExcel = !!reportFormState.includeExcel
      if (reportFormState.includePdf !== undefined) payload.includePdf = !!reportFormState.includePdf
      if (reportFormState.includeBenchmark !== undefined) payload.includeBenchmark = !!reportFormState.includeBenchmark
      if (reportFormState.notes) payload.notes = reportFormState.notes

      const response = await fetch('/api/report-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const result = await response.json()
      toast.success(result.message || 'Report queued successfully. You will receive a notification when it is ready.')

      setReportDialog({ open: false, reportType: null })
      setReportFormState({})
      fetchReportsAndRequests()
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate report')
    } finally {
      setIsSubmittingQuickReport(false)
    }
  }

  async function submitCustomRequest(data: CreateCustomRequest) {
    try {
      const response = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit custom request')
      }

      const result = await response.json()
      toast.success(result.message || 'Custom request submitted successfully')

      setRequestModalOpen(false)
      fetchReportsAndRequests()
    } catch (error) {
      console.error('Error submitting custom request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit custom request')
      throw error
    }
  }

  const quickReportCards = useMemo(() => {
    return Object.values(REPORT_TYPES).filter((config) => config.workflowKey !== 'custom')
  }, [])

  const handleDownloadReport = useCallback(async (reportId: string, documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (!response.ok) {
        throw new Error('Failed to download report')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }, [])

  return (
    <div className="space-y-8 px-6 py-8">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'reports' | 'documents')} className="space-y-8">
        <TabsList className="grid w-full max-w-xl grid-cols-2 bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="reports" className="text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white">
            Reports & Requests
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white">
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-8">
          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Quick reports on demand</CardTitle>
                <CardDescription className="text-gray-600">
                  Generate the most-requested investor deliverables with a single click. We&apos;ll notify you when they&apos;re ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {quickReportCards.map((config) => (
                  <QuickReportCard
                    key={config.workflowKey}
                    config={config}
                    onGenerate={() => handleGenerateReportClick(config.workflowKey as ReportType)}
                  />
                ))}
                <Card className="border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <h3 className="text-base font-semibold text-gray-900">Need something bespoke?</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Our team can prepare detailed analytics and presentations tailored to your mandates.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 border-gray-300" onClick={() => setRequestModalOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start a custom request
                  </Button>
                </Card>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Report delivery status</CardTitle>
                <CardDescription className="text-gray-600">We notify you as soon as a report is complete or requires attention.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentReportsList reports={reports} onDownload={handleDownloadReport} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Active custom requests</CardTitle>
                <CardDescription className="text-gray-600">Your open analytics and document requests with the VERSO team.</CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveRequestsList requests={requests} />
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Request something new</CardTitle>
                <CardDescription className="text-gray-600">Tell us what you need and the team will confirm delivery milestones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Select a vehicle, define your scope, and we&apos;ll prepare the materials or set up a working session.
                </p>
                <Button onClick={() => setRequestModalOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create custom request
                </Button>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab documents={initialDocuments} folders={folders} vehicles={vehicles} documentsForFolders={documentsForFolders} />
        </TabsContent>
      </Tabs>

      <QuickReportDialog
        open={reportDialog.open}
        reportType={reportDialog.reportType}
        onOpenChange={(open) => setReportDialog({ ...reportDialog, open })}
        config={reportFormConfig}
        vehicles={vehicleOptions}
        formState={reportFormState}
        onFormStateChange={setReportFormState}
        onSubmit={submitQuickReport}
        submitting={isSubmittingQuickReport}
      />

      <CustomRequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        onSubmit={submitCustomRequest}
      />
    </div>
  )
}

function DocumentsTab({ documents, folders, vehicles, documentsForFolders }: DocumentsTabProps & { documentsForFolders: DocumentsTabProps['documents'] }) {
  const totalDocuments = documents.length

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Documents hub</CardTitle>
        <CardDescription className="text-gray-600">
          Investor statements, agreements, NDAs, and tax packs now live under Reports for easier access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalDocuments === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 opacity-50" />
            <p className="text-sm font-medium text-gray-700">No documents yet</p>
            <p className="mt-1 text-sm text-gray-500">
              As soon as statements or reports are shared, they will appear here automatically.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 border border-gray-200">
              <TabsTrigger value="categories" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">
                By category
              </TabsTrigger>
              <TabsTrigger value="folders" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">
                By folder
              </TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <CategorizedDocumentsClient initialDocuments={documents} vehicles={vehicles} />
            </TabsContent>
            <TabsContent value="folders">
              <InvestorFoldersClient folders={folders} documents={documentsForFolders as any} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
