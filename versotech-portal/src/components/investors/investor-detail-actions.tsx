'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EditInvestorModal } from './edit-investor-modal'

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
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="bg-white text-black hover:bg-gray-100"
        onClick={() => setEditOpen(true)}
      >
        Edit
      </Button>

      <EditInvestorModal 
        investor={investor}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
