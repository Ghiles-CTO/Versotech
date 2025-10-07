import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient()

    // Fetch all investors
    const { data: investors, error } = await supabase
      .from('investors')
      .select('id, legal_name, type, kyc_status')
      .order('legal_name')

    if (error) {
      console.error('Fetch investors error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch investors' },
        { status: 500 }
      )
    }

    return NextResponse.json({ investors: investors || [] })

  } catch (error) {
    console.error('API /investors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

