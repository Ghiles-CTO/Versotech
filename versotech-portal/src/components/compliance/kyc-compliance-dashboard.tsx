'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Building2,
  Users,
  FileText,
  RefreshCcw,
  ExternalLink,
  Loader2,
  TrendingUp,
  Briefcase,
  Scale,
  Landmark,
  Handshake,
  UserX,
  FileWarning,
  Calendar,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  formatExpiryCountdown,
  getValidationStatusColor,
} from '@/lib/validation/document-validation'

// Types
interface EntityStats {
  total: number
  complete: number
  pending: number
  expiring_soon: number
  expired: number
}

interface MemberComplianceStats {
  total_members: number
  incomplete_kyc: number
  expired_ids: number
  missing_documents: number
}

interface ComplianceOverview {
  summary: {
    total_entities: number
    kyc_complete: number
    kyc_pending: number
    kyc_expiring_soon: number
    kyc_expired: number
    completion_percentage: number
  }
  by_entity_type: {
    investor: EntityStats
    arranger: EntityStats
    partner: EntityStats
    introducer: EntityStats
    lawyer: EntityStats
    commercial_partner: EntityStats
  }
  members_needing_attention: number
  member_compliance: MemberComplianceStats
  documents_expiring_30_days: number
  documents_expired: number
  stale_proof_of_address: number
}

interface ExpiringDocument {
  id: string
  name: string
  type: string
  document_expiry_date: string | null
  document_date: string | null
  days_until_expiry: number | null
  days_since_document_date: number | null
  entity_type: string
  entity_id: string
  entity_name: string
  member_id: string | null
  member_name: string | null
  is_stale: boolean
}

interface ExpiringDocumentsResponse {
  expired: ExpiringDocument[]
  expiring_soon: ExpiringDocument[]
  stale: ExpiringDocument[]
  summary: {
    total: number
    expired_count: number
    expiring_soon_count: number
    stale_count: number
    days_window: number
  }
}

// Entity type config
const ENTITY_TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon; href: string }> = {
  investor: { label: 'Investor', icon: Building2, href: '/versotech_main/users' },
  arranger: { label: 'Arranger', icon: Briefcase, href: '/versotech_main/users' },
  partner: { label: 'Partner', icon: Handshake, href: '/versotech_main/users' },
  introducer: { label: 'Introducer', icon: TrendingUp, href: '/versotech_main/users' },
  lawyer: { label: 'Lawyer', icon: Scale, href: '/versotech_main/users' },
  commercial_partner: { label: 'Commercial Partner', icon: Landmark, href: '/versotech_main/users' },
}

export function KYCComplianceDashboard() {
  const [overview, setOverview] = useState<ComplianceOverview | null>(null)
  const [expiringDocs, setExpiringDocs] = useState<ExpiringDocumentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [daysWindow, setDaysWindow] = useState('30')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      const entityParam = entityTypeFilter !== 'all' ? `&entity_type=${entityTypeFilter}` : ''
      const [overviewRes, docsRes] = await Promise.all([
        fetch('/api/staff/compliance/overview'),
        fetch(`/api/staff/compliance/expiring-documents?days=${daysWindow}&include_expired=true&include_stale=true${entityParam}`),
      ])

      if (!overviewRes.ok || !docsRes.ok) {
        throw new Error('Failed to fetch compliance data')
      }

      const [overviewData, docsData] = await Promise.all([
        overviewRes.json(),
        docsRes.json(),
      ])

      setOverview(overviewData)
      setExpiringDocs(docsData)
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load compliance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [daysWindow, entityTypeFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Failed to load compliance data</p>
        <Button onClick={fetchData}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">KYC Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor KYC status across all entities and track document expiry
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Entity Type Filter */}
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Entity Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entity Types</SelectItem>
              <SelectItem value="investor">Investors</SelectItem>
              <SelectItem value="arranger">Arrangers</SelectItem>
              <SelectItem value="partner">Partners</SelectItem>
              <SelectItem value="introducer">Introducers</SelectItem>
              <SelectItem value="lawyer">Lawyers</SelectItem>
              <SelectItem value="commercial_partner">Commercial Partners</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              KYC Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{overview.summary.kyc_complete}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.summary.completion_percentage}% of all entities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              KYC Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{overview.summary.kyc_pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">
              {overview.documents_expiring_30_days}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents in next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{overview.documents_expired}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-orange-400" />
              Stale Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{overview.stale_proof_of_address}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Proof of address &gt; 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Member Compliance Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Compliance
          </CardTitle>
          <CardDescription>
            Directors, UBOs, and Signatories requiring attention across all entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Members</span>
              </div>
              <div className="text-2xl font-bold">{overview.member_compliance.total_members}</div>
            </div>

            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-400">Incomplete KYC</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">{overview.member_compliance.incomplete_kyc}</div>
            </div>

            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
              <div className="flex items-center gap-2 mb-2">
                <UserX className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">Expired IDs</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{overview.member_compliance.expired_ids}</div>
            </div>

            <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
              <div className="flex items-center gap-2 mb-2">
                <FileWarning className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-400">UBOs Missing Data</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">{overview.member_compliance.missing_documents}</div>
            </div>
          </div>

          {overview.members_needing_attention > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">
                  {overview.members_needing_attention} members require immediate attention
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Overall KYC Completion</CardTitle>
          <CardDescription>
            {overview.summary.kyc_complete} of {overview.summary.total_entities} entities have completed KYC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-white/10 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                overview.summary.completion_percentage >= 80
                  ? 'bg-green-500'
                  : overview.summary.completion_percentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${overview.summary.completion_percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>{overview.summary.completion_percentage}%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Entity Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">KYC Status by Entity Type</CardTitle>
          <CardDescription>
            Breakdown across all 6 persona types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(overview.by_entity_type).map(([type, stats]) => {
              const config = ENTITY_TYPE_CONFIG[type]
              const completionPct = stats.total > 0
                ? Math.round((stats.complete / stats.total) * 100)
                : 0

              // Get the icon component with explicit typing
              const IconComponent: LucideIcon = config?.icon ?? Building2

              return (
                <div
                  key={type}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    entityTypeFilter === type
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                  onClick={() => setEntityTypeFilter(entityTypeFilter === type ? 'all' : type)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{config?.label || type}</span>
                    </div>
                    <Badge variant="outline">{stats.total}</Badge>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats.complete} complete</span>
                    <span>{stats.pending} pending</span>
                  </div>
                  {(stats.expired > 0 || stats.expiring_soon > 0) && (
                    <div className="flex gap-2 mt-2">
                      {stats.expiring_soon > 0 && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                          {stats.expiring_soon} expiring
                        </Badge>
                      )}
                      {stats.expired > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          {stats.expired} expired
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documents Requiring Attention */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Documents Requiring Attention</CardTitle>
              <CardDescription>
                Expired, expiring, and stale documents across all entities
              </CardDescription>
            </div>
            <Select value={daysWindow} onValueChange={setDaysWindow}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Next 30 days</SelectItem>
                <SelectItem value="60">Next 60 days</SelectItem>
                <SelectItem value="90">Next 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expired" className="space-y-4">
            <TabsList>
              <TabsTrigger value="expired" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Expired ({expiringDocs?.summary.expired_count || 0})
              </TabsTrigger>
              <TabsTrigger value="expiring" className="gap-2">
                <Clock className="h-4 w-4" />
                Expiring ({expiringDocs?.summary.expiring_soon_count || 0})
              </TabsTrigger>
              <TabsTrigger value="stale" className="gap-2">
                <Calendar className="h-4 w-4" />
                Stale ({expiringDocs?.summary.stale_count || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expired">
              {expiringDocs?.expired.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mb-4" />
                  <p className="text-muted-foreground">No expired documents</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringDocs?.expired.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} variant="expired" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expiring">
              {expiringDocs?.expiring_soon.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mb-4" />
                  <p className="text-muted-foreground">No documents expiring soon</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringDocs?.expiring_soon.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} variant="expiring" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stale">
              {expiringDocs?.stale?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mb-4" />
                  <p className="text-muted-foreground">No stale proof of address documents</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringDocs?.stale?.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} variant="stale" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Document row component
function DocumentRow({
  doc,
  variant
}: {
  doc: ExpiringDocument
  variant: 'expired' | 'expiring' | 'stale'
}) {
  const config = ENTITY_TYPE_CONFIG[doc.entity_type]
  const Icon = config?.icon || Building2

  // Build the link to the entity detail page
  const getEntityLink = () => {
    const typeMap: Record<string, string> = {
      investor: 'investors',
      arranger: 'arrangers',
      partner: 'partners',
      introducer: 'introducers',
      lawyer: 'lawyers',
      commercial_partner: 'commercial-partners',
    }
    return `/versotech_main/users/${typeMap[doc.entity_type] || 'investors'}/${doc.entity_id}`
  }

  // Get badge styling based on variant
  const getBadgeStyle = () => {
    switch (variant) {
      case 'expired':
        return 'bg-red-500/20 text-red-400'
      case 'expiring':
        return 'bg-amber-500/20 text-amber-400'
      case 'stale':
        return 'bg-orange-500/20 text-orange-400'
    }
  }

  // Get badge text
  const getBadgeText = () => {
    if (variant === 'stale' && doc.days_since_document_date !== null) {
      const months = Math.floor(doc.days_since_document_date / 30)
      return `${months} months old`
    }
    if (doc.days_until_expiry !== null) {
      return formatExpiryCountdown(doc.days_until_expiry)
    }
    return 'Unknown'
  }

  // Get icon background based on variant
  const getIconBg = () => {
    switch (variant) {
      case 'expired':
        return 'bg-red-500/20'
      case 'expiring':
        return 'bg-amber-500/20'
      case 'stale':
        return 'bg-orange-500/20'
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case 'expired':
        return 'text-red-400'
      case 'expiring':
        return 'text-amber-400'
      case 'stale':
        return 'text-orange-400'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2 rounded-lg ${getIconBg()}`}>
          <FileText className={`h-4 w-4 ${getIconColor()}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
            <Badge variant="outline" className="text-xs">
              {doc.type.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-3 w-3" />
            <span>{doc.entity_name}</span>
            {doc.member_name && (
              <>
                <span>•</span>
                <Users className="h-3 w-3" />
                <span>{doc.member_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge className={getBadgeStyle()}>
          {getBadgeText()}
        </Badge>
        <Link href={getEntityLink()}>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
