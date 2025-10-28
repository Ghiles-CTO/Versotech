'use client'

import { useMemo, useState } from 'react'
import { Document, Vehicle } from '@/types/documents'
import { DocumentCard } from './document-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import {
  ArrowLeft,
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardList,
  FileCheck,
  FileText,
  Folder,
  Home,
  Lock,
  Shield
} from 'lucide-react'

interface CategorizedDocumentsClientProps {
  initialDocuments: Document[]
  vehicles: Vehicle[]
}

// Document category configuration
const DOCUMENT_CATEGORIES = {
  agreements: {
    id: 'agreements',
    name: 'Agreements',
    icon: FileCheck,
    color: 'blue',
    description: 'Signed commitments, limited partnership agreements, side letters, amendment documents',
    types: ['Subscription', 'Agreement', 'subscription', 'agreement']
  },
  kyc: {
    id: 'kyc',
    name: 'KYC Documents',
    icon: ClipboardList,
    color: 'green',
    description: 'Identity verification, proof of address, source of funds, beneficial ownership paperwork',
    types: ['KYC', 'kyc']
  },
  statements: {
    id: 'statements',
    name: 'Position Statements',
    icon: BarChart3,
    color: 'purple',
    description: 'Quarterly statements, capital call notices, distribution notices, transaction confirmations',
    types: ['Statement', 'statement', 'capital_call']
  },
  ndas: {
    id: 'ndas',
    name: 'NDAs',
    icon: Lock,
    color: 'red',
    description: 'Non-disclosure agreements and confidentiality undertakings covering sensitive information',
    types: ['NDA', 'nda']
  },
  reports: {
    id: 'reports',
    name: 'Reports',
    icon: FileText,
    color: 'indigo',
    description: 'Performance reports, tax packs, investor letters and notices',
    types: ['Report', 'report', 'Tax', 'tax', 'memo']
  }
}

type HoldingGroup = {
  key: string
  title: string
  subtitle: string
  documents: Document[]
  vehicle?: Document['scope']['vehicle']
  isUnassigned: boolean
}

type CategoryData = {
  documents: Document[]
  holdings: HoldingGroup[]
}

type CategorizedDocuments = Record<string, CategoryData>

function groupDocumentsByHolding(documents: Document[]): HoldingGroup[] {
  const holdingMap = new Map<string, HoldingGroup>()

  documents.forEach((doc) => {
    const vehicle = doc.scope.vehicle
    const key = vehicle?.id ?? 'none'

    if (!holdingMap.has(key)) {
      holdingMap.set(key, {
        key,
        title: vehicle?.name ?? 'Holding: None',
        subtitle: '',
        vehicle,
        documents: [],
        isUnassigned: !vehicle
      })
    }

    holdingMap.get(key)!.documents.push(doc)
  })

  holdingMap.forEach((group) => {
    const descriptorParts: string[] = []

    if (group.vehicle?.type) {
      descriptorParts.push(group.vehicle.type)
    } else if (group.isUnassigned) {
      descriptorParts.push('Unassigned')
    }

    descriptorParts.push(`${group.documents.length} document${group.documents.length === 1 ? '' : 's'}`)
    group.subtitle = descriptorParts.join(' • ')
  })

  return Array.from(holdingMap.values()).sort((a, b) => {
    if (a.isUnassigned && !b.isUnassigned) return 1
    if (!a.isUnassigned && b.isUnassigned) return -1
    return a.title.localeCompare(b.title)
  })
}

function getCategoryForDocumentType(type: string) {
  for (const [categoryId, category] of Object.entries(DOCUMENT_CATEGORIES)) {
    if (category.types.includes(type)) {
      return categoryId
    }
  }
  return null
}

function getCategoryColor(color: string) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
    red: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
  }
  return colors[color as keyof typeof colors] || colors.blue
}

function getCategoryIconColor(color: string) {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  }
  return colors[color as keyof typeof colors] || colors.blue
}

export function CategorizedDocumentsClient({
  initialDocuments,
  vehicles
}: CategorizedDocumentsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter to investor-facing documents (exclude deal-specific files)
  const displayableDocuments = useMemo(() => {
    return initialDocuments.filter(doc => !doc.scope.deal)
  }, [initialDocuments])

  const categorizedDocuments = useMemo(() => {
    const base: CategorizedDocuments = {}

    Object.keys(DOCUMENT_CATEGORIES).forEach(categoryId => {
      base[categoryId] = { documents: [], holdings: [] }
    })

    displayableDocuments.forEach(doc => {
      const categoryId = getCategoryForDocumentType(doc.type) ?? 'reports'

      if (!base[categoryId]) {
        base[categoryId] = { documents: [], holdings: [] }
      }

      base[categoryId].documents.push(doc)
    })

    Object.values(base).forEach(categoryData => {
      categoryData.holdings = groupDocumentsByHolding(categoryData.documents)
    })

    return base
  }, [displayableDocuments])

  const totalDocuments = useMemo(() => displayableDocuments.length, [displayableDocuments])

  // Category view
  if (!selectedCategory) {
    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative border-b border-gray-200 pb-8 mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50 rounded-t-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Holdings Documents
                </h1>
              </div>
              <p className="text-lg text-gray-600 ml-13">
                Access your investment documents organized by category
              </p>
            </div>
            <div className="text-right bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-sm border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Category Folders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(DOCUMENT_CATEGORIES).map(([categoryId, category]) => {
              const Icon = category.icon
              const categoryData = categorizedDocuments[categoryId]
              const documentCount = categoryData?.documents.length || 0
              const holdingCount = categoryData?.holdings.length || 0

              return (
                <Card
                  key={categoryId}
                  className="border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCategory(categoryId)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor(category.color)} border-2 transition-transform group-hover:scale-105`}>
                        <Icon className={`h-8 w-8 ${getCategoryIconColor(category.color)}`} />
                      </div>
                      <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold border-2">
                        {documentCount} document{documentCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-semibold border-2 border-blue-200 bg-blue-50 text-blue-700">
                        {holdingCount} holding{holdingCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Holdings Overview */}
        {vehicles.length > 0 && (
          <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Holdings</h3>
      <div className="flex flex-wrap gap-3">
        {vehicles.map(vehicle => (
          <Badge 
            key={vehicle.id}
            variant="outline" 
            className="text-sm px-4 py-2 bg-white border-2 border-blue-200"
          >
            <Building2 className="h-4 w-4 mr-2 inline" />
            <span className="font-semibold">{vehicle.name}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="uppercase tracking-wide text-xs text-gray-600">{vehicle.type}</span>
          </Badge>
        ))}
      </div>
            </CardContent>
          </Card>
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

  // Document list view for selected category
  const category = DOCUMENT_CATEGORIES[selectedCategory as keyof typeof DOCUMENT_CATEGORIES]
  const categoryData = categorizedDocuments[selectedCategory] || { documents: [], holdings: [] }
  const Icon = category.icon

  return (
    <div className="p-6 space-y-8">
      {/* Header with breadcrumb */}
      <div className="relative border-b border-gray-200 pb-8 mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50 rounded-t-2xl" />
        <div className="relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Home className="h-4 w-4 mr-2" />
              Holdings Documents
            </Button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{category.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSelectedCategory(null)}
                className="border-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(category.color)} border-2`}>
                  <Icon className={`h-6 w-6 ${getCategoryIconColor(category.color)}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                  <p className="text-sm text-gray-600">Browse and download your {category.name.toLowerCase()}</p>
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-lg px-4 py-2 bg-white/80 backdrop-blur-sm border-2">
              {categoryData.documents.length} document{categoryData.documents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {categoryData.documents.length === 0 ? (
        <Card className="border-2">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Folder className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No documents in this category
              </h3>
              <p className="text-gray-600 mb-6">
                Documents will appear here once VERSO staff uploads them to this category.
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="border-2"
              >
                Back to Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categoryData.holdings.map((group) => (
            <Card key={group.key} className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {group.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {group.subtitle}
                    </p>
                  </div>

                  <Badge variant="outline" className="text-xs font-semibold border-2 border-blue-100 bg-blue-50 text-blue-700">
                    {group.documents.length} document{group.documents.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {group.documents.map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
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
              <div className="font-bold text-blue-900 text-lg mb-1">Document Security</div>
              <div className="text-blue-700 leading-relaxed">
                All documents are watermarked and tracked. Download links expire after 15 minutes.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
