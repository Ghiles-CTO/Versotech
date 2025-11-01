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

    // Update commission status to invoiced
    const { error } = await supabase
      .from('introducer_commissions')
      .update({
        status: 'invoiced',
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking commission as invoiced:', error);
      return NextResponse.json({ error: 'Failed to mark commission as invoiced' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-invoiced route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
