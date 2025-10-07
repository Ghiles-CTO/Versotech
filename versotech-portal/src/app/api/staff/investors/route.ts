import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'
import { revalidatePath } from 'next/cache'

// Helper to get user from either real auth or demo mode
async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (user) return { user, error: null, isDemo: false }
  
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  if (demoCookie) {
    const demoSession = parseDemoSession(demoCookie.value)
    if (demoSession) {
      return {
        user: {
          id: demoSession.id,
          email: demoSession.email,
          role: demoSession.role
        },
        error: null,
        isDemo: true
      }
    }
  }
  return { user: null, error: authError || new Error('No authentication found'), isDemo: false }
}

/**
 * GET /api/staff/investors
 * List all investors with optional filtering
 * Authentication: Staff only
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
    const supabase = demoCookie ? createServiceClient() : await createClient()

    // Check authentication
    const { user, error: authError, isDemo } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    let role: string
    if (isDemo) {
      // For demo mode, use role from session
      role = user.role
    } else {
      // For live mode, fetch from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role as string
    }

    if (!role || !role.startsWith('staff_')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const rm = searchParams.get('rm')

    // Build query
    let query = supabase
      .from('investors')
      .select(`
        id,
        legal_name,
        display_name,
        type,
        kyc_status,
        status,
        onboarding_status,
        country,
        email,
        phone,
        primary_rm,
        rm_profile:profiles!investors_primary_rm_fkey (
          id,
          display_name,
          email
        ),
        created_at
      `)

    // Apply filters
    if (q) {
      query = query.or(`legal_name.ilike.%${q}%,email.ilike.%${q}%`)
    }
    if (status) {
      query = query.eq('kyc_status', status)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (rm) {
      query = query.eq('primary_rm', rm)
    }

    const { data: investors, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch investors error:', error)
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 })
    }

    return NextResponse.json({ investors: investors || [] })
  } catch (error) {
    console.error('API /staff/investors GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/staff/investors
 * Create a new investor
 * Authentication: Staff only
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
    const supabase = demoCookie ? createServiceClient() : await createClient()

    // Check authentication
    const { user, error: authError, isDemo } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      console.error('[API] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    let role: string
    if (isDemo) {
      // For demo mode, use role from session
      role = user.role
      console.log('[API] Demo mode - using role from session:', role)
    } else {
      // For live mode, fetch from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role as string
      console.log('[API] Live mode - fetched role from database:', role)
    }

    if (!role || !role.startsWith('staff_')) {
      console.error('[API] Role check failed:', { role, isDemo })
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      legal_name,
      display_name,
      type,
      email,
      phone,
      country,
      country_of_incorporation,
      tax_residency,
      primary_rm,
      is_professional_investor,
      is_qualified_purchaser
    } = body

    // Validation
    if (!legal_name) {
      return NextResponse.json({ error: 'Legal name is required' }, { status: 400 })
    }
    if (!type || !['individual', 'institutional', 'entity', 'family_office', 'fund'].includes(type)) {
      return NextResponse.json({ error: 'Invalid investor type' }, { status: 400 })
    }

    // Check if email already exists
    if (email && email.trim()) {
      const { data: existing } = await supabase
        .from('investors')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
    }

    // Helper to convert empty strings to null for optional fields
    const cleanValue = (value: any) => {
      if (value === '' || value === undefined) return null
      return value
    }

    // Create investor with cleaned data
    const insertData: any = {
      legal_name: legal_name.trim(),
      display_name: cleanValue(display_name),
      type,
      email: cleanValue(email),
      phone: cleanValue(phone),
      country: cleanValue(country),
      country_of_incorporation: cleanValue(country_of_incorporation),
      tax_residency: cleanValue(tax_residency),
      primary_rm: cleanValue(primary_rm), // Convert empty string to null for UUID
      is_professional_investor: is_professional_investor || false,
      is_qualified_purchaser: is_qualified_purchaser || false,
      kyc_status: 'pending',
      status: 'active',
      onboarding_status: 'pending'
    }

    // Only set created_by if not in demo mode (demo user doesn't exist in profiles)
    if (!isDemo) {
      insertData.created_by = user.id
    }

    console.log('[API] Creating investor with data:', insertData)

    const { data: investor, error: insertError } = await supabase
      .from('investors')
      .insert(insertData)
      .select(`
        *,
        rm_profile:profiles!investors_primary_rm_fkey (
          id,
          display_name,
          email
        )
      `)
      .single()

    if (insertError) {
      console.error('Create investor error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Revalidate the investors list page
    revalidatePath('/versotech/staff/investors')

    return NextResponse.json(
      {
        investor,
        message: 'Investor created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API /staff/investors POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
