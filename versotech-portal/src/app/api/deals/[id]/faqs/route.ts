import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createFaqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500, 'Question too long'),
  answer: z.string().min(1, 'Answer is required').max(5000, 'Answer too long'),
})

// GET /api/deals/[id]/faqs - List all FAQs for a deal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: dealId } = await params

    const { data: faqs, error } = await supabase
      .from('deal_faqs')
      .select('*')
      .eq('deal_id', dealId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching FAQs:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ faqs: faqs || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/deals/[id]/faqs - Create new FAQ (staff only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return Response.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const { id: dealId } = await params

    const body = await req.json()
    const validation = createFaqSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Get next display_order
    const { data: maxOrderData } = await supabase
      .from('deal_faqs')
      .select('display_order')
      .eq('deal_id', dealId)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = maxOrderData ? (maxOrderData.display_order + 1) : 0

    const { data: faq, error } = await supabase
      .from('deal_faqs')
      .insert({
        deal_id: dealId,
        question: validation.data.question,
        answer: validation.data.answer,
        display_order: nextOrder,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ faq }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
