import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const hasUsers = searchParams.get('has_users') === 'true'

    let investors: any[] = []
    let error: any = null

    if (hasUsers) {
      // Fetch only investors that have linked user accounts
      const result = await supabase
        .from('investors')
        .select(`
          id,
          legal_name,
          display_name,
          email,
          type,
          kyc_status,
          investor_users!inner (
            user_id,
            profiles:user_id (
              id,
              display_name,
              email,
              role
            )
          )
        `)
        .order('legal_name')
        .range(offset, offset + limit - 1)

      investors = result.data || []
      error = result.error
    } else {
      // Fetch all investors with more fields
      const result = await supabase
        .from('investors')
        .select('id, legal_name, display_name, email, type, kyc_status')
        .order('legal_name')
        .range(offset, offset + limit - 1)

      investors = result.data || []
      error = result.error
    }

    if (error) {
      console.error('Fetch investors error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch investors' },
        { status: 500 }
      )
    }

    // Return with both 'data' and 'investors' keys for compatibility
    return NextResponse.json({
      data: investors || [],
      investors: investors || []
    })

  } catch (error) {
    console.error('API /investors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

