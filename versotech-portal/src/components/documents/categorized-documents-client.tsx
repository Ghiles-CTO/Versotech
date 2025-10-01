'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Document, Vehicle } from '@/types/documents'
import { DocumentCard } from './document-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Shield, 
  Building2,
  Folder,
  ChevronRight,
  Home,
  FileCheck,
  ClipboardList,
  Lock,
  BarChart3,
  ArrowLeft
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
    types: ['Subscription', 'Agreement', 'subscription', 'agreement']
  },
  kyc: {
    id: 'kyc',
    name: 'KYC Documents',
    icon: ClipboardList,
    color: 'green',
    types: ['KYC', 'kyc']
  },
  statements: {
    id: 'statements',
    name: 'Position Statements',
    icon: BarChart3,
    color: 'purple',
    types: ['Statement', 'statement', 'capital_call']
  },
  ndas: {
    id: 'ndas',
    name: 'NDAs',
    icon: Lock,
    color: 'red',
    types: ['NDA', 'nda']
  },
  reports: {
    id: 'reports',
    name: 'Reports',
    icon: FileText,
    color: 'indigo',
    types: ['Report', 'report', 'Tax', 'tax', 'memo']
  }
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
  const router = useRouter()

  // Filter to only holdings documents (exclude deals)
  const holdingsDocuments = useMemo(() => {
    return initialDocuments.filter(doc => doc.scope.vehicle && !doc.scope.deal)
  }, [initialDocuments])

  // Group documents by category
  const categorizedDocuments = useMemo(() => {
    const grouped: Record<string, Document[]> = {
      agreements: [],
      kyc: [],
      statements: [],
      ndas: [],
      reports: []
    }

    holdingsDocuments.forEach(doc => {
      const category = getCategoryForDocumentType(doc.type)
      if (category && grouped[category]) {
        grouped[category].push(doc)
      }
    })

    return grouped
  }, [holdingsDocuments])

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
              <p className="text-3xl font-bold text-gray-900 mt-1">{holdingsDocuments.length}</p>
            </div>
          </div>
        </div>

        {/* Category Folders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(DOCUMENT_CATEGORIES).map(([categoryId, category]) => {
              const Icon = category.icon
              const documentCount = categorizedDocuments[categoryId]?.length || 0
              
              return (
                <Card
                  key={categoryId}
                  className="border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCategory(categoryId)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor(category.color)} border-2 transition-transform group-hover:scale-105`}>
                        <Icon className={`h-8 w-8 ${getCategoryIconColor(category.color)}`} />
                      </div>
                      <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                      {category.name}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm font-semibold border-2">
                        {documentCount} document{documentCount !== 1 ? 's' : ''}
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
                    {vehicle.name}
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
  const documents = categorizedDocuments[selectedCategory] || []
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
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
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
        <div className="space-y-4">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
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
