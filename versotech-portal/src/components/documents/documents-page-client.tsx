'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Document, Vehicle, Deal, DocumentFilters } from '@/types/documents'
import { DocumentCard } from './document-card'
import { DocumentFiltersComponent } from './document-filters'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Shield, AlertTriangle, Loader2, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentsPageClientProps {
  initialDocuments: Document[]
  vehicles: Vehicle[]
  deals: Deal[]
  typeCounts: Record<string, number>
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
    current_page: number
    total_pages: number
  }
  appliedFilters: DocumentFilters
}

export function DocumentsPageClient({
  initialDocuments,
  vehicles,
  deals,
  typeCounts,
  pagination,
  appliedFilters
}: DocumentsPageClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    // Subscribe to document inserts
    const channel = supabase
      .channel('documents_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'documents'
      }, (payload) => {
        console.log('New document added:', payload)

        // RLS will only send documents user can see
        const newDocument = payload.new as any

        // Basic document structure transformation
        const enrichedDocument: Document = {
          id: newDocument.id,
          type: newDocument.type,
          file_name: newDocument.file_key?.split('/').pop() || 'Unknown',
          file_key: newDocument.file_key,
          created_at: newDocument.created_at,
          scope: {},
          watermark: newDocument.watermark
        }

        setDocuments(prev => [enrichedDocument, ...prev])
        toast.success('New document available')
      })
      .subscribe((status) => {
        console.log('Realtime status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Handle filter changes
  const handleFilterChange = (filters: DocumentFilters) => {
    const params = new URLSearchParams()
    if (filters.type) params.set('type', filters.type)
    if (filters.vehicle_id) params.set('vehicle', filters.vehicle_id)
    if (filters.deal_id) params.set('deal', filters.deal_id)
    if (filters.search) params.set('search', filters.search)

    router.push(`/versoholdings/documents?${params.toString()}`)
  }

  // Load more documents (pagination)
  const loadMore = async () => {
    if (!pagination.has_more || loading) return

    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (appliedFilters.type) params.set('type', appliedFilters.type)
      if (appliedFilters.vehicle_id) params.set('vehicle_id', appliedFilters.vehicle_id)
      if (appliedFilters.deal_id) params.set('deal_id', appliedFilters.deal_id)
      if (appliedFilters.search) params.set('search', appliedFilters.search)
      params.set('offset', (pagination.offset + pagination.limit).toString())
      params.set('limit', pagination.limit.toString())

      const response = await fetch(`/api/documents?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to load more documents')
      }

      const data = await response.json()
      setDocuments(prev => [...prev, ...(data.documents || [])])

    } catch (error) {
      console.error('Load more error:', error)
      toast.error('Failed to load more documents')
    } finally {
      setLoading(false)
    }
  }

  // Empty state
  if (documents.length === 0 && !loading) {
    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative border-b border-gray-200 pb-8 mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50 rounded-t-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Documents
                </h1>
              </div>
              <p className="text-lg text-gray-600 ml-13">
                Access your statements, reports, and legal documents
              </p>
            </div>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              0 documents
            </Badge>
          </div>
        </div>

        {/* Empty State */}
        <Card className="border-2">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No documents found
              </h3>
              <p className="text-gray-600 mb-6">
                {appliedFilters.type || appliedFilters.vehicle_id || appliedFilters.deal_id || appliedFilters.search
                  ? 'Try adjusting your filters to see more documents.'
                  : 'Your documents will appear here once VERSO staff uploads them.'}
              </p>
              {(appliedFilters.type || appliedFilters.vehicle_id || appliedFilters.deal_id || appliedFilters.search) && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/versoholdings/documents')}
                  className="border-2"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 border-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-blue-900 text-lg mb-1">Document Security & Compliance</div>
                <div className="text-blue-700 leading-relaxed">
                  All documents are watermarked with your name and download timestamp.
                  Access is logged for compliance and security purposes as required by BVI FSC and GDPR regulations.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="relative border-b border-gray-200 pb-8 mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50 rounded-t-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Documents
              </h1>
            </div>
            <p className="text-lg text-gray-600 ml-13">
              Access your statements, reports, and legal documents
            </p>
          </div>
          <div className="text-right bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-sm border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Documents</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{pagination.total}</p>
            {isConnected && (
              <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live updates
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <DocumentFiltersComponent
        vehicles={vehicles}
        deals={deals}
        typeCounts={typeCounts}
        appliedFilters={appliedFilters}
        onChange={handleFilterChange}
      />

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>

      {/* Load More */}
      {pagination.has_more && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              <>
                Load More Documents
                <span className="ml-2 text-xs text-gray-500">
                  ({pagination.offset + pagination.limit} of {pagination.total})
                </span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Security Notice */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-blue-900 text-lg mb-1">Document Security & Compliance</div>
              <div className="text-blue-700 leading-relaxed">
                All documents are watermarked with your name and download timestamp.
                Access is logged for compliance and security purposes as required by BVI FSC and GDPR regulations.
                Download links expire after 15 minutes for security.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}