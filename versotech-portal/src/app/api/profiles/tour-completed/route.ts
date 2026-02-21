import { NextResponse } from 'next/server'
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

type TourStateEntry = {
  completed?: boolean
  completedAt?: string
  version?: string
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

    const personaKey = typeof rawPersonaKey === 'string' ? rawPersonaKey.trim() : ''
    const version = typeof rawVersion === 'string' && rawVersion.trim()
      ? rawVersion.trim()
      : 'legacy'

    if (!ALLOWED_TOUR_PERSONA_KEYS.has(personaKey)) {
      return NextResponse.json(
        { error: 'Invalid personaKey' },
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
          message: `Platform tour marked as completed for ${personaKey}`,
          personaKey,
          version,
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
