import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const stakeholderSchema = z.object({
  role: z.enum(['lawyer', 'accountant', 'auditor', 'administrator', 'strategic_partner', 'shareholder', 'other']),
  company_name: z.string().min(1, 'Company name is required'),
  contact_person: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  effective_from: z.string(),
  effective_to: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    const { id: vehicleId } = await params

    // Check authentication
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile.role.startsWith('staff_') || profile.role === 'ceo')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = stakeholderSchema.parse(body)

    // Insert stakeholder
    const { data: stakeholder, error } = await supabase
      .from('entity_stakeholders')
      .insert({
        vehicle_id: vehicleId,
        ...validatedData,
        email: validatedData.email || null,
        contact_person: validatedData.contact_person || null,
        phone: validatedData.phone || null,
        effective_to: validatedData.effective_to || null,
        notes: validatedData.notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to add stakeholder:', error)
      return NextResponse.json(
        { error: 'Failed to add stakeholder' },
        { status: 500 }
      )
    }

    // Create entity event
    await supabase.from('entity_events').insert({
      vehicle_id: vehicleId,
      event_type: 'stakeholder_added',
      description: `Added ${validatedData.role}: ${validatedData.company_name}`,
      changed_by: user.id
    })

    return NextResponse.json({ stakeholder })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Stakeholder creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
