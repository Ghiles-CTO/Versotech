import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TOUR_PERSONA_KEYS = new Set([
  'investor_entity',
  'investor_individual',
  'ceo',
  'staff',
  'arranger',
  'introducer',
  'partner',
  'commercial_partner',
  'lawyer',
])

const MAX_UPDATE_RETRIES = 3
const ALLOWED_ACTIONS = new Set(['completed', 'skipped'])

type TourStateEntry = {
  completed?: boolean
  completedAt?: string
  version?: string
  action?: 'completed' | 'skipped'
}

type PlatformTourState = Record<string, TourStateEntry>

function parseTourState(value: unknown): PlatformTourState {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as PlatformTourState
  }
  return {}
}

export async function POST(request: Request) {
  try {
    let body: unknown = null
    try {
      body = await request.json()
    } catch {
      body = null
    }

    const rawPersonaKey =
      body && typeof body === 'object' && 'personaKey' in body
        ? (body as Record<string, unknown>).personaKey
        : null
    const rawVersion =
      body && typeof body === 'object' && 'version' in body
        ? (body as Record<string, unknown>).version
        : null
    const rawAction =
      body && typeof body === 'object' && 'action' in body
        ? (body as Record<string, unknown>).action
        : null

    const personaKey = typeof rawPersonaKey === 'string' ? rawPersonaKey.trim() : ''
    const version = typeof rawVersion === 'string' && rawVersion.trim()
      ? rawVersion.trim()
      : 'legacy'
    const action = typeof rawAction === 'string' ? rawAction.trim() : 'completed'

    if (!ALLOWED_TOUR_PERSONA_KEYS.has(personaKey)) {
      return NextResponse.json(
        { error: 'Invalid personaKey' },
        { status: 400 }
      )
    }

    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: personas, error: personaError } = await supabase.rpc('get_user_personas', {
      p_user_id: user.id
    })

    if (personaError) {
      console.error('[tour-completed] Persona read error:', personaError)
      return NextResponse.json(
        { error: 'Failed to validate persona access', details: personaError.message },
        { status: 500 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[tour-completed] Profile role read error:', profileError)
      return NextResponse.json(
        { error: 'Failed to validate profile role', details: profileError.message },
        { status: 500 }
      )
    }

    const requiredPersonaType = personaKey.startsWith('investor_') ? 'investor' : personaKey
    const hasPersonaAccessFromRpc = ((personas || []) as Array<{ persona_type: string }>).some(
      (persona) => persona.persona_type === requiredPersonaType
    )
    const profileRole = profile?.role
    const hasPersonaAccessFromProfile =
      (requiredPersonaType === 'ceo' && (profileRole === 'ceo' || profileRole === 'staff_admin')) ||
      (requiredPersonaType === 'staff' && (profileRole === 'staff_ops' || profileRole === 'staff_rm'))
    const hasPersonaAccess = hasPersonaAccessFromRpc || hasPersonaAccessFromProfile

    if (!hasPersonaAccess) {
      return NextResponse.json(
        { error: 'Persona not allowed for this user' },
        { status: 403 }
      )
    }

    const cookieStore = await cookies()
    const activePersonaType = cookieStore.get('verso_active_persona_type')?.value?.trim()
    if (activePersonaType && activePersonaType !== requiredPersonaType) {
      return NextResponse.json(
        { error: 'Persona mismatch with active workspace' },
        { status: 409 }
      )
    }

    for (let attempt = 0; attempt < MAX_UPDATE_RETRIES; attempt += 1) {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('platform_tour_state, updated_at')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('[tour-completed] Profile read error:', profileError)
        return NextResponse.json(
          { error: 'Failed to read profile', details: profileError.message },
          { status: 500 }
        )
      }

      const currentState = parseTourState(existingProfile?.platform_tour_state)
      const updatedAt = existingProfile?.updated_at ?? null
      const nextUpdatedAt = new Date().toISOString()

      const nextState: PlatformTourState = {
        ...currentState,
        [personaKey]: {
          completed: true,
          completedAt: nextUpdatedAt,
          version,
          action: action as 'completed' | 'skipped',
        },
      }

      let updateQuery = supabase
        .from('profiles')
        .update({
          has_completed_platform_tour: true,
          platform_tour_state: nextState,
          updated_at: nextUpdatedAt,
        })
        .eq('id', user.id)

      if (updatedAt) {
        updateQuery = updateQuery.eq('updated_at', updatedAt)
      } else {
        updateQuery = updateQuery.is('updated_at', null)
      }

      const { data: updatedRows, error: updateError } = await updateQuery.select('id')
      if (updateError) {
        console.error('[tour-completed] Update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile', details: updateError.message },
          { status: 500 }
        )
      }

      if (updatedRows && updatedRows.length > 0) {
        return NextResponse.json({
          success: true,
          message: action === 'skipped'
            ? `Platform tour marked as skipped for ${personaKey}`
            : `Platform tour marked as completed for ${personaKey}`,
          personaKey,
          version,
          action,
        })
      }
    }

    return NextResponse.json(
      {
        error: 'Profile update conflict. Please retry.',
        code: 'tour_update_conflict',
      },
      {
        status: 409,
      }
    )
  } catch (error) {
    console.error('[tour-completed] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
