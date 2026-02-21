'use client'

import { useMemo } from 'react'
import { Approval } from '@/types/approvals'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  DollarSign,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  Mail,
  UserPlus,
  Shield
} from 'lucide-react'
import { format, isToday, isThisWeek } from 'date-fns'

interface ApprovalsListViewProps {
  approvals: Approval[]
  onApprovalClick: (approval: Approval) => void
  onApproveClick?: (approval: Approval) => void
  onRejectClick?: (approval: Approval) => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
  awaiting_info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  escalated: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
  cancelled: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300'
}

export function ApprovalsListView({
  approvals,
  onApprovalClick,
  onApproveClick,
  onRejectClick
}: ApprovalsListViewProps) {
  const groups = useMemo(() => {
    const today: Approval[] = []
    const thisWeek: Approval[] = []
    const older: Approval[] = []

    for (const a of approvals) {
      const date = new Date(a.created_at)
      if (isToday(date)) {
        today.push(a)
      } else if (isThisWeek(date, { weekStartsOn: 1 })) {
        thisWeek.push(a)
      } else {
        older.push(a)
      }
    }

    return [
      { label: 'Today', items: today },
      { label: 'This Week', items: thisWeek },
      { label: 'Older', items: older },
    ].filter(g => g.items.length > 0)
  }, [approvals])

  const renderCard = (approval: Approval) => (
    <Card
      key={approval.id}
      className="cursor-pointer hover:bg-muted transition-all border-border hover:border-primary/30"
      onClick={() => onApprovalClick(approval)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">
                {approval.entity_type === 'deal_interest' || approval.entity_type === 'deal_interest_nda'
                  ? 'DATA ROOM ACCESS REQUEST'
                  : approval.entity_type.replace(/_/g, ' ').toUpperCase()}
              </Badge>
              <Badge className={statusColors[approval.status]}>
                {approval.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>

            <h3 className="font-semibold text-lg text-foreground">
              {approval.entity_type === 'member_invitation'
                ? `Member Invitation: ${approval.entity_metadata?.email || 'Unknown'}`
                : (
                  approval.related_deal?.name ||
                  approval.related_investor?.legal_name ||
                  approval.entity_metadata?.entity_name ||
                  'Approval Request'
                )}
            </h3>
            {(approval.entity_type === 'deal_interest' || approval.entity_type === 'deal_interest_nda') && (
              <p className="text-sm text-muted-foreground">
                Deal: {approval.related_deal?.name || 'Unknown'} • Requested by {approval.requested_by_profile?.display_name || 'Unknown'}
              </p>
            )}

            {approval.entity_type === 'member_invitation' && approval.entity_metadata && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{approval.entity_metadata.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{approval.entity_metadata.entity_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserPlus className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate capitalize">{approval.entity_metadata.role || 'Member'}</span>
                </div>
                {approval.entity_metadata.is_signatory && (
                  <div className="flex items-center gap-2 text-amber-400 font-medium">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>Signatory</span>
                  </div>
                )}
                {approval.sla_breach_at && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Due {format(new Date(approval.sla_breach_at), 'MMM dd, HH:mm')}</span>
                  </div>
                )}
              </div>
            )}

            {approval.entity_type !== 'member_invitation' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {approval.related_investor && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{approval.related_investor.legal_name}</span>
                  </div>
                )}
                {approval.related_deal && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate capitalize">{approval.related_deal.deal_type || 'Deal'}</span>
                  </div>
                )}
                {approval.sla_breach_at && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Due {format(new Date(approval.sla_breach_at), 'MMM dd, HH:mm')}</span>
                  </div>
                )}
                {approval.entity_metadata?.indicative_amount && (
                  <div className="flex items-center gap-2 font-semibold text-emerald-400">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {approval.entity_metadata.indicative_currency || 'USD'}{' '}
                      {approval.entity_metadata.indicative_amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Requested by {approval.requested_by_profile?.display_name || 'Unknown'}</span>
              <span>•</span>
              <span>Assigned to {approval.assigned_to_profile?.display_name || 'Unassigned'}</span>
              <span>•</span>
              <span>{format(new Date(approval.created_at), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          {approval.status === 'pending' && (onApproveClick || onRejectClick) && (
            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              {onApproveClick && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onApproveClick(approval)
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 min-w-[100px]"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              {onRejectClick && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRejectClick(approval)
                  }}
                  className="min-w-[100px]"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">{group.label}</h3>
          </div>
          <div className="space-y-4">
            {group.items.map((approval) => renderCard(approval))}
          </div>
        </div>
      ))}

      {approvals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No approvals found
        </div>
      )}
    </div>
  )
}
