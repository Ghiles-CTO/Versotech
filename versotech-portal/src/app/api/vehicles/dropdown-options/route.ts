import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/vehicles/dropdown-options
 *
 * Returns lists of arrangers, lawyers, and managing partners (CEO users)
 * for use in vehicle create/edit forms.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all dropdown options in parallel using service client to bypass RLS
    const [
      { data: arrangers, error: arrangersError },
      { data: lawyers, error: lawyersError }
    ] = await Promise.all([
      // Arrangers from arranger_entities
      serviceSupabase
        .from('arranger_entities')
        .select('id, legal_name, email, status')
        .or('status.eq.active,status.is.null')
        .order('legal_name', { ascending: true }),

      // Lawyers from lawyers table
      serviceSupabase
        .from('lawyers')
        .select('id, firm_name, display_name, primary_contact_email, is_active')
        .or('is_active.eq.true,is_active.is.null')
        .order('firm_name', { ascending: true })
    ])

    if (arrangersError) {
      console.error('[dropdown-options] Error fetching arrangers:', arrangersError)
    }
    if (lawyersError) {
      console.error('[dropdown-options] Error fetching lawyers:', lawyersError)
    }

    return NextResponse.json({
      arrangers: (arrangers || []).map((a: any) => ({
        id: a.id,
        name: a.legal_name,
        email: a.email
      })),
      lawyers: (lawyers || []).map((l: any) => ({
        id: l.id,
        name: l.display_name || l.firm_name,
        firm_name: l.firm_name,
        email: l.primary_contact_email
      }))
    })

  } catch (error) {
    console.error('[dropdown-options] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
