/**
 * Commissions Tab - Manage introducer commissions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, Clock, AlertCircle, ExternalLink, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/fees/calculations';
import Link from 'next/link';

interface Commission {
  id: string;
  introducer_id: string;
  deal_id: string | null;
  investor_id: string | null;
  basis_type: string;
  rate_bps: number;
  accrual_amount: number;
  currency: string;
  status: 'accrued' | 'invoiced' | 'paid';
  invoice_id: string | null;
  paid_at: string | null;
  created_at: string;
  base_amount: number;
  payment_due_date: string | null;
  payment_reference: string | null;
  notes: string | null;
  introducer?: {
    id: string;
    legal_name: string;
    contact_name: string;
    email: string;
  };
  deal?: {
    id: string;
    name: string;
  };
  investor?: {
    id: string;
    legal_name: string;
    display_name: string;
  };
}

interface CommissionGroup {
  introducer: {
    id: string;
    legal_name: string;
    contact_name: string;
    email: string;
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
  by_introducer: CommissionGroup[];
}

const statusColors = {
  accrued: 'secondary',
  invoiced: 'default',
  paid: 'default',
} as const;

const statusIcons = {
  accrued: Clock,
  invoiced: FileText,
  paid: CheckCircle,
};

export default function CommissionsTab() {
  const [data, setData] = useState<CommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accrued' | 'invoiced' | 'paid'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCommissions();
  }, [filter]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/staff/fees/commissions'
        : `/api/staff/fees/commissions?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInvoiced = async (commissionId: string) => {
    setActionLoading(commissionId);
    try {
      const res = await fetch(`/api/staff/fees/commissions/${commissionId}/mark-invoiced`, {
        method: 'POST',
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

  const handleMarkPaid = async (commissionId: string) => {
    const reference = prompt('Enter payment reference (optional):');

    setActionLoading(commissionId);
    try {
      const res = await fetch(`/api/staff/fees/commissions/${commissionId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_reference: reference }),
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
        <h2 className="text-2xl font-bold text-white">Introducer Commissions</h2>
        <p className="text-gray-400">Track and manage commission payments to deal introducers</p>
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
      <div className="flex gap-2">
        {(['all', 'accrued', 'invoiced', 'paid'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Commissions Grouped by Introducer */}
      {data.by_introducer.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-400">No commissions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.by_introducer.map((group) => (
            <Card key={group.introducer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      {group.introducer.legal_name}
                      <Link href={`/versotech/staff/introducers`}>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      {group.introducer.contact_name} • {group.introducer.email}
                    </p>
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
                                {commission.status}
                              </Badge>
                              {overdue && (
                                <Badge variant="destructive">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-white">
                              {commission.deal?.name || 'Direct commission'}
                            </p>
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
                              {commission.status === 'accrued' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkInvoiced(commission.id)}
                                  disabled={actionLoading === commission.id}
                                >
                                  {actionLoading === commission.id ? 'Processing...' : 'Mark Invoiced'}
                                </Button>
                              )}
                              {(commission.status === 'accrued' || commission.status === 'invoiced') && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleMarkPaid(commission.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
