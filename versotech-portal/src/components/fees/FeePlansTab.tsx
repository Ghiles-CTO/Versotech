/**
 * Fee Plans Tab - List and manage fee structures
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Copy, FileText, Building2, Trash2, Users, Briefcase, FileCheck, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { FeePlanWithComponents } from '@/lib/fees/types';
import { formatBps } from '@/lib/fees/calculations';
import FeePlanEditModal from './FeePlanEditModal';

interface FeePlanWithDeal extends FeePlanWithComponents {
  deal?: {
    id: string;
    name: string;
  };
  term_sheet?: {
    id: string;
    version: number;
    status: string;
    subscription_fee_percent?: number | null;
    management_fee_percent?: number | null;
    carried_interest_percent?: number | null;
  } | null;
  introducer?: {
    id: string;
    legal_name: string;
  } | null;
  partner?: {
    id: string;
    name: string;
  } | null;
  commercial_partner?: {
    id: string;
    name: string;
  } | null;
  subscription_count?: number;
}

// Map fee component kinds to term sheet fields
const componentToTermSheetField: Record<string, 'subscription_fee_percent' | 'management_fee_percent' | 'carried_interest_percent'> = {
  subscription: 'subscription_fee_percent',
  management: 'management_fee_percent',
  performance: 'carried_interest_percent',
  carried_interest: 'carried_interest_percent',
};

// Check if a fee component exceeds term sheet limits
function getComponentValidation(
  component: { kind: string; rate_bps?: number | null },
  termSheet?: FeePlanWithDeal['term_sheet']
): { isValid: boolean; message?: string; termSheetLimit?: number } {
  if (!termSheet || !component.rate_bps) {
    return { isValid: true };
  }

  const fieldName = componentToTermSheetField[component.kind];
  if (!fieldName) {
    return { isValid: true };
  }

  const termSheetLimit = termSheet[fieldName];
  if (termSheetLimit === null || termSheetLimit === undefined) {
    return { isValid: true };
  }

  // Convert rate_bps to percent (100 bps = 1%)
  const componentPercent = component.rate_bps / 100;

  if (componentPercent > termSheetLimit) {
    return {
      isValid: false,
      message: `Exceeds term sheet limit (${termSheetLimit}%)`,
      termSheetLimit,
    };
  }

  return { isValid: true, termSheetLimit };
}

const feePlanStatusStyles: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400',
  sent: 'bg-blue-500/20 text-blue-400',
  pending_signature: 'bg-purple-500/20 text-purple-400',
  accepted: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

interface FeePlansTabProps {
  dealId?: string;
}

export default function FeePlansTab({ dealId }: FeePlansTabProps) {
  const [plans, setPlans] = useState<FeePlanWithDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FeePlanWithDeal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<FeePlanWithDeal | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [planToDuplicate, setPlanToDuplicate] = useState<FeePlanWithDeal | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [dealId]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      // Build API URL with deal filter if provided
      const plansUrl = dealId
        ? `/api/staff/fees/plans?include_components=true&deal_id=${dealId}`
        : '/api/staff/fees/plans?include_components=true';

      // Fetch plans and deals in parallel
      const [plansRes, dealsRes] = await Promise.all([
        fetch(plansUrl),
        fetch('/api/deals')
      ]);

      const [plansJson, dealsJson] = await Promise.all([
        plansRes.json(),
        dealsRes.json()
      ]);

      let plans = plansJson.data || [];
      const allDeals = dealsJson.deals || [];
      const dealsMap = new Map(allDeals.map((d: any) => [d.id, d]));

      // Filter plans by deal_id on client side as fallback (if API doesn't support filtering)
      if (dealId) {
        plans = plans.filter((plan: any) => plan.deal_id === dealId);
      }

      // Map deals to plans
      const plansWithDeals = plans.map((plan: any) => ({
        ...plan,
        deal: plan.deal_id ? dealsMap.get(plan.deal_id) : undefined,
      }));

      setPlans(plansWithDeals);
    } catch (error) {
      console.error('Error fetching fee plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateClick = (plan: FeePlanWithDeal) => {
    setPlanToDuplicate(plan);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    if (!planToDuplicate) return;

    try {
      const res = await fetch(`/api/staff/fees/plans/${planToDuplicate.id}/duplicate`, {
        method: 'POST',
      });
      if (res.ok) {
        const { data: duplicatedPlan } = await res.json();
        await fetchPlans();
        setDuplicateDialogOpen(false);
        setPlanToDuplicate(null);

        // Open edit modal for the new plan
        if (duplicatedPlan) {
          setSelectedPlan(duplicatedPlan);
          setEditModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error duplicating plan:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedPlan(null);
    setEditModalOpen(true);
  };

  const handleEdit = (plan: FeePlanWithDeal) => {
    setSelectedPlan(plan);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedPlan(null);
  };

  const handleModalSuccess = () => {
    fetchPlans();
    handleModalClose();
  };

  const handleDeleteClick = (plan: FeePlanWithDeal) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    try {
      const res = await fetch(`/api/staff/fees/plans/${planToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPlans();
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading fee plans...</div>;
  }

  // Show prompt if no deal is selected
  if (!dealId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Fee Plans</h2>
            <p className="text-gray-400">
              Manage fee structure templates for a specific deal
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Select a deal to view fee plans</h3>
            <p className="text-muted-foreground">
              Use the deal selector above to choose a deal and view its associated fee plans.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Fee Plans</h2>
          <p className="text-gray-400">
            Manage fee structure templates for this deal
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}>
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create Fee Plan
          </Button>
        </div>
      </div>

      {/* Explanation Card */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-blue-400">How Fee Plans Work:</strong> Fee plans are commercial agreements with introducers/partners.
            Each fee plan must be linked to a <strong>published term sheet</strong> and an <strong>entity</strong> (introducer, partner, or commercial partner).
            Fee values cannot exceed the limits set in the term sheet. When an entity accepts a fee plan, investors can be dispatched through them.
          </p>
        </CardContent>
      </Card>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-400 mb-4">No fee plans created yet</p>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Fee Plan
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Deal / Term Sheet</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Fee Components</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  const entity = plan.introducer || plan.partner || plan.commercial_partner;
                  const entityType = plan.introducer ? 'Introducer' : plan.partner ? 'Partner' : plan.commercial_partner ? 'Commercial Partner' : null;

                  return (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          {plan.description && (
                            <div className="text-sm text-muted-foreground">
                              {plan.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {plan.deal ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{plan.deal.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No deal linked</span>
                        )}
                        {plan.term_sheet ? (
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Term Sheet v{plan.term_sheet.version}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No term sheet</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entity ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {plan.introducer ? (
                              <Users className="h-4 w-4 text-blue-400" />
                            ) : plan.partner ? (
                              <Briefcase className="h-4 w-4 text-purple-400" />
                            ) : (
                              <Building2 className="h-4 w-4 text-green-400" />
                            )}
                            <span>{plan.introducer?.legal_name || plan.partner?.name || plan.commercial_partner?.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{entityType}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No entity</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-1">
                          {plan.components?.map((comp) => {
                            const validation = getComponentValidation(comp, plan.term_sheet);
                            return (
                              <Tooltip key={comp.id}>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${!validation.isValid ? 'border-red-500/50 bg-red-500/10' : ''}`}
                                  >
                                    {!validation.isValid && (
                                      <AlertTriangle className="h-3 w-3 mr-1 text-red-400" />
                                    )}
                                    {comp.kind}: {comp.rate_bps ? formatBps(comp.rate_bps) :
                                                  comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
                                  </Badge>
                                </TooltipTrigger>
                                {!validation.isValid && (
                                  <TooltipContent className="bg-red-900 border-red-700">
                                    <p className="text-red-200">{validation.message}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            );
                          })}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.term_sheet?.status && (
                          <Badge className={feePlanStatusStyles[plan.term_sheet.status] || 'bg-gray-500/20 text-gray-400'}>
                            {plan.term_sheet.status}
                          </Badge>
                        )}
                        {plan.is_active ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/10">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateClick(plan)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(plan)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {plan.is_default && (
                        <Badge variant="default" className="text-xs">Default</Badge>
                      )}
                      {plan.deal && (
                        <Badge variant="outline" className="text-xs">{plan.deal.name}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {plan.subscription_count || 0} subscription{plan.subscription_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicateClick(plan)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(plan)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {plan.description || 'No description'}
                </p>
                <TooltipProvider>
                  <div className="space-y-2">
                    {plan.components?.map((comp) => {
                      const validation = getComponentValidation(comp, plan.term_sheet);
                      return (
                        <div key={comp.id} className={`text-sm flex justify-between items-center ${!validation.isValid ? 'text-red-400' : ''}`}>
                          <span className="capitalize flex items-center gap-1">
                            {!validation.isValid && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-3 w-3 text-red-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-red-900 border-red-700">
                                  <p className="text-red-200">{validation.message}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {comp.kind}
                          </span>
                          <span className="font-medium">
                            {comp.rate_bps ? formatBps(comp.rate_bps) :
                             comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <FeePlanEditModal
        open={editModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        feePlan={selectedPlan}
      />

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Fee Plan?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Create a copy of <strong>{planToDuplicate?.name}</strong> with all fee components.
                </div>
                <div>
                  This is useful for:
                </div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Creating a similar plan for a new deal</li>
                  <li>Testing modifications without affecting the original</li>
                  <li>Creating variations for special investor terms</li>
                </ul>
                <div className="text-muted-foreground">
                  After duplication, you'll be able to immediately edit the new plan.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateConfirm}>
              Duplicate & Edit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Plan?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Are you sure you want to delete <strong>{planToDelete?.name}</strong>?
                </div>
                {planToDelete && planToDelete.subscription_count && planToDelete.subscription_count > 0 ? (
                  <div className="text-yellow-500">
                    ⚠️ This fee plan is used by {planToDelete.subscription_count} subscription
                    {planToDelete.subscription_count !== 1 ? 's' : ''}. Deleting it won't affect those
                    subscriptions, but you won't be able to apply this plan to new deals.
                  </div>
                ) : (
                  <div>This fee plan is not currently used by any subscriptions.</div>
                )}
                {planToDelete?.is_default && (
                  <div className="text-red-500">
                    ⚠️ This is the default fee plan for {planToDelete?.deal?.name || 'this deal'}.
                    You may want to set another plan as default before deleting this one.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
