/**
 * Overview Tab - Complete fee analysis dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, AlertCircle, TrendingUp, Users, UserCheck, Handshake, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/fees/calculations';

interface CommissionSummary {
  total_owed: number;
  total_accrued: number;
  total_invoiced: number;
  total_paid_ytd: number;
  by_entity_type: {
    introducer: { owed: number; paid_ytd: number };
    partner: { owed: number; paid_ytd: number };
    commercial_partner: { owed: number; paid_ytd: number };
  };
}

interface DashboardData {
  total_fees_ytd: number;
  total_fees_mtd: number;
  total_fees_qtd: number;
  outstanding_invoices_count: number;
  outstanding_invoices_amount: number;
  overdue_invoices_count: number;
  overdue_invoices_amount: number;
  upcoming_fees_30days: number;
  upcoming_fees_count: number;
  introducer_commissions_owed: number;
  commission_summary?: CommissionSummary;
}

interface FeeBreakdown {
  subscription_fees: number;
  spread_fees: number;
  bd_fees: number;
  finra_fees: number;
  performance_fees: number;
  total_fees: number;
  unrealized_gains: number;
}

interface ProjectedFees {
  totals: FeeBreakdown & {
    committed_capital: number;
    current_nav: number;
    total_subscriptions: number;
  };
  by_status: Array<FeeBreakdown & {
    status: string;
    committed_capital: number;
    current_nav: number;
    subscription_count: number;
  }>;
  by_vehicle: Array<{
    vehicle_id: string;
    vehicle_name: string;
    fees: FeeBreakdown;
    committed_capital: number;
    current_nav: number;
    subscription_count: number;
    by_status: Array<FeeBreakdown & {
      status: string;
      committed_capital: number;
      current_nav: number;
      subscription_count: number;
    }>;
  }>;
}

export default function OverviewTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [projectedFees, setProjectedFees] = useState<ProjectedFees | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProjected, setLoadingProjected] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch both APIs in parallel for faster loading
      const [dashboardRes, projectedRes] = await Promise.all([
        fetch('/api/staff/fees/dashboard'),
        fetch('/api/staff/fees/projected')
      ]);

      const [dashboardJson, projectedJson] = await Promise.all([
        dashboardRes.json(),
        projectedRes.json()
      ]);

      setData(dashboardJson.data);
      setProjectedFees(projectedJson.data);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
      setLoadingProjected(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!data) {
    return <div className="text-white">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(data.total_fees_ytd)}</div>
            <p className="text-xs text-gray-400">
              MTD: {formatCurrency(data.total_fees_mtd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(data.outstanding_invoices_amount)}</div>
            <p className="text-xs text-gray-400">
              {data.outstanding_invoices_count} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(data.overdue_invoices_amount)}
            </div>
            <p className="text-xs text-gray-400">
              {data.overdue_invoices_count} overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Fees (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(data.upcoming_fees_30days)}</div>
            <p className="text-xs text-gray-400">
              {data.upcoming_fees_count} scheduled fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Section */}
      {data.commission_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Commissions
            </CardTitle>
            <p className="text-sm text-gray-400">
              Commission expenses across all entity types (Introducers, Partners, Commercial Partners)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Commission KPI Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-red-900/20 rounded border border-red-700">
                  <p className="text-xs text-red-300 mb-1">Total Commissions Owed</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(data.commission_summary.total_owed)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Accrued + Invoiced
                  </p>
                </div>
                <div className="p-4 bg-green-900/20 rounded border border-green-700">
                  <p className="text-xs text-green-300 mb-1">Total Paid YTD</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(data.commission_summary.total_paid_ytd)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Commissions paid this year
                  </p>
                </div>
                <div className="p-4 bg-amber-900/20 rounded border border-amber-700">
                  <p className="text-xs text-amber-300 mb-1">Pending Invoice</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(data.commission_summary.total_accrued)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Accrued, awaiting invoice
                  </p>
                </div>
              </div>

              {/* Breakdown by Entity Type */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-300">Breakdown by Entity Type</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-3 bg-gray-900 rounded border border-gray-700 flex items-start gap-3">
                    <UserCheck className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Introducers</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Owed:</span>
                          <span className="text-white font-medium">
                            {formatCurrency(data.commission_summary.by_entity_type.introducer.owed)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Paid YTD:</span>
                          <span className="text-green-400 font-medium">
                            {formatCurrency(data.commission_summary.by_entity_type.introducer.paid_ytd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-900 rounded border border-gray-700 flex items-start gap-3">
                    <Handshake className="h-5 w-5 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Partners</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Owed:</span>
                          <span className="text-white font-medium">
                            {formatCurrency(data.commission_summary.by_entity_type.partner.owed)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Paid YTD:</span>
                          <span className="text-green-400 font-medium">
                            {formatCurrency(data.commission_summary.by_entity_type.partner.paid_ytd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-900 rounded border border-gray-700 flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Commercial Partners</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Owed:</span>
                          <span className="text-white font-medium">
                            {formatCurrency(data.commission_summary.by_entity_type.commercial_partner.owed)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Paid YTD:</span>
                          <span className="text-green-400 font-medium">
                            {formatCurrency(data.commission_summary.by_entity_type.commercial_partner.paid_ytd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Fee Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Complete Fee Analysis</CardTitle>
          <p className="text-sm text-gray-400">
            All subscription fees broken down by type, vehicle, and status
          </p>
        </CardHeader>
        <CardContent>
          {loadingProjected ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : projectedFees ? (
            <div className="space-y-8">
              {/* Fee Type Breakdown - Top Section */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Total Fees by Type</h4>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                  <div className="p-4 bg-blue-900/20 rounded border border-blue-700">
                    <p className="text-xs text-blue-300 mb-1">Subscription Fees</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(projectedFees.totals.subscription_fees)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-900/20 rounded border border-green-700">
                    <p className="text-xs text-green-300 mb-1">Spread Fees</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(projectedFees.totals.spread_fees)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-900/20 rounded border border-purple-700">
                    <p className="text-xs text-purple-300 mb-1">BD Fees</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(projectedFees.totals.bd_fees)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-900/20 rounded border border-orange-700">
                    <p className="text-xs text-orange-300 mb-1">FINRA Fees</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(projectedFees.totals.finra_fees)}
                    </p>
                  </div>
                  <div className="p-4 bg-pink-900/20 rounded border border-pink-700">
                    <p className="text-xs text-pink-300 mb-1">Performance Fees</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(projectedFees.totals.performance_fees)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded border border-gray-600">
                    <p className="text-xs text-gray-300 mb-1 font-semibold">TOTAL ALL FEES</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(projectedFees.totals.total_fees)}
                    </p>
                  </div>
                </div>

                {/* Unrealized Gains Card - Separate Row */}
                <div className="mt-4">
                  <div className={`p-4 rounded border ${
                    projectedFees.totals.unrealized_gains >= 0
                      ? 'bg-emerald-900/20 border-emerald-700'
                      : 'bg-red-900/20 border-red-700'
                  }`}>
                    <p className={`text-xs mb-1 ${
                      projectedFees.totals.unrealized_gains >= 0
                        ? 'text-emerald-300'
                        : 'text-red-300'
                    }`}>
                      Unrealized Gains/Losses (Cost vs Price per Share)
                    </p>
                    <p className={`text-2xl font-bold ${
                      projectedFees.totals.unrealized_gains >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {formatCurrency(projectedFees.totals.unrealized_gains)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      (Price per Share - Cost per Share) × Number of Shares
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  <div className="p-3 bg-gray-900 rounded border border-gray-700">
                    <p className="text-xs text-gray-400">Total Committed Capital</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(projectedFees.totals.committed_capital)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded border border-gray-700">
                    <p className="text-xs text-gray-400">Total Current NAV</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(projectedFees.totals.current_nav)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded border border-gray-700">
                    <p className="text-xs text-gray-400">Total Subscriptions</p>
                    <p className="text-lg font-bold text-white">
                      {projectedFees.totals.total_subscriptions}
                    </p>
                  </div>
                </div>
              </div>

              {/* By Subscription Status */}
              {projectedFees.by_status.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Fees by Subscription Status</h4>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {projectedFees.by_status.map((statusGroup, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-900 rounded border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-white uppercase">{statusGroup.status}</span>
                          <span className="text-xs text-gray-400">{statusGroup.subscription_count} subs</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Subscription:</span>
                            <span className="text-white font-medium">{formatCurrency(statusGroup.subscription_fees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Spread:</span>
                            <span className="text-white font-medium">{formatCurrency(statusGroup.spread_fees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">BD:</span>
                            <span className="text-white font-medium">{formatCurrency(statusGroup.bd_fees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">FINRA:</span>
                            <span className="text-white font-medium">{formatCurrency(statusGroup.finra_fees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Performance:</span>
                            <span className="text-white font-medium">{formatCurrency(statusGroup.performance_fees)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-700">
                            <span className="text-white font-semibold">Total Fees:</span>
                            <span className="text-white font-bold">{formatCurrency(statusGroup.total_fees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={statusGroup.unrealized_gains >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              Unrealized Gain:
                            </span>
                            <span className={`font-semibold ${statusGroup.unrealized_gains >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatCurrency(statusGroup.unrealized_gains)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Vehicle */}
              {projectedFees.by_vehicle.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Fees by Vehicle</h4>
                  <div className="space-y-4">
                    {projectedFees.by_vehicle.map((vehicle, index) => (
                      <div
                        key={index}
                        className="p-5 bg-gray-900 rounded border border-gray-700"
                      >
                        {/* Vehicle Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="text-xl font-bold text-white mb-1">{vehicle.vehicle_name}</h5>
                            <p className="text-sm text-gray-400">
                              {vehicle.subscription_count} subscription{vehicle.subscription_count !== 1 ? 's' : ''} •
                              Capital: {formatCurrency(vehicle.committed_capital)} •
                              NAV: {formatCurrency(vehicle.current_nav)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(vehicle.fees.total_fees)}
                            </p>
                            <p className="text-xs text-gray-400">total fees</p>
                          </div>
                        </div>

                        {/* Fee Type Breakdown for this Vehicle */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                          <div className="p-2 bg-blue-900/10 rounded">
                            <p className="text-xs text-blue-300">Subscription</p>
                            <p className="text-sm font-bold text-white">{formatCurrency(vehicle.fees.subscription_fees)}</p>
                          </div>
                          <div className="p-2 bg-green-900/10 rounded">
                            <p className="text-xs text-green-300">Spread</p>
                            <p className="text-sm font-bold text-white">{formatCurrency(vehicle.fees.spread_fees)}</p>
                          </div>
                          <div className="p-2 bg-purple-900/10 rounded">
                            <p className="text-xs text-purple-300">BD</p>
                            <p className="text-sm font-bold text-white">{formatCurrency(vehicle.fees.bd_fees)}</p>
                          </div>
                          <div className="p-2 bg-orange-900/10 rounded">
                            <p className="text-xs text-orange-300">FINRA</p>
                            <p className="text-sm font-bold text-white">{formatCurrency(vehicle.fees.finra_fees)}</p>
                          </div>
                          <div className="p-2 bg-pink-900/10 rounded">
                            <p className="text-xs text-pink-300">Performance</p>
                            <p className="text-sm font-bold text-white">{formatCurrency(vehicle.fees.performance_fees)}</p>
                          </div>
                        </div>

                        {/* Unrealized Gains for Vehicle */}
                        <div className={`p-3 rounded mb-4 ${
                          vehicle.fees.unrealized_gains >= 0
                            ? 'bg-emerald-900/10 border border-emerald-700'
                            : 'bg-red-900/10 border border-red-700'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${
                              vehicle.fees.unrealized_gains >= 0 ? 'text-emerald-300' : 'text-red-300'
                            }`}>
                              Unrealized Gains/Losses
                            </span>
                            <span className={`text-lg font-bold ${
                              vehicle.fees.unrealized_gains >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(vehicle.fees.unrealized_gains)}
                            </span>
                          </div>
                        </div>

                        {/* Status Breakdown within Vehicle */}
                        {vehicle.by_status.length > 0 && (
                          <div className="pt-4 border-t border-gray-800">
                            <p className="text-xs text-gray-500 mb-3 font-semibold">Status Breakdown:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {vehicle.by_status.map((status, idx) => (
                                <div key={idx} className="p-3 bg-gray-800 rounded text-sm">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-semibold capitalize">{status.status}</span>
                                    <span className="text-gray-400 text-xs">{status.subscription_count}</span>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Sub:</span>
                                      <span className="text-white">{formatCurrency(status.subscription_fees)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Total Fees:</span>
                                      <span className="text-white font-semibold">{formatCurrency(status.total_fees)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className={status.unrealized_gains >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        Unrealized:
                                      </span>
                                      <span className={`font-semibold ${status.unrealized_gains >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatCurrency(status.unrealized_gains)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
