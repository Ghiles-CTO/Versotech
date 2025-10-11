import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface AuthResult {
  serviceSupabase: any
  userId: string
  error?: NextResponse
}

export async function authenticateStaffForDocuments(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      serviceSupabase: null,
      userId: '',
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
    return {
      serviceSupabase: null,
      userId: '',
      error: NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }
  }
  
  return {
    serviceSupabase: createServiceClient(),
    userId: user.id
  }
}


