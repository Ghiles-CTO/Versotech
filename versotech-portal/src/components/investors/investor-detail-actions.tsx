'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EditInvestorModal } from './edit-investor-modal'
import { AddUserToInvestorModal } from './add-user-to-investor-modal'
import { AddSubscriptionDialog } from './add-subscription-dialog'
import { Edit, UserPlus, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

type InvestorDetailActionsProps = {
  investor: {
    id: string
    legal_name: string
    display_name?: string | null
    type: string
    email?: string | null
    phone?: string | null
    country?: string | null
    country_of_incorporation?: string | null
    tax_residency?: string | null
    primary_rm?: string | null
  }
}

export function InvestorDetailActions({ investor }: InvestorDetailActionsProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false)

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        className="bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
        onClick={() => setEditOpen(true)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Investor
      </Button>

      <Button
        className="bg-blue-600 text-white hover:bg-blue-700"
        onClick={() => setAddUserOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>

      <Button
        className="bg-green-600 text-white hover:bg-green-700"
        onClick={() => setAddSubscriptionOpen(true)}
      >
        <FileText className="h-4 w-4 mr-2" />
        Add Subscription
      </Button>

      <EditInvestorModal
        investor={investor}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AddUserToInvestorModal
        investorId={investor.id}
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
      />

      <AddSubscriptionDialog
        open={addSubscriptionOpen}
        onOpenChange={setAddSubscriptionOpen}
        investorId={investor.id}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
