'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Calendar
} from 'lucide-react'
import { format, differenceInDays, isPast, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface ComplianceData {
  aml_risk_rating: string | null
  aml_last_reviewed_at: string | null
  is_pep: boolean
  is_sanctioned: boolean
  is_professional_investor: boolean
  is_qualified_purchaser: boolean
  accreditation_expiry: string | null
  kyc_status: string | null
  kyc_expiry_date: string | null
  kyc_completed_at: string | null
}

function getRiskRatingColor(rating: string | null): string {
  switch (rating?.toLowerCase()) {
    case 'low':
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'medium':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    case 'high':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getExpiryStatus(expiryDate: string | null): { status: 'expired' | 'expiring_soon' | 'valid' | 'not_set', daysLeft: number | null } {
  if (!expiryDate) return { status: 'not_set', daysLeft: null }

  const expiry = new Date(expiryDate)
  const today = new Date()
  const daysLeft = differenceInDays(expiry, today)

  if (isPast(expiry)) {
    return { status: 'expired', daysLeft }
  } else if (daysLeft <= 30) {
    return { status: 'expiring_soon', daysLeft }
  }
  return { status: 'valid', daysLeft }
}

function ExpiryBadge({ date, label }: { date: string | null, label: string }) {
  const { status, daysLeft } = getExpiryStatus(date)

  if (status === 'not_set') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm">Not set</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {status === 'expired' && (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        )}
        {status === 'expiring_soon' && (
          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-3 w-3" />
            Expires in {daysLeft} days
          </Badge>
        )}
        {status === 'valid' && (
          <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500 bg-green-500/10">
            <CheckCircle2 className="h-3 w-3" />
            Valid
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {format(new Date(date!), 'MMM dd, yyyy')}
      </p>
    </div>
  )
}

export function ComplianceTab() {
  const [compliance, setCompliance] = useState<ComplianceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/investors/me/compliance')
      if (!response.ok) {
        throw new Error('Failed to fetch compliance data')
      }
      const data = await response.json()
      setCompliance(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchComplianceData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!compliance) {
    return null
  }

  const kycExpiry = getExpiryStatus(compliance.kyc_expiry_date)
  const accreditationExpiry = getExpiryStatus(compliance.accreditation_expiry)
  const hasComplianceIssues =
    compliance.is_sanctioned ||
    kycExpiry.status === 'expired' ||
    accreditationExpiry.status === 'expired'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Compliance Status</h2>
        <p className="text-muted-foreground">
          Your AML, PEP screening, and accreditation status.
        </p>
      </div>

      {/* Compliance Alert Banner */}
      {hasComplianceIssues && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Compliance Action Required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  One or more compliance items need attention. Please contact your relationship manager.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* AML Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              AML Status
            </CardTitle>
            <CardDescription>Anti-Money Laundering risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Rating</span>
              <Badge
                variant="outline"
                className={cn("capitalize", getRiskRatingColor(compliance.aml_risk_rating))}
              >
                {compliance.aml_risk_rating || 'Not Assessed'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Reviewed</span>
              <span className="text-sm text-muted-foreground">
                {compliance.aml_last_reviewed_at
                  ? format(new Date(compliance.aml_last_reviewed_at), 'MMM dd, yyyy')
                  : 'Never'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* PEP & Sanctions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              PEP & Sanctions
            </CardTitle>
            <CardDescription>Politically Exposed Person and sanctions screening</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PEP Status</span>
              {compliance.is_pep ? (
                <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  PEP Identified
                </Badge>
              ) : (
                <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Clear
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sanctions Status</span>
              {compliance.is_sanctioned ? (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Sanctions Match
                </Badge>
              ) : (
                <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Clear
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KYC Expiry Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              KYC Verification
            </CardTitle>
            <CardDescription>Know Your Customer verification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge
                variant="outline"
                className={cn(
                  compliance.kyc_status === 'approved' || compliance.kyc_status === 'verified'
                    ? 'border-green-500/50 text-green-500 bg-green-500/10'
                    : compliance.kyc_status === 'pending' || compliance.kyc_status === 'submitted'
                    ? 'border-amber-500/50 text-amber-500 bg-amber-500/10'
                    : 'border-muted text-muted-foreground'
                )}
              >
                {compliance.kyc_status?.replace('_', ' ') || 'Not Started'}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium block mb-2">Expiry</span>
              <ExpiryBadge date={compliance.kyc_expiry_date} label="KYC" />
            </div>
            {compliance.kyc_completed_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="text-muted-foreground">
                  {format(new Date(compliance.kyc_completed_at), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accreditation Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Accreditation
            </CardTitle>
            <CardDescription>Investor accreditation and qualification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Professional Investor</span>
              {compliance.is_professional_investor ? (
                <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Yes
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  No
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Qualified Purchaser</span>
              {compliance.is_qualified_purchaser ? (
                <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Yes
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  No
                </Badge>
              )}
            </div>
            <div>
              <span className="text-sm font-medium block mb-2">Accreditation Expiry</span>
              <ExpiryBadge date={compliance.accreditation_expiry} label="Accreditation" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Compliance status is managed by VERSO Holdings. If you believe any information is incorrect
            or needs updating, please contact your relationship manager or email{' '}
            <a href="mailto:compliance@versoholdings.com" className="text-primary hover:underline">
              compliance@versoholdings.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
