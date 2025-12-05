'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FileText, MessageSquare } from 'lucide-react'

import { CustomRequestModal } from './custom-request-modal'
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
import { createClient } from '@/lib/supabase/client'
import type {
  RequestTicket,
  RequestTicketWithRelations,
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
  initialRequests: RequestTicketWithRelations[]
  initialDocuments: Array<Document & { name?: string; folder?: { id: string; name: string; path: string } }>
  folders: DocumentFolder[]
  vehicles: Vehicle[]
  initialView: 'requests' | 'documents'
}

interface DocumentsTabProps {
  documents: ReportsPageClientProps['initialDocuments']
  folders: DocumentFolder[]
  vehicles: Vehicle[]
}

export function ReportsPageClient({
  initialRequests,
  initialDocuments,
  folders,
  vehicles,
  initialView
}: ReportsPageClientProps) {
  const [requests, setRequests] = useState<RequestTicketWithRelations[]>(initialRequests)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [activeView, setActiveView] = useState<'requests' | 'documents'>(initialView)
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

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }, [])

  const subscribeToUpdates = useCallback(() => {
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

          fetchRequests()
        } else if (payload.eventType === 'INSERT') {
          fetchRequests()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(requestsChannel)
    }
  }, [fetchRequests, supabase])

  useEffect(() => {
    const unsubscribe = subscribeToUpdates()
    return () => {
      unsubscribe?.()
    }
  }, [subscribeToUpdates])

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
      fetchRequests()
    } catch (error) {
      console.error('Error submitting custom request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit custom request')
      throw error
    }
  }

  return (
    <div className="space-y-8 px-6 py-8">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'requests' | 'documents')} className="space-y-8">
        <TabsList className="grid w-full max-w-xl grid-cols-2 bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="requests" className="text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white">
            Requests
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white">
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-8">
          <section className="grid gap-6 grid-cols-1 lg:grid-cols-[2fr,1fr]">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Your requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Track your open analytics and document requests with the VERSO team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveRequestsList requests={requests} />
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Request something new</CardTitle>
                <CardDescription className="text-gray-600">
                  Tell us what you need and the team will confirm delivery milestones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Our team can prepare detailed analytics, presentations, and documents tailored to your mandates.
                </p>
                <Button onClick={() => setRequestModalOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
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
          Investor statements, agreements, NDAs, and tax packs organized by category for easier access.
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
          <CategorizedDocumentsClient initialDocuments={documents} vehicles={vehicles} />
        )}
      </CardContent>
    </Card>
  )
}
