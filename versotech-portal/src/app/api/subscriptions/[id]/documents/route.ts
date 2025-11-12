import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subscriptionId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify staff access
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_')
  if (!isStaff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const serviceSupabase = createServiceClient()

  // Fetch documents linked to this subscription
  const { data: documents, error } = await serviceSupabase
    .from('documents')
    .select(`
      *,
      created_by_profile:profiles!documents_created_by_fkey(display_name, email)
    `)
    .eq('subscription_id', subscriptionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch subscription documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }

  return NextResponse.json({ documents: documents || [] })
}
