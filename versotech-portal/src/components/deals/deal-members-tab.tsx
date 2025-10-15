'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Link as LinkIcon } from 'lucide-react'
import { AddMemberModal } from './add-member-modal'
import { GenerateInviteLinkModal } from './generate-invite-link-modal'

interface DealMembersTabProps {
  dealId: string
  members: any[]
}

export function DealMembersTab({ dealId, members }: DealMembersTabProps) {
  const roleColors: Record<string, string> = {
    investor: 'bg-emerald-500/20 text-emerald-200',
    co_investor: 'bg-blue-500/20 text-blue-200',
    advisor: 'bg-purple-500/20 text-purple-200',
    lawyer: 'bg-amber-500/20 text-amber-200',
    banker: 'bg-cyan-500/20 text-cyan-200',
    introducer: 'bg-pink-500/20 text-pink-200',
    verso_staff: 'bg-white/20 text-white',
    viewer: 'bg-gray-500/20 text-gray-200'
  }

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                Deal Members
              </CardTitle>
              <CardDescription>Manage access and participants</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <GenerateInviteLinkModal dealId={dealId} />
              <AddMemberModal dealId={dealId} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!members || members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members added yet. Click "Add Member" to invite participants.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {member.profiles?.display_name || member.profiles?.email}
                        </span>
                        <Badge className={roleColors[member.role] || 'bg-white/20 text-white'}>
                          {member.role.replace('_', ' ')}
                        </Badge>
                        {member.investors && (
                          <Badge variant="outline" className="border-white/20">
                            {member.investors.legal_name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{member.profiles?.email}</span>
                        <span>Invited: {new Date(member.invited_at).toLocaleDateString()}</span>
                        {member.accepted_at ? (
                          <span className="text-emerald-200">
                            Accepted: {new Date(member.accepted_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-amber-200">Pending acceptance</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-200">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
