import { createClient, createServiceClient } from '@/lib/supabase/server'
import { StaffDocuments } from '@/components/documents/staff'
import { CategorizedDocumentsClient } from '@/components/documents/categorized-documents-client'
import { loadInvestorDocuments } from '@/lib/documents/investor-documents'
import { AlertCircle, FileText } from 'lucide-react'
import { checkCeoOnlyAccess } from '@/lib/auth'
import { cookies } from 'next/headers'
import { resolveActivePersona, type PersonaIdentity } from '@/lib/persona/active-persona'
import { readActivePersonaCookieValues, resolveActiveInvestorLink } from '@/lib/kyc/active-investor-link'

export const dynamic = 'force-dynamic'

/**
 * Documents Page for Unified Portal (versotech_main)
 *
 * Persona-aware document management:
 * - CEO persona: Full access to all documents (staff view)
 * - Investors: Full categorized document experience (agreements, statements, NDAs, reports)
 * - Lawyers/Partners/CPs/Introducers: Same categorized view based on their investor links
 */
export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
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

  const cookieStore = await cookies()
  const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(cookieStore)
  const serviceSupabase = createServiceClient()
  const { data: personas, error: personasError } = await clientSupabase.rpc('get_user_personas', {
    p_user_id: user.id,
  })

  if (personasError) {
    console.warn('[DocumentsPage] Persona lookup failed:', personasError.message)
  }

  const activePersona = resolveActivePersona((personas || []) as PersonaIdentity[], {
    cookiePersonaType,
    cookiePersonaId,
  })

  const isCeo = await checkCeoOnlyAccess(user.id)
  const isStaffView = activePersona
    ? activePersona.persona_type === 'ceo' || activePersona.persona_type === 'staff'
    : isCeo

  // CEO gets full document management access
  if (isStaffView) {
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
  const { link: investorLink } = await resolveActiveInvestorLink<{ investor_id: string }>({
    supabase: serviceSupabase,
    userId: user.id,
    cookiePersonaType,
    cookiePersonaId,
    select: 'investor_id',
  })

  const investorIds = investorLink?.investor_id ? [investorLink.investor_id] : []

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
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const selectedHolding = typeof resolvedSearchParams?.holding === 'string'
    ? resolvedSearchParams.holding
    : null
  const selectedCategory = typeof resolvedSearchParams?.category === 'string'
    ? resolvedSearchParams.category
    : null

  return (
    <div>
      <CategorizedDocumentsClient
        initialDocuments={documentsData.documents}
        vehicles={documentsData.vehicles}
        initialSelectedHolding={selectedHolding}
        initialCategory={selectedCategory === 'ndas' ? 'ndas' : null}
      />
    </div>
  )
}
