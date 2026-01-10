'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, Edit, FileText, Users, Building2, Briefcase, CheckCircle, Clock, XCircle, FileSignature, Loader2, FileDown, Eye, Download } from 'lucide-react'
import { toast } from 'sonner'
import FeePlanEditModal from '@/components/fees/FeePlanEditModal'
import { useRouter } from 'next/navigation'

interface DealFeePlansTabProps {
  dealId: string
  feePlans: any[]
}

export function DealFeePlansTab({ dealId, feePlans }: DealFeePlansTabProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [generatingAgreement, setGeneratingAgreement] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  // Handle PDF download from Supabase storage
  const handleDownloadPdf = async (pdfUrl: string, referenceNumber: string | null) => {
    setDownloadingPdf(pdfUrl)
    try {
      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // Extract actual filename from storage path, or fall back to reference number
      const actualFilename = pdfUrl.split('/').pop() || `${referenceNumber || 'agreement'}.pdf`
      link.download = actualFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    } finally {
      setDownloadingPdf(null)
    }
  }

  // Handle PDF preview in new tab
  const handlePreviewPdf = async (pdfUrl: string) => {
    try {
      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
      if (!response.ok) {
        throw new Error('Failed to load file')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error previewing PDF:', error)
      toast.error('Failed to preview PDF')
    }
  }

  // Get PDF URL from agreement (introducer or placement)
  const getAgreementPdfInfo = (plan: any): { pdfUrl: string | null; referenceNumber: string | null } => {
    if (plan.introducer_agreement?.pdf_url) {
      return {
        pdfUrl: plan.introducer_agreement.pdf_url,
        referenceNumber: plan.introducer_agreement.reference_number
      }
    }
    if (plan.placement_agreement?.pdf_url) {
      return {
        pdfUrl: plan.placement_agreement.pdf_url,
        referenceNumber: plan.placement_agreement.reference_number
      }
    }
    return { pdfUrl: null, referenceNumber: null }
  }

  const feeKindLabels: Record<string, string> = {
    subscription: 'Subscription Fee',
    management: 'Management Fee',
    performance: 'Performance Fee',
    spread_markup: 'Spread Markup',
    flat: 'Flat Fee',
    other: 'Other'
  }

  // Helper to get entity display info
  const getEntityInfo = (plan: any) => {
    if (plan.introducer_id) {
      return {
        type: 'Introducer',
        icon: <Users className="h-4 w-4 text-blue-400" />,
        // Introducers table uses 'legal_name', not 'name' or 'company_name'
        name: plan.introducer?.legal_name || plan.introducer?.name || plan.introducer?.company_name || 'Unknown'
      }
    }
    if (plan.partner_id) {
      return {
        type: 'Partner',
        icon: <Building2 className="h-4 w-4 text-green-400" />,
        // Partners table has 'name' and 'legal_name'
        name: plan.partner?.name || plan.partner?.legal_name || plan.partner?.company_name || 'Unknown'
      }
    }
    if (plan.commercial_partner_id) {
      return {
        type: 'Commercial Partner',
        icon: <Briefcase className="h-4 w-4 text-purple-400" />,
        // Commercial partners table has 'name' and 'legal_name'
        name: plan.commercial_partner?.name || plan.commercial_partner?.legal_name || plan.commercial_partner?.company_name || 'Unknown'
      }
    }
    return null
  }

  // Helper to get status badge
  const getStatusBadge = (plan: any) => {
    const status = plan.status || 'draft'
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case 'sent':
      case 'pending_signature':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-500/30 text-gray-400">
            Draft
          </Badge>
        )
    }
  }

  const handleCreateNew = () => {
    setSelectedPlan(null)
    setModalOpen(true)
  }

  const handleEdit = (plan: any) => {
    // Transform fee_components to components for the modal
    const normalizedPlan = {
      ...plan,
      components: plan.fee_components || []
    }
    setSelectedPlan(normalizedPlan)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    setModalOpen(false)
    setSelectedPlan(null)
    router.refresh()
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedPlan(null)
  }

  // Generate Introducer Agreement (DOC 3)
  const handleGenerateIntroducerAgreement = async (plan: any) => {
    if (!plan.introducer_id) return

    setGeneratingAgreement(plan.id)
    try {
      const res = await fetch(`/api/staff/fees/plans/${plan.id}/generate-agreement`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(`Failed to generate agreement: ${data.error || 'Unknown error'}`)
        return
      }

      alert('Introducer Agreement generated successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error generating introducer agreement:', error)
      alert('Failed to generate agreement')
    } finally {
      setGeneratingAgreement(null)
    }
  }

  // Generate Partner Placement Agreement
  const handleGeneratePartnerAgreement = async (plan: any) => {
    if (!plan.partner_id) return

    setGeneratingAgreement(plan.id)
    try {
      const res = await fetch(`/api/staff/fees/plans/${plan.id}/generate-placement-agreement`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(`Failed to generate placement agreement: ${data.error || 'Unknown error'}`)
        return
      }

      alert('Placement Agreement generated successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error generating placement agreement:', error)
      alert('Failed to generate placement agreement')
    } finally {
      setGeneratingAgreement(null)
    }
  }

  // Unified handler that routes to correct agreement type
  const handleGenerateAgreement = async (plan: any) => {
    if (plan.introducer_id) {
      await handleGenerateIntroducerAgreement(plan)
    } else if (plan.partner_id) {
      await handleGeneratePartnerAgreement(plan)
    }
  }

  // Check if agreement has been generated for this plan
  const hasGeneratedAgreement = (plan: any) => {
    if (plan.introducer_id && plan.generated_agreement_id) return true
    if (plan.partner_id && plan.generated_placement_agreement_id) return true
    return false
  }

  // Check if this plan can have an agreement generated
  const canGenerateAgreement = (plan: any) => {
    // Introducers: need introducer_id and no existing agreement
    if (plan.introducer_id && !plan.generated_agreement_id) return true
    // Partners: need partner_id and no existing placement agreement
    if (plan.partner_id && !plan.generated_placement_agreement_id) return true
    return false
  }

  // Get appropriate tooltip for generate button
  const getGenerateTooltip = (plan: any) => {
    if (plan.introducer_id) return 'Generate Introducer Agreement (DOC 3)'
    if (plan.partner_id) return 'Generate Placement Agreement'
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Fee Plans Section (for investors) */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Plans
              </CardTitle>
              <CardDescription>Configure fee structures for investors</CardDescription>
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Fee Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!feePlans || feePlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fee plans created yet. Click "Create Fee Plan" to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feePlans.map((plan) => {
                const entityInfo = getEntityInfo(plan)
                return (
                  <Card key={plan.id} className="border border-white/10 bg-white/5">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg text-foreground">
                              {plan.name}
                            </CardTitle>
                            {getStatusBadge(plan)}
                          </div>
                          {plan.description && (
                            <CardDescription className="mt-1">{plan.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Generate Agreement button - for introducers and partners */}
                          {canGenerateAgreement(plan) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGenerateAgreement(plan)}
                              disabled={generatingAgreement === plan.id}
                              className="text-green-400 hover:text-green-300"
                              title={getGenerateTooltip(plan)}
                            >
                              {generatingAgreement === plan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <FileSignature className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {hasGeneratedAgreement(plan) && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Agreement Generated
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Term Sheet & Entity Info */}
                      <div className="mt-3 space-y-2">
                        {plan.term_sheet_id && plan.term_sheet && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>
                              Term Sheet v{plan.term_sheet.version}
                              {plan.term_sheet.term_sheet_date && (
                                <span className="text-gray-500 ml-1">
                                  ({new Date(plan.term_sheet.term_sheet_date).toLocaleDateString()})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {!plan.term_sheet_id && (
                          <div className="flex items-center gap-2 text-sm text-amber-400">
                            <FileText className="h-4 w-4" />
                            <span>No term sheet linked</span>
                          </div>
                        )}

                        {entityInfo && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            {entityInfo.icon}
                            <span>{entityInfo.type}: {entityInfo.name}</span>
                          </div>
                        )}
                        {!entityInfo && (
                          <div className="flex items-center gap-2 text-sm text-amber-400">
                            <Users className="h-4 w-4" />
                            <span>No entity linked</span>
                          </div>
                        )}

                        {plan.accepted_at && (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span>Accepted {new Date(plan.accepted_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plan.fee_components && plan.fee_components.length > 0 ? (
                        <div className="space-y-2">
                          {plan.fee_components.map((component: any) => (
                            <div
                              key={component.id}
                              className="flex items-center justify-between py-2 px-3 rounded bg-white/5"
                            >
                              <span className="text-sm text-foreground">
                                {feeKindLabels[component.kind]}
                              </span>
                              <Badge variant="outline" className="border-white/20 text-muted-foreground">
                                {component.rate_bps ? `${component.rate_bps / 100}%` :
                                 component.flat_amount ? `$${component.flat_amount}` : '—'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-2">No components added yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="text-xs"
                          >
                            Add Components
                          </Button>
                        </div>
                      )}

                      {/* Agreement Document Section */}
                      {(() => {
                        const { pdfUrl, referenceNumber } = getAgreementPdfInfo(plan)
                        if (!pdfUrl) return null

                        return (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                  <FileText className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {plan.introducer_id ? 'Introducer Agreement' : 'Placement Agreement'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {referenceNumber || 'Document ready'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreviewPdf(pdfUrl)}
                                  className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(pdfUrl, referenceNumber)}
                                  disabled={downloadingPdf === pdfUrl}
                                  className="text-green-400 border-green-400/30 hover:bg-green-400/10"
                                >
                                  {downloadingPdf === pdfUrl ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4 mr-1" />
                                  )}
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Plan Edit Modal */}
      <FeePlanEditModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        feePlan={selectedPlan}
        dealId={dealId}
      />
    </div>
  )
}
