import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateFaqSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1).max(5000).optional(),
})

// PATCH /api/deals/[id]/faqs/[faqId] - Update FAQ (staff only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; faqId: string }> }
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

    const { id: dealId, faqId } = await params

    const body = await req.json()
    const validation = updateFaqSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { data: faq, error } = await supabase
      .from('deal_faqs')
      .update({
        ...validation.data,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', faqId)
      .eq('deal_id', dealId)
      .select()
      .single()

    if (error) {
      console.error('Error updating FAQ:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!faq) {
      return Response.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return Response.json({ faq })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/deals/[id]/faqs/[faqId] - Delete FAQ (staff only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; faqId: string }> }
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

    const { id: dealId, faqId } = await params

    const { error } = await supabase
      .from('deal_faqs')
      .delete()
      .eq('id', faqId)
      .eq('deal_id', dealId)

    if (error) {
      console.error('Error deleting FAQ:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
