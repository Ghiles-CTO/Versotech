'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Send,
  Eye,
  TrendingUp,
  FileSignature,
  FolderOpen,
  FileText,
  Mail,
  CheckCircle2,
  Wallet,
  Users,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { AddMemberModal } from './add-member-modal'
import { GenerateInviteLinkModal } from './generate-invite-link-modal'

// Journey stages configuration - 9-stage investor journey
const JOURNEY_STAGES = [
  { key: 'dispatched', label: 'Dispatched', icon: Send, field: 'dispatched_at' },
  { key: 'viewed', label: 'Viewed', icon: Eye, field: 'viewed_at' },
  { key: 'interest', label: 'Interest', icon: TrendingUp, field: 'interest_confirmed_at' },
  { key: 'nda', label: 'NDA', icon: FileSignature, field: 'nda_signed_at' },
  { key: 'data_room', label: 'Data Room', icon: FolderOpen, field: 'data_room_granted_at' },
  { key: 'pack_gen', label: 'Pack Gen', icon: FileText, field: 'pack_generated_at', fromSubscription: true },
  { key: 'pack_sent', label: 'Pack Sent', icon: Mail, field: 'pack_sent_at', fromSubscription: true },
  { key: 'signed', label: 'Signed', icon: CheckCircle2, field: 'signed_at', fromSubscription: true },
  { key: 'funded', label: 'Funded', icon: Wallet, field: 'funded_at', fromSubscription: true },
] as const

interface DealMembersTabProps {
  dealId: string
  members: any[]
  subscriptions?: any[]
}

function getCurrentStage(member: any): { stage: string; index: number } {
  // Build a map of investor_id to subscription
  const subscription = member.subscription || null

  // Check stages in reverse order to find the latest completed
  for (let i = JOURNEY_STAGES.length - 1; i >= 0; i--) {
    const stage = JOURNEY_STAGES[i]
    let value: string | null = null

    const isFromSubscription = 'fromSubscription' in stage && stage.fromSubscription
    if (isFromSubscription && subscription) {
      value = subscription[stage.field]
    } else if (!isFromSubscription) {
      value = member[stage.field]
    }

    if (value) {
      return { stage: stage.label, index: i }
    }
  }
  return { stage: 'Invited', index: -1 }
}

function JourneyProgressBar({ member }: { member: any }) {
  const { index: currentIndex } = getCurrentStage(member)
  const subscription = member.subscription || null

  return (
    <div className="flex items-center gap-1">
      {JOURNEY_STAGES.map((stage, idx) => {
        let value: string | null = null
        const isFromSubscription = 'fromSubscription' in stage && stage.fromSubscription
        if (isFromSubscription && subscription) {
          value = subscription[stage.field]
        } else if (!isFromSubscription) {
          value = member[stage.field]
        }

        const isCompleted = !!value
        const isCurrent = idx === currentIndex

        return (
          <div
            key={stage.key}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
              isCompleted
                ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                : isCurrent
                  ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                  : 'bg-muted text-muted-foreground'
            }`}
            title={`${stage.label}${value ? ` - ${format(new Date(value), 'MMM d, yyyy')}` : ''}`}
          >
            <stage.icon className="h-3 w-3" />
          </div>
        )
      })}
    </div>
  )
}

export function DealMembersTab({ dealId, members: initialMembers, subscriptions = [] }: DealMembersTabProps) {
  const [members, setMembers] = useState(initialMembers)

  // Create subscription map for quick lookup
  const subscriptionMap = new Map(
    subscriptions.map(s => [s.investor_id, s])
  )

  // Enhance members with subscription data
  const enhancedMembers = members.map(m => ({
    ...m,
    subscription: m.investor_id ? subscriptionMap.get(m.investor_id) : null
  }))

  // Update local state when server data changes
  useEffect(() => {
    setMembers(initialMembers)
  }, [initialMembers])

  const refreshMembers = async () => {
    try {
      const response = await fetch(`/api/deals/${dealId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (err) {
      console.error('Failed to refresh members:', err)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the deal?')) {
      return
    }

    try {
      const response = await fetch(`/api/deals/${dealId}/members/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await refreshMembers()
      } else {
        const data = await response.json()
        alert(`Failed to remove member: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Failed to remove member:', err)
      alert('Failed to remove member. Please try again.')
    }
  }

  const roleColors: Record<string, string> = {
    investor: 'bg-emerald-500/20 text-emerald-200',
    co_investor: 'bg-blue-500/20 text-blue-200',
    partner_investor: 'bg-purple-500/20 text-purple-200',
    introducer_investor: 'bg-orange-500/20 text-orange-200',
    commercial_partner_investor: 'bg-teal-500/20 text-teal-200',
    advisor: 'bg-purple-500/20 text-purple-200',
    lawyer: 'bg-amber-500/20 text-amber-200',
    banker: 'bg-cyan-500/20 text-cyan-200',
    introducer: 'bg-pink-500/20 text-pink-200',
    verso_staff: 'bg-white/20 text-white',
    viewer: 'bg-gray-500/20 text-gray-200'
  }

  // Calculate journey stats
  const stats = {
    total: enhancedMembers.length,
    dispatched: enhancedMembers.filter(m => m.dispatched_at).length,
    viewed: enhancedMembers.filter(m => m.viewed_at).length,
    interested: enhancedMembers.filter(m => m.interest_confirmed_at).length,
    ndaSigned: enhancedMembers.filter(m => m.nda_signed_at).length,
    dataRoom: enhancedMembers.filter(m => m.data_room_granted_at).length,
    packGen: enhancedMembers.filter(m => m.subscription?.pack_generated_at).length,
    packSent: enhancedMembers.filter(m => m.subscription?.pack_sent_at).length,
    signed: enhancedMembers.filter(m => m.subscription?.signed_at).length,
    funded: enhancedMembers.filter(m => m.subscription?.funded_at).length,
  }

  return (
    <div className="space-y-6">
      {/* Journey Funnel Summary */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Investor Journey Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: 'Dispatched', count: stats.dispatched },
              { label: 'Viewed', count: stats.viewed },
              { label: 'Interested', count: stats.interested },
              { label: 'NDA', count: stats.ndaSigned },
              { label: 'Data Room', count: stats.dataRoom },
              { label: 'Pack Gen', count: stats.packGen },
              { label: 'Pack Sent', count: stats.packSent },
              { label: 'Signed', count: stats.signed },
              { label: 'Funded', count: stats.funded },
            ].map((stage, idx) => (
              <div key={stage.label} className="flex items-center">
                <div className="text-center min-w-[70px]">
                  <div className="text-xl font-bold">{stage.count}</div>
                  <div className="text-xs text-muted-foreground">{stage.label}</div>
                </div>
                {idx < 8 && (
                  <div className="mx-1 text-muted-foreground">→</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                Deal Members ({enhancedMembers.length})
              </CardTitle>
              <CardDescription>Manage access and track investor journey progress</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <GenerateInviteLinkModal dealId={dealId} />
              <AddMemberModal dealId={dealId} onMemberAdded={refreshMembers} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!enhancedMembers || enhancedMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No members added yet. Click "Add Member" to invite participants.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Journey Progress</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enhancedMembers.map((member) => {
                  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
                  const investor = Array.isArray(member.investors) ? member.investors[0] : member.investors
                  const { stage } = getCurrentStage(member)

                  return (
                    <TableRow key={member.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {investor?.legal_name || profile?.display_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {profile?.email}
                          </div>
                          {investor?.kyc_status && (
                            <Badge
                              variant="outline"
                              className={`text-xs mt-1 ${
                                investor.kyc_status === 'approved'
                                  ? 'bg-green-500/20 text-green-400'
                                  : investor.kyc_status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : ''
                              }`}
                            >
                              KYC: {investor.kyc_status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[member.role] || 'bg-white/20 text-white'}>
                          {member.role?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <JourneyProgressBar member={member} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stage}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {investor && (
                              <DropdownMenuItem asChild>
                                <a href={`/versotech_main/investors/${investor.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Investor
                                </a>
                              </DropdownMenuItem>
                            )}
                            {profile?.email && (
                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${profile.email}`}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() => handleRemoveMember(member.user_id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
