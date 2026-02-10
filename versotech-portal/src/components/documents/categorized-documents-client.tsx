'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Document, Vehicle, DocumentFilters } from '@/types/documents'
import { DocumentCard } from './document-card'
import { DocumentFiltersComponent } from './document-filters'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from './DocumentViewerFullscreen'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileText,
  Folder,
  FolderOpen,
  Home,
  Lock,
  Shield,
  Briefcase
} from 'lucide-react'

interface CategorizedDocumentsClientProps {
  initialDocuments: Document[]
  vehicles: Vehicle[]
}

// Document category configuration (excluding KYC - that stays in Profile)
const DOCUMENT_CATEGORIES = {
  agreements: {
    id: 'agreements',
    name: 'Agreements',
    icon: FileCheck,
    color: 'blue',
    description: 'Subscription agreements, LPAs, side letters',
    types: ['Subscription', 'Agreement', 'subscription', 'agreement', 'subscription_pack', 'subscription_draft']
  },
  statements: {
    id: 'statements',
    name: 'Statements',
    icon: BarChart3,
    color: 'purple',
    description: 'Position statements, capital calls, distributions',
    types: ['Statement', 'statement', 'capital_call']
  },
  ndas: {
    id: 'ndas',
    name: 'NDAs',
    icon: Lock,
    color: 'amber',
    description: 'Non-disclosure agreements',
    types: ['NDA', 'nda']
  },
  reports: {
    id: 'reports',
    name: 'Reports & Tax',
    icon: FileText,
    color: 'indigo',
    description: 'Performance reports, tax packs, investor letters',
    types: ['Report', 'report', 'Tax', 'tax', 'memo']
  }
}

type CategoryId = keyof typeof DOCUMENT_CATEGORIES

type HoldingWithCategories = {
  id: string
  name: string
  type: string | null
  vehicle: Document['scope']['vehicle']
  categories: Record<CategoryId, Document[]>
  totalDocuments: number
}

function getCategoryForDocumentType(type: string): CategoryId | null {
  for (const [categoryId, category] of Object.entries(DOCUMENT_CATEGORIES)) {
    if (category.types.includes(type)) {
      return categoryId as CategoryId
    }
  }
  return 'reports' // Default to reports for unknown types
}

function getCategoryColor(color: string) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
  }
  return colors[color as keyof typeof colors] || colors.blue
}

function getCategoryIconColor(color: string) {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
    indigo: 'text-indigo-600 dark:text-indigo-400'
  }
  return colors[color as keyof typeof colors] || colors.blue
}

export function CategorizedDocumentsClient({
  initialDocuments,
  vehicles
}: CategorizedDocumentsClientProps) {
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<DocumentFilters>({})
  const documentViewer = useDocumentViewer()

  // Filter documents: exclude KYC (stays in Profile), exclude deal-specific except NDAs/subscriptions
  const displayableDocuments = useMemo(() => {
    let docs = initialDocuments.filter(doc => {
      // Exclude KYC documents - they belong in Profile
      if (doc.type.toLowerCase() === 'kyc') return false

      // Include if no deal scope, or if it's an NDA/subscription
      return !doc.scope.deal ||
        doc.type === 'nda' ||
        doc.type === 'subscription_pack' ||
        doc.type === 'subscription'
    })

    // Apply vehicle/holding filter
    if (filters.vehicle_id) {
      docs = docs.filter(doc => doc.scope.vehicle?.id === filters.vehicle_id)
    }

    // Apply type filter
    if (filters.type) {
      docs = docs.filter(doc =>
        doc.type.toLowerCase() === filters.type?.toLowerCase()
      )
    }

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      docs = docs.filter(doc =>
        doc.file_name?.toLowerCase().includes(search) ||
        (doc as any).name?.toLowerCase().includes(search)
      )
    }

    return docs
  }, [initialDocuments, filters])

  // Calculate type counts for filter badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    displayableDocuments.forEach(doc => {
      counts[doc.type] = (counts[doc.type] || 0) + 1
    })
    return counts
  }, [displayableDocuments])

  // Group documents by holding/investment FIRST, then by category within each holding
  const holdingsWithDocuments = useMemo(() => {
    const holdingMap = new Map<string, HoldingWithCategories>()

    displayableDocuments.forEach((doc) => {
      const vehicle = doc.scope.vehicle
      const holdingId = vehicle?.id ?? 'general'
      const holdingName = vehicle?.investment_name || vehicle?.name || 'General Documents'
      const holdingType = vehicle?.type ?? null

      if (!holdingMap.has(holdingId)) {
        holdingMap.set(holdingId, {
          id: holdingId,
          name: holdingName,
          type: holdingType,
          vehicle,
          categories: {
            agreements: [],
            statements: [],
            ndas: [],
            reports: []
          },
          totalDocuments: 0
        })
      }

      const holding = holdingMap.get(holdingId)!
      const categoryId = getCategoryForDocumentType(doc.type) ?? 'reports'
      holding.categories[categoryId].push(doc)
      holding.totalDocuments++
    })

    // Sort: named holdings first (alphabetically), then General at end
    return Array.from(holdingMap.values()).sort((a, b) => {
      if (a.id === 'general') return 1
      if (b.id === 'general') return -1
      return a.name.localeCompare(b.name)
    })
  }, [displayableDocuments])

  const totalDocuments = displayableDocuments.length

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey)
    } else {
      newExpanded.add(categoryKey)
    }
    setExpandedCategories(newExpanded)
  }

  // Holdings overview (main view)
  if (!selectedHolding) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="relative border-b border-border pb-8 mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900/50 dark:via-blue-900/30 dark:to-indigo-900/30 opacity-60 rounded-t-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Investment Documents
                </h1>
              </div>
              <p className="text-lg text-muted-foreground ml-15">
                Access documents organized by your investments
              </p>
            </div>
            <div className="text-right bg-background/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-sm border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Documents</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <DocumentFiltersComponent
          vehicles={vehicles}
          deals={[]}
          typeCounts={typeCounts}
          appliedFilters={filters}
          onChange={setFilters}
        />

        {/* Holdings List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Investments</h2>

          {holdingsWithDocuments.length === 0 ? (
            <Card className="border-2 border-border">
              <CardContent className="p-12 text-center">
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  No documents available
                </h3>
                <p className="text-muted-foreground">
                  Documents will appear here once they are uploaded by the VERSO team.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {holdingsWithDocuments.map((holding) => (
                <Card
                  key={holding.id}
                  className="border-2 border-border hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-card overflow-hidden"
                  onClick={() => setSelectedHolding(holding.id)}
                >
                  <CardContent className="p-0">
                    {/* Holding Header */}
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/30 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                            {holding.vehicle?.logo_url ? (
                              <Image
                                src={holding.vehicle.logo_url}
                                alt={holding.name}
                                width={56}
                                height={56}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                                <Building2 className="h-7 w-7 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                              {holding.name}
                            </h3>
                            {holding.type && (
                              <p className="text-sm text-muted-foreground uppercase tracking-wide mt-0.5">
                                {holding.type}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Category Summary */}
                    <div className="p-6 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(DOCUMENT_CATEGORIES).map(([catId, category]) => {
                          const docs = holding.categories[catId as CategoryId]
                          if (docs.length === 0) return null
                          const Icon = category.icon
                          return (
                            <div
                              key={catId}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getCategoryColor(category.color)}`}
                            >
                              <Icon className={`h-4 w-4 ${getCategoryIconColor(category.color)}`} />
                              <span className="text-sm font-medium">{category.name}</span>
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {docs.length}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total documents</span>
                        <Badge variant="outline" className="font-semibold border-2">
                          {holding.totalDocuments}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-1">Document Security & Compliance</div>
                <div className="text-blue-700 dark:text-blue-300 leading-relaxed">
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

  // Selected holding detail view
  const selectedHoldingData = holdingsWithDocuments.find(h => h.id === selectedHolding)

  if (!selectedHoldingData) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header with breadcrumb */}
      <div className="relative border-b border-border pb-8 mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900/50 dark:via-blue-900/30 dark:to-indigo-900/30 opacity-60 rounded-t-2xl" />
        <div className="relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedHolding(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4 mr-2" />
              Investments
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{selectedHoldingData.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSelectedHolding(null)}
                className="border-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {selectedHoldingData.vehicle?.logo_url ? (
                    <Image
                      src={selectedHoldingData.vehicle.logo_url}
                      alt={selectedHoldingData.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{selectedHoldingData.name}</h1>
                  {selectedHoldingData.type && (
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mt-0.5">
                      {selectedHoldingData.type}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-lg px-4 py-2 bg-background/80 backdrop-blur-sm border-2">
              {selectedHoldingData.totalDocuments} document{selectedHoldingData.totalDocuments !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Document Categories as Expandable Folders */}
      <div className="space-y-4">
        {Object.entries(DOCUMENT_CATEGORIES).map(([categoryId, category]) => {
          const docs = selectedHoldingData.categories[categoryId as CategoryId]
          if (docs.length === 0) return null

          const Icon = category.icon
          const isExpanded = expandedCategories.has(categoryId)
          const categoryKey = `${selectedHolding}-${categoryId}`

          return (
            <div key={categoryId} className="border-2 border-border rounded-xl bg-card overflow-hidden shadow-sm">
              {/* Category Header (clickable) */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(category.color)} border`}>
                    {isExpanded ? (
                      <FolderOpen className={`h-5 w-5 ${getCategoryIconColor(category.color)}`} />
                    ) : (
                      <Icon className={`h-5 w-5 ${getCategoryIconColor(category.color)}`} />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm font-semibold border-2">
                  {docs.length} document{docs.length !== 1 ? 's' : ''}
                </Badge>
              </button>

              {/* Documents List (expanded) */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/30">
                  <div className="p-4 space-y-3">
                    {docs.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onPreview={documentViewer.openPreview}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-1">Document Security</div>
              <div className="text-blue-700 dark:text-blue-300 leading-relaxed">
                All documents are watermarked and tracked. Download links expire after 15 minutes.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview - Full Screen */}
      <DocumentViewerFullscreen
        isOpen={documentViewer.isOpen}
        document={documentViewer.document}
        previewUrl={documentViewer.previewUrl}
        isLoading={documentViewer.isLoading}
        error={documentViewer.error}
        onClose={documentViewer.closePreview}
        onDownload={documentViewer.downloadDocument}
      />
    </div>
  )
}
