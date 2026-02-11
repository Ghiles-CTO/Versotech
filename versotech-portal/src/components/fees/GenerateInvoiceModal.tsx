/**
 * Generate Invoice Modal
 * Form to create invoices from accrued fee events
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/fees/calculations';
import { formatCurrencyTotals, sumByCurrency } from '@/lib/currency-totals';

interface FeeEvent {
  id: string;
  fee_type: string;
  computed_amount: number;
  currency?: string;
  event_date: string;
  investor?: {
    id: string;
    legal_name: string;
    display_name: string;
  };
  deal?: {
    id: string;
    name: string;
  };
}

interface CustomLineItem {
  description: string;
  amount: number;
  quantity: number;
}

interface Subscription {
  id: string;
  subscription_number: string;
  commitment: number;
  currency?: string;
  vehicle?: {
    id: string;
    name: string;
    short_name?: string;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedInvestorId?: string; // If set, auto-select investor and fetch their fee events
}

export function GenerateInvoiceModal({ open, onClose, onSuccess, preselectedInvestorId }: Props) {
  const [loading, setLoading] = useState(false);
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [fetchingSubscriptions, setFetchingSubscriptions] = useState(false);

  // Form state
  const [investorId, setInvestorId] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [dealId, setDealId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [customLineItems, setCustomLineItems] = useState<CustomLineItem[]>([]);

  // Data state
  const [feeEvents, setFeeEvents] = useState<FeeEvent[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Set preselected investor on mount
  useEffect(() => {
    if (open && preselectedInvestorId) {
      console.log('[GenerateInvoiceModal] Preselected investor ID:', preselectedInvestorId, 'Type:', typeof preselectedInvestorId);

      // Validate the investor ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(preselectedInvestorId)) {
        console.log('[GenerateInvoiceModal] Valid UUID, setting investorId');
        setInvestorId(preselectedInvestorId);
      } else {
        console.error('[GenerateInvoiceModal] Invalid investor ID format:', preselectedInvestorId);
        alert(`Invalid investor ID format: ${preselectedInvestorId}`);
      }
    }
  }, [open, preselectedInvestorId]);

  const fetchInvestors = useCallback(async () => {
    try {
      console.log('[GenerateInvoiceModal] Fetching investors...');
      const res = await fetch('/api/investors?limit=1000');
      const json = await res.json();
      console.log('[GenerateInvoiceModal] Investors fetched:', json.data?.length || 0);
      setInvestors(json.data || []);
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  }, []);

  // Fetch investors on mount
  useEffect(() => {
    if (open) {
      fetchInvestors();
    }
  }, [open, fetchInvestors]);

  const fetchSubscriptions = useCallback(async () => {
    if (!investorId) return;

    setFetchingSubscriptions(true);
    try {
      console.log('[GenerateInvoiceModal] Fetching ALL subscriptions for investor:', investorId);

      // Fetch ALL subscriptions for this investor (not just committed)
      const subsRes = await fetch(`/api/subscriptions?investor_id=${investorId}`);
      const subsJson = await subsRes.json();
      const allSubs = subsJson.data || [];

      console.log('[GenerateInvoiceModal] All subscriptions fetched:', allSubs.length);

      // Now fetch fee events to see which subs have fees
      const feeEventsRes = await fetch(`/api/staff/fees/events?status=accrued&investor_id=${investorId}&limit=500`);
      const feeEventsJson = await feeEventsRes.json();

      if (!feeEventsRes.ok) {
        console.error('[GenerateInvoiceModal] Fee events API error:', feeEventsJson);
        setSubscriptions([]);
        setFetchingSubscriptions(false);
        return;
      }

      const allFeeEvents = feeEventsJson.data || [];

      console.log('[GenerateInvoiceModal] Fee events fetched:', allFeeEvents.length);
      console.log('[GenerateInvoiceModal] Sample fee event:', allFeeEvents[0]);

      // Get unique subscription IDs from fee events (check allocation_id)
      const subscriptionIdsWithFees = [...new Set(
        allFeeEvents
          .map((event: any) => event.allocation_id)
          .filter(Boolean)
      )];

      console.log('[GenerateInvoiceModal] Subscription IDs with fee events:', subscriptionIdsWithFees);

      // Filter subscriptions to only those with fee events
      const subsWithFees = allSubs.filter((sub: any) =>
        subscriptionIdsWithFees.includes(sub.id)
      );

      console.log('[GenerateInvoiceModal] Subscriptions that have fees:', subsWithFees.length);
      console.log('[GenerateInvoiceModal] Subscription details:', subsWithFees);

      setSubscriptions(subsWithFees);

      // If only one subscription, auto-select it
      if (subsWithFees.length === 1) {
        console.log('[GenerateInvoiceModal] Auto-selecting single subscription:', subsWithFees[0].id);
        setSubscriptionId(subsWithFees[0].id);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setFetchingSubscriptions(false);
    }
  }, [investorId]);

  const fetchFeeEvents = useCallback(async () => {
    if (!investorId || !subscriptionId) {
      console.log('[GenerateInvoiceModal] Missing investor or subscription ID, skipping fetch');
      return;
    }

    console.log('[GenerateInvoiceModal] Starting fetchFeeEvents with investorId:', investorId, 'subscriptionId:', subscriptionId);

    setFetchingEvents(true);
    try {
      const params = new URLSearchParams({
        status: 'accrued',
        investor_id: investorId,
        allocation_id: subscriptionId, // Filter by specific subscription
        limit: '100',
        offset: '0',
      });

      console.log('[GenerateInvoiceModal] Fetching fee events for investor:', investorId, 'subscription:', subscriptionId);
      console.log('[GenerateInvoiceModal] URL params:', params.toString());
      const res = await fetch(`/api/staff/fees/events?${params}`);
      const json = await res.json();
      console.log('[GenerateInvoiceModal] Fee events response:', json);

      // Check for API errors
      if (!res.ok || json.error) {
        console.error('[GenerateInvoiceModal] API error:', json.error || res.statusText);
        console.error('[GenerateInvoiceModal] Validation details:', JSON.stringify(json.details, null, 2));

        // Format validation errors for display
        let errorMessage = `Failed to load fee events: ${json.error || res.statusText}`;
        if (json.details && Array.isArray(json.details)) {
          errorMessage += '\n\nValidation errors:';
          json.details.forEach((issue: any) => {
            errorMessage += `\n- Field: ${issue.path?.join('.')}, Error: ${issue.message}`;
          });
        }

        alert(errorMessage);
        setFeeEvents([]);
        return;
      }

      setFeeEvents(json.data || []);
      console.log('[GenerateInvoiceModal] Set fee events count:', json.data?.length || 0);
    } catch (error) {
      console.error('Error fetching fee events:', error);
      alert(`Error loading fee events: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFeeEvents([]);
    } finally {
      setFetchingEvents(false);
    }
  }, [investorId, subscriptionId]);

  // Fetch subscriptions when investor changes
  useEffect(() => {
    if (investorId) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
      setSubscriptionId('');
    }
  }, [investorId, fetchSubscriptions]);

  // Fetch fee events when investor or subscription changes
  useEffect(() => {
    if (investorId && subscriptionId) {
      fetchFeeEvents();
    } else if (investorId && !subscriptionId) {
      // Clear fee events when no subscription selected
      setFeeEvents([]);
    }
  }, [investorId, subscriptionId, fetchFeeEvents]);

  const toggleEventSelection = (eventId: string) => {
    const newSelection = new Set(selectedEventIds);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEventIds(newSelection);
  };

  const addCustomLineItem = () => {
    setCustomLineItems([
      ...customLineItems,
      { description: '', amount: 0, quantity: 1 },
    ]);
  };

  const removeCustomLineItem = (index: number) => {
    setCustomLineItems(customLineItems.filter((_, i) => i !== index));
  };

  const updateCustomLineItem = (index: number, field: keyof CustomLineItem, value: any) => {
    const updated = [...customLineItems];
    updated[index] = { ...updated[index], [field]: value };
    setCustomLineItems(updated);
  };

  const calculateTotal = () => {
    const eventsTotal = feeEvents
      .filter((event) => selectedEventIds.has(event.id))
      .reduce((sum, event) => sum + Number(event.computed_amount), 0);

    const customTotal = customLineItems.reduce(
      (sum, item) => sum + (item.amount * item.quantity),
      0
    );

    return eventsTotal + customTotal;
  };

  const handleSubmit = async () => {
    console.log('[GenerateInvoiceModal] handleSubmit called');
    console.log('[GenerateInvoiceModal] Current state:', {
      investorId,
      selectedEventIds: Array.from(selectedEventIds),
      dueDate,
      notes,
      customLineItems,
    });

    if (!investorId || !subscriptionId || selectedEventIds.size === 0 || !dueDate) {
      alert('Please select an investor, subscription, at least one fee event, and a due date');
      return;
    }

    setLoading(true);
    try {
      // Format due date as ISO string with time at end of day
      const formattedDueDate = dueDate ? new Date(dueDate + 'T23:59:59').toISOString() : '';

      const requestBody = {
        investor_id: investorId,
        deal_id: dealId || undefined,
        fee_event_ids: Array.from(selectedEventIds),
        due_date: formattedDueDate,
        notes: notes || undefined,
        custom_line_items: customLineItems.length > 0 ? customLineItems : undefined,
      };

      console.log('[GenerateInvoiceModal] Request body created:', requestBody);
      console.log('[GenerateInvoiceModal] Sending request to /api/staff/fees/invoices/generate-simple');

      // Use simplified endpoint
      const res = await fetch('/api/staff/fees/invoices/generate-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('[GenerateInvoiceModal] Invoice generation failed:', error);
        console.error('[GenerateInvoiceModal] Request body was:', {
          investor_id: investorId,
          deal_id: dealId || undefined,
          fee_event_ids: Array.from(selectedEventIds),
          due_date: dueDate,
          notes,
          custom_line_items: customLineItems.length > 0 ? customLineItems : undefined,
        });
        throw new Error(error.error || error.details ? JSON.stringify(error.details, null, 2) : 'Failed to generate invoice');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInvestorId('');
    setSubscriptionId('');
    setDealId('');
    setDueDate('');
    setNotes('');
    setSelectedEventIds(new Set());
    setCustomLineItems([]);
    setFeeEvents([]);
    setSubscriptions([]);
    onClose();
  };

  const total = calculateTotal();
  const selectedSubscription = subscriptions.find((subscription) => subscription.id === subscriptionId);
  const selectedEventTotalsByCurrency = sumByCurrency(
    feeEvents.filter((event) => selectedEventIds.has(event.id)),
    (event) => Number(event.computed_amount),
    (event) => event.currency || selectedSubscription?.currency
  );
  const customLineItemsTotal = customLineItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.quantity) || 0),
    0
  );
  const totalByCurrency = { ...selectedEventTotalsByCurrency };
  const selectedCurrencyCode = (selectedSubscription?.currency || '').trim().toUpperCase();
  if (customLineItemsTotal !== 0 && selectedCurrencyCode) {
    totalByCurrency[selectedCurrencyCode] = (totalByCurrency[selectedCurrencyCode] || 0) + customLineItemsTotal;
  }

  const formatAmount = (amount: number, currency?: string | null) => {
    const code = (currency || '').trim().toUpperCase();
    if (!code) return amount.toLocaleString();
    return formatCurrency(amount, code);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Investor Selection or Display */}
          {preselectedInvestorId ? (
            // Show the preselected investor as read-only
            <div>
              <Label className="text-white">Investor</Label>
              <div className="flex items-center gap-2 p-2 border border-white/20 rounded-md bg-black/20">
                <span className="text-sm font-medium text-white">
                  {investors.find(i => i.id === investorId)?.legal_name ||
                   investors.find(i => i.id === investorId)?.display_name ||
                   feeEvents[0]?.investor?.legal_name ||
                   feeEvents[0]?.investor?.display_name ||
                   'Loading...'}
                </span>
                <Badge variant="outline" className="ml-auto text-white border-white/20">Pre-selected</Badge>
              </div>
            </div>
          ) : (
            // Show investor selector only when not preselected
            <div>
              <Label htmlFor="investor" className="text-white">Investor *</Label>
              <Select value={investorId} onValueChange={setInvestorId}>
                <SelectTrigger id="investor">
                  <SelectValue placeholder="Select investor" />
                </SelectTrigger>
                <SelectContent>
                  {investors.map((investor) => (
                    <SelectItem key={investor.id} value={investor.id}>
                      {investor.legal_name || investor.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subscription Selection - shows after investor is selected */}
          {investorId && (
            <div>
              <Label htmlFor="subscription" className="text-white">Subscription *</Label>
              {fetchingSubscriptions ? (
                <div className="flex items-center justify-center p-2 border border-white/20 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading subscriptions...</span>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="p-2 border border-red-500/30 rounded-md bg-red-500/10">
                  <p className="text-sm text-red-300 font-medium">No subscriptions with accrued fees found</p>
                  <p className="text-xs text-red-400 mt-1">
                    This investor has no uninvoiced fee events. Fee events may not have been calculated yet, or all fees have already been invoiced.
                  </p>
                </div>
              ) : (
                <Select value={subscriptionId} onValueChange={setSubscriptionId}>
                  <SelectTrigger id="subscription">
                    <SelectValue placeholder="Select subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions.map((subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id}>
                        {subscription.subscription_number} - {subscription.vehicle?.name || 'Unknown Vehicle'}
                        ({formatAmount(subscription.commitment, subscription.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Due Date */}
          <div>
            <Label htmlFor="due_date" className="text-white">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Fee Events Selection - shows after subscription is selected */}
          {investorId && subscriptionId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white">Fee Events to Invoice *</Label>
                {feeEvents.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedEventIds.size === feeEvents.length) {
                        // Deselect all
                        setSelectedEventIds(new Set());
                      } else {
                        // Select all
                        setSelectedEventIds(new Set(feeEvents.map(e => e.id)));
                      }
                    }}
                  >
                    {selectedEventIds.size === feeEvents.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
              {fetchingEvents ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Loading fee events...
                </div>
              ) : feeEvents.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No accrued fee events found for this investor
                </div>
              ) : (
                <div className="mt-2 space-y-2 border border-border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {feeEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 hover:bg-accent/10 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedEventIds.has(event.id)}
                          onCheckedChange={() => toggleEventSelection(event.id)}
                        />
                        <div>
                          <div className="font-medium text-white">
                            <Badge variant="outline" className="mr-2 text-white border-white/20">
                              {event.fee_type === 'flat' ? 'Investment' : event.fee_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-white">{formatAmount(event.computed_amount, event.currency || selectedSubscription?.currency)}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(event.event_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                            {event.deal && ` • ${event.deal.name}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">Custom Line Items (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomLineItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
            </div>
            {customLineItems.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateCustomLineItem(index, 'description', e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateCustomLineItem(index, 'quantity', parseFloat(e.target.value))
                  }
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) =>
                    updateCustomLineItem(index, 'amount', parseFloat(e.target.value))
                  }
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomLineItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes for the invoice"
              rows={3}
            />
          </div>

          {/* Total Preview */}
          {selectedEventIds.size > 0 && (
            <div className="bg-accent p-4 rounded-lg">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>
                  {Object.keys(totalByCurrency).length > 0
                    ? formatCurrencyTotals(totalByCurrency)
                    : total.toLocaleString()}
                  {customLineItemsTotal !== 0 && !selectedCurrencyCode ? ` + ${customLineItemsTotal.toLocaleString()} custom` : ''}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedEventIds.size} fee event(s)
                {customLineItems.length > 0 && ` + ${customLineItems.length} custom item(s)`}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || selectedEventIds.size === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
