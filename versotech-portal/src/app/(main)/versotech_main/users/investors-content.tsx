'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddInvestorModal } from '@/components/investors/add-investor-modal'
import { InvestorFilters } from '@/components/investors/investor-filters'
import { ExportInvestorsButton } from '@/components/investors/export-investors-button'
import { InvestorSearch } from '@/components/investors/investor-search'
import { InvestorsDataTable } from '@/components/investors/investors-data-table'
import { investorColumns, InvestorRow } from '@/components/investors/investor-columns'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type UIInvestorUser = {
  id: string
  name: string
  email: string
  title: string
}

type UIInvestor = {
  id: string
  name: string
  type: string
  email: string
  kycStatus: string
  onboardingStatus: string
  totalCommitment: number
  totalContributed: number
  vehicleCount: number
  lastActivity: string
  relationshipManager: string
  riskRating: string
  country: string
  users: UIInvestorUser[]
}

type InvestorsStats = {
  total: number
  active: number
  pending: number
  institutional: number
}

export default function InvestorsContent() {
  const [investors, setInvestors] = useState<UIInvestor[]>([])
  const [stats, setStats] = useState<InvestorsStats>({ total: 0, active: 0, pending: 0, institutional: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Invite dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedInvestor, setSelectedInvestor] = useState<{ id: string; name: string } | null>(null)

  // Handle invite event from data table
  const handleInviteEvent = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<InvestorRow>
    const investor = customEvent.detail
    setSelectedInvestor({ id: investor.id, name: investor.name })
    setShowInviteDialog(true)
  }, [])

  // Listen for invite events
  useEffect(() => {
    window.addEventListener('investor-invite', handleInviteEvent)
    return () => window.removeEventListener('investor-invite', handleInviteEvent)
  }, [handleInviteEvent])

  useEffect(() => {
    async function fetchInvestors() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Verify we have an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('[InvestorsContent] Session error:', sessionError)
          throw new Error('Authentication error: ' + (sessionError.message || 'Unknown session error'))
        }
        if (!session) {
          console.warn('[InvestorsContent] No active session')
          throw new Error('No active session. Please log in again.')
        }

        // Fetch investors
        const { data, error: fetchError } = await supabase
          .from('investors')
          .select(`
            id,
            legal_name,
            type,
            kyc_status,
            country,
            status,
            onboarding_status,
            aml_risk_rating,
            created_at,
            primary_rm,
            rm_profile:profiles!investors_primary_rm_fkey (
              id,
              display_name,
              email
            ),
            investor_users (
              user_id,
              profiles:profiles!investor_users_user_id_fkey (
                id,
                display_name,
                email,
                title,
                role
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(500)

        if (fetchError) {
          console.error('[InvestorsContent] Fetch error details:', JSON.stringify(fetchError, null, 2))
          throw fetchError
        }

        const enriched: UIInvestor[] = (data || []).map((inv: any) => {
          const rmProfile = Array.isArray(inv.rm_profile) ? inv.rm_profile[0] : inv.rm_profile
          const users: UIInvestorUser[] = (inv.investor_users || []).map((entry: any) => {
            const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles
            return {
              id: profile?.id || entry.user_id,
              name: profile?.display_name || 'Unnamed User',
              email: profile?.email || 'No email',
              title: profile?.title || '-'
            }
          })

          const primaryContact = users[0]
          const kycStatus = formatKycStatus(inv.kyc_status)

          return {
            id: inv.id,
            name: inv.legal_name || 'Unnamed Investor',
            type: inv.type || 'individual',
            email: primaryContact?.email || 'No primary contact',
            kycStatus,
            onboardingStatus: inv.onboarding_status || 'pending',
            totalCommitment: 0, // Would need separate RPC call
            totalContributed: 0,
            vehicleCount: 0,
            lastActivity: inv.created_at || new Date().toISOString(),
            relationshipManager: rmProfile?.display_name || 'Unassigned',
            riskRating: inv.aml_risk_rating || inferRisk(inv.kyc_status),
            country: inv.country || 'Unknown',
            users
          }
        })

        setInvestors(enriched)
        setStats({
          total: enriched.length,
          active: enriched.filter(i => i.onboardingStatus === 'completed' || i.onboardingStatus === 'active').length,
          pending: enriched.filter(i => ['pending', 'review'].includes(i.kycStatus)).length,
          institutional: enriched.filter(i => i.type === 'institutional' || i.type === 'entity').length
        })
        setError(null)
      } catch (err: any) {
        // Log detailed error info for Supabase errors
        console.error('[InvestorsContent] Error:', {
          message: err?.message,
          details: err?.details,
          hint: err?.hint,
          code: err?.code,
          raw: err
        })
        setError(err?.message || err?.details || 'Failed to load investors')
      } finally {
        setLoading(false)
      }
    }

    fetchInvestors()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading investors...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Investors</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <AddInvestorModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Registered accounts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-muted-foreground mt-1">Fully onboarded</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-muted-foreground mt-1">Require attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Institutional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.institutional}</div>
            <div className="text-sm text-muted-foreground mt-1">Professional investors</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <InvestorSearch />
            </div>
            <div className="flex gap-2">
              <InvestorFilters />
              <ExportInvestorsButton investors={investors} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Investors ({investors.length})</CardTitle>
          <CardDescription>
            Comprehensive investor list with sortable columns and bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvestorsDataTable columns={investorColumns} data={investors} />
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      {selectedInvestor && (
        <InviteUserDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          entityType="investor"
          entityId={selectedInvestor.id}
          entityName={selectedInvestor.name}
        />
      )}
    </div>
  )
}

function formatKycStatus(status: string | null) {
  if (!status) return 'pending'
  const lower = status.toLowerCase()
  if (lower === 'approved') return 'completed'
  return lower
}

function inferRisk(status: string | null) {
  if (!status) return 'medium'
  return status.toLowerCase() === 'approved' ? 'low' : 'medium'
}
