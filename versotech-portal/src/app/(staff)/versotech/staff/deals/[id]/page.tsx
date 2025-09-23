'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DealInventoryPanel from '@/components/deals/deal-inventory-panel'
import FeeManagementPanel from '@/components/deals/fee-management-panel'
import { toast } from 'sonner'

interface Deal {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  offer_unit_price: number
  open_at: string
  close_at: string
  created_at: string
  vehicles?: {
    name: string
    type: string
  }
  deal_memberships: DealMembership[]
}

interface DealMembership {
  user_id: string
  role: string
  invited_at: string
  accepted_at: string
  profiles?: {
    display_name: string
    email: string
  }
  investors?: {
    legal_name: string
  }
}

export default function DealDetailPage() {
  const params = useParams()
  const dealId = params.id as string
  
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDealData()
  }, [dealId])

  const loadDealData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/deals/${dealId}`)
      if (response.ok) {
        const data = await response.json()
        setDeal(data.deal)
      } else {
        toast.error('Failed to load deal data')
      }

    } catch (error) {
      console.error('Error loading deal:', error)
      toast.error('Failed to load deal data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'open': return 'bg-green-100 text-green-800'
      case 'allocation_pending': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'investor': return 'bg-blue-100 text-blue-800'
      case 'co_investor': return 'bg-purple-100 text-purple-800'
      case 'lawyer': return 'bg-green-100 text-green-800'
      case 'banker': return 'bg-yellow-100 text-yellow-800'
      case 'introducer': return 'bg-orange-100 text-orange-800'
      case 'verso_staff': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
          <p className="text-gray-600">The requested deal could not be found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Deal Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
            <p className="text-gray-600 mt-2">
              {deal.vehicles?.name} • {deal.deal_type.replace('_', ' ')} • {deal.currency}
            </p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(deal.status)} size="lg">
              {deal.status.replace('_', ' ')}
            </Badge>
            <div className="text-sm text-gray-600 mt-2">
              Offer Price: {deal.currency} {deal.offer_unit_price}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Opens</div>
            <div className="font-semibold">
              {deal.open_at ? new Date(deal.open_at).toLocaleDateString() : 'Not set'}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Closes</div>
            <div className="font-semibold">
              {deal.close_at ? new Date(deal.close_at).toLocaleDateString() : 'Not set'}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Members</div>
            <div className="font-semibold">
              {deal.deal_memberships?.length || 0} participants
            </div>
          </Card>
        </div>
      </div>

      {/* Deal Management Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="fees">Fees & Billing</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <DealInventoryPanel
            dealId={dealId}
            dealName={deal.name}
            dealStatus={deal.status}
            offerPrice={deal.offer_unit_price}
            currency={deal.currency}
          />
        </TabsContent>

        <TabsContent value="fees">
          <FeeManagementPanel
            dealId={dealId}
            dealName={deal.name}
          />
        </TabsContent>

        <TabsContent value="members">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Deal Members</h3>
            
            <div className="space-y-3">
              {deal.deal_memberships?.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">
                        {member.profiles?.display_name || member.profiles?.email}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {member.investors?.legal_name && `Investor: ${member.investors.legal_name} • `}
                      Invited: {new Date(member.invited_at).toLocaleDateString()}
                      {member.accepted_at && ` • Accepted: ${new Date(member.accepted_at).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!deal.deal_memberships || deal.deal_memberships.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No members added to this deal yet
                </div>
              )}
            </div>
            
            <Button className="mt-4" variant="outline">
              Invite Member
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Document Packages</h3>
            
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                Document package management coming soon
              </div>
              
              <Button variant="outline">
                Create Document Package
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}