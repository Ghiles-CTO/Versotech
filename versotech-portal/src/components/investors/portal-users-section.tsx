'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PortalUsersList } from './portal-users-list'

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
  return (
    <Card id="portal-users-section">
      <CardHeader>
        <div>
          <CardTitle>Portal Users</CardTitle>
          <CardDescription>Users with access to the investor portal. Use "Add User" button in the page header to add new users.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <PortalUsersList
          investorId={investorId}
          users={users}
        />
      </CardContent>
    </Card>
  )
}

