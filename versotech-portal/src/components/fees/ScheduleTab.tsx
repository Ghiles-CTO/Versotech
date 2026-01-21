/**
 * Schedule Tab - Calendar view of upcoming recurring fees
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/fees/calculations';
import { Calendar, DollarSign, Clock, TrendingUp, Users, Building2, ChevronDown, ChevronRight, UserCheck, Handshake } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  frequency: string;
  next_due_date: string;
  status: string;
}

interface InvestorFeeEvent {
  id: string;
  fee_type: string;
  computed_amount: number;
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
  status: string;
  created_at: string;
}

interface ScheduleData {
  data: UpcomingFee[];
  summary: {
    total_scheduled: number;
    total_amount: number;
    date_range: {
      from: string;
      to: string;
    };
  };
  by_month: Record<string, {
    fees: UpcomingFee[];
    total: number;
  }>;
}

export default function ScheduleTab() {
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
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `/api/staff/fees/events?status=accrued&period_from=${today}&limit=200`
      );
      const json = await res.json();
      setInvestorFees(json.data || []);
    } catch (error) {
      console.error('Error fetching investor fees:', error);
      setInvestorFees([]);
    } finally {
      setInvestorFeesLoading(false);
    }
  }, []);

  const fetchIntroducerCommissions = useCallback(async () => {
    setIntroducerCommissionsLoading(true);
    try {
      // Get introducer commissions with status in ('accrued', 'invoiced') for schedule view
      const res = await fetch(
        `/api/staff/fees/commissions?entity_type=introducer&status=accrued`
      );
      const json = await res.json();
      // Filter to only introducer type from the response
      const introducerData = (json.data || []).filter(
        (c: IntroducerCommission) => c.entity_type === 'introducer'
      );
      setIntroducerCommissions(introducerData);
    } catch (error) {
      console.error('Error fetching introducer commissions:', error);
      setIntroducerCommissions([]);
    } finally {
      setIntroducerCommissionsLoading(false);
    }
  }, []);

  const fetchPartnerCommissions = useCallback(async () => {
    setPartnerCommissionsLoading(true);
    try {
      // Get partner commissions with status = 'accrued' for schedule view
      const res = await fetch(
        `/api/staff/fees/commissions?entity_type=partner&status=accrued`
      );
      const json = await res.json();
      // Filter to only partner type from the response
      const partnerData = (json.data || []).filter(
        (c: PartnerCommission) => c.entity_type === 'partner'
      );
      setPartnerCommissions(partnerData);
    } catch (error) {
      console.error('Error fetching partner commissions:', error);
      setPartnerCommissions([]);
    } finally {
      setPartnerCommissionsLoading(false);
    }
  }, []);

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

  const investorFeesTotal = useMemo(() => {
    return investorFees.reduce((sum, fee) => sum + fee.computed_amount, 0);
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

  const introducerCommissionsTotal = useMemo(() => {
    return introducerCommissions.reduce((sum, c) => sum + Number(c.accrual_amount), 0);
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

  const partnerCommissionsTotal = useMemo(() => {
    return partnerCommissions.reduce((sum, c) => sum + Number(c.accrual_amount), 0);
  }, [partnerCommissions]);

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
              {formatCurrency(data.summary.total_amount)}
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
                      {formatCurrency(investorFeesTotal)}
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
                          {formatCurrency(dealGroup.total)}
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
                              {formatCurrency(investorGroup.total)}
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
                                      {formatCurrency(fee.computed_amount)}
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
                      {formatCurrency(introducerCommissionsTotal)}
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
                          {formatCurrency(introducerGroup.total)}
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
                              {formatCurrency(dealGroup.total)}
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
                                      {formatCurrency(Number(commission.accrual_amount))}
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
                      {formatCurrency(partnerCommissionsTotal)}
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
                          {formatCurrency(partnerGroup.total)}
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
                              {formatCurrency(dealGroup.total)}
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
                                      {formatCurrency(Number(commission.accrual_amount))}
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
                  {monthData.fees.length} fee{monthData.fees.length !== 1 ? 's' : ''} • {formatCurrency(monthData.total)}
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
                            {formatCurrency(fee.amount)}
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
