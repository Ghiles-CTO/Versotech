'use client'

import { useState } from 'react'
import { Document, DocumentType } from '@/types/documents'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DocumentCard } from './document-card'
import { 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  Briefcase, 
  User,
  FileText,
  PieChart,
  Shield
} from 'lucide-react'

interface DocumentSectionProps {
  title: string
  subtitle?: string
  icon: 'building' | 'briefcase' | 'user'
  documents: Document[]
  defaultExpanded?: boolean
  badgeColor?: 'blue' | 'purple' | 'green'
}

function getSectionIcon(icon: string) {
  switch (icon) {
    case 'building': return Building2
    case 'briefcase': return Briefcase  
    case 'user': return User
    default: return FileText
  }
}

function getDocumentTypeStats(documents: Document[]) {
  const stats = documents.reduce((acc, doc) => {
    const type = doc.type.toLowerCase()
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3) // Show top 3 document types
}

export function DocumentSection({ 
  title, 
  subtitle, 
  icon, 
  documents, 
  defaultExpanded = true,
  badgeColor = 'blue' 
}: DocumentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const IconComponent = getSectionIcon(icon)
  const documentStats = getDocumentTypeStats(documents)

  if (documents.length === 0) {
    return null // Don't render empty sections
  }

  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'green': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <Card className="border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
              badgeColor === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
              badgeColor === 'green' ? 'bg-gradient-to-br from-green-100 to-green-200' :
              'bg-gradient-to-br from-blue-100 to-blue-200'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                badgeColor === 'purple' ? 'text-purple-600' :
                badgeColor === 'green' ? 'text-green-600' :
                'text-blue-600'
              }`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-sm font-semibold border-2 ${getBadgeVariant(badgeColor)}`}
                >
                  {documents.length} document{documents.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {subtitle && (
                <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
              )}
              
              {/* Document type breakdown */}
              {documentStats.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {documentStats.map(([type, count]) => (
                    <Badge 
                      key={type}
                      variant="outline" 
                      className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                    >
                      {count} {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6 space-y-4 bg-gray-50/50">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents available in this section</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

