import { createClient, createServiceClient } from '@/lib/supabase/server'
import { StaffDocumentsClient } from '@/components/documents/staff-documents-client'
import { AlertCircle, FileText, FolderOpen } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Documents Page for Unified Portal (versotech_main)
 *
 * Persona-aware document management:
 * - Staff/CEO personas: Full access to all documents (staff view)
 * - Lawyers: Access to deal documents for assigned deals
 * - Investors: Access to their own investor documents
 * - Partners/CPs/Introducers: Access to agreements and deal documents
 */
export default async function DocumentsPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view documents.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  // Check user personas for access level
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isStaff = personas?.some((p: any) => p.persona_type === 'staff') || false
  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false
  const isInvestor = personas?.some((p: any) => p.persona_type === 'investor') || false
  const isPartner = personas?.some((p: any) => ['partner', 'introducer', 'commercial_partner', 'arranger'].includes(p.persona_type)) || false

  // Staff get full document management access
  if (isStaff) {
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('role, display_name, title')
      .eq('id', user.id)
      .single()

    const { data: vehicles } = await serviceSupabase
      .from('vehicles')
      .select('id, name, type')
      .order('name')

    const userProfile = {
      role: profile?.role || 'staff_ops',
      display_name: profile?.display_name || null,
      title: profile?.title || null
    }

    return (
      <div className="p-6">
        <StaffDocumentsClient
          initialVehicles={vehicles || []}
          userProfile={userProfile}
        />
      </div>
    )
  }

  // Non-staff users: Show their accessible documents
  // Get documents from deals they have access to via deal_memberships
  const { data: dealMemberships } = await serviceSupabase
    .from('deal_memberships')
    .select('deal_id, role, deals(id, name)')
    .eq('user_id', user.id)

  // Get investor documents if user is an investor
  let investorDocs: any[] = []
  if (isInvestor) {
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id, investors(id, legal_name)')
      .eq('user_id', user.id)

    if (investorLinks && investorLinks.length > 0) {
      const investorIds = investorLinks.map(l => l.investor_id)
      const { data: docs } = await serviceSupabase
        .from('documents')
        .select('id, name, mime_type, created_at, owner_investor_id')
        .in('owner_investor_id', investorIds)
        .order('created_at', { ascending: false })
        .limit(50)

      investorDocs = docs || []
    }
  }

  const hasDeals = dealMemberships && dealMemberships.length > 0
  const hasDocs = investorDocs.length > 0

  if (!hasDeals && !hasDocs) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Documents Available
          </h3>
          <p className="text-muted-foreground">
            You don&apos;t have any documents to view at this time.
          </p>
        </div>
      </div>
    )
  }

  // Show a simplified document browser for non-staff
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
        <p className="text-muted-foreground mt-1">
          Access your investment documents and deal materials
        </p>
      </div>

      {/* Deal Documents Section */}
      {hasDeals && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Deal Documents</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dealMemberships.map((membership: any) => (
              <Link
                key={membership.deal_id}
                href={`/versotech_main/opportunities/${membership.deal_id}?tab=data-room`}
                className="block p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      {membership.deals?.name || 'Deal Documents'}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {membership.role?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Investor Documents Section */}
      {hasDocs && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">My Investor Documents</h2>
          <div className="divide-y border rounded-lg">
            {investorDocs.map((doc: any) => (
              <div key={doc.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
