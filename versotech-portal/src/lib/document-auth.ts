import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface AuthResult {
  serviceSupabase: any
  userId: string
  error?: NextResponse
}

export async function authenticateStaffForDocuments(): Promise<AuthResult> {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()
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

  const hasCeoRole = !!profile && profile.role === 'ceo'
  let hasCeoPersona = false
  if (!hasCeoRole) {
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id
    })
    hasCeoPersona = personas?.some(
      (p: { persona_type: string }) => p.persona_type === 'ceo'
    ) || false
  }

  if (!hasCeoRole && !hasCeoPersona) {
    return {
      serviceSupabase: null,
      userId: '',
      error: NextResponse.json({ error: 'CEO access required' }, { status: 403 })
    }
  }
  
  return {
    serviceSupabase,
    userId: user.id
  }
}
