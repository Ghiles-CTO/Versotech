'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PortalUsersList } from './portal-users-list'
import { AddUserToInvestorModal } from './add-user-to-investor-modal'

type PortalUsersSectionProps = {
  investorId: string
  users: Array<{
    user_id: string
    profiles: {
      id: string
      display_name: string
      email: string
      title: string
      role: string
    } | null
  }>
}

export function PortalUsersSection({ investorId, users }: PortalUsersSectionProps) {
  const [addUserOpen, setAddUserOpen] = useState(false)

  return (
    <>
      <Card id="portal-users-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portal Users</CardTitle>
              <CardDescription>Users with access to the investor portal</CardDescription>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setAddUserOpen(true)}
            >
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PortalUsersList 
            investorId={investorId} 
            users={users} 
          />
        </CardContent>
      </Card>

      <AddUserToInvestorModal
        investorId={investorId}
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
      />
    </>
  )
}

