/**
 * Term Sheet Selector Component
 *
 * Allows selection of a published term sheet for a deal.
 * Fee models must be derived from term sheets per business requirements.
 */

'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

export interface TermSheet {
  id: string;
  deal_id: string;
  version: number;
  status: string;
  term_sheet_date: string | null;
  subscription_fee_percent: number | null;
  management_fee_percent: number | null;
  carried_interest_percent: number | null;
  published_at: string | null;
}

interface TermSheetSelectorProps {
  dealId: string | undefined;
  value?: string;
  onChange: (termSheetId: string | undefined, termSheet: TermSheet | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export function TermSheetSelector({
  dealId,
  value,
  onChange,
  required = true,
  disabled = false,
}: TermSheetSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [termSheets, setTermSheets] = useState<TermSheet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dealId) {
      loadTermSheets(dealId);
    } else {
      setTermSheets([]);
      onChange(undefined, null);
    }
  }, [dealId]);

  const loadTermSheets = async (dId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${dId}/fee-structures?status=published`);
      if (!res.ok) {
        throw new Error('Failed to load term sheets');
      }
      const json = await res.json();
      const sheets = json.term_sheets || [];
      setTermSheets(sheets);

      // If current value is not in the list, clear it
      if (value && !sheets.find((ts: TermSheet) => ts.id === value)) {
        onChange(undefined, null);
      }
    } catch (err) {
      console.error('Error loading term sheets:', err);
      setError('Failed to load term sheets');
      setTermSheets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (termSheetId: string) => {
    if (termSheetId === 'none') {
      onChange(undefined, null);
    } else {
      const selected = termSheets.find(ts => ts.id === termSheetId);
      onChange(termSheetId, selected || null);
    }
  };

  const formatFeePercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return `${value}%`;
  };

  const selectedTermSheet = termSheets.find(ts => ts.id === value);

  if (!dealId) {
    return (
      <div className="space-y-2">
        <Label className="text-foreground font-medium">
          Term Sheet {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </Label>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-500/10 p-3 rounded border border-amber-500/30">
          <AlertCircle className="h-4 w-4" />
          <span>Select a deal first to see available term sheets</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">
        Term Sheet {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </Label>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground h-11 px-3 border border-border rounded-md bg-muted/50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading term sheets...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : termSheets.length === 0 ? (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-500/10 p-3 rounded border border-amber-500/30">
          <AlertCircle className="h-4 w-4" />
          <span>No published term sheets available for this deal. Create and publish a term sheet first.</span>
        </div>
      ) : (
        <>
          <Select
            value={value || 'none'}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className="bg-muted/50 border-border text-foreground h-11">
              <SelectValue placeholder="Select a term sheet" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {!required && (
                <SelectItem value="none">No term sheet</SelectItem>
              )}
              {termSheets.map((ts) => (
                <SelectItem key={ts.id} value={ts.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Version {ts.version}</span>
                    {ts.term_sheet_date && (
                      <span className="text-muted-foreground text-xs">
                        ({new Date(ts.term_sheet_date).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Show fee summary when a term sheet is selected */}
          {selectedTermSheet && (
            <div className="bg-muted/50 border border-border rounded-md p-3 mt-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Term Sheet Fee Limits:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600 dark:text-blue-400">
                  Subscription: {formatFeePercent(selectedTermSheet.subscription_fee_percent)}
                </Badge>
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 dark:text-green-400">
                  Management: {formatFeePercent(selectedTermSheet.management_fee_percent)}
                </Badge>
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
                  Performance: {formatFeePercent(selectedTermSheet.carried_interest_percent)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Fee model values must not exceed these limits.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
