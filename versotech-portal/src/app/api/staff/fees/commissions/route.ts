/**
 * Commissions API Routes
 * GET /api/staff/fees/commissions - List all entity commissions (introducers, partners, commercial partners)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type EntityType = 'introducer' | 'partner' | 'commercial_partner';

interface NormalizedCommission {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  entity_name: string;
  entity_contact?: string;
  entity_email?: string;
  deal_id: string | null;
  deal_name?: string;
  investor_id: string | null;
  investor_name?: string;
  fee_plan_id?: string | null;
  fee_plan_name?: string;
  basis_type: string;
  rate_bps: number;
  base_amount: number;
  accrual_amount: number;
  currency: string;
  status: 'accrued' | 'invoiced' | 'paid';
  invoice_id: string | null;
  paid_at: string | null;
  payment_due_date: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Staff role check - only staff can list all commissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
      return NextResponse.json({ error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // accrued, invoiced, paid
    const entityType = searchParams.get('entity_type'); // introducer, partner, commercial_partner
    const introducerId = searchParams.get('introducer_id');
    const partnerId = searchParams.get('partner_id');
    const commercialPartnerId = searchParams.get('commercial_partner_id');
    const dealId = searchParams.get('deal_id');

    const allCommissions: NormalizedCommission[] = [];

    // Fetch introducer commissions (unless filtered to another entity type)
    if (!entityType || entityType === 'introducer') {
      let introducerQuery = supabase
        .from('introducer_commissions')
        .select(`
          *,
          introducer:introducer_id(id, legal_name, contact_name, email),
          deal:deal_id(id, name),
          investor:investor_id(id, legal_name, display_name)
        `)
        .order('created_at', { ascending: false });

      if (status) introducerQuery = introducerQuery.eq('status', status);
      if (introducerId) introducerQuery = introducerQuery.eq('introducer_id', introducerId);
      if (dealId) introducerQuery = introducerQuery.eq('deal_id', dealId);

      const { data: introducerCommissions, error: introducerError } = await introducerQuery;

      if (introducerError) {
        console.error('Error fetching introducer commissions:', introducerError);
      } else if (introducerCommissions) {
        for (const c of introducerCommissions) {
          allCommissions.push({
            id: c.id,
            entity_type: 'introducer',
            entity_id: c.introducer_id,
            entity_name: c.introducer?.legal_name || 'Unknown Introducer',
            entity_contact: c.introducer?.contact_name,
            entity_email: c.introducer?.email,
            deal_id: c.deal_id,
            deal_name: c.deal?.name,
            investor_id: c.investor_id,
            investor_name: c.investor?.legal_name || c.investor?.display_name,
            fee_plan_id: null, // Introducer commissions don't have direct fee_plan_id
            basis_type: c.basis_type,
            rate_bps: c.rate_bps,
            base_amount: c.base_amount,
            accrual_amount: c.accrual_amount,
            currency: c.currency,
            status: c.status,
            invoice_id: c.invoice_id,
            paid_at: c.paid_at,
            payment_due_date: c.payment_due_date,
            payment_reference: c.payment_reference,
            notes: c.notes,
            created_at: c.created_at,
          });
        }
      }
    }

    // Fetch partner commissions
    if (!entityType || entityType === 'partner') {
      let partnerQuery = supabase
        .from('partner_commissions')
        .select(`
          *,
          partner:partner_id(id, name, primary_contact_name, primary_contact_email),
          deal:deal_id(id, name),
          investor:investor_id(id, legal_name, display_name),
          fee_plan:fee_plan_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (status) partnerQuery = partnerQuery.eq('status', status);
      if (partnerId) partnerQuery = partnerQuery.eq('partner_id', partnerId);
      if (dealId) partnerQuery = partnerQuery.eq('deal_id', dealId);

      const { data: partnerCommissions, error: partnerError } = await partnerQuery;

      if (partnerError) {
        console.error('Error fetching partner commissions:', partnerError);
      } else if (partnerCommissions) {
        for (const c of partnerCommissions) {
          allCommissions.push({
            id: c.id,
            entity_type: 'partner',
            entity_id: c.partner_id,
            entity_name: c.partner?.name || 'Unknown Partner',
            entity_contact: c.partner?.primary_contact_name,
            entity_email: c.partner?.primary_contact_email,
            deal_id: c.deal_id,
            deal_name: c.deal?.name,
            investor_id: c.investor_id,
            investor_name: c.investor?.legal_name || c.investor?.display_name,
            fee_plan_id: c.fee_plan_id,
            fee_plan_name: c.fee_plan?.name,
            basis_type: c.basis_type,
            rate_bps: c.rate_bps,
            base_amount: c.base_amount,
            accrual_amount: c.accrual_amount,
            currency: c.currency,
            status: c.status,
            invoice_id: c.invoice_id,
            paid_at: c.paid_at,
            payment_due_date: c.payment_due_date,
            payment_reference: c.payment_reference,
            notes: c.notes,
            created_at: c.created_at,
          });
        }
      }
    }

    // Fetch commercial partner commissions
    if (!entityType || entityType === 'commercial_partner') {
      let commercialQuery = supabase
        .from('commercial_partner_commissions')
        .select(`
          *,
          commercial_partner:commercial_partner_id(id, name, contact_name, contact_email),
          deal:deal_id(id, name),
          investor:investor_id(id, legal_name, display_name),
          fee_plan:fee_plan_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (status) commercialQuery = commercialQuery.eq('status', status);
      if (commercialPartnerId) commercialQuery = commercialQuery.eq('commercial_partner_id', commercialPartnerId);
      if (dealId) commercialQuery = commercialQuery.eq('deal_id', dealId);

      const { data: commercialCommissions, error: commercialError } = await commercialQuery;

      if (commercialError) {
        console.error('Error fetching commercial partner commissions:', commercialError);
      } else if (commercialCommissions) {
        for (const c of commercialCommissions) {
          allCommissions.push({
            id: c.id,
            entity_type: 'commercial_partner',
            entity_id: c.commercial_partner_id,
            entity_name: c.commercial_partner?.name || 'Unknown Commercial Partner',
            entity_contact: c.commercial_partner?.contact_name,
            entity_email: c.commercial_partner?.contact_email,
            deal_id: c.deal_id,
            deal_name: c.deal?.name,
            investor_id: c.investor_id,
            investor_name: c.investor?.legal_name || c.investor?.display_name,
            fee_plan_id: c.fee_plan_id,
            fee_plan_name: c.fee_plan?.name,
            basis_type: c.basis_type,
            rate_bps: c.rate_bps,
            base_amount: c.base_amount,
            accrual_amount: c.accrual_amount,
            currency: c.currency,
            status: c.status,
            invoice_id: c.invoice_id,
            paid_at: c.paid_at,
            payment_due_date: c.payment_due_date,
            payment_reference: c.payment_reference,
            notes: c.notes,
            created_at: c.created_at,
          });
        }
      }
    }

    // Sort all commissions by created_at descending
    allCommissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calculate summary stats
    const totalAccrued = allCommissions.filter(c => c.status === 'accrued').reduce((sum, c) => sum + Number(c.accrual_amount), 0);
    const totalInvoiced = allCommissions.filter(c => c.status === 'invoiced').reduce((sum, c) => sum + Number(c.accrual_amount), 0);
    const totalPaid = allCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.accrual_amount), 0);
    const totalOverdue = allCommissions.filter(c =>
      c.status !== 'paid' &&
      c.payment_due_date &&
      new Date(c.payment_due_date) < new Date()
    ).reduce((sum, c) => sum + Number(c.accrual_amount), 0);

    // Group by entity (combining entity_type and entity_id as key)
    const byEntity = allCommissions.reduce((acc, comm) => {
      const key = `${comm.entity_type}:${comm.entity_id}`;

      if (!acc[key]) {
        acc[key] = {
          entity_type: comm.entity_type,
          entity: {
            id: comm.entity_id,
            name: comm.entity_name,
            contact_name: comm.entity_contact,
            email: comm.entity_email,
          },
          commissions: [],
          totals: {
            accrued: 0,
            invoiced: 0,
            paid: 0,
            total: 0,
          },
        };
      }

      acc[key].commissions.push(comm);
      acc[key].totals.total += Number(comm.accrual_amount);

      if (comm.status === 'accrued') {
        acc[key].totals.accrued += Number(comm.accrual_amount);
      } else if (comm.status === 'invoiced') {
        acc[key].totals.invoiced += Number(comm.accrual_amount);
      } else if (comm.status === 'paid') {
        acc[key].totals.paid += Number(comm.accrual_amount);
      }

      return acc;
    }, {} as Record<string, any>);

    // Sort groups by total amount descending
    const sortedByEntity = Object.values(byEntity).sort((a: any, b: any) => b.totals.total - a.totals.total);

    return NextResponse.json({
      data: allCommissions,
      summary: {
        total_accrued: totalAccrued,
        total_invoiced: totalInvoiced,
        total_paid: totalPaid,
        total_overdue: totalOverdue,
        total_owed: totalAccrued + totalInvoiced,
      },
      by_entity: sortedByEntity,
      // Keep legacy field for backward compatibility
      by_introducer: sortedByEntity.filter((g: any) => g.entity_type === 'introducer'),
    });
  } catch (error) {
    console.error('Error in GET /api/staff/fees/commissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
