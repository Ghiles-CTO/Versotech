import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Staff role check - only staff can mark commissions as paid
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
      return NextResponse.json({ error: 'Forbidden - Staff only' }, { status: 403 });
    }

    const body = await request.json();
    const { payment_reference } = body;

    // Update commission status to paid
    const { error } = await supabase
      .from('introducer_commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_reference: payment_reference || null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking commission as paid:', error);
      return NextResponse.json({ error: 'Failed to mark commission as paid' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-paid route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
