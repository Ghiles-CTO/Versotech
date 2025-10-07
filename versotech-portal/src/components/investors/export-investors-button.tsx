'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

type ExportInvestorsButtonProps = {
  investors: Array<{
    id: string
    name: string
    type: string
    email: string
    kycStatus: string
    onboardingStatus: string
    totalCommitment: number
    totalContributed: number
    vehicleCount: number
    relationshipManager: string
    country: string
    lastActivity: string
  }>
}

export function ExportInvestorsButton({ investors }: ExportInvestorsButtonProps) {
  const handleExport = () => {
    try {
      // Create CSV headers
      const headers = [
        'ID',
        'Name',
        'Type',
        'Email',
        'KYC Status',
        'Onboarding Status',
        'Total Commitment',
        'Total Contributed',
        'Vehicles',
        'Relationship Manager',
        'Country',
        'Last Activity'
      ]

      // Create CSV rows
      const rows = investors.map(inv => [
        inv.id,
        inv.name,
        inv.type,
        inv.email,
        inv.kycStatus,
        inv.onboardingStatus,
        inv.totalCommitment,
        inv.totalContributed,
        inv.vehicleCount,
        inv.relationshipManager,
        inv.country,
        new Date(inv.lastActivity).toLocaleDateString()
      ])

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `investors_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Exported ${investors.length} investors to CSV`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export investors')
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  )
}

