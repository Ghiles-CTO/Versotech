import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch vehicles - RLS policies will automatically filter based on user permissions
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, name, type, currency, status')
      .order('name', { ascending: true })

    if (error) {
      console.error('Vehicles fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      vehicles: vehicles || []
    })

  } catch (error) {
    console.error('API /vehicles error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
