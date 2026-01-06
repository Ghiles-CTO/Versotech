'use client'

/**
 * Investor Members Tab
 *
 * Manages directors, shareholders, and beneficial owners for entity-type investors.
 * Uses GenericEntityMembersTab with MemberKYCEditDialog for comprehensive KYC editing.
 */

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { GenericEntityMembersTab } from './generic-entity-members-tab'

interface Investor {
  id: string
  type: string
  display_name: string
}

export function InvestorMembersTab() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [entityInvestor, setEntityInvestor] = useState<Investor | null>(null)

  useEffect(() => {
    loadInvestorInfo()
  }, [])

  const loadInvestorInfo = async () => {
    try {
      const response = await fetch('/api/investors/me/members')
      if (!response.ok) throw new Error('Failed to load investor info')

      const data = await response.json()
      setInvestors(data.investors || [])

      // Find entity-type investor
      const entityInv = (data.investors || []).find(
        (i: Investor) => ['entity', 'institutional'].includes(i.type)
      )
      setEntityInvestor(entityInv || null)
    } catch (error) {
      console.error('Error loading investor info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Check if user is entity-type investor
  const isEntityInvestor = investors.some(i => ['entity', 'institutional'].includes(i.type))

  if (!isEntityInvestor || !entityInvestor) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Members management is only available for entity-type investors.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <GenericEntityMembersTab
      entityType="investor"
      entityId={entityInvestor.id}
      entityName={entityInvestor.display_name}
      apiEndpoint="/api/investors/me/members"
      canManage={true}
      title="Entity Members"
      description="Manage directors, shareholders, and beneficial owners of your entity. Click on a member to edit their full KYC information."
    />
  )
}
