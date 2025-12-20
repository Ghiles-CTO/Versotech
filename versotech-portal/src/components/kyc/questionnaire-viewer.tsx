'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  User,
  Briefcase,
  GraduationCap,
  Shield,
  Flag,
  FileText,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  PenTool,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { STEP_CONFIG, shouldShowUSPersonSteps } from './schemas/kyc-questionnaire-schema'

// Field labels for human-readable display
const FIELD_LABELS: Record<string, string> = {
  // Step 1: About You
  fullName: 'Full Legal Name',
  dateOfBirth: 'Date of Birth',
  nationality: 'Nationality',
  countryOfResidence: 'Country of Residence',
  residentialAddress: 'Residential Address',
  city: 'City',
  postalCode: 'Postal Code',
  email: 'Email Address',
  phone: 'Phone Number',
  taxIdNumber: 'Tax ID Number',
  taxResidencyCountry: 'Tax Residency Country',

  // Step 2: Investment Type
  investmentType: 'Investment Type',
  investmentTypeOther: 'Other Investment Type',

  // Step 3: Well-Informed Status
  isWellInformed: 'Well-Informed Investor?',
  wellInformedBasis: 'Basis for Well-Informed Status',
  wellInformedEvidence: 'Supporting Evidence',

  // Step 4: Compliance (HIGH RISK)
  isPEP: 'Politically Exposed Person (PEP)?',
  pepDetails: 'PEP Details',
  isRelatedToPEP: 'Related to a PEP?',
  relatedPEPDetails: 'Related PEP Details',
  isSanctioned: 'Subject to Sanctions?',
  sanctionedDetails: 'Sanctions Details',
  hasCriminalRecord: 'Criminal Record?',
  criminalDetails: 'Criminal Record Details',
  isUnderInvestigation: 'Under Investigation?',
  investigationDetails: 'Investigation Details',
  hasBankruptcy: 'Bankruptcy History?',
  bankruptcyDetails: 'Bankruptcy Details',
  isUSPerson: 'US Person?',
  sourceOfFunds: 'Source of Funds',
  sourceOfWealth: 'Source of Wealth',

  // Step 5: US Person Status
  isUSCitizen: 'US Citizen?',
  isUSResident: 'US Resident?',
  hasUSGreenCard: 'US Green Card Holder?',
  hasSubstantialUSPresence: 'Substantial US Presence?',
  hasUSMailingAddress: 'US Mailing Address?',
  hasUSPhoneNumber: 'US Phone Number?',
  hasUSBankAccount: 'US Bank Account?',
  hasUSPowerOfAttorney: 'US Power of Attorney?',
  usConnectionDetails: 'US Connection Details',

  // Step 6: Offer Details
  isAccreditedInvestor: 'Accredited Investor?',
  accreditationBasis: 'Accreditation Basis',
  hasReceivedOfferingMaterials: 'Received Offering Materials?',
  understandsRestrictions: 'Understands Restrictions?',

  // Step 7: US Tax Compliance
  acknowledgesFATCA: 'FATCA Acknowledgment',
  willProvideW9: 'Will Provide W-9?',
  understandsWithholding: 'Understands Withholding?',
  certifiesTaxCompliance: 'Certifies Tax Compliance?',
  acknowledgesReportingObligations: 'Reporting Obligations Acknowledged?',

  // Step 8: Investment Suitability
  educationLevel: 'Education Level',
  employmentStatus: 'Employment Status',
  occupation: 'Occupation',
  employer: 'Employer',
  yearsInvestingExperience: 'Years of Investment Experience',
  annualIncome: 'Annual Income',
  netWorth: 'Net Worth',
  liquidNetWorth: 'Liquid Net Worth',
  investmentObjective: 'Investment Objective',
  riskTolerance: 'Risk Tolerance',
  investmentHorizon: 'Investment Time Horizon',
  percentageOfNetWorthToInvest: '% of Net Worth to Invest',
  hasAlternativeInvestmentExperience: 'Alternative Investment Experience?',
  alternativeInvestmentTypes: 'Types of Alternative Investments',

  // Step 9: Risk Awareness
  acknowledgesIlliquidity: 'Acknowledges Illiquidity Risk',
  acknowledgesLossRisk: 'Acknowledges Loss Risk',
  acknowledgesNoGuarantees: 'Acknowledges No Guarantees',
  acknowledgesLimitedInfo: 'Acknowledges Limited Information',
  acknowledgesNoRegulation: 'Acknowledges Limited Regulation',
  acknowledgesConflicts: 'Acknowledges Conflicts of Interest',
  acknowledgesTaxImplications: 'Acknowledges Tax Implications',
  acknowledgesFees: 'Acknowledges Fees',
  hasReadOfferingDocs: 'Has Read Offering Documents',
  hasSoughtIndependentAdvice: 'Has Sought Independent Advice',

  // Step 10: Signature
  certifiesAccuracy: 'Certifies Accuracy',
  certifiesNoOmissions: 'Certifies No Omissions',
  agreesToUpdates: 'Agrees to Provide Updates',
  consentToProcessing: 'Consents to Data Processing',
  signatureName: 'Signature Name',
  signatureDate: 'Signature Date',

  // Metadata
  lastCompletedStep: 'Last Completed Step',
  wizardVersion: 'Form Version',
}

// High-risk fields that should be highlighted
const HIGH_RISK_FIELDS = [
  'isPEP',
  'isRelatedToPEP',
  'isSanctioned',
  'hasCriminalRecord',
  'isUnderInvestigation',
  'hasBankruptcy',
]

// Fields organized by step
const STEP_FIELDS: Record<string, string[]> = {
  step1: ['fullName', 'dateOfBirth', 'nationality', 'countryOfResidence', 'residentialAddress', 'city', 'postalCode', 'email', 'phone', 'taxIdNumber', 'taxResidencyCountry'],
  step2: ['investmentType', 'investmentTypeOther'],
  step3: ['isWellInformed', 'wellInformedBasis', 'wellInformedEvidence'],
  step4: ['isPEP', 'pepDetails', 'isRelatedToPEP', 'relatedPEPDetails', 'isSanctioned', 'sanctionedDetails', 'hasCriminalRecord', 'criminalDetails', 'isUnderInvestigation', 'investigationDetails', 'hasBankruptcy', 'bankruptcyDetails', 'isUSPerson', 'sourceOfFunds', 'sourceOfWealth'],
  step5: ['isUSCitizen', 'isUSResident', 'hasUSGreenCard', 'hasSubstantialUSPresence', 'hasUSMailingAddress', 'hasUSPhoneNumber', 'hasUSBankAccount', 'hasUSPowerOfAttorney', 'usConnectionDetails'],
  step6: ['isAccreditedInvestor', 'accreditationBasis', 'hasReceivedOfferingMaterials', 'understandsRestrictions'],
  step7: ['acknowledgesFATCA', 'willProvideW9', 'understandsWithholding', 'certifiesTaxCompliance', 'acknowledgesReportingObligations'],
  step8: ['educationLevel', 'employmentStatus', 'occupation', 'employer', 'yearsInvestingExperience', 'annualIncome', 'netWorth', 'liquidNetWorth', 'investmentObjective', 'riskTolerance', 'investmentHorizon', 'percentageOfNetWorthToInvest', 'hasAlternativeInvestmentExperience', 'alternativeInvestmentTypes'],
  step9: ['acknowledgesIlliquidity', 'acknowledgesLossRisk', 'acknowledgesNoGuarantees', 'acknowledgesLimitedInfo', 'acknowledgesNoRegulation', 'acknowledgesConflicts', 'acknowledgesTaxImplications', 'acknowledgesFees', 'hasReadOfferingDocs', 'hasSoughtIndependentAdvice'],
  step10: ['certifiesAccuracy', 'certifiesNoOmissions', 'agreesToUpdates', 'consentToProcessing', 'signatureName', 'signatureDate'],
}

// Icon mapping for steps
const STEP_ICONS: Record<string, typeof User> = {
  step1: User,
  step2: Briefcase,
  step3: GraduationCap,
  step4: Shield,
  step5: Flag,
  step6: FileText,
  step7: FileCheck,
  step8: TrendingUp,
  step9: AlertTriangle,
  step10: PenTool,
}

// Format value for display
function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  // Yes/No string values
  if (value === 'yes' || value === 'no') {
    return value === 'yes' ? 'Yes' : 'No'
  }

  // Arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    return value.map(v => formatEnumValue(String(v))).join(', ')
  }

  // Enum-like values (snake_case or camelCase)
  if (typeof value === 'string' && (value.includes('_') || /^[a-z]+[A-Z]/.test(value))) {
    return formatEnumValue(value)
  }

  return String(value)
}

// Format enum values to readable text
function formatEnumValue(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}

// Check if a field has a high-risk value
function isHighRiskValue(key: string, value: unknown): boolean {
  if (!HIGH_RISK_FIELDS.includes(key)) return false
  return value === 'yes' || value === true
}

interface QuestionnaireViewerProps {
  open: boolean
  onClose: () => void
  investorName: string
  submittedAt: string
  metadata: Record<string, unknown>
}

export function QuestionnaireViewer({
  open,
  onClose,
  investorName,
  submittedAt,
  metadata,
}: QuestionnaireViewerProps) {
  if (!metadata) return null

  // Flatten nested step data (e.g., { step1: {...}, step2: {...} })
  const flattenedData: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(metadata)) {
    if (key.startsWith('step') && typeof value === 'object' && value !== null) {
      // It's a step object, flatten its contents
      Object.assign(flattenedData, value)
    } else {
      // It's a top-level field
      flattenedData[key] = value
    }
  }

  // Check if US Person steps should be shown
  const showUSSteps = flattenedData.isUSPerson === 'yes'

  // Determine which steps to show
  const visibleSteps = showUSSteps
    ? ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'step9', 'step10']
    : ['step1', 'step2', 'step3', 'step4', 'step8', 'step9', 'step10']

  // Get step config info
  const getStepInfo = (stepKey: string) => {
    const index = parseInt(stepKey.replace('step', '')) - 1
    return STEP_CONFIG[index]
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KYC Questionnaire Responses
          </DialogTitle>
          <DialogDescription>
            Submitted by <span className="font-medium text-foreground">{investorName}</span> on{' '}
            {new Date(submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area with explicit height and overflow */}
        <div className="flex-1 min-h-0 -mx-6 px-6 overflow-y-auto">
          <div className="space-y-6 py-4">
            {visibleSteps.map((stepKey) => {
              const stepInfo = getStepInfo(stepKey)
              const StepIcon = STEP_ICONS[stepKey] || FileText
              const fields = STEP_FIELDS[stepKey] || []

              // Filter to fields that have values
              const fieldsWithValues = fields.filter(
                field => flattenedData[field] !== undefined && flattenedData[field] !== ''
              )

              if (fieldsWithValues.length === 0) return null

              return (
                <Card key={stepKey} className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <StepIcon className="h-4 w-4 text-muted-foreground" />
                      {stepInfo?.title || `Step ${stepKey.replace('step', '')}`}
                      {stepKey === 'step4' && (
                        <Badge variant="outline" className="ml-2 text-xs font-normal">
                          Compliance
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-3">
                      {fieldsWithValues.map((field) => {
                        const value = flattenedData[field]
                        const isHighRisk = isHighRiskValue(field, value)
                        const label = FIELD_LABELS[field] || formatEnumValue(field)
                        const formattedValue = formatValue(field, value)

                        return (
                          <div
                            key={field}
                            className={`flex flex-col gap-1 p-3 rounded-lg ${
                              isHighRisk
                                ? 'bg-destructive/10 border border-destructive/30'
                                : 'bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                {label}
                              </span>
                              {isHighRisk && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Requires Review
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {typeof value === 'boolean' || value === 'yes' || value === 'no' ? (
                                <>
                                  {value === true || value === 'yes' ? (
                                    <CheckCircle className={`h-4 w-4 ${isHighRisk ? 'text-destructive' : 'text-emerald-500'}`} />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className={`text-sm ${isHighRisk ? 'font-semibold text-destructive' : 'text-foreground'}`}>
                                    {formattedValue}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-foreground">
                                  {formattedValue}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Separator className="flex-shrink-0" />

        <DialogFooter className="pt-4 flex-shrink-0">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
