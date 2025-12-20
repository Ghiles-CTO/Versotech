/**
 * Manual Commission Creation API
 * POST /api/staff/fees/commissions/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCommissionSchema } from '@/lib/fees/validation';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Staff role check - only staff can create commissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createCommissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten()
      }, { status: 400 });
    }

    const data = validation.data;

    // Check for duplicate commission
    if (data.introduction_id) {
      const { data: existing } = await supabase
        .from('introducer_commissions')
        .select('id')
        .eq('introduction_id', data.introduction_id)
        .eq('introducer_id', data.introducer_id)
        .single();

      if (existing) {
        return NextResponse.json({
          error: 'Commission already exists for this introduction'
        }, { status: 400 });
      }
    }

    // Create commission
    const { data: commission, error } = await supabase
      .from('introducer_commissions')
      .insert({
        introducer_id: data.introducer_id,
        introduction_id: data.introduction_id || null,
        deal_id: data.deal_id || null,
        investor_id: data.investor_id || null,
        basis_type: data.basis_type,
        rate_bps: data.rate_bps,
        base_amount: data.base_amount,
        accrual_amount: data.accrual_amount,
        currency: data.currency,
        payment_due_date: data.payment_due_date || null,
        notes: data.notes || null,
        status: 'accrued',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating commission:', error);
      return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 });
    }

    return NextResponse.json({ success: true, commission }, { status: 201 });
  } catch (error) {
    console.error('Error in commission creation route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
