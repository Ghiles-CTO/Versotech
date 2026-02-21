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

type TourStateEntry = {
  completed?: boolean
  completedAt?: string
  version?: string
}

type PlatformTourState = Record<string, TourStateEntry>

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

    const isPersonaKeyValid = ALLOWED_TOUR_PERSONA_KEYS.has(personaKey)

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let nextState: PlatformTourState | undefined
    if (isPersonaKeyValid) {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('platform_tour_state')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('[tour-completed] Profile read error:', profileError)
        return NextResponse.json(
          { error: 'Failed to read profile', details: profileError.message },
          { status: 500 }
        )
      }

      const currentStateRaw = existingProfile?.platform_tour_state
      const currentState: PlatformTourState =
        currentStateRaw && typeof currentStateRaw === 'object' && !Array.isArray(currentStateRaw)
          ? (currentStateRaw as PlatformTourState)
          : {}

      nextState = {
        ...currentState,
        [personaKey]: {
          completed: true,
          completedAt: new Date().toISOString(),
          version,
        },
      }
    } else {
      console.warn('[tour-completed] Missing/invalid personaKey. Falling back to legacy completion only.')
    }

    const updatePayload: {
      has_completed_platform_tour: boolean
      platform_tour_state?: PlatformTourState
    } = {
      has_completed_platform_tour: true,
    }

    if (nextState) {
      updatePayload.platform_tour_state = nextState
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)

    if (updateError) {
      console.error('[tour-completed] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    if (!isPersonaKeyValid) {
      return NextResponse.json({
        success: true,
        message: 'Platform tour marked as completed (legacy mode)',
        personaKey: null,
        version: null,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Platform tour marked as completed for ${personaKey}`,
      personaKey,
      version,
    })
  } catch (error) {
    console.error('[tour-completed] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
