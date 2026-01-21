/**
 * Commissions Tab - Manage entity commissions (introducers, partners, commercial partners)
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, Clock, AlertCircle, ExternalLink, FileText, Users, Briefcase, Building2, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/fees/calculations';
import Link from 'next/link';

type EntityType = 'introducer' | 'partner' | 'commercial_partner';

interface Commission {
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
  accrual_amount: number;
  currency: string;
  status: 'accrued' | 'invoice_requested' | 'invoice_submitted' | 'invoiced' | 'paid' | 'rejected' | 'cancelled';
  invoice_id: string | null;
  paid_at: string | null;
  created_at: string;
  base_amount: number;
  payment_due_date: string | null;
  payment_reference: string | null;
  notes: string | null;
}

interface EntityGroup {
  entity_type: EntityType;
  entity: {
    id: string;
    name: string;
    contact_name?: string;
    email?: string;
  };
  commissions: Commission[];
  totals: {
    accrued: number;
    invoiced: number;
    paid: number;
    total: number;
  };
}

interface CommissionsData {
  data: Commission[];
  summary: {
    total_accrued: number;
    total_invoiced: number;
    total_paid: number;
    total_overdue: number;
    total_owed: number;
  };
  by_entity: EntityGroup[];
}

const statusColors = {
  accrued: 'secondary',
  invoice_requested: 'outline',
  invoice_submitted: 'default',
  invoiced: 'default',
  paid: 'default',
  rejected: 'destructive',
  cancelled: 'secondary',
} as const;

const statusIcons = {
  accrued: Clock,
  invoice_requested: Send,
  invoice_submitted: FileText,
  invoiced: FileText,
  paid: CheckCircle,
  rejected: AlertCircle,
  cancelled: AlertCircle,
};

// Entity type configuration
const entityConfig: Record<EntityType, { label: string; icon: typeof Users; linkPath: string; color: string }> = {
  introducer: {
    label: 'Introducer',
    icon: Users,
    linkPath: '/versotech_main/introducers',
    color: 'text-blue-400',
  },
  partner: {
    label: 'Partner',
    icon: Briefcase,
    linkPath: '/versotech_main/partners',
    color: 'text-purple-400',
  },
  commercial_partner: {
    label: 'Commercial Partner',
    icon: Building2,
    linkPath: '/versotech_main/commercial-partners',
    color: 'text-orange-400',
  },
};

// Fallback for unknown entity types
const getEntityConfig = (type: EntityType) => {
  return entityConfig[type] || entityConfig.introducer;
};

export default function CommissionsTab() {
  const [data, setData] = useState<CommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'accrued' | 'invoice_requested' | 'invoice_submitted' | 'invoiced' | 'paid' | 'rejected' | 'cancelled'>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<'all' | EntityType>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (entityTypeFilter !== 'all') params.set('entity_type', entityTypeFilter);

      const url = params.toString()
        ? `/api/staff/fees/commissions?${params.toString()}`
        : '/api/staff/fees/commissions';
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, entityTypeFilter]);

  useEffect(() => {
    fetchCommissions();
  }, [statusFilter, entityTypeFilter, fetchCommissions]);

  const handleMarkInvoiced = async (commissionId: string, entityType: EntityType) => {
    setActionLoading(commissionId);
    try {
      const res = await fetch(`/api/staff/fees/commissions/${commissionId}/mark-invoiced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType }),
      });
      if (res.ok) {
        fetchCommissions();
      } else {
        const error = await res.json();
        alert(`Failed to mark as invoiced: ${error.error}`);
      }
    } catch (error) {
      console.error('Error marking as invoiced:', error);
      alert('Failed to mark as invoiced');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (commissionId: string, entityType: EntityType) => {
    const reference = prompt('Enter payment reference (optional):');

    setActionLoading(commissionId);
    try {
      const res = await fetch(`/api/staff/fees/commissions/${commissionId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_reference: reference, entity_type: entityType }),
      });
      if (res.ok) {
        fetchCommissions();
      } else {
        const error = await res.json();
        alert(`Failed to mark as paid: ${error.error}`);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-white">Loading commissions...</div>;
  }

  if (!data) {
    return <div className="text-white">Failed to load commissions data</div>;
  }

  const isOverdue = (commission: Commission) => {
    if (commission.status === 'paid') return false;
    if (!commission.payment_due_date) return false;
    return new Date(commission.payment_due_date) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Entity Commissions</h2>
        <p className="text-gray-400">Track and manage commission payments to introducers, partners, and commercial partners</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.summary.total_owed)}
            </div>
            <p className="text-xs text-gray-400">
              Accrued + Invoiced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accrued</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.summary.total_accrued)}
            </div>
            <p className="text-xs text-gray-400">
              Not yet invoiced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid (YTD)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.summary.total_paid)}
            </div>
            <p className="text-xs text-gray-400">
              Settled commissions
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
              {formatCurrency(data.summary.total_overdue)}
            </div>
            <p className="text-xs text-gray-400">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex gap-2">
          <span className="text-sm text-gray-400 self-center mr-1">Status:</span>
          {(['all', 'accrued', 'invoice_requested', 'invoice_submitted', 'invoiced', 'paid', 'rejected', 'cancelled'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'invoice_requested'
                ? 'Invoice Requested'
                : status === 'invoice_submitted'
                ? 'Invoice Submitted'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Entity Type Filter */}
        <div className="flex gap-2">
          <span className="text-sm text-gray-400 self-center mr-1">Entity:</span>
          <Button
            variant={entityTypeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEntityTypeFilter('all')}
          >
            All
          </Button>
          {(Object.keys(entityConfig) as EntityType[]).map((type) => {
            const config = entityConfig[type];
            const Icon = config.icon;
            return (
              <Button
                key={type}
                variant={entityTypeFilter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEntityTypeFilter(type)}
                className="flex items-center gap-1"
              >
                <Icon className={`h-3 w-3 ${entityTypeFilter === type ? '' : config.color}`} />
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Commissions Grouped by Entity */}
      {data.by_entity.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-400">No commissions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.by_entity.map((group) => {
            const config = getEntityConfig(group.entity_type);
            const EntityIcon = config.icon;

            return (
              <Card key={`${group.entity_type}:${group.entity.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <EntityIcon className={`h-5 w-5 ${config.color}`} />
                        {group.entity.name}
                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                          {config.label}
                        </Badge>
                        <Link href={`${config.linkPath}/${group.entity.id}`}>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </CardTitle>
                      {(group.entity.contact_name || group.entity.email) && (
                        <p className="text-sm text-gray-400 mt-1">
                          {group.entity.contact_name && group.entity.email
                            ? `${group.entity.contact_name} • ${group.entity.email}`
                            : group.entity.contact_name || group.entity.email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(group.totals.total)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {group.commissions.length} commission{group.commissions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.commissions.map((commission) => {
                      const StatusIcon = statusIcons[commission.status];
                      const overdue = isOverdue(commission);

                      return (
                        <div
                          key={commission.id}
                          className={`p-4 rounded border ${
                            overdue
                              ? 'bg-red-900/20 border-red-700'
                              : 'bg-gray-900 border-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={statusColors[commission.status]}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {commission.status === 'invoice_requested'
                                    ? 'Invoice Requested'
                                    : commission.status === 'invoice_submitted'
                                    ? 'Invoice Submitted'
                                    : commission.status}
                                </Badge>
                                {overdue && (
                                  <Badge variant="destructive">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-white">
                                {commission.deal_name || 'Direct commission'}
                              </p>
                              {commission.investor_name && (
                                <p className="text-sm text-gray-300">
                                  Investor: {commission.investor_name}
                                </p>
                              )}
                              {commission.fee_plan_name && (
                                <p className="text-sm text-gray-400">
                                  Fee Plan: {commission.fee_plan_name}
                                </p>
                              )}
                              <p className="text-sm text-gray-400 mt-1">
                                {(commission.rate_bps / 100).toFixed(2)}% of {formatCurrency(commission.base_amount)}
                                {commission.payment_due_date && (
                                  <span className="ml-2">
                                    • Due: {new Date(commission.payment_due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                              {commission.notes && (
                                <p className="text-xs text-gray-500 mt-1">{commission.notes}</p>
                              )}
                              {commission.payment_reference && (
                                <p className="text-xs text-green-400 mt-1">
                                  Payment ref: {commission.payment_reference}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <div className="text-right mr-4">
                                <p className="text-xl font-bold text-white">
                                  {formatCurrency(commission.accrual_amount)}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2">
                                {commission.status === 'invoice_submitted' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkInvoiced(commission.id, commission.entity_type)}
                                    disabled={actionLoading === commission.id}
                                  >
                                    {actionLoading === commission.id ? 'Processing...' : 'Mark Invoiced'}
                                  </Button>
                                )}
                                {commission.status === 'invoiced' && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleMarkPaid(commission.id, commission.entity_type)}
                                    disabled={actionLoading === commission.id}
                                  >
                                    {actionLoading === commission.id ? 'Processing...' : 'Mark Paid'}
                                  </Button>
                                )}
                                {commission.status === 'paid' && commission.paid_at && (
                                  <p className="text-xs text-green-400">
                                    Paid {new Date(commission.paid_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
