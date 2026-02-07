/**
 * Schedule Tab - Calendar view of upcoming recurring fees
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/fees/calculations';
import { formatCurrencyTotals, sumByCurrency } from '@/lib/currency-totals';
import { Calendar, DollarSign, Clock, Users, Building2, ChevronDown, ChevronRight, UserCheck, Handshake, Briefcase, X, Filter, Check, ChevronsUpDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';

interface UpcomingFee {
  id: string;
  subscription_id: string;
  subscription_number: string;
  investor: {
    id: string;
    legal_name: string;
    display_name: string;
  };
  vehicle: {
    id: string;
    name: string;
  };
  fee_type: string;
  fee_name: string;
  amount: number;
  currency?: string;
  frequency: string;
  next_due_date: string;
  status: string;
}

interface InvestorFeeEvent {
  id: string;
  fee_type: string;
  computed_amount: number;
  currency?: string;
  period_start_date: string | null;
  period_end_date: string | null;
  status: string;
  event_date: string;
  investor: {
    id: string;
    legal_name: string;
    display_name: string;
  } | null;
  deal: {
    id: string;
    name: string;
  } | null;
}

interface IntroducerCommission {
  id: string;
  entity_type: 'introducer';
  entity_id: string;
  entity_name: string;
  deal_id: string | null;
  deal_name?: string;
  investor_id: string | null;
  investor_name?: string;
  accrual_amount: number;
  currency?: string;
  status: string;
  created_at: string;
}

interface PartnerCommission {
  id: string;
  entity_type: 'partner';
  entity_id: string;
  entity_name: string;
  deal_id: string | null;
  deal_name?: string;
  investor_id: string | null;
  investor_name?: string;
  accrual_amount: number;
  currency?: string;
  status: string;
  created_at: string;
}

interface CommercialPartnerCommission {
  id: string;
  entity_type: 'commercial_partner';
  entity_id: string;
  entity_name: string;
  deal_id: string | null;
  deal_name?: string;
  investor_id: string | null;
  investor_name?: string;
  accrual_amount: number;
  currency?: string;
  status: string;
  created_at: string;
}

interface ScheduleData {
  data: UpcomingFee[];
  summary: {
    total_scheduled: number;
    total_amount: number;
    total_amount_by_currency?: Record<string, number>;
    date_range: {
      from: string;
      to: string;
    };
  };
  by_month: Record<string, {
    fees: UpcomingFee[];
    total: number;
    total_by_currency?: Record<string, number>;
  }>;
}

interface Deal {
  id: string;
  name: string;
}

interface Entity {
  id: string;
  name: string;
  type: 'introducer' | 'partner' | 'commercial_partner';
}

export default function ScheduleTab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(60);
  const [investorFees, setInvestorFees] = useState<InvestorFeeEvent[]>([]);
  const [investorFeesLoading, setInvestorFeesLoading] = useState(true);
  const [investorFeesExpanded, setInvestorFeesExpanded] = useState(true);
  const [introducerCommissions, setIntroducerCommissions] = useState<IntroducerCommission[]>([]);
  const [introducerCommissionsLoading, setIntroducerCommissionsLoading] = useState(true);
  const [introducerCommissionsExpanded, setIntroducerCommissionsExpanded] = useState(true);
  const [partnerCommissions, setPartnerCommissions] = useState<PartnerCommission[]>([]);
  const [partnerCommissionsLoading, setPartnerCommissionsLoading] = useState(true);
  const [partnerCommissionsExpanded, setPartnerCommissionsExpanded] = useState(true);
  const [commercialPartnerCommissions, setCommercialPartnerCommissions] = useState<CommercialPartnerCommission[]>([]);
  const [commercialPartnerCommissionsLoading, setCommercialPartnerCommissionsLoading] = useState(true);
  const [commercialPartnerCommissionsExpanded, setCommercialPartnerCommissionsExpanded] = useState(true);

  // Filter state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>(() => {
    const dealIds = searchParams.get('deal_ids');
    return dealIds ? dealIds.split(',') : [];
  });
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>(() => {
    const entityIds = searchParams.get('entity_ids');
    return entityIds ? entityIds.split(',') : [];
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('date_from');
    const to = searchParams.get('date_to');
    if (from || to) {
      return {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      };
    }
    return undefined;
  });
  const [dealPopoverOpen, setDealPopoverOpen] = useState(false);
  const [entityPopoverOpen, setEntityPopoverOpen] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = selectedDealIds.length > 0 || selectedEntityIds.length > 0 || dateRange?.from || dateRange?.to;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedDealIds.length > 0) {
      params.set('deal_ids', selectedDealIds.join(','));
    } else {
      params.delete('deal_ids');
    }

    if (selectedEntityIds.length > 0) {
      params.set('entity_ids', selectedEntityIds.join(','));
    } else {
      params.delete('entity_ids');
    }

    if (dateRange?.from) {
      params.set('date_from', dateRange.from.toISOString().split('T')[0]);
    } else {
      params.delete('date_from');
    }

    if (dateRange?.to) {
      params.set('date_to', dateRange.to.toISOString().split('T')[0]);
    } else {
      params.delete('date_to');
    }

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.push(newUrl, { scroll: false });
  }, [selectedDealIds, selectedEntityIds, dateRange, router, searchParams]);

  // Fetch deals list for filter
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals');
      const json = await res.json();
      setDeals(json.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  }, []);

  // Fetch entities list for filter - uses commissions API to get unique entities
  const fetchEntities = useCallback(async () => {
    try {
      // Fetch all commissions to extract unique entities
      const res = await fetch('/api/staff/fees/commissions');
      const json = await res.json();

      // Use by_entity which has already grouped unique entities
      const byEntity = json.by_entity || [];
      const allEntities: Entity[] = byEntity.map((group: { entity_type: string; entity: { id: string; name: string } }) => ({
        id: group.entity.id,
        name: group.entity.name,
        type: group.entity_type as 'introducer' | 'partner' | 'commercial_partner',
      }));

      // Also try to get introducers from dedicated endpoint for completeness
      try {
        const introducersRes = await fetch('/api/staff/introducers');
        const introducersJson = await introducersRes.json();
        const introducers = (introducersJson.data || []).map((e: { id: string; legal_name?: string; name?: string }) => ({
          id: e.id,
          name: e.legal_name || e.name || 'Unknown',
          type: 'introducer' as const,
        }));

        // Merge introducers, avoiding duplicates
        const existingIds = new Set(allEntities.map(e => e.id));
        for (const introducer of introducers) {
          if (!existingIds.has(introducer.id)) {
            allEntities.push(introducer);
          }
        }
      } catch {
        // Introducers endpoint may not be accessible, that's ok
      }

      // Sort by name
      allEntities.sort((a, b) => a.name.localeCompare(b.name));

      setEntities(allEntities);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedDealIds([]);
    setSelectedEntityIds([]);
    setDateRange(undefined);
  }, []);

  // Toggle deal selection
  const toggleDeal = (dealId: string) => {
    setSelectedDealIds((prev) =>
      prev.includes(dealId) ? prev.filter((id) => id !== dealId) : [...prev, dealId]
    );
  };

  // Toggle entity selection
  const toggleEntity = (entityId: string) => {
    setSelectedEntityIds((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
    );
  };

  // Get selected deal names for display
  const selectedDealNames = useMemo(() => {
    return selectedDealIds
      .map((id) => deals.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [selectedDealIds, deals]);

  // Get selected entity names for display
  const selectedEntityNames = useMemo(() => {
    return selectedEntityIds
      .map((id) => entities.find((e) => e.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [selectedEntityIds, entities]);

  // Load deals and entities on mount
  useEffect(() => {
    fetchDeals();
    fetchEntities();
  }, [fetchDeals, fetchEntities]);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/fees/schedules?days=${daysAhead}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  const fetchInvestorFees = useCallback(async () => {
    setInvestorFeesLoading(true);
    try {
      // Get fee events with status = 'accrued' and future period_start_date
      const params = new URLSearchParams();
      params.set('status', 'accrued');
      params.set('limit', '200');

      // Use date range or default to today
      if (dateRange?.from) {
        params.set('period_from', dateRange.from.toISOString().split('T')[0]);
      } else {
        params.set('period_from', new Date().toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        params.set('period_to', dateRange.to.toISOString().split('T')[0]);
      }

      const res = await fetch(`/api/staff/fees/events?${params.toString()}`);
      const json = await res.json();

      let feeData = json.data || [];

      // Filter by selected deals (client-side since API doesn't support multiple deal_ids)
      if (selectedDealIds.length > 0) {
        feeData = feeData.filter((fee: InvestorFeeEvent) =>
          fee.deal?.id && selectedDealIds.includes(fee.deal.id)
        );
      }

      setInvestorFees(feeData);
    } catch (error) {
      console.error('Error fetching investor fees:', error);
      setInvestorFees([]);
    } finally {
      setInvestorFeesLoading(false);
    }
  }, [selectedDealIds, dateRange]);

  const fetchIntroducerCommissions = useCallback(async () => {
    setIntroducerCommissionsLoading(true);
    try {
      // Get introducer commissions with status = 'accrued' for schedule view
      const params = new URLSearchParams();
      params.set('entity_type', 'introducer');
      params.set('status', 'accrued');

      const res = await fetch(`/api/staff/fees/commissions?${params.toString()}`);
      const json = await res.json();

      let introducerData = (json.data || []).filter(
        (c: IntroducerCommission) => c.entity_type === 'introducer'
      );

      // Filter by selected deals
      if (selectedDealIds.length > 0) {
        introducerData = introducerData.filter((c: IntroducerCommission) =>
          c.deal_id && selectedDealIds.includes(c.deal_id)
        );
      }

      // Filter by selected entities (introducers)
      if (selectedEntityIds.length > 0) {
        introducerData = introducerData.filter((c: IntroducerCommission) =>
          selectedEntityIds.includes(c.entity_id)
        );
      }

      // Filter by date range (created_at)
      if (dateRange?.from) {
        introducerData = introducerData.filter((c: IntroducerCommission) =>
          new Date(c.created_at) >= dateRange.from!
        );
      }
      if (dateRange?.to) {
        introducerData = introducerData.filter((c: IntroducerCommission) =>
          new Date(c.created_at) <= dateRange.to!
        );
      }

      setIntroducerCommissions(introducerData);
    } catch (error) {
      console.error('Error fetching introducer commissions:', error);
      setIntroducerCommissions([]);
    } finally {
      setIntroducerCommissionsLoading(false);
    }
  }, [selectedDealIds, selectedEntityIds, dateRange]);

  const fetchPartnerCommissions = useCallback(async () => {
    setPartnerCommissionsLoading(true);
    try {
      // Get partner commissions with status = 'accrued' for schedule view
      const params = new URLSearchParams();
      params.set('entity_type', 'partner');
      params.set('status', 'accrued');

      const res = await fetch(`/api/staff/fees/commissions?${params.toString()}`);
      const json = await res.json();

      let partnerData = (json.data || []).filter(
        (c: PartnerCommission) => c.entity_type === 'partner'
      );

      // Filter by selected deals
      if (selectedDealIds.length > 0) {
        partnerData = partnerData.filter((c: PartnerCommission) =>
          c.deal_id && selectedDealIds.includes(c.deal_id)
        );
      }

      // Filter by selected entities (partners)
      if (selectedEntityIds.length > 0) {
        partnerData = partnerData.filter((c: PartnerCommission) =>
          selectedEntityIds.includes(c.entity_id)
        );
      }

      // Filter by date range (created_at)
      if (dateRange?.from) {
        partnerData = partnerData.filter((c: PartnerCommission) =>
          new Date(c.created_at) >= dateRange.from!
        );
      }
      if (dateRange?.to) {
        partnerData = partnerData.filter((c: PartnerCommission) =>
          new Date(c.created_at) <= dateRange.to!
        );
      }

      setPartnerCommissions(partnerData);
    } catch (error) {
      console.error('Error fetching partner commissions:', error);
      setPartnerCommissions([]);
    } finally {
      setPartnerCommissionsLoading(false);
    }
  }, [selectedDealIds, selectedEntityIds, dateRange]);

  const fetchCommercialPartnerCommissions = useCallback(async () => {
    setCommercialPartnerCommissionsLoading(true);
    try {
      // Get commercial partner commissions with status = 'accrued' for schedule view
      const params = new URLSearchParams();
      params.set('entity_type', 'commercial_partner');
      params.set('status', 'accrued');

      const res = await fetch(`/api/staff/fees/commissions?${params.toString()}`);
      const json = await res.json();

      let commercialPartnerData = (json.data || []).filter(
        (c: CommercialPartnerCommission) => c.entity_type === 'commercial_partner'
      );

      // Filter by selected deals
      if (selectedDealIds.length > 0) {
        commercialPartnerData = commercialPartnerData.filter((c: CommercialPartnerCommission) =>
          c.deal_id && selectedDealIds.includes(c.deal_id)
        );
      }

      // Filter by selected entities (commercial partners)
      if (selectedEntityIds.length > 0) {
        commercialPartnerData = commercialPartnerData.filter((c: CommercialPartnerCommission) =>
          selectedEntityIds.includes(c.entity_id)
        );
      }

      // Filter by date range (created_at)
      if (dateRange?.from) {
        commercialPartnerData = commercialPartnerData.filter((c: CommercialPartnerCommission) =>
          new Date(c.created_at) >= dateRange.from!
        );
      }
      if (dateRange?.to) {
        commercialPartnerData = commercialPartnerData.filter((c: CommercialPartnerCommission) =>
          new Date(c.created_at) <= dateRange.to!
        );
      }

      setCommercialPartnerCommissions(commercialPartnerData);
    } catch (error) {
      console.error('Error fetching commercial partner commissions:', error);
      setCommercialPartnerCommissions([]);
    } finally {
      setCommercialPartnerCommissionsLoading(false);
    }
  }, [selectedDealIds, selectedEntityIds, dateRange]);

  useEffect(() => {
    fetchSchedules();
  }, [daysAhead, fetchSchedules]);

  useEffect(() => {
    fetchInvestorFees();
  }, [fetchInvestorFees]);

  useEffect(() => {
    fetchIntroducerCommissions();
  }, [fetchIntroducerCommissions]);

  useEffect(() => {
    fetchPartnerCommissions();
  }, [fetchPartnerCommissions]);

  useEffect(() => {
    fetchCommercialPartnerCommissions();
  }, [fetchCommercialPartnerCommissions]);

  // Group investor fees by deal, then by investor
  const groupedInvestorFees = useMemo(() => {
    const byDeal: Record<string, {
      deal: { id: string; name: string };
      byInvestor: Record<string, {
        investor: { id: string; name: string };
        fees: InvestorFeeEvent[];
        total: number;
      }>;
      total: number;
    }> = {};

    for (const fee of investorFees) {
      const dealId = fee.deal?.id || 'unknown';
      const dealName = fee.deal?.name || 'Unknown Deal';
      const investorId = fee.investor?.id || 'unknown';
      const investorName = fee.investor?.legal_name || fee.investor?.display_name || 'Unknown Investor';

      if (!byDeal[dealId]) {
        byDeal[dealId] = {
          deal: { id: dealId, name: dealName },
          byInvestor: {},
          total: 0,
        };
      }

      if (!byDeal[dealId].byInvestor[investorId]) {
        byDeal[dealId].byInvestor[investorId] = {
          investor: { id: investorId, name: investorName },
          fees: [],
          total: 0,
        };
      }

      byDeal[dealId].byInvestor[investorId].fees.push(fee);
      byDeal[dealId].byInvestor[investorId].total += fee.computed_amount;
      byDeal[dealId].total += fee.computed_amount;
    }

    // Sort fees by period_start_date within each group
    Object.values(byDeal).forEach(dealGroup => {
      Object.values(dealGroup.byInvestor).forEach(investorGroup => {
        investorGroup.fees.sort((a, b) => {
          const dateA = a.period_start_date || a.event_date;
          const dateB = b.period_start_date || b.event_date;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
      });
    });

    return byDeal;
  }, [investorFees]);

  // Group introducer commissions by introducer, then by deal
  const groupedIntroducerCommissions = useMemo(() => {
    const byIntroducer: Record<string, {
      introducer: { id: string; name: string };
      byDeal: Record<string, {
        deal: { id: string; name: string };
        commissions: IntroducerCommission[];
        total: number;
      }>;
      total: number;
    }> = {};

    for (const commission of introducerCommissions) {
      const introducerId = commission.entity_id || 'unknown';
      const introducerName = commission.entity_name || 'Unknown Introducer';
      const dealId = commission.deal_id || 'unknown';
      const dealName = commission.deal_name || 'Unknown Deal';

      if (!byIntroducer[introducerId]) {
        byIntroducer[introducerId] = {
          introducer: { id: introducerId, name: introducerName },
          byDeal: {},
          total: 0,
        };
      }

      if (!byIntroducer[introducerId].byDeal[dealId]) {
        byIntroducer[introducerId].byDeal[dealId] = {
          deal: { id: dealId, name: dealName },
          commissions: [],
          total: 0,
        };
      }

      byIntroducer[introducerId].byDeal[dealId].commissions.push(commission);
      byIntroducer[introducerId].byDeal[dealId].total += Number(commission.accrual_amount);
      byIntroducer[introducerId].total += Number(commission.accrual_amount);
    }

    // Sort commissions by created_at within each group
    Object.values(byIntroducer).forEach(introducerGroup => {
      Object.values(introducerGroup.byDeal).forEach(dealGroup => {
        dealGroup.commissions.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });
    });

    return byIntroducer;
  }, [introducerCommissions]);

  // Group partner commissions by partner, then by deal
  const groupedPartnerCommissions = useMemo(() => {
    const byPartner: Record<string, {
      partner: { id: string; name: string };
      byDeal: Record<string, {
        deal: { id: string; name: string };
        commissions: PartnerCommission[];
        total: number;
      }>;
      total: number;
    }> = {};

    for (const commission of partnerCommissions) {
      const partnerId = commission.entity_id || 'unknown';
      const partnerName = commission.entity_name || 'Unknown Partner';
      const dealId = commission.deal_id || 'unknown';
      const dealName = commission.deal_name || 'Unknown Deal';

      if (!byPartner[partnerId]) {
        byPartner[partnerId] = {
          partner: { id: partnerId, name: partnerName },
          byDeal: {},
          total: 0,
        };
      }

      if (!byPartner[partnerId].byDeal[dealId]) {
        byPartner[partnerId].byDeal[dealId] = {
          deal: { id: dealId, name: dealName },
          commissions: [],
          total: 0,
        };
      }

      byPartner[partnerId].byDeal[dealId].commissions.push(commission);
      byPartner[partnerId].byDeal[dealId].total += Number(commission.accrual_amount);
      byPartner[partnerId].total += Number(commission.accrual_amount);
    }

    // Sort commissions by created_at within each group
    Object.values(byPartner).forEach(partnerGroup => {
      Object.values(partnerGroup.byDeal).forEach(dealGroup => {
        dealGroup.commissions.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });
    });

    return byPartner;
  }, [partnerCommissions]);

  // Group commercial partner commissions by commercial partner, then by deal
  const groupedCommercialPartnerCommissions = useMemo(() => {
    const byCommercialPartner: Record<string, {
      commercialPartner: { id: string; name: string };
      byDeal: Record<string, {
        deal: { id: string; name: string };
        commissions: CommercialPartnerCommission[];
        total: number;
      }>;
      total: number;
    }> = {};

    for (const commission of commercialPartnerCommissions) {
      const commercialPartnerId = commission.entity_id || 'unknown';
      const commercialPartnerName = commission.entity_name || 'Unknown Commercial Partner';
      const dealId = commission.deal_id || 'unknown';
      const dealName = commission.deal_name || 'Unknown Deal';

      if (!byCommercialPartner[commercialPartnerId]) {
        byCommercialPartner[commercialPartnerId] = {
          commercialPartner: { id: commercialPartnerId, name: commercialPartnerName },
          byDeal: {},
          total: 0,
        };
      }

      if (!byCommercialPartner[commercialPartnerId].byDeal[dealId]) {
        byCommercialPartner[commercialPartnerId].byDeal[dealId] = {
          deal: { id: dealId, name: dealName },
          commissions: [],
          total: 0,
        };
      }

      byCommercialPartner[commercialPartnerId].byDeal[dealId].commissions.push(commission);
      byCommercialPartner[commercialPartnerId].byDeal[dealId].total += Number(commission.accrual_amount);
      byCommercialPartner[commercialPartnerId].total += Number(commission.accrual_amount);
    }

    // Sort commissions by created_at within each group
    Object.values(byCommercialPartner).forEach(commercialPartnerGroup => {
      Object.values(commercialPartnerGroup.byDeal).forEach(dealGroup => {
        dealGroup.commissions.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });
    });

    return byCommercialPartner;
  }, [commercialPartnerCommissions]);

  if (loading) {
    return <div className="text-white">Loading fee schedules...</div>;
  }

  if (!data) {
    return <div className="text-white">Failed to load fee schedules</div>;
  }

  const feeTypeColors: Record<string, string> = {
    management: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    subscription: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    performance: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const formatTotalsByCurrency = <T,>(
    items: T[],
    amountGetter: (item: T) => number | null | undefined,
    currencyGetter: (item: T) => string | null | undefined
  ) => formatCurrencyTotals(sumByCurrency(items, amountGetter, currencyGetter));

  const formatAmount = (amount: number, currency?: string | null) => {
    const code = (currency || '').trim().toUpperCase();
    if (!code) return amount.toLocaleString();
    return formatCurrency(amount, code);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Fee Schedule</h2>
        <p className="text-gray-400">Upcoming recurring fees for the next {daysAhead} days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.summary.total_scheduled}
            </div>
            <p className="text-xs text-gray-400">
              Recurring fees due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.summary.total_amount_by_currency
                ? formatCurrencyTotals(data.summary.total_amount_by_currency)
                : formatTotalsByCurrency(data.data, (fee) => fee.amount, (fee) => fee.currency)}
            </div>
            <p className="text-xs text-gray-400">
              Total amount scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-white">
              {new Date(data.summary.date_range.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' - '}
              {new Date(data.summary.date_range.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <p className="text-xs text-gray-400">
              Forecast period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[30, 60, 90, 180].map((days) => (
          <Button
            key={days}
            variant={daysAhead === days ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDaysAhead(days)}
          >
            {days} days
          </Button>
        ))}
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm">Filters</CardTitle>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {selectedDealIds.length + selectedEntityIds.length + (dateRange ? 1 : 0)} active
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {/* Deal Filter */}
            <Popover open={dealPopoverOpen} onOpenChange={setDealPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={dealPopoverOpen}
                  className="min-w-[200px] justify-between text-left font-normal"
                >
                  <span className="truncate">
                    {selectedDealIds.length > 0
                      ? selectedDealIds.length === 1
                        ? selectedDealNames
                        : `${selectedDealIds.length} deals selected`
                      : 'Select deals...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search deals..." />
                  <CommandList>
                    <CommandEmpty>No deals found.</CommandEmpty>
                    <CommandGroup heading="Deals">
                      {deals.map((deal) => (
                        <CommandItem
                          key={deal.id}
                          value={deal.name}
                          onSelect={() => toggleDeal(deal.id)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Checkbox
                              checked={selectedDealIds.includes(deal.id)}
                              onCheckedChange={() => toggleDeal(deal.id)}
                              className="h-4 w-4"
                            />
                            <span className="truncate">{deal.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Entity Filter */}
            <Popover open={entityPopoverOpen} onOpenChange={setEntityPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={entityPopoverOpen}
                  className="min-w-[200px] justify-between text-left font-normal"
                >
                  <span className="truncate">
                    {selectedEntityIds.length > 0
                      ? selectedEntityIds.length === 1
                        ? selectedEntityNames
                        : `${selectedEntityIds.length} entities selected`
                      : 'Select entities...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search entities..." />
                  <CommandList>
                    <CommandEmpty>No entities found.</CommandEmpty>
                    {/* Group by entity type */}
                    {['introducer', 'partner', 'commercial_partner'].map((type) => {
                      const typeEntities = entities.filter((e) => e.type === type);
                      if (typeEntities.length === 0) return null;

                      const typeLabels: Record<string, string> = {
                        introducer: 'Introducers',
                        partner: 'Partners',
                        commercial_partner: 'Commercial Partners',
                      };

                      return (
                        <CommandGroup key={type} heading={typeLabels[type]}>
                          {typeEntities.map((entity) => (
                            <CommandItem
                              key={entity.id}
                              value={`${entity.type}-${entity.name}`}
                              onSelect={() => toggleEntity(entity.id)}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Checkbox
                                  checked={selectedEntityIds.includes(entity.id)}
                                  onCheckedChange={() => toggleEntity(entity.id)}
                                  className="h-4 w-4"
                                />
                                {entity.type === 'introducer' && (
                                  <UserCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                )}
                                {entity.type === 'partner' && (
                                  <Handshake className="h-3.5 w-3.5 text-green-400 shrink-0" />
                                )}
                                {entity.type === 'commercial_partner' && (
                                  <Briefcase className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                )}
                                <span className="truncate">{entity.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Date Range Filter */}
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              variant="dark"
            />
          </div>
        </CardContent>
      </Card>

      {/* Investor Fees Section */}
      <Collapsible open={investorFeesExpanded} onOpenChange={setInvestorFeesExpanded}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <CardTitle className="text-lg">Investor Fees</CardTitle>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Accrued fees pending collection
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {investorFees.length} fee{investorFees.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTotalsByCurrency(investorFees, (fee) => fee.computed_amount, (fee) => fee.currency)}
                    </div>
                  </div>
                  {investorFeesExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {investorFeesLoading ? (
                <p className="text-gray-400 py-4">Loading investor fees...</p>
              ) : investorFees.length === 0 ? (
                <p className="text-gray-400 py-4">No accrued investor fees with future periods</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedInvestorFees).map(([dealId, dealGroup]) => (
                    <div key={dealId} className="space-y-4">
                      {/* Deal Header */}
                      <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                        <Building2 className="h-4 w-4 text-purple-400" />
                        <h4 className="font-semibold text-white">{dealGroup.deal.name}</h4>
                        <span className="text-sm text-gray-400 ml-auto">
                          {formatTotalsByCurrency(
                            Object.values(dealGroup.byInvestor).flatMap((group) => group.fees),
                            (fee) => fee.computed_amount,
                            (fee) => fee.currency
                          )}
                        </span>
                      </div>

                      {/* Investors within Deal */}
                      {Object.entries(dealGroup.byInvestor).map(([investorId, investorGroup]) => (
                        <div key={investorId} className="ml-6 space-y-2">
                          {/* Investor Header */}
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-gray-500" />
                            <h5 className="font-medium text-gray-200">{investorGroup.investor.name}</h5>
                            <span className="text-sm text-gray-400 ml-auto">
                              {formatTotalsByCurrency(investorGroup.fees, (fee) => fee.computed_amount, (fee) => fee.currency)}
                            </span>
                          </div>

                          {/* Fee Events Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Fee Type</th>
                                  <th className="text-right py-2 px-2 text-gray-400 font-medium">Amount</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Period Start</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Period End</th>
                                </tr>
                              </thead>
                              <tbody>
                                {investorGroup.fees.map((fee) => (
                                  <tr key={fee.id} className="border-b border-gray-800">
                                    <td className="py-2 px-2">
                                      <Badge className={feeTypeColors[fee.fee_type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                                        {fee.fee_type}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-2 text-right text-white font-medium">
                                      {formatAmount(fee.computed_amount, fee.currency)}
                                    </td>
                                    <td className="py-2 px-2 text-gray-300">
                                      {fee.period_start_date
                                        ? new Date(fee.period_start_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })
                                        : '-'}
                                    </td>
                                    <td className="py-2 px-2 text-gray-300">
                                      {fee.period_end_date
                                        ? new Date(fee.period_end_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })
                                        : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Introducer Commissions Section */}
      <Collapsible open={introducerCommissionsExpanded} onOpenChange={setIntroducerCommissionsExpanded}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-blue-400" />
                  <div>
                    <CardTitle className="text-lg">Introducer Commissions</CardTitle>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Pending commission payments to introducers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {introducerCommissions.length} commission{introducerCommissions.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTotalsByCurrency(introducerCommissions, (commission) => commission.accrual_amount, (commission) => commission.currency)}
                    </div>
                  </div>
                  {introducerCommissionsExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {introducerCommissionsLoading ? (
                <p className="text-gray-400 py-4">Loading introducer commissions...</p>
              ) : introducerCommissions.length === 0 ? (
                <p className="text-gray-400 py-4">No pending introducer commissions</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedIntroducerCommissions).map(([introducerId, introducerGroup]) => (
                    <div key={introducerId} className="space-y-4">
                      {/* Introducer Header */}
                      <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                        <UserCheck className="h-4 w-4 text-blue-400" />
                        <h4 className="font-semibold text-white">{introducerGroup.introducer.name}</h4>
                        <span className="text-sm text-gray-400 ml-auto">
                          {formatTotalsByCurrency(
                            Object.values(introducerGroup.byDeal).flatMap((group) => group.commissions),
                            (commission) => commission.accrual_amount,
                            (commission) => commission.currency
                          )}
                        </span>
                      </div>

                      {/* Deals within Introducer */}
                      {Object.entries(introducerGroup.byDeal).map(([dealId, dealGroup]) => (
                        <div key={dealId} className="ml-6 space-y-2">
                          {/* Deal Header */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-purple-400" />
                            <h5 className="font-medium text-gray-200">{dealGroup.deal.name}</h5>
                            <span className="text-sm text-gray-400 ml-auto">
                              {formatTotalsByCurrency(dealGroup.commissions, (commission) => commission.accrual_amount, (commission) => commission.currency)}
                            </span>
                          </div>

                          {/* Commissions Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Investor</th>
                                  <th className="text-right py-2 px-2 text-gray-400 font-medium">Amount</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Created Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dealGroup.commissions.map((commission) => (
                                  <tr key={commission.id} className="border-b border-gray-800">
                                    <td className="py-2 px-2 text-gray-300">
                                      {commission.investor_name || '-'}
                                    </td>
                                    <td className="py-2 px-2 text-right text-white font-medium">
                                      {formatAmount(Number(commission.accrual_amount), commission.currency)}
                                    </td>
                                    <td className="py-2 px-2">
                                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                        {commission.status}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-2 text-gray-300">
                                      {new Date(commission.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Partner Commissions Section */}
      <Collapsible open={partnerCommissionsExpanded} onOpenChange={setPartnerCommissionsExpanded}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <Handshake className="h-5 w-5 text-green-400" />
                  <div>
                    <CardTitle className="text-lg">Partner Commissions</CardTitle>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Pending commission payments to partners
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {partnerCommissions.length} commission{partnerCommissions.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTotalsByCurrency(partnerCommissions, (commission) => commission.accrual_amount, (commission) => commission.currency)}
                    </div>
                  </div>
                  {partnerCommissionsExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {partnerCommissionsLoading ? (
                <p className="text-gray-400 py-4">Loading partner commissions...</p>
              ) : partnerCommissions.length === 0 ? (
                <p className="text-gray-400 py-4">No pending partner commissions</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPartnerCommissions).map(([partnerId, partnerGroup]) => (
                    <div key={partnerId} className="space-y-4">
                      {/* Partner Header */}
                      <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                        <Handshake className="h-4 w-4 text-green-400" />
                        <h4 className="font-semibold text-white">{partnerGroup.partner.name}</h4>
                        <span className="text-sm text-gray-400 ml-auto">
                          {formatTotalsByCurrency(
                            Object.values(partnerGroup.byDeal).flatMap((group) => group.commissions),
                            (commission) => commission.accrual_amount,
                            (commission) => commission.currency
                          )}
                        </span>
                      </div>

                      {/* Deals within Partner */}
                      {Object.entries(partnerGroup.byDeal).map(([dealId, dealGroup]) => (
                        <div key={dealId} className="ml-6 space-y-2">
                          {/* Deal Header */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-purple-400" />
                            <h5 className="font-medium text-gray-200">{dealGroup.deal.name}</h5>
                            <span className="text-sm text-gray-400 ml-auto">
                              {formatTotalsByCurrency(dealGroup.commissions, (commission) => commission.accrual_amount, (commission) => commission.currency)}
                            </span>
                          </div>

                          {/* Commissions Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Investor</th>
                                  <th className="text-right py-2 px-2 text-gray-400 font-medium">Amount</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Created Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dealGroup.commissions.map((commission) => (
                                  <tr key={commission.id} className="border-b border-gray-800">
                                    <td className="py-2 px-2 text-gray-300">
                                      {commission.investor_name || '-'}
                                    </td>
                                    <td className="py-2 px-2 text-right text-white font-medium">
                                      {formatAmount(Number(commission.accrual_amount), commission.currency)}
                                    </td>
                                    <td className="py-2 px-2">
                                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                        {commission.status}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-2 text-gray-300">
                                      {new Date(commission.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Commercial Partner Commissions Section */}
      <Collapsible open={commercialPartnerCommissionsExpanded} onOpenChange={setCommercialPartnerCommissionsExpanded}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-purple-400" />
                  <div>
                    <CardTitle className="text-lg">Commercial Partner Commissions</CardTitle>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Pending commission payments to commercial partners
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {commercialPartnerCommissions.length} commission{commercialPartnerCommissions.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTotalsByCurrency(
                        commercialPartnerCommissions,
                        (commission) => commission.accrual_amount,
                        (commission) => commission.currency
                      )}
                    </div>
                  </div>
                  {commercialPartnerCommissionsExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {commercialPartnerCommissionsLoading ? (
                <p className="text-gray-400 py-4">Loading commercial partner commissions...</p>
              ) : commercialPartnerCommissions.length === 0 ? (
                <p className="text-gray-400 py-4">No pending commercial partner commissions</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedCommercialPartnerCommissions).map(([commercialPartnerId, commercialPartnerGroup]) => (
                    <div key={commercialPartnerId} className="space-y-4">
                      {/* Commercial Partner Header */}
                      <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                        <Briefcase className="h-4 w-4 text-purple-400" />
                        <h4 className="font-semibold text-white">{commercialPartnerGroup.commercialPartner.name}</h4>
                        <span className="text-sm text-gray-400 ml-auto">
                          {formatTotalsByCurrency(
                            Object.values(commercialPartnerGroup.byDeal).flatMap((group) => group.commissions),
                            (commission) => commission.accrual_amount,
                            (commission) => commission.currency
                          )}
                        </span>
                      </div>

                      {/* Deals within Commercial Partner */}
                      {Object.entries(commercialPartnerGroup.byDeal).map(([dealId, dealGroup]) => (
                        <div key={dealId} className="ml-6 space-y-2">
                          {/* Deal Header */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-purple-400" />
                            <h5 className="font-medium text-gray-200">{dealGroup.deal.name}</h5>
                            <span className="text-sm text-gray-400 ml-auto">
                              {formatTotalsByCurrency(dealGroup.commissions, (commission) => commission.accrual_amount, (commission) => commission.currency)}
                            </span>
                          </div>

                          {/* Commissions Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Investor</th>
                                  <th className="text-right py-2 px-2 text-gray-400 font-medium">Amount</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Created Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dealGroup.commissions.map((commission) => (
                                  <tr key={commission.id} className="border-b border-gray-800">
                                    <td className="py-2 px-2 text-gray-300">
                                      {commission.investor_name || '-'}
                                    </td>
                                    <td className="py-2 px-2 text-right text-white font-medium">
                                      {formatAmount(Number(commission.accrual_amount), commission.currency)}
                                    </td>
                                    <td className="py-2 px-2">
                                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                        {commission.status}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-2 text-gray-300">
                                      {new Date(commission.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Scheduled Recurring Fees - Grouped by Month */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Scheduled Recurring Fees</h3>
      </div>
      {Object.keys(data.by_month).length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-400">No upcoming fees scheduled for the next {daysAhead} days</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(data.by_month).map(([month, monthData]) => (
            <div key={month}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{month}</h3>
                <div className="text-sm text-gray-400">
                  {monthData.fees.length} fee{monthData.fees.length !== 1 ? 's' : ''} • {monthData.total_by_currency
                    ? formatCurrencyTotals(monthData.total_by_currency)
                    : formatTotalsByCurrency(monthData.fees, (fee) => fee.amount, (fee) => fee.currency)}
                </div>
              </div>

              <div className="space-y-3">
                {monthData.fees.map((fee) => (
                  <Card key={fee.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={feeTypeColors[fee.fee_type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                              {fee.fee_name}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {fee.frequency}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <p className="font-medium text-white">
                              {fee.investor.legal_name || fee.investor.display_name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {fee.vehicle.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              Subscription: {fee.subscription_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due: {new Date(fee.next_due_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-white">
                            {formatAmount(fee.amount, fee.currency)}
                          </div>
                          <Badge variant="secondary" className="mt-2">
                            {fee.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
