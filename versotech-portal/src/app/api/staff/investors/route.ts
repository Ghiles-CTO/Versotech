import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

const INVESTOR_TYPES = ['individual', 'institutional', 'entity', 'family_office', 'fund'] as const

const createInvestorSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required'),
  display_name: z.string().optional().nullable(),
  type: z.enum(INVESTOR_TYPES).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  country_of_incorporation: z.string().optional().nullable(),
  tax_residency: z.string().optional().nullable(),
  primary_rm: z.string().uuid().optional().nullable()
})

const sanitizeString = (value?: string | null) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Get investors list for staff dropdowns with optional search
 * API Route: /api/staff/investors?search=john
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user (handles both real auth and demo mode)
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const userRole = user.user_metadata?.role || user.role
    if (!['staff_admin', 'staff_ops', 'staff_rm'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized - Staff access required' }, { status: 403 })
    }

    // Use service client to bypass RLS since we've already verified staff access
    const serviceClient = createServiceClient()

    // Get search parameter
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Build query
    let query = serviceClient
      .from('investors')
      .select('id, legal_name, email, status, type')
      .order('legal_name', { ascending: true })

    // Apply search filter if provided
    if (search && search.trim().length > 0) {
      query = query.or(`legal_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Limit results
    query = query.limit(50)

    const { data: investors, error } = await query

    if (error) {
      console.error('Error fetching investors:', error)
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 })
    }

    return NextResponse.json({
      investors: investors || []
    })

  } catch (error) {
    console.error('Investors API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role || user.role
    if (!['staff_admin', 'staff_ops', 'staff_rm'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized - Staff access required' }, { status: 403 })
    }

    const payload = await request.json().catch(() => ({}))
    const parsed = createInvestorSchema.parse(payload)

    const serviceClient = createServiceClient()
    const legalName = parsed.legal_name.trim()
    const displayName = sanitizeString(parsed.display_name) ?? legalName
    const email = sanitizeString(parsed.email)?.toLowerCase() ?? null

    const { data: existingByName } = await serviceClient
      .from('investors')
      .select('id')
      .eq('legal_name', legalName)
      .maybeSingle()

    if (existingByName) {
      return NextResponse.json(
        { error: 'An investor with this legal name already exists' },
        { status: 409 }
      )
    }

    if (email) {
      const { data: existingByEmail } = await serviceClient
        .from('investors')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingByEmail) {
        return NextResponse.json(
          { error: 'An investor with this email already exists' },
          { status: 409 }
        )
      }
    }

    const now = new Date().toISOString()
    const insertPayload = {
      legal_name: legalName,
      display_name: displayName,
      type: parsed.type ?? null,
      email,
      phone: sanitizeString(parsed.phone),
      country: sanitizeString(parsed.country),
      country_of_incorporation: sanitizeString(parsed.country_of_incorporation),
      tax_residency: sanitizeString(parsed.tax_residency),
      primary_rm: parsed.primary_rm ?? null,
      created_by: user.id.startsWith('demo-') ? null : user.id,
      updated_at: now
    }

    const { data: investor, error: insertError } = await serviceClient
      .from('investors')
      .insert(insertPayload)
      .select(
        'id, legal_name, display_name, type, email, phone, country, country_of_incorporation, tax_residency, primary_rm, status, onboarding_status'
      )
      .single()

    if (insertError || !investor) {
      console.error('Error creating investor:', insertError)
      return NextResponse.json({ error: 'Failed to create investor' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.INVESTORS,
      entity_id: investor.id,
      metadata: {
        endpoint: '/api/staff/investors',
        legal_name: investor.legal_name,
        email: investor.email,
        type: investor.type
      }
    })

    revalidatePath('/versotech/staff/investors')

    return NextResponse.json({ investor }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('Investors API create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
