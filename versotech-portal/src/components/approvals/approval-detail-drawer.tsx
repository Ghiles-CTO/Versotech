'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  FileText,
  ExternalLink,
  TrendingUp,
  Info,
  MessageCircle
} from 'lucide-react'
import { Approval } from '@/types/approvals'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ApprovalDetailDrawerProps {
  approval: Approval | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove?: (approvalId: string) => Promise<void>
  onReject?: (approvalId: string, reason: string) => Promise<void>
}

const statusColors = {
  pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
  awaiting_info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  escalated: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
  cancelled: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300'
}

const entityTypeLabels: Record<string, string> = {
  deal_interest: 'Data Room Access Request',
  deal_subscription: 'Subscription',
  deal_close: 'Deal Close',
  allocation: 'Allocation',
  withdrawal: 'Withdrawal',
  kyc_change: 'KYC Change',
  profile_update: 'Profile Update',
  fee_override: 'Fee Override',
  document_access: 'Document Access',
  permission_grant: 'Permission Grant'
}

export function ApprovalDetailDrawer({
  approval,
  open,
  onOpenChange,
  onApprove,
  onReject
}: ApprovalDetailDrawerProps) {
  const router = useRouter()
  const [slaProgress, setSlaProgress] = useState(0)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  useEffect(() => {
    if (approval?.sla_breach_at) {
      const now = new Date().getTime()
      const created = new Date(approval.created_at).getTime()
      const breach = new Date(approval.sla_breach_at).getTime()
      const total = breach - created
      const elapsed = now - created
      const progress = Math.min(100, Math.max(0, (elapsed / total) * 100))
      setSlaProgress(progress)
    }
  }, [approval])

  if (!approval) return null

  const handleApprove = async () => {
    if (!onApprove) return
    setIsApproving(true)
    try {
      await onApprove(approval.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Approval failed:', error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    const reason = prompt('Please provide a rejection reason:')
    if (!reason) return

    setIsRejecting(true)
    try {
      await onReject(approval.id, reason)
      onOpenChange(false)
    } catch (error) {
      console.error('Rejection failed:', error)
    } finally {
      setIsRejecting(false)
    }
  }

  const handleMessageInvestor = async () => {
    if (!approval.requested_by_profile?.id) {
      toast.error('Cannot message investor', {
        description: 'Investor profile not found'
      })
      return
    }

    setIsCreatingConversation(true)
    try {
      // Create conversation with the investor about this approval
      const dealName = approval.related_deal?.name || 'Deal'
      const approvalType = entityTypeLabels[approval.entity_type] || approval.entity_type
      const subject = `${approvalType} - ${dealName}`

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          participant_ids: [approval.requested_by_profile.id],
          type: 'dm',
          visibility: 'investor',
          initial_message: `Regarding your ${approvalType.toLowerCase()} for ${dealName}.`,
          metadata: {
            approval_id: approval.id,
            entity_type: approval.entity_type,
            deal_id: approval.related_deal?.id
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create conversation')
      }

      const data = await response.json()

      toast.success('Conversation created', {
        description: `Opening conversation with ${approval.requested_by_profile.display_name || 'investor'}`
      })

      // Navigate to the conversation
      router.push(`/versotech_main/messages?conversation=${data.conversation.id}`)
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const slaBreachDate = approval.sla_breach_at ? new Date(approval.sla_breach_at) : null
  const isOverdue = slaBreachDate && slaBreachDate < new Date()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm text-foreground border-border">
                  {entityTypeLabels[approval.entity_type] || approval.entity_type}
                </Badge>
                <Badge className={statusColors[approval.status]}>
                  {approval.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <SheetTitle className="text-2xl text-foreground">
                {approval.related_deal?.name || approval.related_investor?.legal_name || 'Approval Details'}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Requested {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })} by{' '}
                {approval.requested_by_profile?.display_name || 'Unknown'}
              </SheetDescription>
            </div>
          </div>

          {/* SLA Countdown */}
          {slaBreachDate && (
            <Card className="border-border bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <Clock className="h-4 w-4" />
                      SLA Deadline
                    </span>
                    <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-foreground'}>
                      {isOverdue ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {formatDistanceToNow(slaBreachDate)} overdue
                        </span>
                      ) : (
                        format(slaBreachDate, 'MMM dd, yyyy HH:mm')
                      )}
                    </span>
                  </div>
                  <Progress value={slaProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            {approval.status === 'pending' && (onApprove || onReject) && (
              <div className="flex gap-2">
                {onApprove && (
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isApproving ? 'Approving...' : 'Approve'}
                  </Button>
                )}
                {onReject && (
                  <Button
                    onClick={handleReject}
                    disabled={isRejecting}
                    variant="destructive"
                    className="flex-1 text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isRejecting ? 'Rejecting...' : 'Reject'}
                  </Button>
                )}
              </div>
            )}

            {/* Message Investor Button */}
            {approval.requested_by_profile && (
              <Button
                onClick={handleMessageInvestor}
                disabled={isCreatingConversation}
                variant="outline"
                className="w-full border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {isCreatingConversation
                  ? 'Creating conversation...'
                  : `Message ${approval.requested_by_profile.display_name || 'Investor'}`}
              </Button>
            )}
          </div>
        </SheetHeader>

        <Separator className="my-6" />

        <Tabs defaultValue="overview" className="w-full" id={`approval-tabs-${approval?.id || 'new'}`}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="metadata">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            {/* Deal Information */}
            {approval.related_deal && (
              <Card className="border-border bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <Building2 className="h-5 w-5" />
                    Deal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Deal Name</p>
                      <Link
                        href={`/versotech_main/deals/${approval.related_deal.id}`}
                        className="font-medium text-foreground hover:underline flex items-center gap-1"
                      >
                        {approval.related_deal.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium text-foreground capitalize">{approval.related_deal.status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deal Type</p>
                      <p className="font-medium text-foreground capitalize">{approval.related_deal.deal_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium text-foreground">{(approval.related_deal as any).currency || 'USD'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investor Information */}
            {approval.related_investor && (
              <Card className="border-border bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <User className="h-5 w-5" />
                    Investor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Legal Name</p>
                      <p className="font-medium text-foreground">{approval.related_investor.legal_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">KYC Status</p>
                      <Badge variant="outline" className="text-foreground border-border">
                        {approval.related_investor.kyc_status || 'Unknown'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground capitalize">{(approval.related_investor as any).type || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Counterparty Entity Information (for entity subscriptions) */}
            {approval.entity_type === 'deal_subscription' &&
              approval.entity_metadata?.subscription_type === 'entity' &&
              approval.entity_metadata?.counterparty_entity && (
              <Card className="border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    Subscribing Entity
                  </CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-300">
                    This subscription is being made through a counterparty entity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entity Legal Name</p>
                      <p className="font-medium text-foreground">{approval.entity_metadata.counterparty_entity.legal_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entity Type</p>
                      <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-400/30">
                        {approval.entity_metadata.counterparty_entity.entity_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    {approval.entity_metadata.counterparty_entity.jurisdiction && (
                      <div>
                        <p className="text-sm text-muted-foreground">Jurisdiction</p>
                        <p className="font-medium text-foreground">{approval.entity_metadata.counterparty_entity.jurisdiction}</p>
                      </div>
                    )}
                    {approval.entity_metadata.counterparty_entity.registration_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Registration Number</p>
                        <p className="font-medium text-foreground">{approval.entity_metadata.counterparty_entity.registration_number}</p>
                      </div>
                    )}
                    {approval.entity_metadata.counterparty_entity.tax_id && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tax ID</p>
                        <p className="font-mono text-sm text-foreground">{approval.entity_metadata.counterparty_entity.tax_id}</p>
                      </div>
                    )}
                    {approval.entity_metadata.counterparty_entity.representative_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Authorized Representative</p>
                        <p className="font-medium text-foreground">
                          {approval.entity_metadata.counterparty_entity.representative_name}
                          {approval.entity_metadata.counterparty_entity.representative_title && (
                            <span className="text-muted-foreground text-sm ml-1">
                              ({approval.entity_metadata.counterparty_entity.representative_title})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Entity KYC Status */}
                  {approval.entity_metadata.counterparty_entity.kyc_status && (
                    <div className="col-span-2 mt-2 p-3 rounded-lg bg-muted border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Entity KYC Status</p>
                          <Badge
                            variant={
                              approval.entity_metadata.counterparty_entity.kyc_status === 'approved'
                                ? 'default'
                                : approval.entity_metadata.counterparty_entity.kyc_status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className={
                              approval.entity_metadata.counterparty_entity.kyc_status === 'approved'
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                                : approval.entity_metadata.counterparty_entity.kyc_status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                            }
                          >
                            {approval.entity_metadata.counterparty_entity.kyc_status.toUpperCase()}
                          </Badge>
                        </div>
                        {approval.entity_metadata.counterparty_entity.kyc_completed_at && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-sm text-foreground">
                              {new Date(approval.entity_metadata.counterparty_entity.kyc_completed_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                      {approval.entity_metadata.counterparty_entity.kyc_expiry_date && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(approval.entity_metadata.counterparty_entity.kyc_expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {approval.entity_metadata.counterparty_entity.kyc_notes && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">{approval.entity_metadata.counterparty_entity.kyc_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {approval.entity_metadata.counterparty_entity.registered_address && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Registered Address</p>
                      <div className="text-sm text-foreground">
                        {approval.entity_metadata.counterparty_entity.registered_address.street && (
                          <p>{approval.entity_metadata.counterparty_entity.registered_address.street}</p>
                        )}
                        <p>
                          {[
                            approval.entity_metadata.counterparty_entity.registered_address.city,
                            approval.entity_metadata.counterparty_entity.registered_address.state,
                            approval.entity_metadata.counterparty_entity.registered_address.postal_code
                          ].filter(Boolean).join(', ')}
                        </p>
                        {approval.entity_metadata.counterparty_entity.registered_address.country && (
                          <p>{approval.entity_metadata.counterparty_entity.registered_address.country}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> The investor ({approval.related_investor?.legal_name}) is investing on behalf of this entity. Subscription documents will be prepared in the entity's name.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Request Details */}
            <Card className="border-border bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="font-medium text-foreground">
                      {approval.assigned_to_profile?.display_name || 'Unassigned'}
                    </p>
                    {approval.assigned_to_profile?.email && (
                      <p className="text-xs text-muted-foreground">{approval.assigned_to_profile.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested By</p>
                    <p className="font-medium text-foreground">
                      {approval.requested_by_profile?.display_name || 'Unknown'}
                    </p>
                    {approval.requested_by_profile?.email && (
                      <p className="text-xs text-muted-foreground">{approval.requested_by_profile.email}</p>
                    )}
                  </div>
                </div>

                {/* Subscription Amount (only for deal_subscription approvals) */}
                {approval.entity_type === 'deal_subscription' && approval.entity_metadata?.derived_amount && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Amount</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {approval.entity_metadata.payload?.currency || 'USD'}{' '}
                      {approval.entity_metadata.derived_amount.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Fallback for other approval types with indicative_amount */}
                {approval.entity_type !== 'deal_subscription' && approval.entity_metadata?.indicative_amount && (
                  <div>
                    <p className="text-sm text-muted-foreground">Indicative Amount</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {approval.entity_metadata.indicative_currency || 'USD'}{' '}
                      {approval.entity_metadata.indicative_amount.toLocaleString()}
                    </p>
                  </div>
                )}

                {approval.entity_metadata?.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <div className="p-3 rounded-lg bg-muted border border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{approval.entity_metadata.notes}</p>
                    </div>
                  </div>
                )}

                {approval.request_reason && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Request Reason</p>
                    <div className="p-3 rounded-lg bg-muted border border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{approval.request_reason}</p>
                    </div>
                  </div>
                )}

                {approval.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Staff Notes</p>
                    <div className="p-3 rounded-lg bg-muted border border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{approval.notes}</p>
                    </div>
                  </div>
                )}

                {approval.rejection_reason && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Rejection Reason</p>
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
                      <p className="text-sm whitespace-pre-wrap text-rose-700 dark:text-rose-300">{approval.rejection_reason}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Decision */}
            {approval.approved_by_profile && (
              <Card className="border-border bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5" />
                    Decision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Decided By</p>
                      <p className="font-medium text-foreground">{approval.approved_by_profile.display_name}</p>
                      <p className="text-xs text-muted-foreground">{approval.approved_by_profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Decided At</p>
                      <p className="font-medium text-foreground">
                        {approval.approved_at && format(new Date(approval.approved_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entity ID Reference */}
            <Card className="border-border bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Info className="h-5 w-5" />
                  Reference Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Approval ID</p>
                    <p className="font-mono text-xs text-foreground">{approval.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entity ID</p>
                    <p className="font-mono text-xs text-foreground">{approval.entity_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-6">
            <Card className="border-border bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5" />
                  Approval Timeline
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete event history for this approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalTimeline approval={approval} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4 mt-6">
            {/* Entity Metadata */}
            {approval.entity_metadata && Object.keys(approval.entity_metadata).length > 0 && (
              <Card className="border-border bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Entity Metadata</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Complete data payload for this approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-lg bg-muted dark:bg-black/30 border border-border overflow-x-auto text-xs text-foreground">
                    {JSON.stringify(approval.entity_metadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <Card className="border-border bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created At</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(approval.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                  {approval.updated_at && (
                    <div>
                      <p className="text-muted-foreground">Updated At</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(approval.updated_at), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  )}
                  {approval.approved_at && (
                    <div>
                      <p className="text-muted-foreground">Approved/Rejected At</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(approval.approved_at), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  )}
                  {approval.resolved_at && (
                    <div>
                      <p className="text-muted-foreground">Resolved At</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(approval.resolved_at), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  )}
                  {approval.sla_breach_at && (
                    <div>
                      <p className="text-muted-foreground">SLA Deadline</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(approval.sla_breach_at), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Full Approval Object (for debugging/admin) */}
            <Card className="border-border bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Complete Approval Record</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Full approval object (all fields)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted dark:bg-black/30 border border-border overflow-x-auto text-xs text-foreground max-h-96 overflow-y-auto">
                  {JSON.stringify(approval, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

// Approval Timeline Component - Accurate for all approval stages
function ApprovalTimeline({ approval }: { approval: Approval }) {
  const events = []

  // 1. Approval Created/Requested
  events.push({
    label: 'Approval Requested',
    date: new Date(approval.created_at),
    completed: true,
    current: false,
    icon: FileText,
    description: `Requested by ${approval.requested_by_profile?.display_name || 'Unknown'}`
  })

  // 2. Assignment (if assigned)
  if (approval.assigned_to_profile) {
    events.push({
      label: 'Assigned for Review',
      date: new Date(approval.created_at),
      completed: true,
      current: false,
      icon: User,
      description: `Assigned to ${approval.assigned_to_profile.display_name}`
    })
  }

  // 3. Current state based on status
  const now = new Date()

  if (approval.status === 'pending') {
    // Still pending review
    events.push({
      label: 'Under Review',
      date: null,
      completed: false,
      current: true,
      icon: Clock,
      description: approval.sla_breach_at
        ? `SLA deadline: ${format(new Date(approval.sla_breach_at), 'MMM dd, HH:mm')}`
        : 'Awaiting decision'
    })
  } else if (approval.status === 'approved') {
    // Approved
    events.push({
      label: 'Approved',
      date: approval.approved_at ? new Date(approval.approved_at) : null,
      completed: true,
      current: !approval.resolved_at,
      icon: CheckCircle2,
      description: approval.approved_by_profile?.display_name
        ? `Approved by ${approval.approved_by_profile.display_name}`
        : 'Approval granted'
    })
  } else if (approval.status === 'rejected') {
    // Rejected
    events.push({
      label: 'Rejected',
      date: approval.approved_at ? new Date(approval.approved_at) : null,
      completed: true,
      current: !approval.resolved_at,
      icon: XCircle,
      description: approval.approved_by_profile?.display_name
        ? `Rejected by ${approval.approved_by_profile.display_name}`
        : 'Approval denied'
    })

    // Show rejection reason if available
    if (approval.rejection_reason) {
      events.push({
        label: 'Rejection Reason',
        date: null,
        completed: true,
        current: false,
        icon: Info,
        description: approval.rejection_reason
      })
    }
  } else if (approval.status === 'awaiting_info') {
    // Awaiting additional information
    events.push({
      label: 'Awaiting Information',
      date: approval.updated_at ? new Date(approval.updated_at) : null,
      completed: false,
      current: true,
      icon: AlertTriangle,
      description: 'Additional information requested'
    })
  } else if (approval.status === 'escalated') {
    // Escalated
    events.push({
      label: 'Escalated',
      date: approval.updated_at ? new Date(approval.updated_at) : null,
      completed: true,
      current: !approval.resolved_at,
      icon: AlertTriangle,
      description: 'Escalated to higher authority'
    })
  } else if (approval.status === 'cancelled') {
    // Cancelled
    events.push({
      label: 'Cancelled',
      date: approval.updated_at ? new Date(approval.updated_at) : null,
      completed: true,
      current: false,
      icon: XCircle,
      description: 'Approval request cancelled'
    })
  }

  // 4. Resolution (if resolved)
  if (approval.resolved_at) {
    events.push({
      label: 'Workflow Completed',
      date: new Date(approval.resolved_at),
      completed: true,
      current: false,
      icon: CheckCircle2,
      description: 'Approval workflow finalized'
    })
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = event.icon
        return (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${
                  event.completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : event.current
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {index < events.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${event.completed ? 'bg-emerald-500/30' : 'bg-border'}`}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <p className={`font-medium ${event.current ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                {event.label}
              </p>
              {event.date && (
                <p className="text-sm text-muted-foreground">{format(event.date, 'MMM dd, yyyy HH:mm')}</p>
              )}
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
