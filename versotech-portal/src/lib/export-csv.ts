import { Approval } from '@/types/approvals'

export function exportApprovalsToCSV(approvals: Approval[], filename: string = 'approvals-export.csv') {
  if (!approvals || approvals.length === 0) {
    throw new Error('No data to export')
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Request Type',
    'Status',
    'Priority',
    'Requested By',
    'Assigned To',
    'Investor',
    'Deal',
    'Amount',
    'Units',
    'SLA Breach At',
    'Created At',
    'Approved By',
    'Approved At',
    'Rejection Reason',
    'Notes'
  ]

  // Convert approvals to CSV rows
  const rows = approvals.map(approval => {
    const amount = approval.entity_metadata?.requested_amount || 
                   approval.entity_metadata?.amount || 
                   ''
    const units = approval.entity_metadata?.requested_units || ''
    
    return [
      approval.id,
      approval.entity_type,
      approval.status,
      approval.priority,
      approval.requested_by_profile?.display_name || '',
      approval.assigned_to_profile?.display_name || '',
      approval.related_investor?.legal_name || '',
      approval.related_deal?.name || '',
      amount,
      units,
      approval.sla_breach_at ? new Date(approval.sla_breach_at).toLocaleString() : '',
      new Date(approval.created_at).toLocaleString(),
      approval.approved_by_profile?.display_name || '',
      approval.approved_at ? new Date(approval.approved_at).toLocaleString() : '',
      approval.rejection_reason || '',
      approval.notes || ''
    ].map(value => {
      // Escape CSV values
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

