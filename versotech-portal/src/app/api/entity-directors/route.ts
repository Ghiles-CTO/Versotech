import { NextResponse } from 'next/server'
import { createSmartClient } from '@/lib/supabase/smart-client'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { z } from 'zod'

const createDirectorAssignmentSchema = z.object({
  vehicle_id: z.string().uuid(),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional().nullable(),
  role: z.string().optional().nullable(),
  effective_from: z.string().optional().nullable(),
  effective_to: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function POST(request: Request) {
  try {
    const supabase = await createSmartClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createDirectorAssignmentSchema.parse(body)

    const { data: director, error } = await supabase
      .from('entity_directors')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Director assignment error:', error)
      return NextResponse.json({ error: 'Failed to assign director' }, { status: 500 })
    }

    // Log the event
    await supabase
      .from('entity_events')
      .insert({
        vehicle_id: validatedData.vehicle_id,
        event_type: 'board_change',
        description: `Added director: ${validatedData.full_name}${validatedData.role ? ` as ${validatedData.role}` : ''}`,
        changed_by: user.id.startsWith('demo-') ? null : user.id,
        payload: { director_name: validatedData.full_name, role: validatedData.role }
      })

    return NextResponse.json({ director }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Entity directors API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
