import { NextResponse } from 'next/server'
import { createSmartClient } from '@/lib/supabase/smart-client'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { z } from 'zod'

const createDirectorSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  id_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('director_registry')
      .select('*')
      .order('full_name', { ascending: true })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: directors, error } = await query

    if (error) {
      console.error('Director registry fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch directors' }, { status: 500 })
    }

    return NextResponse.json({ directors: directors || [] })

  } catch (error) {
    console.error('Director registry API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const validatedData = createDirectorSchema.parse(body)

    const { data: director, error } = await supabase
      .from('director_registry')
      .insert({
        ...validatedData,
        created_by: user.id.startsWith('demo-') ? null : user.id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Director with this name and email already exists' },
          { status: 409 }
        )
      }
      console.error('Director creation error:', error)
      return NextResponse.json({ error: 'Failed to create director' }, { status: 500 })
    }

    return NextResponse.json({ director }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Director registry API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
