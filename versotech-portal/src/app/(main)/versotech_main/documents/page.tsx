import { createClient, createServiceClient } from '@/lib/supabase/server'
import { StaffDocumentsClient } from '@/components/documents/staff-documents-client'
import { CategorizedDocumentsClient } from '@/components/documents/categorized-documents-client'
import { loadInvestorDocuments } from '@/lib/documents/investor-documents'
import { AlertCircle, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

/**
 * Documents Page for Unified Portal (versotech_main)
 *
 * Persona-aware document management:
 * - Staff/CEO personas: Full access to all documents (staff view)
 * - Investors: Full categorized document experience (agreements, statements, NDAs, reports)
 * - Lawyers/Partners/CPs/Introducers: Same categorized view based on their investor links
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

  const isStaff = personas?.some((p: any) => p.persona_type === 'staff' || p.persona_type === 'ceo') || false

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
      <div className="p-6">
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
    <div className="p-6">
      <CategorizedDocumentsClient
        initialDocuments={documentsData.documents}
        vehicles={documentsData.vehicles}
      />
    </div>
  )
}
