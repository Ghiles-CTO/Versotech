import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const valuationSchema = z.object({
  nav_total: z.number().positive(),
  nav_per_unit: z.number().positive(),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params
    const supabase = createServiceClient()

    const { data: valuations, error } = await supabase
      .from('valuations')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('as_of_date', { ascending: false })

    if (error) {
      console.error('Valuations fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch valuations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ valuations: valuations || [] })

  } catch (error) {
    console.error('Valuations GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params
    const supabase = createServiceClient()

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = valuationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid valuation data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { nav_total, nav_per_unit, as_of_date } = validation.data

    // Insert valuation
    const { data: valuation, error: insertError } = await supabase
      .from('valuations')
      .insert({
        vehicle_id: vehicleId,
        nav_total,
        nav_per_unit,
        as_of_date
      })
      .select()
      .single()

    if (insertError) {
      console.error('Valuation insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create valuation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ valuation })

  } catch (error) {
    console.error('Valuation creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
