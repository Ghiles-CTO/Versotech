/**
 * Invoices Tab - Manage invoices and payments
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, DollarSign, X, FileText, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import type { InvoiceWithLines } from '@/lib/fees/types';
import { formatCurrency } from '@/lib/fees/calculations';
import { GenerateInvoiceModal } from './GenerateInvoiceModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusColors = {
  draft: 'secondary',
  sent: 'default',
  paid: 'default',
  partially_paid: 'default',
  overdue: 'destructive',
  cancelled: 'secondary',
  disputed: 'destructive',
} as const;

interface FeeEvent {
  id: string;
  fee_type: string;
  computed_amount: number;
  event_date: string;
  status: string;
  allocation_id?: string;
  investor?: {
    id: string;
    legal_name: string;
    display_name: string;
  };
  deal?: {
    id: string;
    name: string;
  };
  subscription?: {
    id: string;
    subscription_number: string;
    commitment: number;
    vehicle?: {
      id: string;
      name: string;
      short_name?: string;
    };
  };
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<InvoiceWithLines[]>([]);
  const [feeEvents, setFeeEvents] = useState<FeeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | undefined>(undefined);
  const [backfillLoading, setBackfillLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const url = filter === 'all'
        ? '/api/staff/fees/invoices?limit=100&offset=0'
        : `/api/staff/fees/invoices?status=${filter}&limit=100&offset=0`;
      const res = await fetch(url);
      const json = await res.json();
      setInvoices(json.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  }, [filter]);

  const fetchFeeEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/fees/events?status=accrued&limit=100&offset=0');
      const json = await res.json();
      console.log('[InvoicesTab] Fee events fetched:', json.data?.length || 0, 'events');
      if (json.data?.length > 0) {
        console.log('[InvoicesTab] First fee event:', json.data[0]);
        console.log('[InvoicesTab] First investor data:', json.data[0]?.investor);
      }
      setFeeEvents(json.data || []);
    } catch (error) {
      console.error('Error fetching fee events:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchInvoices(), fetchFeeEvents()]);
    setLoading(false);
  }, [fetchInvoices, fetchFeeEvents]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/staff/fees/invoices/${invoiceId}/send`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        // Success - invoice was sent and status updated
        alert(data.message || 'Invoice sent successfully');
        fetchInvoices();
      } else {
        // Failed - show error message
        console.error('Error sending invoice:', data);
        alert(data.error + (data.details ? `\n\n${data.details}` : ''));
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const handleMarkPaid = async (invoiceId: string, amount: number) => {
    try {
      const res = await fetch(`/api/staff/fees/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid_amount: amount }),
      });
      if (res.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleBackfillFeeEvents = async () => {
    if (!confirm('This will calculate fee events for all existing committed subscriptions that don\'t have fee events yet. Continue?')) {
      return;
    }

    setBackfillLoading(true);
    try {
      const res = await fetch('/api/staff/fees/events/backfill', {
        method: 'POST',
      });

      const result = await res.json();

      if (res.ok) {
        alert(`Backfill complete!\n\nProcessed: ${result.results.processed}\nSkipped: ${result.results.skipped}\nFailed: ${result.results.failed}\nTotal Fee Events Created: ${result.results.created_events}`);
        fetchData(); // Refresh data
      } else {
        alert(`Backfill failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error running backfill:', error);
      alert('Failed to run backfill');
    } finally {
      setBackfillLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Group fee events by investor and then by subscription
  const feeEventsByInvestor = feeEvents.reduce((acc, event) => {
    const investorId = event.investor?.id || 'unknown';
    if (!acc[investorId]) {
      acc[investorId] = {
        investor: event.investor,
        subscriptions: {},
        total: 0,
      };
    }

    // Group by subscription within investor
    const subscriptionId = event.allocation_id || 'no-subscription';
    const subscriptionName = event.subscription
      ? `${event.subscription.subscription_number} - ${event.subscription.vehicle?.name || 'Unknown Vehicle'}`
      : 'Direct Fee';

    if (!acc[investorId].subscriptions[subscriptionId]) {
      acc[investorId].subscriptions[subscriptionId] = {
        subscription: event.subscription,
        name: subscriptionName,
        events: [],
        total: 0,
      };
    }

    acc[investorId].subscriptions[subscriptionId].events.push(event);
    acc[investorId].subscriptions[subscriptionId].total += Number(event.computed_amount);
    acc[investorId].total += Number(event.computed_amount);

    return acc;
  }, {} as Record<string, {
    investor: any;
    subscriptions: Record<string, {
      subscription: any;
      name: string;
      events: FeeEvent[];
      total: number;
    }>;
    total: number;
  }>);

  const totalUninvoiced = feeEvents.reduce((sum, e) => sum + Number(e.computed_amount), 0);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Invoices</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBackfillFeeEvents}
              disabled={backfillLoading}
            >
              {backfillLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Backfill Fee Events
            </Button>
            <Button onClick={() => setShowGenerateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </div>
        </div>

        <Tabs defaultValue="uninvoiced" className="w-full" id="invoices-tab-tabs">
          <TabsList>
            <TabsTrigger value="uninvoiced">
              Uninvoiced Fees
              {feeEvents.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {feeEvents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Uninvoiced Fee Events Tab */}
          <TabsContent value="uninvoiced" className="space-y-4">
            {feeEvents.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No uninvoiced fee events</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fee events are automatically created when subscriptions are committed
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Card */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Uninvoiced</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalUninvoiced)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Fee Events</p>
                        <p className="text-2xl font-bold">{feeEvents.length}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Investors</p>
                        <p className="text-2xl font-bold">
                          {Object.keys(feeEventsByInvestor).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Events Grouped by Investor and Subscription */}
                {Object.values(feeEventsByInvestor).map(({ investor, subscriptions, total }) => (
                  <Card key={investor?.id || 'unknown'}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {investor?.legal_name || investor?.display_name || 'Unknown Investor'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Object.keys(subscriptions).length} subscription(s) • {formatCurrency(total)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            console.log('[InvoicesTab] Invoice button clicked for investor:', investor);
                            console.log('[InvoicesTab] Investor ID:', investor?.id, 'Type:', typeof investor?.id);

                            // Only open modal if we have a valid investor ID
                            if (investor?.id && investor.id !== 'unknown') {
                              console.log('[InvoicesTab] Setting selectedInvestorId to:', investor.id);
                              setSelectedInvestorId(investor.id);
                              setShowGenerateModal(true);
                            } else {
                              alert('Cannot generate invoice: Investor information is missing');
                            }
                          }}
                          disabled={!investor?.id || investor.id === 'unknown'}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Invoice All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Group by Subscription */}
                        {Object.values(subscriptions).map((subGroup) => (
                          <div key={subGroup.name} className="border-l-2 border-primary/20 pl-4">
                            <div className="mb-2">
                              <p className="font-medium text-sm">
                                {subGroup.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {subGroup.events.length} fee(s) • {formatCurrency(subGroup.total)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {subGroup.events.map((event) => (
                                <div
                                  key={event.id}
                                  className="flex items-center justify-between p-2 bg-accent/50 rounded"
                                >
                                  <div>
                                    <div className="font-medium text-sm">
                                      <Badge variant="outline" className="mr-2 text-xs">
                                        {event.fee_type === 'flat' ? 'Investment' : event.fee_type.replace('_', ' ')}
                                      </Badge>
                                      {formatCurrency(event.computed_amount)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(event.event_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
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

            {/* Invoices List */}
            {invoices.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No invoices found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {invoice.investor?.display_name || 'Unknown Investor'}
                            {invoice.deal && ` • ${invoice.deal.name}`}
                          </p>
                        </div>
                        <Badge variant={statusColors[invoice.status]}>
                          {invoice.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">
                            {formatCurrency(invoice.total)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                            {invoice.balance_due && invoice.balance_due > 0 && (
                              <span className="ml-2">
                                • Balance: {formatCurrency(invoice.balance_due)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleSend(invoice.id)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send
                            </Button>
                          )}
                          {['sent', 'partially_paid', 'overdue'].includes(invoice.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(invoice.id, invoice.balance_due || invoice.total)}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Generate Invoice Modal */}
      <GenerateInvoiceModal
        open={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setSelectedInvestorId(undefined);
        }}
        onSuccess={() => fetchData()}
        preselectedInvestorId={selectedInvestorId}
      />
    </>
  );
}
