import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile and verify staff access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const investorId = searchParams.get('investor_id')
    const documentType = searchParams.get('document_type')

    // Build query
    let query = supabase
      .from('kyc_submissions')
      .select(`
        *,
        investor:investors(
          id,
          name,
          email,
          type,
          kyc_status
        ),
        document:documents(
          id,
          name,
          file_key,
          file_size_bytes,
          mime_type,
          created_at
        ),
        reviewer:reviewed_by(
          id,
          display_name,
          email
        )
      `)
      .order('submitted_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (investorId) {
      query = query.eq('investor_id', investorId)
    }
    if (documentType) {
      query = query.eq('document_type', documentType)
    }

    const { data: submissions, error: submissionsError } = await query

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch KYC submissions' },
        { status: 500 }
      )
    }

    // Get submission statistics
    const { data: stats } = await supabase
      .from('kyc_submissions')
      .select('status')

    const statistics = {
      total: stats?.length || 0,
      pending: stats?.filter(s => s.status === 'pending').length || 0,
      under_review: stats?.filter(s => s.status === 'under_review').length || 0,
      approved: stats?.filter(s => s.status === 'approved').length || 0,
      rejected: stats?.filter(s => s.status === 'rejected').length || 0,
      expired: stats?.filter(s => s.status === 'expired').length || 0
    }

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
      statistics
    })

  } catch (error) {
    console.error('KYC submissions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
