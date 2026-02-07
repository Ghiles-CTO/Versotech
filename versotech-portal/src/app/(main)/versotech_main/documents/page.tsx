import { createClient, createServiceClient } from '@/lib/supabase/server'
import { StaffDocuments } from '@/components/documents/staff'
import { CategorizedDocumentsClient } from '@/components/documents/categorized-documents-client'
import { loadInvestorDocuments } from '@/lib/documents/investor-documents'
import { AlertCircle, FileText } from 'lucide-react'
import { checkCeoOnlyAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Documents Page for Unified Portal (versotech_main)
 *
 * Persona-aware document management:
 * - CEO persona: Full access to all documents (staff view)
 * - Investors: Full categorized document experience (agreements, statements, NDAs, reports)
 * - Lawyers/Partners/CPs/Introducers: Same categorized view based on their investor links
 */
export default async function DocumentsPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div>
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

  // Check user personas for access level
  const isCeo = await checkCeoOnlyAccess(user.id)
  const serviceSupabase = createServiceClient()

  // CEO gets full document management access
  if (isCeo) {
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
      <StaffDocuments
        initialVehicles={vehicles || []}
        userProfile={userProfile}
      />
    )
  }

  // Non-staff users: Use the full categorized document experience
  // Get investor IDs linked to this user
  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) ?? []

  // Load full investor documents (owner docs + vehicle docs from subscriptions)
  const documentsData = await loadInvestorDocuments(serviceSupabase, investorIds)

  // If no documents available, show empty state
  if (documentsData.documents.length === 0) {
    return (
      <div>
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Documents Available
          </h3>
          <p className="text-muted-foreground">
            Documents will appear here once they are uploaded by the VERSO team.
          </p>
        </div>
      </div>
    )
  }

  // Render full categorized document experience
  return (
    <div>
      <CategorizedDocumentsClient
        initialDocuments={documentsData.documents}
        vehicles={documentsData.vehicles}
      />
    </div>
  )
}
